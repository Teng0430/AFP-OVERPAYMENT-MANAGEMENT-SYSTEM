<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RolesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Role::create([
            'name' => 'Super Admin',
            'slug' => 'super-admin',
            'description' => 'Full system access with all permissions.',
            'permissions' => ['*'],
        ]);

        Role::create([
            'name' => 'Finance Admin',
            'slug' => 'finance-admin',
            'description' => 'Administrative access to finance-related features.',
            'permissions' => [
                'pensioner.*',
                'upload.*',
                'recovery.*',
                'report.*',
                'alert.*',
                'user.read',
                'setting.*',
            ],
        ]);

        Role::create([
            'name' => 'Finance Officer',
            'slug' => 'finance-officer',
            'description' => 'Operational access to finance features.',
            'permissions' => [
                'pensioner.*',
                'upload.*',
                'recovery.*',
                'report.*',
                'alert.read',
            ],
        ]);

        Role::create([
            'name' => 'Encoder',
            'slug' => 'encoder',
            'description' => 'Can create and update pensioner records.',
            'permissions' => [
                'pensioner.create',
                'pensioner.read',
                'pensioner.update',
            ],
        ]);

        Role::create([
            'name' => 'Viewer',
            'slug' => 'viewer',
            'description' => 'Read-only access to pensioner data, reports, and alerts.',
            'permissions' => [
                'pensioner.read',
                'report.read',
                'alert.read',
            ],
        ]);

        Role::create([
            'name' => 'Auditor',
            'slug' => 'auditor',
            'description' => 'Read-only access plus audit log review.',
            'permissions' => [
                'pensioner.read',
                'report.read',
                'alert.read',
                'audit-log.*',
            ],
        ]);
    }
}
