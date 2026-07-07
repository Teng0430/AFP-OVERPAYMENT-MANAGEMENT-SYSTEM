<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolesSeeder::class,
            SettingsSeeder::class,
        ]);

        if (! User::where('email', 'test@example.com')->exists()) {
            User::factory()->create([
                'name' => 'Test User',
                'email' => 'test@example.com',
            ]);
        }

        $adminRole = Role::where('slug', 'administrator')->first();

        if (! User::where('email', 'admin@afp.mil.ph')->exists()) {
            User::factory()->create([
                'name' => 'Admin User',
                'email' => 'admin@afp.mil.ph',
                'password' => Hash::make('admin123'),
                'role_id' => $adminRole?->id,
            ]);
        } elseif ($adminRole) {
            User::where('email', 'admin@afp.mil.ph')->update(['role_id' => $adminRole->id]);
        }
    }
}
