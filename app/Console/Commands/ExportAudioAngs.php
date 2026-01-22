<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ExportAudioAngs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:export-audio-angs';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Export audio segments for each Ang from the source audio file based on start_time and end_time from panktis.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Fetch the audio parts and their associated Angs
        $audioParts = collect(DB::select(
            "SELECT DISTINCT audio_source_part
            FROM lines
            INNER JOIN audio_transcriptions ON lines.id = audio_transcriptions.line_id
            WHERE audio_source_part IS NOT NULL"
        ));

        if ($audioParts->isEmpty()) {
            $this->error("No audio parts found.");
            return;
        }

        // Loop through each audio part
        foreach ($audioParts as $audioPart) {
            $this->info("Processing Part {$audioPart->audio_source_part}...");

            // Fetch all the panktis for this part, grouped by Ang
            $angs = collect(DB::select(
                "SELECT source_page, audio_source_part, start_time, end_time
                FROM lines
                INNER JOIN audio_transcriptions ON lines.id = audio_transcriptions.line_id
                WHERE audio_source_part = ?
                ORDER BY source_page, lines.order_id",
                [$audioPart->audio_source_part]
            ));

            // Group panktis by Ang
            $angsGrouped = $angs->groupBy('source_page');

            // Process each Ang
            foreach ($angsGrouped as $ang => $panktis) {
                $this->info("Processing Ang {$ang}...");

                // Calculate the min start_time and max end_time for the whole Ang
                $minStartTime = $panktis->min('start_time');
                $maxEndTime = $panktis->max('end_time');

                // Output file name
                $outputFileName = "sehaj_path_bhai_sarwan_singh_ang{$ang}.webm";

                // Path to the original part file (using the audio source part)
                $audioFileName = "sehaj_path_bhai_sarwan_singh_part{$audioPart->audio_source_part}.webm";
                $inputFilePath = public_path("audio/{$audioFileName}");
                $outputFilePath = public_path("audio/angs/{$outputFileName}");

                // Check if the input file exists
                if (!file_exists($inputFilePath)) {
                    $this->error("Input file {$audioFileName} not found. Skipping Ang {$ang}.");
                    continue;
                }

                // Calculate the duration for the segment (max end_time - min start_time)
                $duration = $maxEndTime - $minStartTime;

                // Run ffmpeg command to split the audio for this Ang
                $ffmpegCommand = "ffmpeg -i {$inputFilePath} -ss {$minStartTime} -t {$duration} {$outputFilePath}";

                // Execute the command
                $output = [];
                $resultCode = null;
                exec($ffmpegCommand, $output, $resultCode);

                // Check result of the command
                if ($resultCode === 0) {
                    $this->info("Successfully exported Ang {$ang} to {$outputFileName}");
                } else {
                    $this->error("Failed to export Ang {$ang}. Error: " . implode("\n", $output));
                }
            }
        }

        // Final completion message
        $this->info("Audio export for all Angs completed.");
    }
}
