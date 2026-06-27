<?php

use Illuminate\Support\Facades\App;

test('application boots successfully', function (): void {
    expect(App::version())->toBeString()->not->toBeEmpty();
});

test('application environment is testing', function (): void {
    expect(App::environment())->toBe('testing');
});
