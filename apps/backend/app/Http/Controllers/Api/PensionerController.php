<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePensionerRequest;
use App\Http\Requests\UpdatePensionerRequest;
use App\Http\Resources\PensionerResource;
use App\Models\Pensioner;
use App\Services\OverpaymentCalculationService;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PensionerController extends Controller
{
    /**
     * @var array<int, string>
     */
    private const ALLOWED_SORT_COLUMNS = [
        'id', 'rank', 'name', 'serial_number', 'account_number',
        'date_of_death', 'cause_of_stoppage', 'agency_name',
        'monthly_pension', 'agency_deduction', 'fractional_days',
        'whole_months', 'amount_collected', 'date_collected',
        'status', 'last_payment', 'created_at', 'updated_at',
    ];

    public function index(Request $request): JsonResponse
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

        if ($request->filled('agency_name')) {
            $query->whereIn('agency_name', (array) $request->input('agency_name'));
        }

        if ($request->filled('status')) {
            $query->whereIn('status', (array) $request->input('status'));
        }

        if ($request->filled('cause_of_stoppage')) {
            $query->whereIn('cause_of_stoppage', (array) $request->input('cause_of_stoppage'));
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

        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');

        if (! in_array($sortBy, self::ALLOWED_SORT_COLUMNS, true)) {
            $sortBy = 'created_at';
        }

        if (! in_array(strtolower($sortDir), ['asc', 'desc'], true)) {
            $sortDir = 'desc';
        }

        $query->orderBy($sortBy, $sortDir);

        $perPage = min((int) $request->input('per_page', 50), 100);
        $pensioners = $query->paginate($perPage);

        $collection = PensionerResource::collection($pensioners);

        return response()->success($collection->toResponse($request)->getData(true));
    }

    public function show(int $id): JsonResponse
    {
        $pensioner = Pensioner::with(['uploadBatch', 'creator', 'recoveryInstallments', 'collections'])
            ->findOrFail($id);

        return response()->success(new PensionerResource($pensioner));
    }

    public function store(StorePensionerRequest $request): JsonResponse
    {
        $data = $request->validated();

        $this->computeAndMergeOverpayment($data);

        $pensioner = Pensioner::create([
            ...$data,
            'created_by' => $request->user()->id,
        ]);

        $pensioner->load(['uploadBatch', 'creator']);

        return response()->success(new PensionerResource($pensioner), 201);
    }

    public function update(UpdatePensionerRequest $request, int $id): JsonResponse
    {
        $pensioner = Pensioner::findOrFail($id);
        $data = $request->validated();

        $this->computeAndMergeOverpayment($data);

        $pensioner->update($data);

        $pensioner->load(['uploadBatch', 'creator']);

        return response()->success(new PensionerResource($pensioner));
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $pensioner = Pensioner::findOrFail($id);
            $pensioner->delete();

            return response()->success(['message' => 'Pensioner deleted successfully.']);
        } catch (QueryException $e) {
            return response()->error(
                'Unable to delete pensioner because related records exist.',
                'FOREIGN_KEY_CONSTRAINT',
                409,
            );
        }
    }

    public function bulkDelete(Request $request): JsonResponse
    {
        $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['required', 'integer', 'exists:pensioners,id'],
        ]);

        try {
            $ids = $request->input('ids');
            $deleted = Pensioner::whereIn('id', $ids)->delete();

            return response()->success(['message' => "{$deleted} pensioner(s) deleted successfully."]);
        } catch (QueryException $e) {
            return response()->error(
                'Unable to delete pensioners because related records exist.',
                'FOREIGN_KEY_CONSTRAINT',
                409,
            );
        }
    }

    public function bulkUpdate(Request $request): JsonResponse
    {
        $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['required', 'integer', 'exists:pensioners,id'],
            'data' => ['required', 'array'],
            'data.rank' => ['sometimes', 'string', 'max:20'],
            'data.name' => ['sometimes', 'string', 'max:255'],
            'data.serial_number' => ['sometimes', 'string', 'max:50'],
            'data.account_number' => ['nullable', 'string', 'max:50'],
            'data.date_of_death' => ['nullable', 'date'],
            'data.last_payment' => ['nullable', 'date'],
            'data.cause_of_stoppage' => ['sometimes', 'string', 'max:255'],
            'data.agency_name' => ['sometimes', 'string', 'max:50'],
            'data.monthly_pension' => ['sometimes', 'numeric', 'min:0'],
            'data.agency_deduction' => ['nullable', 'numeric', 'min:0'],
            'data.agency_deductions' => ['nullable', 'array', 'max:10'],
            'data.fractional_days' => ['sometimes', 'numeric', 'min:0', 'max:31'],
            'data.whole_months' => ['sometimes', 'integer', 'min:0'],
            'data.amount_collected' => ['sometimes', 'numeric', 'min:0'],
            'data.date_collected' => ['nullable', 'date'],
            'data.status' => ['sometimes', 'string', 'in:recovered,not-yet-recovered,recovered-but-inc'],
        ]);

        Pensioner::whereIn('id', $request->input('ids'))
            ->update($request->input('data'));

        return response()->success(['message' => 'Pensioners updated successfully.']);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function computeAndMergeOverpayment(array &$data): void
    {
        $dateOfDeath = $data['date_of_death'] ?? null;
        $lastPayment = $data['last_payment'] ?? null;
        $monthlyPension = (float) ($data['monthly_pension'] ?? 0);

        if ($dateOfDeath !== null && $lastPayment !== null && $monthlyPension > 0) {
            $data['whole_months'] = OverpaymentCalculationService::wholeMonths($dateOfDeath, $lastPayment);
            $data['fractional_days'] = OverpaymentCalculationService::fractionalDays($dateOfDeath, $lastPayment);
        }

        if (isset($data['agency_deduction']) && ! isset($data['agency_deductions'])) {
            $data['agency_deductions'] = [
                [
                    'agency_name' => $data['agency_name'],
                    'amount' => (float) $data['agency_deduction'],
                    'crediting_agency' => true,
                ],
            ];
        }

        if (isset($data['agency_deductions'])) {
            $firstCrediting = null;
            foreach ($data['agency_deductions'] as $i => $entry) {
                if (! empty($entry['crediting_agency'])) {
                    $firstCrediting = $entry['agency_name'];
                    break;
                }
            }

            if ($firstCrediting === null && ! empty($data['agency_deductions'])) {
                $data['agency_deductions'][0]['crediting_agency'] = true;
                $firstCrediting = $data['agency_deductions'][0]['agency_name'];
            }

            $data['crediting_agency_name'] = $firstCrediting;

            $data['agency_deductions'] = array_map(
                fn (array $entry) => [
                    'agency_name' => $entry['agency_name'],
                    'amount' => (float) $entry['amount'],
                    'crediting_agency' => (bool) ($entry['crediting_agency'] ?? false),
                ],
                $data['agency_deductions'],
            );
        }
    }
}
