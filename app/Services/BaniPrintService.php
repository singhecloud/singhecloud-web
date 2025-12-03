<?php

namespace App\Services;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Spatie\Browsershot\Browsershot;
use Spatie\LaravelPdf\Facades\Pdf;

class BaniPrintService
{
    public function download()
    {
        // for ($i = 1; $i <= 29; $i++) {
            $this->downloadShabads();
        // }
    }

    public function downloadShabads(int $baniId = 14)
    {
        

        $lines = collect(DB::select(
            "

            SELECT lines.id, split_pankti, bani_lines.section, line_group, lines.type_id, bani_lines.gurmukhi, lines.source_page 
            FROM bani_lines
            INNER JOIN lines ON (bani_lines.line_id = lines.id) 
            WHERE bani_id = $baniId
            ORDER BY line_group ASC, lines.order_id ASC

            
        "));

        // $lines = collect(DB::select(
        //     "
        //     select lines.id, 0 as split_pankti, 1 as section, 1 as line_group, lines.type_id, lines.gurmukhi, lines.source_page, order_id, 1 as order_page
        //     from lines
        //     where shabad_id = 'Z96'

        //     UNION ALL
            
            
        //     select lines.id, 0 as split_pankti, 1 as section, 1 as line_group, lines.type_id, lines.gurmukhi, lines.source_page, order_id, 2 as order_page
        //     from lines
        //     where shabad_id = '3T9'
        //     order by order_page, order_id    
        // "));

        

        // 41479

        // $lines = collect(DB::select(
        //     "SELECT lines.id, lines.type_id, lines.gurmukhi, lines.source_page 
        //     FROM lines
        //     INNER JOIN shabads ON lines.shabad_id = shabads.id
        //     WHERE shabads.source_id = 1
        //     ORDER BY lines.order_id ASC"
        // ));

        // $groups = $lines->groupBy('line_group');

        $this->printShabad($lines, $baniId);
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

    private function printShabad($panktis, $baniId)
    {
        $title = DB::select(
            "SELECT name_english 
            FROM banis
            WHERE id = $baniId"
        )[0]->name_english;

        $formattedId = str_pad($baniId, 2, '0', STR_PAD_LEFT);
        $formattedTitle = str_replace(' ', '_', $title);

        $fileName = $formattedId . '_' . $formattedTitle . '.pdf';

        // $fileName = '25_Basant_Ki_Vaar.pdf';

        $groups = $this->getPanktiGroups($panktis);
        // $panktiSize = 52;
        $panktiSize = 54;

        Pdf::view('pdf.bani', [
            'panktiSize' => $panktiSize,
            'groups'     => $groups,
        ])
        ->withBrowsershot(function (Browsershot $shot) {
            $shot->paperSize(240, 280)
                ->margins(4, 0, 2, 0);
        })
        ->format('a4')
        ->landscape()
        ->save($fileName);
    }

    private function printMobileShabad($panktis, $baniId)
    {
        $fileName = 'jaap_sahib.pdf';

        $groups = $this->getPanktiGroups($panktis);
        $panktiSize = 14;

        Pdf::view('pdf.bani-mobile', [
            'panktiSize' => $panktiSize,
            'groups'     => $groups,
        ])
        ->withBrowsershot(function (Browsershot $shot) {
            $shot->paperSize(61.8, 130)
                ->margins(4, 0, 2, 0);
        })
        ->save($fileName);
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

    private function endsWithNumberMarker(string $line): bool {
        $line = trim($line);
        // Match the final "]<digits>]" at the very end of the line (supports cases like ...]4]5])
        return (bool) preg_match('/\]\s*\d+\]\z/u', $line);
    }
}
