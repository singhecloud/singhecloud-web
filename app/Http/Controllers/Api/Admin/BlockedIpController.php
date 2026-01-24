<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlockedIp;
use Illuminate\Http\Request;

class BlockedIpController extends Controller
{
    public function index()
    {
        return BlockedIp::orderBy('created_at', 'desc')->get();
    }

    public function store(Request $request)
    {
        $request->validate(['ip' => 'required|ip|unique:blocked_ips,ip']);
        return BlockedIp::create($request->only('ip', 'note'));
    }

    public function update(Request $request, BlockedIp $blockedIp)
    {
        $request->validate(['ip' => "required|ip|unique:blocked_ips,ip,{$blockedIp->id}"]);
        $blockedIp->update($request->only('ip', 'note'));
        return $blockedIp;
    }

    public function destroy(BlockedIp $blockedIp)
    {
        $blockedIp->delete();
        return response()->noContent();
    }
}
