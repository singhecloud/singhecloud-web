<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class ApiKeyController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user();

        return Inertia::render('settings/apiKeys', [
            'hasToken' => $user->tokens()->exists()
        ]);
    }

    public function generate(Request $request)
    {
        $user = $request->user();

        $user->tokens()->delete();
        $token = $user->createToken('api-token')->plainTextToken;

        return redirect()
            ->route('api.keys')
            ->with('flash', [
                'type' => 'api_token',
                'data' => $token,
            ]);
    }
}