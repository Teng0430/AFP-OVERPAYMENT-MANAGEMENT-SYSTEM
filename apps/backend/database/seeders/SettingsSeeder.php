<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Setting::create([
            'group' => 'calculation',
            'key' => 'computation_formula',
            'value' => 'standard',
            'type' => 'string',
            'description' => 'The formula used for overpayment calculation.',
        ]);

        Setting::create([
            'group' => 'notification',
            'key' => 'email_enabled',
            'value' => 'true',
            'type' => 'boolean',
            'description' => 'Enable or disable email notifications.',
        ]);

        Setting::create([
            'group' => 'notification',
            'key' => 'sms_enabled',
            'value' => 'false',
            'type' => 'boolean',
            'description' => 'Enable or disable SMS notifications.',
        ]);

        Setting::create([
            'group' => 'upload',
            'key' => 'max_file_size_mb',
            'value' => '10',
            'type' => 'integer',
            'description' => 'Maximum allowed file size for uploads in megabytes.',
        ]);

        Setting::create([
            'group' => 'system',
            'key' => 'currency',
            'value' => 'PHP',
            'type' => 'string',
            'description' => 'Default currency used in the system.',
        ]);

        Setting::create([
            'group' => 'system',
            'key' => 'date_format',
            'value' => 'Y-m-d',
            'type' => 'string',
            'description' => 'Default date format throughout the system.',
        ]);
    }
}
