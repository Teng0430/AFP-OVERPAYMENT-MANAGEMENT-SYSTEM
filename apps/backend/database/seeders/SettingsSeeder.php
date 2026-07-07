<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    private const SETTINGS = [
        ['group' => 'calculation', 'key' => 'computation_formula', 'value' => 'standard', 'type' => 'string', 'description' => 'The formula used for overpayment calculation.'],
        ['group' => 'notification', 'key' => 'email_enabled', 'value' => 'true', 'type' => 'boolean', 'description' => 'Enable or disable email notifications.'],
        ['group' => 'notification', 'key' => 'sms_enabled', 'value' => 'false', 'type' => 'boolean', 'description' => 'Enable or disable SMS notifications.'],
        ['group' => 'upload', 'key' => 'max_file_size_mb', 'value' => '10', 'type' => 'integer', 'description' => 'Maximum allowed file size for uploads in megabytes.'],
        ['group' => 'system', 'key' => 'currency', 'value' => 'PHP', 'type' => 'string', 'description' => 'Default currency used in the system.'],
        ['group' => 'system', 'key' => 'date_format', 'value' => 'Y-m-d', 'type' => 'string', 'description' => 'Default date format throughout the system.'],
    ];

    public function run(): void
    {
        foreach (self::SETTINGS as $setting) {
            Setting::firstOrCreate(
                ['group' => $setting['group'], 'key' => $setting['key']],
                $setting,
            );
        }
    }
}
