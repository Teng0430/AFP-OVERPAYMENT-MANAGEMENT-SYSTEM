<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

it('requires last_payment to be after date_of_death', function (): void {
    $response = $this->postJson('/api/pensioners', [
        'rank' => 'LCDR',
        'name' => 'Test',
        'serial_number' => 'TST-001',
        'date_of_death' => '2026-03-31',
        'last_payment' => '2026-03-15',
        'cause_of_stoppage' => 'Late Death Reporting',
        'agency_name' => 'LBP',
        'monthly_pension' => 30000,
        'amount_collected' => 0,
        'status' => 'not-yet-recovered',
    ]);

    $response->assertStatus(422);
    $response->assertJsonStructure(['error' => ['details' => ['last_payment']]]);
});

it('requires monthly_pension to be greater than 0', function (): void {
    $response = $this->postJson('/api/pensioners', [
        'rank' => 'LCDR',
        'name' => 'Test',
        'serial_number' => 'TST-002',
        'date_of_death' => '2026-01-15',
        'last_payment' => '2026-03-31',
        'cause_of_stoppage' => 'Late Death Reporting',
        'agency_name' => 'LBP',
        'monthly_pension' => 0,
        'amount_collected' => 0,
        'status' => 'not-yet-recovered',
    ]);

    $response->assertStatus(422);
    $response->assertJsonStructure(['error' => ['details' => ['monthly_pension']]]);
});

it('rejects negative deduction amounts', function (): void {
    $response = $this->postJson('/api/pensioners', [
        'rank' => 'LCDR',
        'name' => 'Test',
        'serial_number' => 'TST-003',
        'date_of_death' => '2026-01-15',
        'last_payment' => '2026-03-31',
        'cause_of_stoppage' => 'Late Death Reporting',
        'agency_name' => 'LBP',
        'monthly_pension' => 30000,
        'agency_deductions' => [
            ['agency_name' => 'LBP', 'amount' => -100],
        ],
        'amount_collected' => 0,
        'status' => 'not-yet-recovered',
    ]);

    $response->assertStatus(422);
    $response->assertJsonStructure(['error' => ['details' => ['agency_deductions.0.amount']]]);
});

it('rejects more than 10 agency deductions', function (): void {
    $deductions = [];
    for ($i = 0; $i < 11; $i++) {
        $deductions[] = ['agency_name' => 'LBP', 'amount' => 100];
    }

    $response = $this->postJson('/api/pensioners', [
        'rank' => 'LCDR',
        'name' => 'Test',
        'serial_number' => 'TST-004',
        'date_of_death' => '2026-01-15',
        'last_payment' => '2026-03-31',
        'cause_of_stoppage' => 'Late Death Reporting',
        'agency_name' => 'LBP',
        'monthly_pension' => 30000,
        'agency_deductions' => $deductions,
        'amount_collected' => 0,
        'status' => 'not-yet-recovered',
    ]);

    $response->assertStatus(422);
    $response->assertJsonStructure(['error' => ['details' => ['agency_deductions']]]);
});

it('requires all required fields', function (): void {
    $response = $this->postJson('/api/pensioners', []);

    $response->assertStatus(422);
    $response->assertJsonStructure(['error' => ['details' => [
        'rank', 'name', 'serial_number', 'date_of_death',
        'last_payment', 'cause_of_stoppage', 'agency_name',
        'monthly_pension', 'amount_collected', 'status',
    ]]]);
});

it('accepts valid pensioner with agency_deductions', function (): void {
    $response = $this->postJson('/api/pensioners', [
        'rank' => 'LCDR',
        'name' => 'Test',
        'serial_number' => 'TST-005',
        'date_of_death' => '2026-01-15',
        'last_payment' => '2026-03-31',
        'cause_of_stoppage' => 'Late Death Reporting',
        'agency_name' => 'LBP',
        'monthly_pension' => 30000,
        'agency_deductions' => [
            ['agency_name' => 'LBP', 'amount' => 500],
            ['agency_name' => 'AFPSLAI', 'amount' => 1200],
        ],
        'amount_collected' => 0,
        'status' => 'not-yet-recovered',
    ]);

    $response->assertStatus(201);
    $response->assertJsonPath('success', true);
});
