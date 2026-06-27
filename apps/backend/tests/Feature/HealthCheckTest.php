<?php

test('health check endpoint returns 200 with correct structure', function (): void {
    $response = $this->getJson('/api/health');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'success',
            'data' => [
                'status',
                'app',
                'version',
                'database',
                'timestamp',
            ],
        ])
        ->assertJson([
            'success' => true,
            'data' => [
                'app' => 'laravel',
            ],
        ]);
});

test('health check reports database status', function (): void {
    $response = $this->getJson('/api/health');

    $response->assertStatus(200);

    $data = $response->json('data');

    expect($data['database'])->toBeIn(['connected', 'disconnected']);
    expect($data['status'])->toBeIn(['healthy', 'degraded']);
});

test('health check returns healthy status when database is connected', function (): void {
    $response = $this->getJson('/api/health');

    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
            'data' => [
                'status' => 'healthy',
                'database' => 'connected',
            ],
        ]);
});

test('health check does not require authentication', function (): void {
    // No auth header
    $response = $this->getJson('/api/health');

    $response->assertStatus(200);
});
