<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('speech_token_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('shabad_id');
            $table->string('line_id');
            $table->text('final_token')->nullable();
            $table->text('partial_token')->nullable();
            $table->text('corrected_token')->nullable();
            $table->enum('status', ['init', 'start', 'running', 'stopped']);
            $table->uuid('session_id')->index(); // session identifier
            $table->timestamp('started_at')->nullable(); // session start
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('speech_token_logs');
    }
};