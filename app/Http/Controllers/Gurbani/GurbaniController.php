<?php

namespace App\Http\Controllers\Gurbani;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class GurbaniController extends Controller
{
    public function index()
    {
        return Inertia::render('gurbani/index');
    }
}
