<?php

test('env example contains all required keys', function (): void {
    $envExample = file_get_contents(base_path('.env.example'));

    $requiredKeys = [
        'APP_KEY=',
        'APP_URL=',
        'DB_CONNECTION=',
        'DB_HOST=',
        'DB_PORT=',
        'DB_DATABASE=',
        'DB_USERNAME=',
        'DB_PASSWORD=',
        'SANCTUM_STATEFUL_DOMAINS=',
        'SESSION_DRIVER=',
        'CORS_PATHS=',
        'CORS_ALLOWED_ORIGINS=',
    ];

    foreach ($requiredKeys as $key) {
        expect(str_contains((string) $envExample, $key))->toBeTrue("Required key '{$key}' missing from .env.example");
    }
});

test('env example does not contain real secrets', function (): void {
    $envExample = file_get_contents(base_path('.env.example'));

    // APP_KEY should be empty in .env.example
    expect($envExample)->toContain('APP_KEY=');

    // Ensure no actual base64 key is committed
    expect($envExample)->not->toContain('APP_KEY=base64:');
});
