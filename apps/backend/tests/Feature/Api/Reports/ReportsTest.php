<?php

use App\Models\Pensioner;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

it('returns reports index with success envelope', function (): void {
    Pensioner::factory(3)->create();

    $response = $this->getJson('/api/reports');

    $response->assertStatus(200);
    $response->assertJsonStructure([
        'success',
        'data' => [
            'by_agency',
            'by_rank',
            'by_status',
            'monthly_trend',
        ],
    ]);
    $response->assertJsonPath('success', true);
});

it('reports index returns correct counts', function (): void {
    Pensioner::factory()->create(['status' => 'recovered', 'agency_name' => 'LBP', 'rank' => 'LCDR']);
    Pensioner::factory()->create(['status' => 'not-yet-recovered', 'agency_name' => 'DBP', 'rank' => 'CDR']);
    Pensioner::factory()->create(['status' => 'recovered-but-inc', 'agency_name' => 'LBP', 'rank' => 'LCDR']);

    $response = $this->getJson('/api/reports');

    $response->assertStatus(200);
    $body = $response->json();

    expect($body['data']['by_status'])->toHaveCount(3);
    expect($body['data']['by_agency'])->toHaveCount(2);
    expect($body['data']['by_rank'])->toHaveCount(2);
});

it('returns empty reports when no pensioners exist', function (): void {
    $response = $this->getJson('/api/reports');

    $response->assertStatus(200);
    $response->assertJsonPath('success', true);

    $body = $response->json();
    expect($body['data']['by_agency'])->toBeEmpty();
    expect($body['data']['by_rank'])->toBeEmpty();
    expect($body['data']['by_status'])->toBeEmpty();
    expect($body['data']['monthly_trend'])->toBeEmpty();
});
