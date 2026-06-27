<?php

test('application config loads without errors', function (): void {
    // Verify config values are accessible without exceptions
    expect(config('app.name'))->toBeString();
    expect(config('database.default'))->toBeString();
    expect(config('sanctum.expiration'))->toBeNull();
});

test('database config has mysql connection defined', function (): void {
    $connections = config('database.connections');

    expect($connections)->toHaveKey('mysql');
    expect($connections['mysql']['driver'])->toBe('mysql');
    expect($connections['mysql']['charset'])->toBe('utf8mb4');
    expect($connections['mysql']['collation'])->toBe('utf8mb4_unicode_ci');
});

test('cors config is loaded correctly', function (): void {
    $paths = config('cors.paths');

    expect($paths)->toBeArray();
    expect($paths)->toContain('api/*');
});
