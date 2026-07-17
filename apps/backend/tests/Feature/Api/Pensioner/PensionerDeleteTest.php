<?php

use App\Models\Pensioner;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

// ─── Single Delete ───────────────────────────────────────────────

it('can delete a single pensioner', function (): void {
    $pensioner = Pensioner::factory()->create();

    $response = $this->deleteJson("/api/pensioners/{$pensioner->id}");

    $response->assertStatus(200);
    $response->assertJsonPath('success', true);
    $response->assertJsonPath('data.message', 'Pensioner deleted successfully.');
    expect(Pensioner::find($pensioner->id))->toBeNull();
});

it('returns 404 when deleting non-existent pensioner', function (): void {
    $response = $this->deleteJson('/api/pensioners/99999');

    $response->assertStatus(404);
});

// ─── Bulk Delete ─────────────────────────────────────────────────

it('can bulk delete multiple pensioners', function (): void {
    $p1 = Pensioner::factory()->create();
    $p2 = Pensioner::factory()->create();
    $p3 = Pensioner::factory()->create();

    $response = $this->postJson('/api/pensioners/bulk-delete', [
        'ids' => [$p1->id, $p3->id],
    ]);

    $response->assertStatus(200);
    $response->assertJsonPath('success', true);
    $response->assertJsonPath('data.message', '2 pensioner(s) deleted successfully.');
    expect(Pensioner::find($p1->id))->toBeNull();
    expect(Pensioner::find($p3->id))->toBeNull();
    expect(Pensioner::find($p2->id))->not->toBeNull();
});

it('rejects bulk delete with empty ids array', function (): void {
    Pensioner::factory()->create();

    $response = $this->postJson('/api/pensioners/bulk-delete', [
        'ids' => [],
    ]);

    $response->assertStatus(422);
});

it('rejects bulk delete with non-existent ids', function (): void {
    Pensioner::factory()->create();

    $response = $this->postJson('/api/pensioners/bulk-delete', [
        'ids' => [99998, 99999],
    ]);

    $response->assertStatus(422);
});

it('rejects bulk delete with non-integer ids', function (): void {
    $response = $this->postJson('/api/pensioners/bulk-delete', [
        'ids' => ['abc', 'def'],
    ]);

    $response->assertStatus(422);
});

it('rejects bulk delete with missing ids field', function (): void {
    $response = $this->postJson('/api/pensioners/bulk-delete', []);

    $response->assertStatus(422);
});

it('requires authentication for bulk delete', function (): void {
    $pensioner = Pensioner::factory()->create();

    // Override the actingAs from beforeEach by logging out
    auth()->logout();

    $response = $this->postJson('/api/pensioners/bulk-delete', [
        'ids' => [$pensioner->id],
    ]);

    $response->assertStatus(401);
});

it('prevents bulk delete of already deleted pensioners', function (): void {
    $p1 = Pensioner::factory()->create();
    $p2 = Pensioner::factory()->create();
    $p1->delete();

    $response = $this->postJson('/api/pensioners/bulk-delete', [
        'ids' => [$p1->id, $p2->id],
    ]);

    $response->assertStatus(422);
    expect(Pensioner::find($p2->id))->not->toBeNull();
});
