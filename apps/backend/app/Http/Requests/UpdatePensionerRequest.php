<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
            'date_of_death' => ['nullable', 'date'],
            'cause_of_stoppage' => ['sometimes', 'required', 'string', 'max:255'],
            'agency_name' => ['sometimes', 'required', 'string', 'max:50'],
            'monthly_pension' => ['sometimes', 'required', 'numeric', 'min:0'],
            'agency_deduction' => ['nullable', 'numeric', 'min:0'],
            'fractional_days' => ['sometimes', 'required', 'numeric', 'min:0', 'max:31'],
            'whole_months' => ['sometimes', 'required', 'integer', 'min:0'],
            'amount_collected' => ['sometimes', 'required', 'numeric', 'min:0'],
            'date_collected' => ['nullable', 'date'],
            'status' => ['sometimes', 'required', 'string', 'in:recovered,not-yet-recovered,recovered-but-inc'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'serial_number.unique' => 'This serial number is already in use.',
            'monthly_pension.min' => 'The monthly pension must be at least 0.',
            'fractional_days.max' => 'The fractional days must not exceed 31.',
            'status.in' => 'The status must be one of: recovered, not-yet-recovered, recovered-but-inc.',
        ];
    }
}
