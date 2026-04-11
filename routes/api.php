<?php

use App\Http\Controllers\Api\GurbaniApiController;
use App\Http\Controllers\Api\SpeechTokenController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Shetabit\Visitor\Middlewares\LogVisits;

Route::middleware([LogVisits::class])->group(function () {
    Route::get('/gurbani/angs/{ang}', [GurbaniApiController::class, 'getByAng']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function(Request $request) {
        $user = $request->user();

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
        ]);
    });

    Route::post('/speech/token', [SpeechTokenController::class, 'store'])->name('speech.tokens.create');
});