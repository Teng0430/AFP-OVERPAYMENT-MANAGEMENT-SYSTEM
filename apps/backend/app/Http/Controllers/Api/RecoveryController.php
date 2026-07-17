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
use Illuminate\Support\Facades\DB;

class RecoveryController extends Controller
{
    public function installments(int $pensionerId): JsonResponse
    {
        $installments = RecoveryInstallment::where('pensioner_id', $pensionerId)
            ->with('creator')
            ->orderBy('installment_no')
            ->get();

        $pensioner = Pensioner::find($pensionerId);
        $totalCollecte = (float) $installments->sum('amount_paid');
        $totalOverpayment = $pensioner ? (float) $pensioner->overpayment_amount : 0;
        $remainingBalance = max(0, $totalOverpayment - $totalCollecte);

        $summary = [
            'total_overpayment' => round($totalOverpayment, 2),
            'total_collected' => round($totalCollecte, 2),
            'remaining_balance' => round($remainingBalance, 2),
            'collection_percentage' => $totalOverpayment > 0
                ? round(($totalCollecte / $totalOverpayment) * 100, 2)
                : 0.0,
            'expected_completion' => null,
        ];

        return response()->success([
            'installments' => RecoveryInstallmentResource::collection($installments),
            'summary' => $summary,
        ]);
    }

    public function storeInstallment(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'pensioner_id' => ['required', 'integer', 'exists:pensioners,id'],
            'date_paid' => ['required', 'date'],
            'amount_paid' => ['required', 'numeric', 'min:0'],
            'collector' => ['nullable', 'string', 'max:255'],
            'remarks' => ['nullable', 'string', 'max:1000'],
        ]);

        $pensioner = Pensioner::findOrFail($validated['pensioner_id']);
        $cumulativePaid = (float) RecoveryInstallment::where('pensioner_id', $pensioner->id)
            ->sum('amount_paid');
        $nextInstallmentNo = RecoveryInstallment::where('pensioner_id', $pensioner->id)->max('installment_no') + 1;

        $runningBalance = max(0, (float) $pensioner->overpayment_amount - $cumulativePaid - (float) $validated['amount_paid']);

        $installment = RecoveryInstallment::create([
            'pensioner_id' => $validated['pensioner_id'],
            'installment_no' => $nextInstallmentNo ?: 1,
            'date_paid' => $validated['date_paid'],
            'amount_paid' => $validated['amount_paid'],
            'running_balance' => $runningBalance,
            'collector' => $validated['collector'] ?? $request->user()->name,
            'remarks' => $validated['remarks'] ?? null,
            'created_by' => $request->user()->id,
        ]);

        $installment->load('creator');

        return response()->success(['installment' => new RecoveryInstallmentResource($installment)], 201);
    }

    public function storeInstallmentByPensioner(Request $request, int $pensionerId): JsonResponse
    {
        $validated = $request->validate([
            'date_paid' => ['required', 'date'],
            'amount_paid' => ['required', 'numeric', 'min:0'],
            'collector' => ['nullable', 'string', 'max:255'],
            'remarks' => ['nullable', 'string', 'max:1000'],
        ]);

        $pensioner = Pensioner::findOrFail($pensionerId);
        $cumulativePaid = (float) RecoveryInstallment::where('pensioner_id', $pensioner->id)
            ->sum('amount_paid');
        $nextInstallmentNo = (RecoveryInstallment::where('pensioner_id', $pensioner->id)->max('installment_no') ?: 0) + 1;

        $runningBalance = max(0, (float) $pensioner->overpayment_amount - $cumulativePaid - (float) $validated['amount_paid']);

        $installment = RecoveryInstallment::create([
            'pensioner_id' => $pensionerId,
            'installment_no' => $nextInstallmentNo,
            'date_paid' => $validated['date_paid'],
            'amount_paid' => $validated['amount_paid'],
            'running_balance' => $runningBalance,
            'collector' => $validated['collector'] ?? $request->user()->name,
            'remarks' => $validated['remarks'] ?? null,
            'created_by' => $request->user()->id,
        ]);

        $installment->load('creator');

        return response()->success(['installment' => new RecoveryInstallmentResource($installment)], 201);
    }

    public function collections(int $pensionerId): JsonResponse
    {
        $collections = Collection::where('pensioner_id', $pensionerId)
            ->with('creator')
            ->orderBy('collection_date', 'desc')
            ->get();

        return response()->success([
            'collections' => CollectionResource::collection($collections),
        ]);
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

        return response()->success(['collection' => new CollectionResource($collection)], 201);
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
                DB::raw('COALESCE(pensioners.overpayment_amount, 0) as overpayment'),
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
                'pensioners.overpayment_amount',
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
