<?php

namespace App\Http\Controllers\Gurbani;

use App\Http\Controllers\Controller;
use App\Services\ShabadService;
use Inertia\Inertia;

class GurbaniEReaderController extends Controller
{
    public function index()
    {
        return Inertia::render('gurbani/ereader/index');
    }

    public function download($type, $serial = null)
    {
        $shabadService = new ShabadService();
        return $shabadService->download($type, $serial);
    }
}
