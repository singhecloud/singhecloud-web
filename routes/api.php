<?php

use App\Http\Controllers\Api\GurbaniApiController;
use Illuminate\Support\Facades\Route;
use Shetabit\Visitor\Middlewares\LogVisits;

Route::middleware([LogVisits::class])->group(function () {
    Route::get('/gurbani/angs/{ang}', [GurbaniApiController::class, 'getByAng']);
});