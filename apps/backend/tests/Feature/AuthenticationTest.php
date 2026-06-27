<?php

test('protected api route returns 401 when unauthenticated', function (): void {
    $response = $this->getJson('/api/user');

    $response->assertStatus(401)
        ->assertJsonStructure([
            'success',
            'error' => [
                'message',
                'code',
            ],
        ])
        ->assertJson([
            'success' => false,
            'error' => [
                'message' => 'Unauthenticated.',
                'code' => 'UNAUTHENTICATED',
            ],
        ]);
});

test('api response envelope has success field', function (): void {
    // Health check is a public endpoint that uses the envelope
    $response = $this->getJson('/api/health');

    $response->assertStatus(200);

    expect($response->json('success'))->toBeTrue();
    expect($response->json('data'))->not->toBeNull();
});

test('api error response has correct envelope format', function (): void {
    $response = $this->getJson('/api/user');

    expect($response->json('success'))->toBeFalse();
    expect($response->json('error'))->toBeArray();
    expect($response->json('error.message'))->toBeString();
    expect($response->json('error.code'))->toBeString();
});
