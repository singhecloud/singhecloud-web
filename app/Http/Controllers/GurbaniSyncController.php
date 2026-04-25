<?php

namespace App\Http\Controllers;

use App\Models\BaniStreamKey;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GurbaniSyncController extends Controller
{
    public function __invoke(string $keyName, Request $request)
    {
        if (empty($keyName)) {
            abort(404);
        }

        $baniStreamKey = BaniStreamKey::where('name', $keyName)->first();
        if (!$baniStreamKey) {
            abort(404);
        }

        return Inertia::render('gurbani/sync', [
            'wssServer' => config('app.wss_public_server'),
            'streamKeyName' => $baniStreamKey->name,
            'showSettings' => $request->has('settings'),
        ]);
    }
}