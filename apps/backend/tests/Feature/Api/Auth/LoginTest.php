<?php

use App\Models\User;

test('registered user can login successfully', function (): void {
    $user = User::factory()->create([
        'email' => 'jane@example.com',
        'password' => bcrypt('password123'),
    ]);

    $response = $this->postJson('/api/login', [
        'email' => 'jane@example.com',
        'password' => 'password123',
    ]);

    $response->assertStatus(200)
        ->assertJsonStructure([
            'success',
            'data' => [
                'user' => ['id', 'name', 'email'],
                'token',
            ],
        ]);

    expect($response->json('data.token'))->toBeString()->not->toBeEmpty();
});

test('invalid password returns 401 with generic error', function (): void {
    User::factory()->create([
        'email' => 'jane@example.com',
        'password' => bcrypt('password123'),
    ]);

    $response = $this->postJson('/api/login', [
        'email' => 'jane@example.com',
        'password' => 'wrongpassword',
    ]);

    $response->assertStatus(401)
        ->assertJson([
            'success' => false,
            'error' => [
                'message' => 'Invalid credentials.',
            ],
        ]);
});

test('unregistered email returns 401 with generic error', function (): void {
    $response = $this->postJson('/api/login', [
        'email' => 'nonexistent@example.com',
        'password' => 'password123',
    ]);

    $response->assertStatus(401)
        ->assertJson([
            'success' => false,
            'error' => [
                'message' => 'Invalid credentials.',
            ],
        ]);
});

test('missing login fields return validation errors', function (): void {
    $response = $this->postJson('/api/login', []);

    $response->assertStatus(422)
        ->assertJson([
            'success' => false,
        ]);
});
