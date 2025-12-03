<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Spatie\LaravelPdf\Facades\Pdf;

class PrintService
{
    public function download()
    {
        set_time_limit(0);
        ini_set('max_execution_time', 0);
        $angs = [91];
        for ($ang = 152; $ang <= 152; $ang++) {
            // if (! in_array($ang, $angs) && $ang < 284) {
            //     continue;
            // }

            $panktis = collect(DB::select("
                SELECT gurmukhi, type_id
                FROM lines
                INNER JOIN shabads ON shabads.id = lines.shabad_id
                WHERE source_page = ?
                AND source_id = 1
                ORDER BY lines.order_id
            ", [$ang]));

            $file = str_pad($ang, 4, '0', STR_PAD_LEFT) . '.pdf';
            $fontSize = 40;

            do {
                Pdf::view('pdf.paath', [
                    'ang' => $ang,
                    'panktis' => $panktis,
                    'fontSize' => $fontSize
                ])
                ->landscape()
                ->save($file);
                $fontSize = $fontSize - 2;
            } while ($this->countPages($file) > 1);

            $fontSize = $fontSize + 6;
            do {
                Pdf::view('pdf.paath', [
                    'ang' => $ang,
                    'panktis' => $panktis,
                    'fontSize' => $fontSize
                ])
                ->landscape()
                ->save($file);
                $fontSize = $fontSize - 1;
            } while ($this->countPages($file) > 1);

            $fontSize = $fontSize + 2;

            do {
                Pdf::view('pdf.paath', [
                    'ang' => $ang,
                    'panktis' => $panktis,
                    'fontSize' => $fontSize
                ])
                ->landscape()
                ->save($file);
                $fontSize = $fontSize - 0.1;
            } while ($this->countPages($file) > 1);

            echo $ang . '<br />';
            ob_flush();flush();

            // return Pdf::view('pdf.paath', [
            //         'ang' => $ang,
            //         'panktis' => $panktis,
            //         'fontSize' => $fontSize - 0.1
            //     ])
            //     ->landscape()
            //     ->inline();
            // dd();
        }
    }

    private function countPages(string $file): int {
        return (new \Smalot\PdfParser\Parser())->parseFile($file)->getDetails()['Pages'] ?? 1;
    }
}
