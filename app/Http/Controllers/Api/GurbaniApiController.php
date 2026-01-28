<?php

namespace App\Http\Controllers\Api;

use Illuminate\Support\Facades\DB;

class GurbaniApiController
{
    public function getByAng($ang)
    {
        // Ensure ang is within valid range
        if ($ang < 1 || $ang > 150) {
            return;
        }

        $panktis = DB::select(
            "SELECT
                l.id,
                l.gurmukhi,
                t.translation,
                t.additional_information,
                source_page,
                at.line_start_time AS start_time,
                at.line_end_time   AS end_time
            FROM audio_transcriptions at
            INNER JOIN lines l ON l.id = at.line_id
            LEFT JOIN translations t
                ON t.line_id = l.id
               AND t.translation_source_id = 6
            WHERE source_page = ?
            ORDER BY l.order_id ASC",
            [$ang]
        );

        return [
            'ang' => $ang,
            'panktis' => $panktis,
        ];
    }
}
