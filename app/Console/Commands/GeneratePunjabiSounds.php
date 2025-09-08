<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\Console\Attribute\AsCommand;

#[AsCommand(name: 'tts:letter', description: 'Generate MP3 for a Punjabi letter (Google TTS REST + API key)')]
class GeneratePunjabiSounds extends Command
{
    protected $signature = 'tts:letter
        {letter : Punjabi letter to synthesize (e.g. ਓ)}
        {--slug= : Filename slug (default based on letter)}
        {--rate=1.0 : Speaking rate (0.25–4.0)}
        {--out=sounds : Storage path relative to storage/app/private}
        {--overwrite : Overwrite existing file if present}';
        // e.g php artisan tts:letter "ਚਚਾ ਚਮਚਾ|" --slug=11 --rate=0.6

    protected $description = 'Generate MP3 sound for any Punjabi letter using Google Cloud Text-to-Speech (API key + REST API)';

    public function handle(): int
    {
        $letter = $this->argument('letter');
        $slug = $this->option('slug') ?? $this->slugFromLetter($letter);
        $outDir = $this->option('out');
        $rate = (float) $this->option('rate');
        $overwrite = (bool) $this->option('overwrite');

        $path = "{$outDir}/{$slug}.mp3";
        $fsPath = storage_path("app/{$path}");

        if (file_exists($fsPath) && !$overwrite) {
            $this->warn("⏭ File exists, skipping: {$path}");
            return Command::SUCCESS;
        }

        $apiKey = env('GOOGLE_API_KEY');
        if (!$apiKey) {
            $this->error("❌ GOOGLE_API_KEY not set in .env");
            return Command::FAILURE;
        }

        $response = Http::withHeaders([
            'X-Goog-Api-Key' => $apiKey,
            'Content-Type'   => 'application/json',
        ])->post('https://texttospeech.googleapis.com/v1/text:synthesize', [
            'input' => ['text' => $letter],
            // pa-IN-Standard-A
            'voice' => ['languageCode' => 'pa-IN', 'name' => 'pa-IN-Wavenet-C'],
            'audioConfig' => [
                'audioEncoding' => 'MP3',
                'speakingRate'  => $rate,
            ],
        ]);

        if ($response->failed()) {
            $this->error("❌ API call failed: " . $response->body());
            return Command::FAILURE;
        }

        $audioB64 = $response->json('audioContent');
        if (!$audioB64) {
            $this->error("❌ No audio content returned");
            return Command::FAILURE;
        }

        Storage::put($path, base64_decode($audioB64));
        $this->info("✅ Saved: storage/app/{$path} letter: " . $letter);
        $this->line("   Public URL: /storage/" . str_replace('public/', '', $path));

        return Command::SUCCESS;
    }

    protected function slugFromLetter(string $letter): string
    {
        $map = [
            'ਓ' => 'oora',
            'ਆ' => 'aara',
            'ਈ' => 'eeree',
            'ਉ' => 'uri',
            'ਊ' => 'ooree',
            'ਅ' => 'ura',
        ];
        return $map[$letter] ?? 'letter_' . bin2hex($letter);
    }
}
