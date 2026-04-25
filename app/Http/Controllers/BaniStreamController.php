<?php

namespace App\Http\Controllers;

use App\Models\BaniStreamKey;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BaniStreamController extends Controller
{
    public function get(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('settings/bani-stream', [
            'baniStreamKey' => $user->baniStreamKey,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:1000'],
            'gurdwara_sahib' => ['boolean'],
        ]);

        $request->user()->baniStreamKey()->updateOrCreate(
            [],
            $validated
        );

        return redirect()
            ->route('api.bani-stream.get')
            ->with('success', 'Bani Stream settings saved successfully.');
    }
}