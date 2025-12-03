<?php

namespace App\Services;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Spatie\Browsershot\Browsershot;
use Spatie\LaravelPdf\Facades\Pdf;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ShabadPrintService
{
    public function download()
    {
        // for ($i = 1; $i <= 51; $i++) {
            $this->downloadShabads();
        // }
    }

    public function downloadShabads(int $sectionId = 5)
    {
        $result = DB::select("SELECT name_gurmukhi, name_english FROM sections WHERE id = $sectionId");

        $this->getPauriShabads($sectionId);
        $fileName = 'section_' . $sectionId . '_' . str_replace(' ', '_', strtolower($result[0]->name_english)) . '.pdf';

        $shabads = collect(DB::select(
            "SELECT id, order_id 
            FROM shabads 
            WHERE source_id = 1 
            and section_id = ?
            ORDER BY order_id",
            [$sectionId]
        ));

        if ($shabads->isEmpty()) {
            throw new NotFoundHttpException('No Shabads found.');
        }

        // Get all lines for these shabads
        $shabadIds = $shabads->pluck('id')->toArray();

        $lines = collect(DB::select(
            "SELECT id, shabad_id, type_id, gurmukhi, source_page 
            FROM lines 
            WHERE shabad_id IN ('" . implode("','", $shabadIds) . "') 
            ORDER BY shabad_id ASC, order_id ASC"
        ));

        // Group lines by shabad_id
        $grouped = $lines->groupBy('shabad_id');

        // total
        $groupedShabadIds = collect($this->salokShabads)->flatten()->unique();
        $nonGroupedShabadIds = collect($shabadIds)->diff($groupedShabadIds);
        $total = count($this->salokShabads) + $nonGroupedShabadIds->count();
        $total = 167;

        $serial = 1;
        // $total = count($shabadIds);
        $salokShabads = [];
        foreach ($shabadIds as $index => $shabadId) {
            if (isset($this->salokShabads[$shabadId])) {
                $salokShabads = $this->salokShabads[$shabadId];
                $panktis = collect([]);
                foreach ($salokShabads as $salokshabadId) {
                    $panktis = $panktis->concat($grouped[$salokshabadId]);
                }

                $this->printShabad($serial, $panktis, $sectionId, $total);
                $serial++;
                continue;
            } elseif (in_array($shabadId, $salokShabads)) {
                continue;
            }

            $salokShabads = [];
            $this->printShabad($serial, $grouped[$shabadId], $sectionId, $total);
            $serial++;
        }

        // Pass to Blade
        
    }

    private function getSirlekh($pankti)
    {
        if (in_array($pankti->gurmukhi, [
            'isrIrwgu mhlu 1 ]',
            'isrIrwgu mhl 1',
            'isrIrwgu kbIr jIau kw ]',
            'eyku suAwnu kY Gir gwvxw ]',
            'isrIrwgu kbIr jIau kw ] eyku suAwnu kY Gir gwvxw ]',
            'isrIrwgu iqRlocn kw ]',
            'sRIrwgu Bgq kbIr jIau kw ]',
            'sRIrwg bwxI Bgq byxI jIau kI ]',
            'phirAw kY Gir gwvxw ]',
            'sRIrwg bwxI Bgq byxI jIau kI ] phirAw kY Gir gwvxw ]',
            'isrIrwgu ]',
        ])) {
            $pankti->type_id = 2;
        }

        return $pankti;
    }

    private function printShabad(int $serial, $panktis, int $sectionId, int $total)
    {
        foreach ($panktis as $index => $pankti) {
            $panktis[$index] = $this->getSirlekh($pankti);
        }

        $pageCount = 0;
        $fileName = $serial . '.pdf';
        $panktiSize = 20;

        if (in_array($serial, [128, 129, 141])) {
            $groups = $this->getCustomPanktiGroups($serial, $panktis);
        } else {
            $groups = $this->getPanktiGroups($panktis);
        }

        do {
            Pdf::view('pdf.shabads-mobile', [
                'serial'     => $serial,
                'sectionId'  => $this->toRoman($sectionId),
                'total'      => $total,
                'panktiSize' => $panktiSize,
                'panktis'    => $panktis,
                'groups'     => $groups,
            ])
            // ->format([
            //     'width'  => '68.5mm',
            //     'height' => '137mm',
            // ])
            ->withBrowsershot(function (Browsershot $shot) {
                $shot->paperSize(61.8, 130);
            })
            // ->format('a4')
            ->save($fileName);

            $panktiSize = $panktiSize - 0.25;

            // $pageCount = 2;

            $pageCount = $this->countPages($fileName);

        } while ($pageCount > 1);
    }

    private $salokShabads = [];

    private function getPauriShabads(int $sectionId)
    {
        $pauris = collect(DB::select("SELECT shabads.*
            FROM lines
            INNER JOIN shabads ON lines.shabad_id = shabads.id
            WHERE gurmukhi like 'pauVI%'
            and section_id = ?
            AND shabads.source_id = 1", [$sectionId]
        ));

        foreach ($pauris as $pauri) {
            $previousShabads = DB::select("SELECT order_id, * FROM shabads WHERE source_id = 1 AND order_id < '{$pauri->order_id}' ORDER BY order_id desc LIMIT 10");
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

        // Shant and Daknas
        $shants = collect(DB::select("SELECT shabads.*
            FROM lines
            INNER JOIN shabads ON lines.shabad_id = shabads.id
            WHERE gurmukhi like 'CMqu ]'
            and section_id = ?
            AND shabads.source_id = 1", [$sectionId]
        ));

        foreach ($shants as $shant) {
            $previousShabads = DB::select("SELECT order_id, * FROM shabads WHERE source_id = 1 AND order_id < '{$shant->order_id}' ORDER BY order_id desc LIMIT 10");
            $shabads = [$shant->id];
            foreach ($previousShabads as $previousShabad) {
                $panktis = DB::select("SELECT * FROM lines WHERE shabad_id = '$previousShabad->id' AND (gurmukhi like 'fKxw %') ORDER BY order_id");
                if (count($panktis) > 0) {
                    array_unshift($shabads, $panktis[0]->shabad_id);
                } else {
                    break;
                }
            }

            $this->salokShabads[$shabads[0]] = $shabads;            
        }
    }

    private function toRoman($number) {
        if ($number < 1 || $number > 50) return $number; // fallback

        $map = [
            'L' => 50,
            'XL' => 40,
            'X' => 10,
            'IX' => 9,
            'V' => 5,
            'IV' => 4,
            'I' => 1,
        ];

        $result = '';
        foreach ($map as $roman => $value) {
            while ($number >= $value) {
                $result .= $roman;
                $number -= $value;
            }
        }
        return $result;
    }

    private function getPanktiGroups(Collection $panktis)
    {
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

        return $groups;
    }

    private function getCustomPanktiGroups($serial, $panktis)
    {
        $groups = [];
        $group = [];
        foreach ($panktis as $pankti) {
            if ($pankti->type_id < 3) {
                $group[] = $pankti;
                $groups[] = $group;
                $group = [];
            } else {
                $group[] = $pankti;
            }
        }

        $groups[] = $group;

        return $groups;
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
}