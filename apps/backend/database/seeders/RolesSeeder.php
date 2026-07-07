<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RolesSeeder extends Seeder
{
    private const ROLES = [
        [
            'name' => 'Administrator',
            'slug' => 'administrator',
            'description' => 'Full system access with all permissions.',
            'permissions' => ['*'],
        ],
        [
            'name' => 'Encoder',
            'slug' => 'encoder',
            'description' => 'Can create and update pensioner records.',
            'permissions' => [
                'pensioner.create',
                'pensioner.read',
                'pensioner.update',
            ],
        ],
        [
            'name' => 'Reviewer',
            'slug' => 'reviewer',
            'description' => 'Can review and approve pensioner records.',
            'permissions' => [
                'pensioner.read',
                'pensioner.update',
                'report.read',
            ],
        ],
        [
            'name' => 'Approver',
            'slug' => 'approver',
            'description' => 'Can approve final decisions on pensioner records.',
            'permissions' => [
                'pensioner.read',
                'report.read',
                'alert.read',
            ],
        ],
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach (self::ROLES as $role) {
            if (! Role::where('slug', $role['slug'])->exists()) {
                Role::create($role);
            }
        }
    }
}
