<?php

use App\Models\Pensioner;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

it('returns pensioners list with success envelope', function (): void {
    Pensioner::factory(3)->create();

    $response = $this->getJson('/api/pensioners');

    $response->assertStatus(200);
    $response->assertJsonStructure([
        'success',
        'data' => [
            'data',
            'meta' => [
                'current_page',
                'last_page',
                'per_page',
                'total',
                'from',
                'to',
            ],
        ],
    ]);
    $response->assertJsonPath('success', true);
});

it('returns paginated pensioners list', function (): void {
    Pensioner::factory(15)->create();

    $response = $this->getJson('/api/pensioners?per_page=5');

    $response->assertStatus(200);
    $response->assertJsonPath('success', true);

    $body = $response->json();
    $data = $body['data'];
    expect($data['data'])->toHaveCount(5);
    expect($data['meta']['total'])->toBe(15);
    expect($data['meta']['per_page'])->toBe(5);
    expect($data['meta']['last_page'])->toBe(3);
});

it('returns empty list when no pensioners exist', function (): void {
    $response = $this->getJson('/api/pensioners');

    $response->assertStatus(200);
    $response->assertJsonPath('success', true);

    $body = $response->json();
    expect($body['data']['data'])->toBeEmpty();
    expect($body['data']['meta']['total'])->toBe(0);
});

it('filters pensioners by status', function (): void {
    Pensioner::factory()->create(['status' => 'recovered']);
    Pensioner::factory()->create(['status' => 'not-yet-recovered']);
    Pensioner::factory()->create(['status' => 'recovered-but-inc']);

    $response = $this->getJson('/api/pensioners?status[]=recovered');

    $response->assertStatus(200);
    $response->assertJsonPath('success', true);

    $body = $response->json();
    expect($body['data']['data'])->toHaveCount(1);
    expect($body['data']['data'][0]['status'])->toBe('recovered');
});
