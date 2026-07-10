<?php

namespace App\Http\Resources;

use App\Models\Pensioner;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Pensioner
 */
class PensionerResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'rank' => $this->rank,
            'name' => $this->name,
            'serial_number' => $this->serial_number,
            'account_number' => $this->account_number,
            'date_of_death' => $this->date_of_death,
            'last_payment' => $this->last_payment,
            'last_payment_formatted' => $this->last_payment
                ? \Carbon\Carbon::parse($this->last_payment)->format('F d, Y')
                : null,
            'cause_of_stoppage' => $this->cause_of_stoppage,
            'agency_name' => $this->agency_name,
            'monthly_pension' => (float) $this->monthly_pension,
            'agency_deduction' => (float) ($this->agency_deduction ?? 0),
            'agency_deductions' => $this->agency_deductions ?? [],
            'fractional_days' => (float) $this->fractional_days,
            'whole_months' => $this->whole_months,
            'start_date' => $this->start_date,
            'end_date' => $this->end_date,
            'daily_rate' => $this->daily_rate,
            'total_overpayment_days' => $this->total_overpayment_days,
            'overpayment_amount' => $this->overpayment_amount,
            'crediting_agency_name' => $this->crediting_agency_name,
            'net_monthly_pension' => $this->net_monthly_pension,
            'total_non_crediting' => (function () {
                $deductions = $this->agency_deductions ?? [];
                $nonCrediting = array_filter(
                    $deductions,
                    fn (array $d) => empty($d['crediting_agency']),
                );

                return round(array_sum(array_column($nonCrediting, 'amount')), 2);
            })(),
            'net_pension_overpayment' => $this->net_pension_overpayment,
            'agency_overpayments' => $this->agency_overpayments,
            'grand_total_overpayment' => $this->grand_total_overpayment,
            'amount_collected' => (float) $this->amount_collected,
            'date_collected' => $this->date_collected,
            'status' => $this->status,
            'upload_batch_id' => $this->upload_batch_id,
            'created_by' => $this->created_by,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'computation_of_days' => $this->computation_of_days,
            'computation_in_months' => $this->computation_in_months,
            'overpayment_subtotal' => $this->overpayment_subtotal,
            'overpayment_total' => $this->overpayment_total,
            'balance' => $this->balance,
            'upload_batch' => UploadBatchResource::make($this->whenLoaded('uploadBatch')),
            'creator' => UserResource::make($this->whenLoaded('creator')),
            'recovery_installments' => RecoveryInstallmentResource::collection($this->whenLoaded('recoveryInstallments')),
            'collections' => CollectionResource::collection($this->whenLoaded('collections')),
        ];
    }
}
