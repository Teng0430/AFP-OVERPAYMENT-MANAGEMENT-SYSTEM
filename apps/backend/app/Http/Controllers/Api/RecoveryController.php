<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CollectionResource;
use App\Http\Resources\RecoveryInstallmentResource;
use App\Models\Collection;
use App\Models\Pensioner;
use App\Models\RecoveryInstallment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class RecoveryController extends Controller
{
    public function installments(int $pensionerId): AnonymousResourceCollection
    {
        $installments = RecoveryInstallment::where('pensioner_id', $pensionerId)
            ->with('creator')
            ->orderBy('installment_no')
            ->paginate(50);

        return RecoveryInstallmentResource::collection($installments);
    }

    public function storeInstallment(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'pensioner_id' => ['required', 'integer', 'exists:pensioners,id'],
            'installment_no' => ['required', 'integer', 'min:1'],
            'date_paid' => ['required', 'date'],
            'amount_paid' => ['required', 'numeric', 'min:0'],
            'collector' => ['required', 'string', 'max:255'],
            'remarks' => ['nullable', 'string', 'max:1000'],
        ]);

        $pensioner = Pensioner::findOrFail($validated['pensioner_id']);
        $cumulativePaid = (float) RecoveryInstallment::where('pensioner_id', $pensioner->id)
            ->sum('amount_paid');

        $runningBalance = max(0, $pensioner->overpayment_total - $cumulativePaid - (float) $validated['amount_paid']);

        $installment = RecoveryInstallment::create([
            'pensioner_id' => $validated['pensioner_id'],
            'installment_no' => $validated['installment_no'],
            'date_paid' => $validated['date_paid'],
            'amount_paid' => $validated['amount_paid'],
            'running_balance' => $runningBalance,
            'collector' => $validated['collector'],
            'remarks' => $validated['remarks'] ?? null,
            'created_by' => $request->user()->id,
        ]);

        $installment->load('creator');

        return response()->success(new RecoveryInstallmentResource($installment), 201);
    }

    public function collections(int $pensionerId): AnonymousResourceCollection
    {
        $collections = Collection::where('pensioner_id', $pensionerId)
            ->with('creator')
            ->orderBy('collection_date', 'desc')
            ->paginate(50);

        return CollectionResource::collection($collections);
    }

    public function storeCollection(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'pensioner_id' => ['required', 'integer', 'exists:pensioners,id'],
            'amount' => ['required', 'numeric', 'min:0'],
            'collection_date' => ['required', 'date'],
            'collection_type' => ['required', 'string', 'max:50'],
            'reference' => ['nullable', 'string', 'max:100'],
            'collector' => ['required', 'string', 'max:255'],
            'remarks' => ['nullable', 'string', 'max:1000'],
        ]);

        $collection = Collection::create([
            'pensioner_id' => $validated['pensioner_id'],
            'amount' => $validated['amount'],
            'collection_date' => $validated['collection_date'],
            'collection_type' => $validated['collection_type'],
            'reference' => $validated['reference'] ?? null,
            'collector' => $validated['collector'],
            'remarks' => $validated['remarks'] ?? null,
            'created_by' => $request->user()->id,
        ]);

        $collection->load('creator');

        return response()->success(new CollectionResource($collection), 201);
    }

    public function ledger(Request $request): JsonResponse
    {
        $query = DB::table('pensioners')
            ->leftJoin('recovery_installments', 'pensioners.id', '=', 'recovery_installments.pensioner_id')
            ->select(
                'pensioners.id',
                'pensioners.name',
                'pensioners.serial_number',
                'pensioners.agency_name',
                'pensioners.monthly_pension',
                'pensioners.amount_collected',
                'pensioners.status',
                'pensioners.created_at',
                DB::raw('(pensioners.monthly_pension * pensioners.fractional_days + pensioners.monthly_pension * pensioners.whole_months) as overpayment'),
                DB::raw('COALESCE(SUM(recovery_installments.amount_paid), 0) as total_installments_paid'),
                DB::raw('MAX(recovery_installments.date_paid) as last_payment_date'),
            )
            ->groupBy(
                'pensioners.id',
                'pensioners.name',
                'pensioners.serial_number',
                'pensioners.agency_name',
                'pensioners.monthly_pension',
                'pensioners.amount_collected',
                'pensioners.status',
                'pensioners.fractional_days',
                'pensioners.whole_months',
                'pensioners.created_at',
            );

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search): void {
                $q->where('pensioners.name', 'like', "%{$search}%")
                    ->orWhere('pensioners.serial_number', 'like', "%{$search}%");
            });
        }

        if ($request->filled('date_from')) {
            $query->whereDate('recovery_installments.date_paid', '>=', $request->input('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('recovery_installments.date_paid', '<=', $request->input('date_to'));
        }

        if ($request->filled('status')) {
            $query->whereIn('pensioners.status', (array) $request->input('status'));
        }

        $query->orderBy('pensioners.name');

        $results = $query->paginate(50);

        return response()->success($results);
    }
}
