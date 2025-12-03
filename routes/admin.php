<?php

use App\Http\Controllers\Gurbani\GurbaniController;
use App\Http\Controllers\Gurbani\GurbaniEReaderController;
use App\Services\BaniPrintService;
use App\Services\ShabadPrintService;
use Illuminate\Support\Facades\Route;

Route::get('gurbani', [GurbaniController::class, 'index'])->name('gurbani.index');
Route::get('gurbani/ereader', [GurbaniEReaderController::class, 'index'])->name('gurbani.index');
Route::get('gurbani/ereader/download/{type}/{serial?}', [GurbaniEReaderController::class, 'download'])->name('gurbani.index');

Route::get('gurbani/print/shabads', function() {
    app(ShabadPrintService::class)->download();
});

Route::get('gurbani/print/bani', function() {
    app(BaniPrintService::class)->download();
});