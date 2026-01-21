<?php

namespace App\Http\Controllers\Api;

use Illuminate\Support\Facades\DB;

class GurbaniApiController
{
    public function getByAng($ang)
    {
        if ($ang < 1 || $ang > 56) return;

        $panktis = collect(DB::select(
            "SELECT
            audio_source_part,
            lines.id, lines.gurmukhi, translation, additional_information, start_time, end_time
            FROM lines
            INNER JOIN audio_transcriptions ON lines.id = audio_transcriptions.line_id
            LEFT JOIN translations ON translations.line_id = lines.id
            AND translation_source_id = 6
            WHERE source_page = $ang
            ORDER BY lines.order_id ASC"
        ));

        return [
            'ang' => $ang,
            'panktis' => $panktis,
        ];
    }
}