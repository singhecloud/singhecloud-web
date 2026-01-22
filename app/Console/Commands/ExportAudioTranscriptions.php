<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ExportAudioTranscriptions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:export-audio-transcriptions';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info("Fetching rows from local SQLite...");

        $rows = DB::table('audio_transcriptions')->get();

        if ($rows->isEmpty()) {
            $this->warn("No rows found to export.");
            return 0;
        }

        $filename = 'audio_transcriptions_export.json';
        $path = storage_path($filename);

        file_put_contents($path, $rows->toJson(JSON_PRETTY_PRINT));

        $this->info("Exported {$rows->count()} rows to {$path}");
        return 0;
    }
}
