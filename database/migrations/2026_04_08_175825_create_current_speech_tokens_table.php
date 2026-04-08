<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('current_speech_tokens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete()->unique();
            $table->string('shabad_id')->nullable();
            $table->string('line_id')->nullable();
            $table->text('final_token')->nullable();
            $table->text('partial_token')->nullable();
            $table->text('corrected_token')->nullable();
            $table->enum('status', ['init', 'start', 'running', 'stopped'])->default('init');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('current_speech_tokens');
    }
};