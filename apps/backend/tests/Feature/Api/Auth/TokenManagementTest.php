<?php

use App\Models\User;

test('authenticated user can list their tokens', function (): void {
    $user = User::factory()->create();
    $user->createToken('token-1');
    $user->createToken('token-2');

    $token = $user->createToken('auth-token')->plainTextToken;

    $response = $this->withToken($token)->getJson('/api/tokens');

    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
        ]);

    expect($response->json('data.tokens'))->toBeArray();
    expect(count($response->json('data.tokens')))->toBe(3);
});

test('user can revoke a specific token', function (): void {
    $user = User::factory()->create();
    $tokenToRevoke = $user->createToken('revoke-me');
    $tokenId = $tokenToRevoke->accessToken->id;

    $token = $user->createToken('auth-token')->plainTextToken;

    $response = $this->withToken($token)->deleteJson("/api/tokens/{$tokenId}");

    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
            'data' => [
                'message' => 'Token revoked.',
            ],
        ]);

    expect($user->tokens()->where('id', $tokenId)->exists())->toBeFalse();
    expect($user->tokens()->count())->toBe(1);
});

test('user cannot revoke another users token', function (): void {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();
    $user2Token = $user2->createToken('user2-token');
    $tokenId = $user2Token->accessToken->id;

    $token = $user1->createToken('auth-token')->plainTextToken;

    $response = $this->withToken($token)->deleteJson("/api/tokens/{$tokenId}");

    $response->assertStatus(404);
});

test('revoking non-existent token returns 404', function (): void {
    $user = User::factory()->create();
    $token = $user->createToken('auth-token')->plainTextToken;

    $response = $this->withToken($token)->deleteJson('/api/tokens/99999');

    $response->assertStatus(404);
});
