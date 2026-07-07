<?php

namespace App\Services;

use App\Models\Pensioner;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;

class OverpaymentCalculationService
{
    public static function startDate(?string $dateOfDeath): ?Carbon
    {
        if ($dateOfDeath === null) {
            return null;
        }

        return Carbon::parse($dateOfDeath)->addDay()->startOfDay();
    }

    public static function endDate(?string $lastPayment): ?Carbon
    {
        if ($lastPayment === null) {
            return null;
        }

        return Carbon::parse($lastPayment)->endOfMonth()->startOfDay();
    }

    public static function wholeMonths(?string $dateOfDeath, ?string $lastPayment): int
    {
        $start = self::startDate($dateOfDeath);
        $end = self::endDate($lastPayment);

        if ($start === null || $end === null || $end->lessThan($start)) {
            return 0;
        }

        return (int) $start->diffInMonths($end);
    }

    public static function fractionalDays(?string $dateOfDeath, ?string $lastPayment): int
    {
        $start = self::startDate($dateOfDeath);
        $end = self::endDate($lastPayment);

        if ($start === null || $end === null || $end->lessThan($start)) {
            return 0;
        }

        $wholeMonths = self::wholeMonths($dateOfDeath, $lastPayment);
        $afterMonths = (clone $start)->addMonthsNoOverflow($wholeMonths);

        return (int) $afterMonths->diffInDays((clone $end)->addDay());
    }

    public static function totalDays(?string $dateOfDeath, ?string $lastPayment): int
    {
        $start = self::startDate($dateOfDeath);
        $end = self::endDate($lastPayment);

        if ($start === null || $end === null || $end->lessThan($start)) {
            return 0;
        }

        return (int) $start->diffInDays((clone $end)->addDay());
    }

    public static function dailyRate(float $monthlyPension, ?string $dateOfDeath): float
    {
        if ($dateOfDeath === null || $monthlyPension <= 0) {
            return 0.0;
        }

        $start = self::startDate($dateOfDeath);
        if ($start === null) {
            return 0.0;
        }

        $daysInMonth = $start->daysInMonth;

        if ($daysInMonth === 0) {
            return 0.0;
        }

        return round($monthlyPension / $daysInMonth, 2);
    }

    public static function overpaymentAmount(
        float $monthlyPension,
        ?string $dateOfDeath,
        ?string $lastPayment,
    ): float {
        $months = self::wholeMonths($dateOfDeath, $lastPayment);
        $fractionalDays = self::fractionalDays($dateOfDeath, $lastPayment);
        $dailyRate = self::dailyRate($monthlyPension, $dateOfDeath);

        return ($months * $monthlyPension) + ($fractionalDays * $dailyRate);
    }

    public static function computationOfDays(float $monthlyPension, float $fractionalDays): float
    {
        return $monthlyPension * $fractionalDays;
    }

    public static function computationInMonths(float $monthlyPension, int $wholeMonths): float
    {
        return $monthlyPension * $wholeMonths;
    }

    public static function overpaymentSubtotal(float $days, float $months): float
    {
        return $days + $months;
    }

    /**
     * @param  Collection<int, Pensioner>  $pensioners
     */
    public static function overpaymentTotal(Collection $pensioners): float
    {
        return $pensioners->sum(fn (Pensioner $p) => $p->monthly_pension * $p->fractional_days + $p->monthly_pension * $p->whole_months);
    }

    public static function balance(float $total, float $collected): float
    {
        return max(0.0, $total - $collected);
    }

    public static function recoveryRate(float $collected, float $total): float
    {
        if ($total == 0) {
            return 0.0;
        }

        return round(($collected / $total) * 100, 2);
    }

    /**
     * @param  array<int, array{agency_name: string, amount: float, crediting_agency?: bool}>  $deductions
     */
    public static function netMonthlyPension(float $gross, array $deductions): float
    {
        $nonCrediting = array_filter(
            $deductions,
            fn (array $d) => empty($d['crediting_agency']),
        );
        $totalDeductions = array_sum(array_column($nonCrediting, 'amount'));

        return round(max(0, $gross - $totalDeductions), 2);
    }

    /**
     * Compute overpayment for a single monthly amount (net pension or agency deduction).
     *
     * Formula: (wholeMonths * monthlyAmount) + (fractionalDays * monthlyAmount / daysInMonth)
     */
    public static function componentOverpayment(
        float $monthlyAmount,
        ?string $dateOfDeath,
        ?string $lastPayment,
    ): float {
        if ($monthlyAmount <= 0 || $dateOfDeath === null || $lastPayment === null) {
            return 0.0;
        }

        $months = self::wholeMonths($dateOfDeath, $lastPayment);
        $fractionalDays = self::fractionalDays($dateOfDeath, $lastPayment);
        $dailyRate = self::dailyRate($monthlyAmount, $dateOfDeath);

        return round(($months * $monthlyAmount) + ($fractionalDays * $dailyRate), 2);
    }

    /**
     * @param  array<int, array{agency_name: string, amount: float}>  $deductions
     */
    public static function netPensionOverpayment(
        float $gross,
        array $deductions,
        ?string $dateOfDeath,
        ?string $lastPayment,
    ): float {
        $net = self::netMonthlyPension($gross, $deductions);

        return self::componentOverpayment($net, $dateOfDeath, $lastPayment);
    }

    /**
     * @param  array<int, array{agency_name: string, amount: float}>  $deductions
     * @return array<int, array{agency_name: string, amount: float, overpayment: float}>
     */
    public static function agencyOverpayments(
        array $deductions,
        ?string $dateOfDeath,
        ?string $lastPayment,
    ): array {
        return array_map(function (array $deduction) use ($dateOfDeath, $lastPayment): array {
            return [
                'agency_name' => $deduction['agency_name'],
                'amount' => (float) $deduction['amount'],
                'overpayment' => self::componentOverpayment(
                    (float) $deduction['amount'],
                    $dateOfDeath,
                    $lastPayment,
                ),
            ];
        }, $deductions);
    }

    /**
     * @param  array<int, array{agency_name: string, amount: float, overpayment: float}>  $agencyOverpayments
     */
    public static function grandTotalOverpayment(
        float $netPensionOverpayment,
        array $agencyOverpayments,
    ): float {
        $totalAgency = array_sum(array_column($agencyOverpayments, 'overpayment'));

        return round($netPensionOverpayment + $totalAgency, 2);
    }
}
