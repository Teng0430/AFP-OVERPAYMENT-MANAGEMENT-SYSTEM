<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PensionerResource;
use App\Models\Pensioner;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SearchController extends Controller
{
    /** @var array<int, string> */
    private const ALLOWED_SORT_COLUMNS = [
        'id', 'rank', 'name', 'serial_number', 'account_number',
        'date_of_death', 'cause_of_stoppage', 'agency_name',
        'monthly_pension', 'agency_deduction', 'fractional_days',
        'whole_months', 'amount_collected', 'date_collected',
        'status', 'created_at', 'updated_at',
    ];

    public function search(Request $request): AnonymousResourceCollection
    {
        $query = Pensioner::query();

        $query->with(['uploadBatch', 'creator']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search): void {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('serial_number', 'like', "%{$search}%")
                    ->orWhere('account_number', 'like', "%{$search}%");
            });
        }

        if ($request->filled('rank')) {
            $query->whereIn('rank', (array) $request->input('rank'));
        }

        if ($request->filled('agency')) {
            $query->whereIn('agency_name', (array) $request->input('agency'));
        }

        if ($request->filled('status')) {
            $query->whereIn('status', (array) $request->input('status'));
        }

        if ($request->filled('date_from')) {
            $query->whereDate('date_of_death', '>=', $request->input('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('date_of_death', '<=', $request->input('date_to'));
        }

        if ($request->filled('amount_min') || $request->filled('amount_max')) {
            $subtotalRaw = 'CAST((monthly_pension * fractional_days) + (monthly_pension * whole_months) AS DECIMAL(12, 2))';

            if ($request->filled('amount_min')) {
                $query->whereRaw("{$subtotalRaw} >= ?", [(float) $request->input('amount_min')]);
            }

            if ($request->filled('amount_max')) {
                $query->whereRaw("{$subtotalRaw} <= ?", [(float) $request->input('amount_max')]);
            }
        }

        $sortBy = $request->input('sort_by', 'name');
        $sortDir = $request->input('sort_dir', 'asc');

        if (! in_array($sortBy, self::ALLOWED_SORT_COLUMNS, true)) {
            $sortBy = 'name';
        }

        if (! in_array(strtolower($sortDir), ['asc', 'desc'], true)) {
            $sortDir = 'asc';
        }

        $query->orderBy($sortBy, $sortDir);

        $perPage = min((int) $request->input('per_page', 50), 100);
        $pensioners = $query->paginate($perPage);

        return PensionerResource::collection($pensioners);
    }
}
