<?php

test('expected application directories exist', function (): void {
    $basePath = base_path();

    $directories = [
        'app/Http/Controllers',
        'database/migrations',
        'routes',
        'tests',
        'tests/Feature',
        'tests/Unit',
    ];

    foreach ($directories as $dir) {
        expect(is_dir($basePath.'/'.$dir))->toBeTrue("Directory '{$dir}' does not exist");
    }
});

test('expected configuration files exist', function (): void {
    $configPath = config_path();

    $files = ['app.php', 'auth.php', 'database.php', 'sanctum.php', 'cors.php'];

    foreach ($files as $file) {
        expect(file_exists($configPath.'/'.$file))->toBeTrue("Config file '{$file}' does not exist");
    }
});

test('env example file exists', function (): void {
    expect(file_exists(base_path('.env.example')))->toBeTrue();
});
