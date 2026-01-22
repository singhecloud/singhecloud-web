<?php

namespace App\Http\Controllers\Api;

use Illuminate\Support\Facades\DB;

class GurbaniApiController
{
    public function getByAng($ang)
    {
        // Ensure that the ang is within the valid range
        if ($ang < 1 || $ang > 56) return;

        // Fetch the last pankti of the previous ang to get the end_time
        $previousAng = $ang - 1;
        $lastPanktiOfPreviousAng = DB::selectOne(
            "SELECT max(end_time) as end_time
            FROM audio_transcriptions
            WHERE ang = ?",
            [$previousAng]
        );

        // If the previous ang exists and has a last pankti, get its end_time
        $previousAngEndTime = $lastPanktiOfPreviousAng ? $lastPanktiOfPreviousAng->end_time : 0;

        // Fetch the panktis for the current ang
        $panktis = collect(DB::select(
            "SELECT
                audio_source_part,
                lines.id, lines.gurmukhi, translation, additional_information, source_page, start_time, end_time
            FROM lines
            INNER JOIN audio_transcriptions ON lines.id = audio_transcriptions.line_id
            LEFT JOIN translations ON translations.line_id = lines.id
            AND translation_source_id = 6
            WHERE source_page = ?
            ORDER BY lines.order_id ASC",
            [$ang]
        ));

        // Adjust the start_time and end_time of each pankti based on the previous ang's end_time
        if ($panktis->isNotEmpty() && $previousAngEndTime > 0 && ($panktis[0]->start_time - $previousAngEndTime) > 0) {
            $panktis->transform(function ($pankti) use ($previousAngEndTime) {
                // Adjust the start_time and end_time by subtracting the end_time of the previous ang
                $pankti->start_time = $pankti->start_time - $previousAngEndTime;
                $pankti->end_time = $pankti->end_time - $previousAngEndTime;
                return $pankti;
            });
        }

        return [
            'ang' => $ang,
            'panktis' => $panktis,
        ];
    }
}
