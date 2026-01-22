<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ImportAudioTranscriptions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:import-audio-transcriptions';

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
        $file = $this->argument('file');

        if (!file_exists($file)) {
            $this->error("File {$file} does not exist.");
            return 1;
        }

        $this->info("Reading file {$file}...");
        $data = json_decode(file_get_contents($file), true);

        if (empty($data)) {
            $this->warn("No data found in file.");
            return 0;
        }

        $this->info("Inserting {$this->countRows($data)} rows into server SQLite...");

        DB::transaction(function () use ($data) {
            // Optional: clear table first
            DB::table('audio_transcriptions')->truncate();

            // Insert in chunks
            collect($data)->chunk(500)->each(function ($chunk) {
                DB::table('audio_transcriptions')->insert($chunk->toArray());
            });
        });

        $this->info("Import completed successfully!");
        return 0;
    }

    private function countRows(array $data)
    {
        return count($data);
    }
}
