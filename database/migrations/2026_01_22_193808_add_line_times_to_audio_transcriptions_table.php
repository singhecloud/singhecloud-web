<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('audio_transcriptions', function (Blueprint $table) {
            $table->decimal('line_start_time', 10, 3)
                  ->nullable()
                  ->after('end_time');

            $table->decimal('line_end_time', 10, 3)
                  ->nullable()
                  ->after('line_start_time');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('audio_transcriptions', function (Blueprint $table) {
            $table->dropColumn([
                'line_start_time',
                'line_end_time',
            ]);
        });
    }
};
