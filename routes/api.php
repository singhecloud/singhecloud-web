<?php

use App\Http\Controllers\Api\GurbaniApiController;
use Illuminate\Support\Facades\Route;

Route::get('/gurbani/angs/{ang}', [GurbaniApiController::class, 'getByAng']);
