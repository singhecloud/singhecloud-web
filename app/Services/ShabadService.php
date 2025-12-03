<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Spatie\LaravelPdf\Facades\Pdf;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ShabadService
{
    private $salokShabads = [];

    public function download($type, $serial = null) {

        if ($type === 'hukam') {
            set_time_limit(0);
            ini_set('max_execution_time', 0);
            return $this->printHukamNama();
        }
    }

    private function scaleFonts(array $fonts, float $ratio): array {
        return array_map(fn ($size) => (int) max(1, round($size * $ratio)), $fonts);
    }

    private function countPages(string $file): int {
        return (new \Smalot\PdfParser\Parser())->parseFile($file)->getDetails()['Pages'] ?? 1;
    }

    private function endsWithNumberMarker(string $line): bool {
        $line = trim($line);
        // Match the final "]<digits>]" at the very end of the line (supports cases like ...]4]5])
        return (bool) preg_match('/\]\s*\d+\]\z/u', $line);
    }

    private function printPdf($fileName, $data)
    {
        Pdf::view('pdf.hukamnama', $data)
            ->paperSize(571.50, 1016.26, 'mm')
            ->landscape()
            ->save($fileName);
    }

    private function printSalokPdf($fileName, $data)
    {
        Pdf::view('pdf.salok-hukamnama', $data)
            ->paperSize(571.50, 1016.26, 'mm')
            ->landscape()
            ->save($fileName);
    }

    private function printParagraphPdf($fileName, $data)
    {
        Pdf::view('pdf.paragraph-hukamnama', $data)
            ->paperSize(571.50, 1016.26, 'mm')
            ->landscape()
            ->save($fileName);
    }

    private function sclaePdf($fileName, $data)
    {
        $shrinkFactor = 0.98;   // shrink 2% per pass
        $minScale     = 0.45;   // don't go smaller than 50%
        $scale        = 1.00;   // start at 100%
        $maxIters     = 100;     // safety cap
        $iters        = 0;

        do {
            // shrink once per iteration
            $scale *= $shrinkFactor;

            // clamp to minimum
            if ($scale < $minScale) {
                $scale = $minScale;
            }

            // scale from the ORIGINAL fonts by the current scale
            $derivedFonts = $this->scaleFonts($data['fonts'], $scale);

            $this->printPdf($fileName, [
                'shabad'     => $data['shabad'],
                'panktis'     => $data['panktis'],
                'groups' => $data['groups'],
                'ang'   => $data['ang'],
                'fonts' => $derivedFonts,
            ]);

            $pageCount = $this->countPages($fileName);
            $iters++;

            // stop if we hit the min scale or the safety cap
            if ($scale <= $minScale) {
                if ($pageCount > 1) {
                    echo $fileName . ' - min scale<br />';
                    $this->scaleParagraphView($fileName, $data);
                }
                break;
            }

            if ($iters >= $maxIters) {
                echo $fileName . ' - max iters<br />';
                break;
            }

        } while ($pageCount > 1);
    }

    private function sclaeSalokPdf($fileName, $data)
    {
        $shrinkFactor = 0.98;   // shrink 2% per pass
        $minScale     = 0.45;   // don't go smaller than 50%
        $scale        = 1.00;   // start at 100%
        $maxIters     = 100;     // safety cap
        $iters        = 0;
        $scaleWarning = false;

        do {
            // shrink once per iteration
            $scale *= $shrinkFactor;

            // scale from the ORIGINAL fonts by the current scale
            $derivedFonts = $this->scaleFonts($data['fonts'], $scale);

            $this->printSalokPdf($fileName, [
                'panktis'     => $data['panktis'],
                'groups' => $data['groups'],
                'ang'   => $data['ang'],
                'fonts' => $derivedFonts,
            ]);

            $pageCount = $this->countPages($fileName);
            $iters++;

            // stop if we hit the min scale or the safety cap
            if ($scale <= $minScale && !$scaleWarning) {
                $scaleWarning = true;
                echo $fileName . ' - min scale salok view<br />';
            }

            if ($iters >= $maxIters) {
                echo $fileName . ' - max iters<br />';
                break;
            }

        } while ($pageCount > 1);
    }

    private function scaleParagraphView($fileName, $data)
    {
        $shrinkFactor = 0.98;   // shrink 2% per pass
        $minScale     = 0.45;   // don't go smaller than 50%
        $scale        = 1.00;   // start at 100%
        $maxIters     = 100;     // safety cap
        $iters        = 0;
        $scaleWarning = false;

        $data['fonts'] = [
            'pankti' => 90,
            'title' => 100,
            'arth' => 34,
        ];

        do {
            // shrink once per iteration
            $scale *= $shrinkFactor;

            // scale from the ORIGINAL fonts by the current scale
            $derivedFonts = $this->scaleFonts($data['fonts'], $scale);

            $this->printParagraphPdf($fileName, [
                'shabad'     => $data['shabad'],
                'panktis'     => $data['panktis'],
                'groups' => $data['groups'],
                'ang'   => $data['ang'],
                'fonts' => $derivedFonts,
            ]);

            $pageCount = $this->countPages($fileName);
            $iters++;

            // stop if we hit the min scale or the safety cap
            if ($scale <= $minScale && !$scaleWarning) {
                $scaleWarning = true;
                echo $fileName . ' - min scale para view<br />';
            }

            if ($iters >= $maxIters) {
                echo $fileName . ' - max iters<br />';
                break;
            }

        } while ($pageCount > 1);
    }

    private function getFileName($ang, $serial)
    {
        return str_pad($ang, 4, '0', STR_PAD_LEFT) . '-' . $serial . '.pdf';
    }

    private function printSalok($shabadId, $fileName)
    {
        $shabads = $this->salokShabads[$shabadId];
        $panktis = collect(DB::select(
                "SELECT id, shabad_id, type_id, gurmukhi, translation, additional_information, source_page
                FROM lines
                LEFT JOIN translations ON translations.line_id = lines.id
                AND translation_source_id = 6
                WHERE shabad_id IN ('" . implode("', '", $shabads) . "')
                ORDER BY order_id ASC"
            ));
        $this->salokShabads += $shabads;

        $groups = [];
        $current = [];
        $prevShabadId = null;
        $ang = null;

        foreach ($panktis as $pankti) {
            if ($ang == null) {
                $ang = $pankti->source_page;
            }

            if ($prevShabadId !== null && $pankti->shabad_id !== $prevShabadId) {
                if (!empty($current)) {
                    $groups[] = $current;
                    $current = [];
                }
            }

            $current[] = $pankti;
            $prevShabadId = $pankti->shabad_id;
        }

        if (!empty($current)) {
            $groups[] = $current;
        }

        $fonts = [
            'pankti' => 70,
            'mangal' => 90,
            'translation' => 50,
            'title' => 100,
            'arth' => 34,
        ];

        $this->printSalokPdf($fileName, [
            'panktis'     => $panktis,
            'groups' => $groups,
            'ang'   => $ang,
            'fonts' => $fonts,
        ]);

        $pageCount = $this->countPages($fileName);

        if ($pageCount > 1) {
            $this->sclaeSalokPdf($fileName, [
                'panktis'     => $panktis,
                'groups' => $groups,
                'ang'   => $ang,
                'fonts' => $fonts,
            ]);
        }
    }

    private function getPauriShabads()
    {
        $pauris = collect(DB::select("SELECT shabads.*
            FROM lines
            INNER JOIN shabads ON lines.shabad_id = shabads.id
            WHERE gurmukhi like 'pauVI%'
            AND shabads.source_id = 1"
        ));

        foreach ($pauris as $pauri) {
            $previousShabads = DB::select("SELECT order_id, * FROM shabads WHERE order_id < '{$pauri->order_id}' ORDER BY order_id desc LIMIT 10");
            $shabads = [$pauri->id];
            foreach ($previousShabads as $previousShabad) {
                $panktis = DB::select("SELECT * FROM lines WHERE shabad_id = '$previousShabad->id' AND (gurmukhi like 'mÚ%' OR gurmukhi like 'slok %' OR gurmukhi like 'sloku %') ORDER BY order_id");
                if (count($panktis) > 0) {
                    array_unshift($shabads, $panktis[0]->shabad_id);
                } else {
                    break;
                }
            }

            $this->salokShabads[$shabads[0]] = $shabads;            
        }
    }

    public function printHukamNama()
    {
        $this->getPauriShabads();

        $salokShabads = [];
        for ($ang = 1; $ang <= 1430; $ang++) {
            $shabads = collect(DB::select(
                "SELECT id, order_id 
                FROM shabads
                WHERE id IN (
                    SELECT shabad_id
                    FROM lines
                    WHERE source_page = ?
                )
                AND source_id = 1
                ORDER BY order_id",
                [$ang]
            ));

            $pageSerial = 1;
            foreach ($shabads as $serial => $shabad) {
                $fileName = $this->getFileName($ang, $pageSerial);
                if (isset($this->salokShabads[$shabad->id])) {
                    $this->printSalok($shabad->id, $fileName);
                    echo "salok: $fileName<br />";
                    $salokShabads = $this->salokShabads[$shabad->id];
                    ob_flush();flush();
                    $pageSerial++;
                    continue;
                } elseif (in_array($shabad->id, $salokShabads)) {
                    echo 'skipping: ' . $ang . '-' . $serial . '<br />';
                    ob_flush();flush();
                    continue;
                }

                $salokShabads = [];
                $panktis = collect(DB::select(
                    "SELECT id, type_id, gurmukhi, translation, additional_information
                    FROM lines
                    LEFT JOIN translations ON translations.line_id = lines.id
                    AND translation_source_id = 6
                    WHERE shabad_id = '$shabad->id'
                    ORDER BY order_id ASC"
                ));

                $groups = [];
                $current = [];
                $prevTypeId = null;

                foreach ($panktis as $pankti) {
                    if ($prevTypeId !== null && $pankti->type_id !== $prevTypeId) {
                        if (!empty($current)) {
                            $groups[] = $current;
                            $current = [];
                        }
                    }

                    $current[] = $pankti;

                    if ($this->endsWithNumberMarker($pankti->gurmukhi)) {
                        $groups[] = $current;
                        $current = [];
                    }

                    $prevTypeId = $pankti->type_id;
                }

                if (!empty($current)) {
                    $groups[] = $current;
                }

                $fonts = [
                    'pankti' => 70,
                    'mangal' => 90,
                    'translation' => 50,
                    'title' => 100,
                    'arth' => 34,
                ];

                $this->printPdf($fileName, [
                    'shabad'     => $shabad,
                    'panktis'     => $panktis,
                    'groups' => $groups,
                    'ang'   => $ang,
                    'fonts' => $fonts,
                ]);

                $pageCount = $this->countPages($fileName);

                if ($pageCount > 1) {
                    $this->sclaePdf($fileName, [
                        'shabad'     => $shabad,
                        'panktis'     => $panktis,
                        'groups' => $groups,
                        'ang'   => $ang,
                        'fonts' => $fonts,
                    ]);
                }

                echo 'shabad: ' . $fileName . '<br />';
                ob_flush();flush();

                $pageSerial++;
            }
        }
    }
}
