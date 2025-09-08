<?php

namespace App\Http\Controllers\Learn\Punjabi;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class ReadPunjabiController extends Controller
{
    public function index()
    {
        return Inertia::render('learn/punjabi/reading');
    }

    public function alphabets($index)
    {
        return Inertia::render('learn/punjabi/alphabets', [
            'serial' => (int) $index
        ]);
    }
}
