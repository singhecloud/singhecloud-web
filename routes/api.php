<?php

use App\Http\Controllers\Api\GurbaniApiController;
use App\Http\Controllers\Api\SpeechTokenController;
use Illuminate\Support\Facades\Route;
use Shetabit\Visitor\Middlewares\LogVisits;

Route::middleware([LogVisits::class])->group(function () {
    Route::get('/gurbani/angs/{ang}', [GurbaniApiController::class, 'getByAng']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/speech/token', [SpeechTokenController::class, 'store'])->name('speech.tokens.create');
});