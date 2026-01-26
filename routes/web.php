<?php

use App\Http\Controllers\Api\Admin\BlockedIpController;
use App\Http\Controllers\Api\Admin\VisitorController;
use App\Http\Controllers\Api\DashboardVisitorController;
use App\Http\Controllers\Learn\Punjabi\HomeController;
use App\Http\Controllers\Learn\Punjabi\ReadPunjabiController;
use App\Http\Controllers\Listen\GurbaniListenController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('home');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('/dashboard/visitors', [DashboardVisitorController::class, 'index']);
    Route::get('/visitors', [VisitorController::class, 'index']);
    Route::apiResource('blocked-ips', BlockedIpController::class);
});

Route::middleware(['auth', 'verified'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/visitors', function () {
            return Inertia::render('admin/visitors');
        })->name('visitors');

        Route::get('/block-ips', function () {
            return Inertia::render('admin/blockIps');
        })->name('blockIps');
    });

Route::get('/listen', [GurbaniListenController::class, 'index']);

Route::get('/learn/punjabi', HomeController::class)->name('learn.punjabi.home');
Route::get('/learn/punjabi/reading', [ReadPunjabiController::class, 'index'])->name('learn.punjabi.read');
Route::get('/learn/punjabi/reading/alphabets/{index}', [ReadPunjabiController::class, 'alphabets'])->name('learn.punjabi.read');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
