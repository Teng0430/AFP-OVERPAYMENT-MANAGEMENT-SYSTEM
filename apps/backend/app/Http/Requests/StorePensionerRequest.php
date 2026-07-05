<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePensionerRequest extends FormRequest
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
            'rank' => ['required', 'string', 'max:20'],
            'name' => ['required', 'string', 'max:255'],
            'serial_number' => ['required', 'string', 'max:50', 'unique:pensioners,serial_number'],
            'account_number' => ['nullable', 'string', 'max:50'],
            'date_of_death' => ['nullable', 'date'],
            'cause_of_stoppage' => ['required', 'string', 'max:255'],
            'agency_name' => ['required', 'string', 'max:50'],
            'monthly_pension' => ['required', 'numeric', 'min:0'],
            'agency_deduction' => ['nullable', 'numeric', 'min:0'],
            'fractional_days' => ['required', 'numeric', 'min:0', 'max:31'],
            'whole_months' => ['required', 'integer', 'min:0'],
            'amount_collected' => ['required', 'numeric', 'min:0'],
            'date_collected' => ['nullable', 'date'],
            'status' => ['required', 'string', 'in:recovered,not-yet-recovered,recovered-but-inc'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'rank.required' => 'The rank field is required.',
            'name.required' => 'The name field is required.',
            'serial_number.required' => 'The serial number field is required.',
            'serial_number.unique' => 'This serial number is already in use.',
            'cause_of_stoppage.required' => 'The cause of stoppage field is required.',
            'agency_name.required' => 'The agency name field is required.',
            'monthly_pension.required' => 'The monthly pension field is required.',
            'monthly_pension.min' => 'The monthly pension must be at least 0.',
            'fractional_days.required' => 'The fractional days field is required.',
            'fractional_days.max' => 'The fractional days must not exceed 31.',
            'whole_months.required' => 'The whole months field is required.',
            'amount_collected.required' => 'The amount collected field is required.',
            'status.required' => 'The status field is required.',
            'status.in' => 'The status must be one of: recovered, not-yet-recovered, recovered-but-inc.',
        ];
    }
}
