<?php

namespace App\Http\Controllers\Listen;

use Inertia\Inertia;

class GurbaniListenController
{
    public function index()
    {
        return Inertia::render('listen/index');
    }
}
