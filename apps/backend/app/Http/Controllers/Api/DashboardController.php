<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pensioner;
use App\Services\OverpaymentCalculationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function kpis(): JsonResponse
    {
        $now = Carbon::now();
        $thirtyDaysAgo = (clone $now)->subDays(30);
        $previousPeriodStart = (clone $now)->subDays(60);
        $previousPeriodEnd = (clone $now)->subDays(30);

        // Current period counts
        $totalPensioners = Pensioner::count();
        $activeCases = Pensioner::where('status', '!=', 'recovered')->count();
        $newlyUploaded = Pensioner::where('created_at', '>=', $thirtyDaysAgo)->count();
        $pendingVerification = Pensioner::where('status', 'not-yet-recovered')->count();
        $recoveredAccounts = Pensioner::where('status', 'recovered')->count();
        $recoveredButIncomplete = Pensioner::where('status', 'recovered-but-inc')->count();

        // Financial aggregates
        $totalOverpayment = (float) Pensioner::select(DB::raw('COALESCE(SUM(overpayment_amount), 0) as total'))->value('total');
        $totalCollected = (float) Pensioner::sum('amount_collected');
        $outstandingBalance = OverpaymentCalculationService::balance($totalOverpayment, $totalCollected);
        $recoveryRate = OverpaymentCalculationService::recoveryRate($totalCollected, $totalOverpayment);

        // Trends (compare current 30 days to previous 30 days)
        $previousActiveCases = Pensioner::where('status', '!=', 'recovered')
            ->where('created_at', '>=', $previousPeriodStart)
            ->where('created_at', '<', $previousPeriodEnd)
            ->count();

        $previousNewlyUploaded = Pensioner::where('created_at', '>=', $previousPeriodStart)
            ->where('created_at', '<', $previousPeriodEnd)
            ->count();

        $previousPendingVerification = Pensioner::where('status', 'not-yet-recovered')
            ->where('created_at', '>=', $previousPeriodStart)
            ->where('created_at', '<', $previousPeriodEnd)
            ->count();

        $previousRecovered = Pensioner::where('status', 'recovered')
            ->where('created_at', '>=', $previousPeriodStart)
            ->where('created_at', '<', $previousPeriodEnd)
            ->count();

        $previousRecoveredButIncomplete = Pensioner::where('status', 'recovered-but-inc')
            ->where('created_at', '>=', $previousPeriodStart)
            ->where('created_at', '<', $previousPeriodEnd)
            ->count();

        $previousTotalOverpayment = (float) Pensioner::where('created_at', '>=', $previousPeriodStart)
            ->where('created_at', '<', $previousPeriodEnd)
            ->select(DB::raw('COALESCE(SUM(overpayment_amount), 0) as total'))
            ->value('total');

        $previousTotalCollected = (float) Pensioner::where('created_at', '>=', $previousPeriodStart)
            ->where('created_at', '<', $previousPeriodEnd)
            ->sum('amount_collected');

        $previousOutstanding = OverpaymentCalculationService::balance($previousTotalOverpayment, $previousTotalCollected);
        $previousRecoveryRate = OverpaymentCalculationService::recoveryRate($previousTotalCollected, $previousTotalOverpayment);

        $trends = [
            'total_pensioners' => $this->calculateTrend($totalPensioners, Pensioner::where('created_at', '<', $thirtyDaysAgo)->count()),
            'active_monitoring_cases' => $this->calculateTrend($activeCases, $previousActiveCases),
            'total_overpayment' => $this->calculateTrend($totalOverpayment, $previousTotalOverpayment),
            'total_amount_collected' => $this->calculateTrend($totalCollected, $previousTotalCollected),
            'outstanding_balance' => $this->calculateTrend($outstandingBalance, $previousOutstanding),
            'recovery_rate' => $this->calculateTrend($recoveryRate, $previousRecoveryRate),
            'newly_uploaded_records' => $this->calculateTrend($newlyUploaded, $previousNewlyUploaded),
            'pending_verification' => $this->calculateTrend($pendingVerification, $previousPendingVerification),
            'recovered_accounts' => $this->calculateTrend($recoveredAccounts, $previousRecovered),
            'recovered_but_incomplete' => $this->calculateTrend($recoveredButIncomplete, $previousRecoveredButIncomplete),
        ];

        // Sparklines - last 6 months of total overpayment
        $sparklines = $this->sparklines();

        return response()->success([
            'total_pensioners' => $totalPensioners,
            'active_monitoring_cases' => $activeCases,
            'total_overpayment' => round($totalOverpayment, 2),
            'total_amount_collected' => round($totalCollected, 2),
            'outstanding_balance' => round($outstandingBalance, 2),
            'recovery_rate' => $recoveryRate,
            'newly_uploaded_records' => $newlyUploaded,
            'pending_verification' => $pendingVerification,
            'recovered_accounts' => $recoveredAccounts,
            'recovered_but_incomplete' => $recoveredButIncomplete,
            'trends' => $trends,
            'sparklines' => $sparklines,
        ]);
    }

    public function charts(): JsonResponse
    {
        $dbDriver = DB::connection()->getDriverName();
        $dateFormat = $dbDriver === 'sqlite'
            ? "strftime('%Y-%m', created_at)"
            : "DATE_FORMAT(created_at, '%Y-%m')";
        $collectedDateFormat = $dbDriver === 'sqlite'
            ? "strftime('%Y-%m', COALESCE(date_collected, created_at))"
            : "DATE_FORMAT(COALESCE(date_collected, created_at), '%Y-%m')";

        $monthlyOverpaymentTrend = Pensioner::select(
            DB::raw("{$dateFormat} as month"),
            DB::raw('COALESCE(SUM(overpayment_amount), 0) as amount'),
        )
            ->where('created_at', '>=', Carbon::now()->subYear())
            ->groupBy(DB::raw($dateFormat))
            ->orderBy('month')
            ->get();

        $overpaymentByRank = Pensioner::select(
            'rank',
            DB::raw('COALESCE(SUM(overpayment_amount), 0) as amount'),
        )
            ->groupBy('rank')
            ->orderByDesc('amount')
            ->get();

        $statusDistribution = Pensioner::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get();

        $collectionProgress = Pensioner::select(
            DB::raw("{$collectedDateFormat} as month"),
            DB::raw('COALESCE(SUM(amount_collected), 0) as collected'),
            DB::raw('COALESCE(SUM(overpayment_amount), 0) as target'),
        )
            ->whereNotNull('amount_collected')
            ->where('amount_collected', '>', 0)
            ->groupBy(DB::raw($collectedDateFormat))
            ->orderBy('month')
            ->get();

        $agencyRecoveries = Pensioner::select(
            DB::raw('agency_name as agency'),
            DB::raw('COALESCE(SUM(overpayment_amount), 0) as total_overpayment'),
            DB::raw('COALESCE(SUM(amount_collected), 0) as collected'),
        )
            ->groupBy('agency_name')
            ->orderByDesc('total_overpayment')
            ->get();

        $yearCollectedExpr = $dbDriver === 'sqlite'
            ? "CAST(strftime('%Y', COALESCE(date_collected, created_at)) AS INTEGER)"
            : 'YEAR(COALESCE(date_collected, created_at))';
        $monthCollectedExpr = $dbDriver === 'sqlite'
            ? "CAST(strftime('%m', COALESCE(date_collected, created_at)) AS INTEGER)"
            : 'MONTH(COALESCE(date_collected, created_at))';

        $monthlyRecoveriesHeatmap = Pensioner::select(
            DB::raw("{$yearCollectedExpr} as year"),
            DB::raw("{$monthCollectedExpr} as month"),
            DB::raw('COALESCE(SUM(amount_collected), 0) as amount'),
        )
            ->whereNotNull('amount_collected')
            ->where('amount_collected', '>', 0)
            ->groupBy(DB::raw($yearCollectedExpr), DB::raw($monthCollectedExpr))
            ->orderBy('year')
            ->orderBy('month')
            ->get();

        return response()->success([
            'monthly_overpayment_trend' => $monthlyOverpaymentTrend,
            'overpayment_by_rank' => $overpaymentByRank,
            'status_distribution' => $statusDistribution,
            'collection_progress' => $collectionProgress,
            'agency_recoveries' => $agencyRecoveries,
            'monthly_recoveries_heatmap' => $monthlyRecoveriesHeatmap,
        ]);
    }

    /**
     * @return array<string, array<int, float>>
     */
    private function sparklines(): array
    {
        $months = collect();
        for ($i = 5; $i >= 0; $i--) {
            $start = Carbon::now()->subMonths($i)->startOfMonth();
            $end = Carbon::now()->subMonths($i)->endOfMonth();
            $total = (float) Pensioner::whereBetween('created_at', [$start, $end])
                ->select(DB::raw('COALESCE(SUM(overpayment_amount), 0) as total'))
                ->value('total');
            $months->push(round($total, 2));
        }

        return [
            'total_overpayment' => $months->values()->toArray(),
        ];
    }

    /**
     * @return array{direction: 'up'|'down', percentage: float}
     */
    private function calculateTrend(float|int $current, float|int $previous): array
    {
        if ($previous == 0) {
            return ['direction' => 'up', 'percentage' => $current > 0 ? 100.0 : 0.0];
        }

        $change = (($current - $previous) / $previous) * 100;

        return [
            'direction' => $change >= 0 ? 'up' : 'down',
            'percentage' => round(abs($change), 2),
        ];
    }
}
