<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

test('database connection is established', function (): void {
    // This test uses in-memory SQLite per constitution (phpunit.xml)
    expect(DB::connection()->getPdo())->toBeInstanceOf(PDO::class);
});

test('migrations table exists after migration', function (): void {
    expect(Schema::hasTable('migrations'))->toBeTrue();
});

test('users table exists with expected columns', function (): void {
    expect(Schema::hasTable('users'))->toBeTrue();

    $columns = ['id', 'name', 'email', 'email_verified_at', 'password', 'remember_token', 'created_at', 'updated_at'];

    foreach ($columns as $column) {
        expect(Schema::hasColumn('users', $column))->toBeTrue("Column '{$column}' missing from users table");
    }
});

test('personal_access_tokens table exists with expected columns', function (): void {
    expect(Schema::hasTable('personal_access_tokens'))->toBeTrue();

    $columns = ['id', 'tokenable_type', 'tokenable_id', 'name', 'token', 'abilities', 'last_used_at', 'expires_at', 'created_at', 'updated_at'];

    foreach ($columns as $column) {
        expect(Schema::hasColumn('personal_access_tokens', $column))->toBeTrue("Column '{$column}' missing from personal_access_tokens table");
    }
});

test('sessions table exists with expected columns', function (): void {
    expect(Schema::hasTable('sessions'))->toBeTrue();

    $columns = ['id', 'user_id', 'ip_address', 'user_agent', 'payload', 'last_activity'];

    foreach ($columns as $column) {
        expect(Schema::hasColumn('sessions', $column))->toBeTrue("Column '{$column}' missing from sessions table");
    }
});
