<?php

namespace App\Models;

use App\Services\OverpaymentCalculationService;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property float $monthly_pension
 * @property float $fractional_days
 * @property int $whole_months
 * @property float $amount_collected
 * @property string $rank
 * @property string $name
 * @property string $serial_number
 * @property string|null $account_number
 * @property string|null $date_of_death
 * @property string $cause_of_stoppage
 * @property string $agency_name
 * @property string|null $last_payment
 * @property array<int, array{agency_name: string, amount: float, crediting_agency: bool}>|null $agency_deductions
 * @property string|null $crediting_agency_name
 * @property float|null $net_monthly_pension
 * @property float|null $net_pension_overpayment
 * @property array<int, array{agency_name: string, amount: float, overpayment: float}>|null $agency_overpayments
 * @property float|null $grand_total_overpayment
 * @property string|null $date_collected
 * @property string $status
 * @property int|null $upload_batch_id
 * @property int|null $created_by
 * @property string $created_at
 * @property string $updated_at
 */
class Pensioner extends Model
{
    protected $fillable = [
        'rank',
        'name',
        'serial_number',
        'account_number',
        'date_of_death',
        'last_payment',
        'cause_of_stoppage',
        'agency_name',
        'monthly_pension',
        'agency_deduction',
        'agency_deductions',
        'crediting_agency_name',
        'fractional_days',
        'whole_months',
        'amount_collected',
        'date_collected',
        'status',
        'upload_batch_id',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'monthly_pension' => 'decimal:2',
            'agency_deduction' => 'decimal:2',
            'agency_deductions' => 'array',
            'fractional_days' => 'decimal:3',
            'whole_months' => 'integer',
            'amount_collected' => 'decimal:2',
            'date_of_death' => 'date',
            'last_payment' => 'date',
            'date_collected' => 'date',
        ];
    }

    public function uploadBatch(): BelongsTo
    {
        return $this->belongsTo(UploadBatch::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function recoveryInstallments(): HasMany
    {
        return $this->hasMany(RecoveryInstallment::class);
    }

    public function collections(): HasMany
    {
        return $this->hasMany(Collection::class);
    }

    public function getStartDateAttribute(): ?string
    {
        if ($this->date_of_death === null) {
            return null;
        }

        return Carbon::parse($this->date_of_death)->addDay()->toDateString();
    }

    public function getEndDateAttribute(): ?string
    {
        if ($this->last_payment === null) {
            return null;
        }

        return Carbon::parse($this->last_payment)->endOfMonth()->toDateString();
    }

    public function getDailyRateAttribute(): ?float
    {
        return OverpaymentCalculationService::dailyRate(
            (float) $this->monthly_pension,
            $this->date_of_death,
        );
    }

    public function getTotalOverpaymentDaysAttribute(): ?int
    {
        return OverpaymentCalculationService::totalDays(
            $this->date_of_death,
            $this->last_payment,
        );
    }

    public function getOverpaymentAmountAttribute(): ?float
    {
        return OverpaymentCalculationService::overpaymentAmount(
            (float) $this->monthly_pension,
            $this->date_of_death,
            $this->last_payment,
        );
    }

    public function getComputationOfDaysAttribute(): float
    {
        if ($this->date_of_death !== null && $this->last_payment !== null) {
            $fractional = OverpaymentCalculationService::fractionalDays(
                $this->date_of_death,
                $this->last_payment,
            );

            return (float) $this->monthly_pension * $fractional;
        }

        return (float) $this->monthly_pension * (float) $this->fractional_days;
    }

    public function getComputationInMonthsAttribute(): float
    {
        if ($this->date_of_death !== null && $this->last_payment !== null) {
            $months = OverpaymentCalculationService::wholeMonths(
                $this->date_of_death,
                $this->last_payment,
            );

            return (float) $this->monthly_pension * $months;
        }

        return (float) $this->monthly_pension * (int) $this->whole_months;
    }

    public function getOverpaymentSubtotalAttribute(): float
    {
        return $this->computation_of_days + $this->computation_in_months;
    }

    public function getOverpaymentTotalAttribute(): float
    {
        return (float) static::where('name', $this->name)
            ->get()
            ->sum(fn (self $p) => $p->overpayment_subtotal);
    }

    public function getBalanceAttribute(): float
    {
        return $this->overpayment_total - $this->amount_collected;
    }

    public function getNetMonthlyPensionAttribute(): ?float
    {
        return OverpaymentCalculationService::netMonthlyPension(
            (float) $this->monthly_pension,
            $this->agency_deductions ?? [],
        );
    }

    public function getNetPensionOverpaymentAttribute(): ?float
    {
        if ($this->date_of_death === null || $this->last_payment === null) {
            return null;
        }

        return OverpaymentCalculationService::netPensionOverpayment(
            (float) $this->monthly_pension,
            $this->agency_deductions ?? [],
            $this->date_of_death,
            $this->last_payment,
        );
    }

    /** @return array<int, array{agency_name: string, amount: float, overpayment: float}> */
    public function getAgencyOverpaymentsAttribute(): array
    {
        if ($this->agency_deductions === null || empty($this->agency_deductions)) {
            return [];
        }

        return OverpaymentCalculationService::agencyOverpayments(
            $this->agency_deductions,
            $this->date_of_death,
            $this->last_payment,
        );
    }

    public function getGrandTotalOverpaymentAttribute(): ?float
    {
        $netPension = $this->net_pension_overpayment;
        if ($netPension === null) {
            return null;
        }

        return OverpaymentCalculationService::grandTotalOverpayment(
            $netPension,
            $this->agency_overpayments,
        );
    }
}
