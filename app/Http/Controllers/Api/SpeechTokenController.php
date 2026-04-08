<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CurrentSpeechToken;
use App\Models\SpeechTokenLog;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Carbon\Carbon;

class SpeechTokenController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            't'  => 'nullable|string',               // final token
            'pt' => 'nullable|string',               // partial token
            'ct' => 'nullable|string',               // corrected token
            'st' => 'required|string|in:nt,st,rn,stp', // status codes
            'lid'=> 'required|string',               // line id
            'sid'=> 'required|string',               // shabad id
        ]);

        $statusMap = [
            'nt' => 'init',
            'st' => 'start',
            'rn' => 'running',
            'stp'=> 'stopped',
        ];

        $userId        = $request->user()->id;
        $lineId        = $validated['lid'];
        $shabadId      = $validated['sid'];
        $finalToken    = $validated['t'] ?? null;
        $partialToken  = $validated['pt'] ?? null;
        $correctedToken= $validated['ct'] ?? null;
        $status        = $statusMap[$validated['st']] ?? 'init';

        // --- Fetch last log for user ---
        $lastLog = SpeechTokenLog::where('user_id', $userId)->latest()->first();
        $newSession = true;
        $sessionId = (string) Str::uuid();

        if ($lastLog) {
            $lastUpdated = Carbon::parse($lastLog->updated_at);
            $diffMinutes = $lastUpdated->diffInMinutes(now());

            if ($lastLog->line_id === $lineId && $diffMinutes <= 15) {
                $newSession = false;
                $sessionId = $lastLog->session_id;
            }
        }

        // --- Update or create log ---
        if (!$newSession && $lastLog) {
            if ($finalToken) {
                $lastLog->final_token = trim(($lastLog->final_token ?? '') . ' ' . $finalToken);
            }
            $lastLog->partial_token = $partialToken ?? $lastLog->partial_token;
            $lastLog->corrected_token = $correctedToken ?? $lastLog->corrected_token;
            $lastLog->status = $status;
            $lastLog->save();
        } else {
            SpeechTokenLog::create([
                'user_id'       => $userId,
                'shabad_id'     => $shabadId,
                'line_id'       => $lineId,
                'final_token'   => $finalToken,
                'partial_token' => $partialToken,
                'corrected_token'=> $correctedToken,
                'status'        => $status,
                'session_id'    => $sessionId,
                'started_at'    => now(),
            ]);
        }

        // --- Update current state table ---
        $currentToken = CurrentSpeechToken::firstOrNew(['user_id' => $userId]);
        $currentToken->line_id = $lineId;
        $currentToken->shabad_id = $shabadId;

        if ($finalToken) {
            $currentToken->final_token = trim(($currentToken->final_token ?? '') . ' ' . $finalToken);
        }

        $currentToken->partial_token   = $partialToken ?? $currentToken->partial_token;
        $currentToken->corrected_token = $correctedToken ?? $currentToken->corrected_token;
        $currentToken->status          = $status;

        $currentToken->save();

        return response()->json([
            'success'    => true,
            'session_id' => $sessionId
        ]);
    }

    /**
     * Return current speech token for the authenticated user.
     */
    public function index(Request $request)
    {
        $userId = $request->user()->id;
        $token = CurrentSpeechToken::where('user_id', $userId)->first();

        return response()->json($token);
    }

    /**
     * List all sessions for the authenticated user
     */
    public function sessions(Request $request)
    {
        $userId = $request->user()->id;

        $sessions = SpeechTokenLog::where('user_id', $userId)
            ->select('session_id', 'shabad_id', 'line_id')
            ->selectRaw('MIN(started_at) as started_at, MAX(updated_at) as last_updated')
            ->groupBy('session_id', 'shabad_id', 'line_id')
            ->orderByDesc('started_at')
            ->get();

        return response()->json($sessions);
    }

    /**
     * Get all logs for a specific session
     */
    public function getSessionLogs(Request $request, $sessionId)
    {
        $userId = $request->user()->id;

        $logs = SpeechTokenLog::where('user_id', $userId)
            ->where('session_id', $sessionId)
            ->orderBy('created_at')
            ->get();

        if ($logs->isEmpty()) {
            return response()->json(['message' => 'Session not found'], 404);
        }

        return response()->json($logs);
    }
}