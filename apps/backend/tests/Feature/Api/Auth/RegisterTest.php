<?php

use App\Models\User;

test('new user can register successfully', function (): void {
    $response = $this->postJson('/api/register', [
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertStatus(201)
        ->assertJsonStructure([
            'success',
            'data' => [
                'user' => ['id', 'name', 'email'],
                'token',
            ],
        ])
        ->assertJson([
            'success' => true,
            'data' => [
                'user' => [
                    'name' => 'Jane Doe',
                    'email' => 'jane@example.com',
                ],
            ],
        ]);

    expect($response->json('data.token'))->toBeString()->not->toBeEmpty();
});

test('duplicate email returns validation error', function (): void {
    User::factory()->create(['email' => 'jane@example.com']);

    $response = $this->postJson('/api/register', [
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertStatus(422)
        ->assertJson([
            'success' => false,
        ]);
});

test('weak password under 8 characters returns validation error', function (): void {
    $response = $this->postJson('/api/register', [
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
        'password' => 'short',
        'password_confirmation' => 'short',
    ]);

    $response->assertStatus(422)
        ->assertJson([
            'success' => false,
        ]);
});

test('missing fields return validation errors', function (): void {
    $response = $this->postJson('/api/register', []);

    $response->assertStatus(422)
        ->assertJson([
            'success' => false,
        ]);
});
