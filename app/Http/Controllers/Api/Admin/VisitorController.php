<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Shetabit\Visitor\Models\Visit;

class VisitorController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->integer('perPage', 25);
        $page    = $request->integer('page', 1);
        $sort    = $request->get('sort', 'created_at');
        $order   = $request->get('order', 'DESC');

        $query = Visit::query();

        /* --------------------
         | Text Filters
         |--------------------*/
        $query->when($request->ip, fn ($q) =>
            $q->where('ip', 'like', "%{$request->ip}%")
        );

        $query->when($request->visitor_id, fn ($q) =>
            $q->where('visitor_id', $request->visitor_id)
        );

        $query->when($request->url, fn ($q) =>
            $q->where('url', 'like', "%{$request->url}%")
        );

        $query->when($request->useragent, fn ($q) =>
            $q->where('useragent', 'like', "%{$request->useragent}%")
        );

        /* --------------------
         | Exclude Admin URLs
         |--------------------*/
        $query->when($request->exclude_admin, fn ($q) =>
            $q->where('url', 'not like', '%/admin%')
            ->where('url', 'not like', '%/dashboard%')
            ->where('url', 'not like', '%/logout%')
            ->where('url', 'not like', '%/visitors%')
        );

        /* --------------------
         | Select Filters
         |--------------------*/
        $query->when($request->browser, fn ($q) =>
            $q->where('browser', $request->browser)
        );

        $query->when($request->platform, fn ($q) =>
            $q->where('platform', $request->platform)
        );

        $query->when($request->device, fn ($q) =>
            $q->where('device', $request->device)
        );

        /* --------------------
         | Geo Filters (optional)
         |--------------------*/
        $query->when($request->country, fn ($q) =>
            $q->where('country', $request->country)
        );

        $query->when($request->city, fn ($q) =>
            $q->where('city', 'like', "%{$request->city}%")
        );

        /* --------------------
         | Date Filters
         |--------------------*/
        $query->when($request->visited_from, fn ($q) =>
            $q->whereDate('created_at', '>=', $request->visited_from)
        );

        $query->when($request->visited_to, fn ($q) =>
            $q->whereDate('created_at', '<=', $request->visited_to)
        );

        $query->orderBy($sort, $order);

        $visits = $query->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'data' => $visits->map(fn ($v) => [
                'id'         => $v->id,
                'visitor_id' => $v->visitor_id,
                'ip'         => $v->ip,
                'browser'    => $v->browser,
                'platform'   => $v->platform,
                'device'     => $v->device,
                'useragent'  => $v->useragent,
                'url'        => $v->url,
                'country'    => $v->country ?? null,
                'city'       => $v->city ?? null,
                'visited_at' => $v->created_at,
            ]),
            'total' => $visits->total(),
        ]);
    }
}
