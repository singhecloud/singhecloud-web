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
        // Fetch distinct Angs
        $angs = collect(DB::select(
            "SELECT DISTINCT source_page
            FROM lines
            INNER JOIN audio_transcriptions ON lines.id = audio_transcriptions.line_id
            ORDER BY source_page"
        ));

        if ($angs->isEmpty()) {
            $this->error("No Angs found.");
            return;
        }

        foreach ($angs as $angRow) {
            $ang = $angRow->source_page;
            $this->info("Processing Ang {$ang}...");

            // Fetch all lines for this Ang across all parts
            $rows = collect(DB::select(
                "SELECT l.id AS line_id,
                        audio_source_part,
                        l.order_id,
                        at.start_time,
                        at.end_time
                FROM lines l
                INNER JOIN audio_transcriptions at ON l.id = at.line_id
                WHERE l.source_page = ?
                ORDER BY audio_source_part, l.order_id",
                [$ang]
            ));

            if ($rows->isEmpty()) {
                $this->warn("No audio rows for Ang {$ang}, skipping.");
                continue;
            }

            // Group by audio part
            $partsGrouped = $rows->groupBy('audio_source_part');

            // Track part offsets inside Ang timeline
            $partOffsets = [];
            $currentOffset = 0;

            // Temp files for ffmpeg concat
            $tempFiles = [];

            DB::beginTransaction();

            try {
                foreach ($partsGrouped as $part => $panktis) {

                    $partStart = $panktis->min('start_time');
                    $partEnd   = $panktis->max('end_time');
                    $partDuration = $partEnd - $partStart;

                    $partOffsets[$part] = [
                        'offset' => $currentOffset,
                        'start'  => $partStart,
                    ];

                    // ---- FFmpeg extraction for this part ----
                    $inputFile = public_path("audio/sehaj_path_bhai_sarwan_singh_part{$part}.webm");

                    if (!file_exists($inputFile)) {
                        throw new \Exception("Missing audio part file: {$inputFile}");
                    }

                    $tempOutput = public_path("audio/tmp/ang{$ang}_part{$part}.webm");
                    $tempFiles[] = $tempOutput;

                    $cmd = sprintf(
                        'ffmpeg -y -i "%s" -ss %s -t %s "%s"',
                        $inputFile,
                        $partStart,
                        $partDuration,
                        $tempOutput
                    );

                    exec($cmd, $out, $code);

                    if ($code !== 0) {
                        throw new \Exception("FFmpeg failed for Ang {$ang}, part {$part}");
                    }

                    $currentOffset += $partDuration;
                }

                // ---- Calculate & persist per-line Ang timing ----
                foreach ($rows as $row) {
                    $part = $row->audio_source_part;

                    $relativeStart = $row->start_time - $partOffsets[$part]['start'];
                    $duration      = $row->end_time - $row->start_time;

                    $lineStart = $partOffsets[$part]['offset'] + $relativeStart;
                    $lineEnd   = $lineStart + $duration;

                    DB::update(
                        "UPDATE audio_transcriptions
                        SET line_start_time = ?, line_end_time = ?
                        WHERE line_id = ?",
                        [$lineStart, $lineEnd, $row->line_id]
                    );
                }

                // ---- Final Ang output ----
                $finalOutput = public_path(
                    "audio/angs/sehaj_path_bhai_sarwan_singh_ang{$ang}.webm"
                );

                // Single part → move file
                if (count($tempFiles) === 1) {
                    rename($tempFiles[0], $finalOutput);
                } else {
                    // Multi-part → concat
                    $listFile = public_path("audio/tmp/ang{$ang}_list.txt");

                    $listContent = collect($tempFiles)
                        ->map(fn ($file) => "file '{$file}'")
                        ->implode("\n");

                    file_put_contents($listFile, $listContent);

                    $concatCmd = sprintf(
                        'ffmpeg -y -f concat -safe 0 -i "%s" -c copy "%s"',
                        $listFile,
                        $finalOutput
                    );

                    exec($concatCmd, $out, $code);

                    if ($code !== 0) {
                        throw new \Exception("Concat failed for Ang {$ang}");
                    }

                    @unlink($listFile);
                }

                DB::commit();
                $this->info("Ang {$ang} exported & line timings saved.");

            } catch (\Throwable $e) {
                DB::rollBack();
                $this->error("Failed Ang {$ang}: " . $e->getMessage());
            }

            // Cleanup temp files
            foreach ($tempFiles as $file) {
                @unlink($file);
            }
        }

        $this->info("All Angs processed successfully 🎧");
    }
}
