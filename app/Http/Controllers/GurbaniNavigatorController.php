<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class GurbaniNavigatorController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('gurbani/navigator', [
            'apiToken' => config('app.api_token'),
            'appId' => config('app.app_id'),
            'wssServer' => config('app.wss_server'),
        ]);
    }
}
