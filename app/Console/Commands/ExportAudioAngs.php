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

    public function handle()
    {
        $bitrates = ['48k', '64k'];

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

            $partsGrouped = $rows->groupBy('audio_source_part');

            $partOffsets = [];
            $currentOffset = 0;

            // Temp files per bitrate
            $tempFiles = [];
            foreach ($bitrates as $bitrate) {
                $tempFiles[$bitrate] = [];
            }

            DB::beginTransaction();

            try {
                // ---- Extract parts per bitrate ----
                foreach ($partsGrouped as $part => $panktis) {

                    $partStart = $panktis->min('start_time');
                    $partEnd   = $panktis->max('end_time');
                    $partDuration = $partEnd - $partStart;

                    $partOffsets[$part] = [
                        'offset' => $currentOffset,
                        'start'  => $partStart,
                    ];

                    $inputFile = resource_path(
                        "audio/sehaj_paath/sehaj_path_bhai_sarwan_singh_part{$part}.mp3"
                    );

                    if (!file_exists($inputFile)) {
                        throw new \Exception("Missing audio part file: {$inputFile}");
                    }

                    foreach ($bitrates as $bitrate) {

                        $tmpDir = public_path("audio/tmp/{$bitrate}");
                        if (!is_dir($tmpDir)) {
                            mkdir($tmpDir, 0775, true);
                        }

                        $tempOutput = "{$tmpDir}/ang{$ang}_part{$part}.webm";
                        $tempFiles[$bitrate][] = $tempOutput;

                        $cmd = sprintf(
                            'ffmpeg -y -ss %s -i "%s" -t %s -vn -c:a libopus -b:a %s -application voip "%s" 2>&1',
                            $partStart,
                            $inputFile,
                            $partDuration,
                            $bitrate,
                            $tempOutput
                        );

                        exec($cmd, $out, $code);

                        if ($code !== 0) {
                            throw new \Exception("FFmpeg failed for Ang {$ang}, part {$part}, {$bitrate}");
                        }
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

                // ---- Final Ang output per bitrate ----
                foreach ($bitrates as $bitrate) {

                    $finalDir = public_path("audio/angs/{$bitrate}");
                    if (!is_dir($finalDir)) {
                        mkdir($finalDir, 0775, true);
                    }

                    $finalOutput =
                        "{$finalDir}/sehaj_path_bhai_sarwan_singh_ang{$ang}.webm";

                    $files = $tempFiles[$bitrate];

                    if (count($files) === 1) {
                        rename($files[0], $finalOutput);
                    } else {
                        $listFile = public_path("audio/tmp/ang{$ang}_{$bitrate}_list.txt");

                        $listContent = collect($files)
                            ->map(fn ($file) => "file '{$file}'")
                            ->implode("\n");

                        file_put_contents($listFile, $listContent);

                        $concatCmd = sprintf(
                            'ffmpeg -y -f concat -safe 0 -i "%s" -c copy "%s" 2>&1',
                            $listFile,
                            $finalOutput
                        );

                        exec($concatCmd, $out, $code);

                        if ($code !== 0) {
                            throw new \Exception("Concat failed for Ang {$ang} ({$bitrate})");
                        }

                        @unlink($listFile);
                    }
                }

                DB::commit();
                $this->info("Ang {$ang} exported (48k + 64k) & line timings saved.");

            } catch (\Throwable $e) {
                DB::rollBack();
                $this->error("Failed Ang {$ang}: " . $e->getMessage());
            }

            // ---- Cleanup temp files ----
            foreach ($tempFiles as $files) {
                foreach ($files as $file) {
                    @unlink($file);
                }
            }
        }

        $this->info("All Angs processed successfully 🎧");
    }
}
