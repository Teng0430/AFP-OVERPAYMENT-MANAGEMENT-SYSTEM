<?php

namespace App\Models;

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
        'cause_of_stoppage',
        'agency_name',
        'monthly_pension',
        'agency_deduction',
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
            'fractional_days' => 'decimal:3',
            'whole_months' => 'integer',
            'amount_collected' => 'decimal:2',
            'date_of_death' => 'date',
            'date_collected' => 'date',
        ];
    }

    /**
     * @return BelongsTo<UploadBatch, $this>
     */
    public function uploadBatch(): BelongsTo
    {
        return $this->belongsTo(UploadBatch::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * @return HasMany<RecoveryInstallment, $this>
     */
    public function recoveryInstallments(): HasMany
    {
        return $this->hasMany(RecoveryInstallment::class);
    }

    /**
     * @return HasMany<Collection, $this>
     */
    public function collections(): HasMany
    {
        return $this->hasMany(Collection::class);
    }

    public function getComputationOfDaysAttribute(): float
    {
        return $this->monthly_pension * $this->fractional_days;
    }

    public function getComputationInMonthsAttribute(): float
    {
        return $this->monthly_pension * $this->whole_months;
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
}
