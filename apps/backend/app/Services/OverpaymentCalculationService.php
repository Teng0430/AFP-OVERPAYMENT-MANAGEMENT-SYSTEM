<?php

namespace App\Services;

use App\Models\Pensioner;
use Illuminate\Database\Eloquent\Collection;

class OverpaymentCalculationService
{
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
}
