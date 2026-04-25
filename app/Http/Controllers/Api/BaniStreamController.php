<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BaniStreamKey;

class BaniStreamController extends Controller
{
    public function validateName(string $name)
    {
        if (empty($name)) {
            abort(404);
        }

        $baniStreamKey = BaniStreamKey::where('name', $name)->first();

        if (!$baniStreamKey) {
            abort(404);
        }

        return response()->json([
            'id' => $baniStreamKey->id,
            'name' => $baniStreamKey->name,
            'user_id' => $baniStreamKey->user_id,
        ]);
    }
}