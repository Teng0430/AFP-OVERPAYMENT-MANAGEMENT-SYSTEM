<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdatePensionerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'rank' => ['sometimes', 'required', 'string', 'max:20'],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'serial_number' => [
                'sometimes',
                'required',
                'string',
                'max:50',
                Rule::unique('pensioners', 'serial_number')->ignore($this->route('pensioner')),
            ],
            'account_number' => ['nullable', 'string', 'max:50'],
            'date_of_death' => ['sometimes', 'required', 'date'],
            'last_payment' => ['sometimes', 'required', 'date', 'after_or_equal:date_of_death'],
            'cause_of_stoppage' => ['sometimes', 'required', 'string', 'max:255'],
            'agency_name' => ['sometimes', 'required', 'string', 'max:50'],
            'monthly_pension' => ['sometimes', 'required', 'numeric', 'gt:0'],
            'agency_deduction' => ['nullable', 'numeric', 'min:0'],
            'agency_deductions' => ['nullable', 'array', 'max:10'],
            'agency_deductions.*.agency_name' => ['required', 'string', 'max:50'],
            'agency_deductions.*.amount' => ['required', 'numeric', 'min:0'],
            'agency_deductions.*.crediting_agency' => ['nullable', 'boolean'],
            'amount_collected' => ['sometimes', 'required', 'numeric', 'min:0'],
            'date_collected' => ['nullable', 'date'],
            'status' => ['sometimes', 'required', 'string', 'in:recovered,not-yet-recovered,recovered-but-inc'],
        ];
    }

    /**
     * @return array<int, \Closure>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $data = $validator->getData();
                if (! isset($data['monthly_pension']) && ! isset($data['agency_deductions'])) {
                    return;
                }
                $gross = (float) ($data['monthly_pension'] ?? 0);
                $deductions = $data['agency_deductions'] ?? [];
                $nonCrediting = array_filter(
                    $deductions,
                    fn (array $d) => empty($d['crediting_agency']),
                );
                $total = array_sum(array_column($nonCrediting, 'amount'));

                if ($gross > 0 && ($gross - $total) < 0) {
                    $validator->errors()->add(
                        'agency_deductions',
                        'Total non-crediting agency deductions cannot exceed the monthly pension.',
                    );
                }
            },
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'serial_number.unique' => 'This serial number is already in use.',
            'last_payment.after_or_equal' => 'The last payment must be on or after the date of death.',
            'monthly_pension.gt' => 'The monthly pension must be greater than 0.',
            'agency_deductions.max' => 'A maximum of 10 agency deductions is allowed.',
            'agency_deductions.*.agency_name.required' => 'Each deduction must have an agency name.',
            'agency_deductions.*.amount.required' => 'Each deduction must have an amount.',
            'agency_deductions.*.amount.min' => 'Deduction amounts cannot be negative.',
            'status.in' => 'The status must be one of: recovered, not-yet-recovered, recovered-but-inc.',
        ];
    }
}
