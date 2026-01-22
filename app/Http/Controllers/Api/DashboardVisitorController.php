<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Shetabit\Visitor\Models\Visit;

class DashboardVisitorController extends Controller
{
    public function index()
    {
        $week  = now()->startOfWeek();
        $month = now()->startOfMonth();
        $year  = now()->startOfYear();

        // ===== Tiles =====
        $totalVisits = Visit::count();

        // Unique visitor: visitor morph_id or IP or 'guest'
        $totalUnique = Visit::select(DB::raw("COALESCE(CAST(visitor_id AS CHAR), ip, 'guest') as visitor"))
            ->distinct()
            ->count('visitor');

        $weekUnique = Visit::where('created_at', '>=', $week)
            ->select(DB::raw("COALESCE(CAST(visitor_id AS CHAR), ip, 'guest') as visitor"))
            ->distinct()
            ->count('visitor');

        $monthUnique = Visit::where('created_at', '>=', $month)
            ->select(DB::raw("COALESCE(CAST(visitor_id AS CHAR), ip, 'guest') as visitor"))
            ->distinct()
            ->count('visitor');

        $yearUnique = Visit::where('created_at', '>=', $year)
            ->select(DB::raw("COALESCE(CAST(visitor_id AS CHAR), ip, 'guest') as visitor"))
            ->distinct()
            ->count('visitor');

        // ===== Area Chart (last 14 days unique) =====
        $areaChart = Visit::select(DB::raw("
                DATE(created_at) as date,
                COUNT(DISTINCT COALESCE(CAST(visitor_id AS CHAR), ip, 'guest')) as visitors
            "))
            ->where('created_at', '>=', now()->subDays(14))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // ===== Device Pie =====
        $devices = Visit::select('device')
            ->selectRaw('COUNT(*) as value')
            ->groupBy('device')
            ->get()
            ->map(fn ($d) => [
                'name' => ucfirst($d->device ?? 'Unknown'),
                'value' => $d->value,
            ]);

        // ===== Browser Pie =====
        $browsers = Visit::select('browser')
            ->selectRaw('COUNT(*) as value')
            ->groupBy('browser')
            ->get()
            ->map(fn ($b) => [
                'name' => ucfirst($b->browser ?? 'Unknown'),
                'value' => $b->value,
            ]);

        // ===== Geo Map =====
        $countries = Visit::select('country', 'country_code')
            ->selectRaw('COUNT(*) as value')
            ->groupBy('country', 'country_code')
            ->get()
            ->map(fn ($c) => [
                'country' => $c->country_code ?? $c->country ?? 'XX', // ISO_A2 code
                'value' => $c->value,
            ]);

        // ===== Heatmap =====
        $heatmap = Visit::selectRaw("
                DATE(created_at) as date,
                COUNT(*) as count
            ")
            ->where('created_at', '>=', now()->subYear())
            ->groupBy('date')
            ->get();

        return response()->json([
            // tiles
            'total_visits' => $totalVisits,
            'unique_visitors' => $totalUnique,
            'unique_this_week' => $weekUnique,
            'unique_this_month' => $monthUnique,
            'unique_this_year' => $yearUnique,

            // charts
            'area_chart' => $areaChart,
            'devices' => $devices,
            'browsers' => $browsers,
            'countries' => $countries,
            'heatmap' => $heatmap,
        ]);
    }
}
