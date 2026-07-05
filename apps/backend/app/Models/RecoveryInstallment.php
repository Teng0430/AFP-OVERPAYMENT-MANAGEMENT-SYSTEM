<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RecoveryInstallment extends Model
{
    protected $fillable = [
        'pensioner_id',
        'installment_no',
        'date_paid',
        'amount_paid',
        'running_balance',
        'collector',
        'remarks',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'date_paid' => 'date',
            'amount_paid' => 'decimal:2',
            'running_balance' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<Pensioner, $this>
     */
    public function pensioner(): BelongsTo
    {
        return $this->belongsTo(Pensioner::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
