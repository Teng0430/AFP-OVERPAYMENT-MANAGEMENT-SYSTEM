<?php

namespace App\Http\Resources;

use App\Models\RecoveryInstallment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin RecoveryInstallment
 */
class RecoveryInstallmentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'pensioner_id' => $this->pensioner_id,
            'installment_no' => $this->installment_no,
            'date_paid' => $this->date_paid,
            'amount_paid' => (float) $this->amount_paid,
            'running_balance' => (float) $this->running_balance,
            'collector' => $this->collector,
            'remarks' => $this->remarks,
            'created_by' => $this->created_by,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
