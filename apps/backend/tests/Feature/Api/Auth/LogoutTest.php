<?php

use App\Models\User;

test('authenticated user can logout successfully', function (): void {
    $user = User::factory()->create();
    $token = $user->createToken('auth-token')->plainTextToken;

    $response = $this->withToken($token)->postJson('/api/logout');

    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
            'data' => [
                'message' => 'Logged out successfully.',
            ],
        ]);

    expect($user->tokens()->count())->toBe(0);
});

test('logout without token returns 401', function (): void {
    $response = $this->postJson('/api/logout');

    $response->assertStatus(401)
        ->assertJson([
            'success' => false,
        ]);
});
