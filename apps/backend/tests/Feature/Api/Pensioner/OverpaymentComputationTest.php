<?php

use App\Models\User;
use App\Services\OverpaymentCalculationService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

it('computes standard overpayment scenario', function (): void {
    expect(OverpaymentCalculationService::wholeMonths('2026-01-15', '2026-03-31'))->toBe(2);
    expect(OverpaymentCalculationService::fractionalDays('2026-01-15', '2026-03-31'))->toBe(16);
    expect(OverpaymentCalculationService::totalDays('2026-01-15', '2026-03-31'))->toBe(75);
    expect(OverpaymentCalculationService::dailyRate(30000, '2026-01-15'))->toBe(967.74);
});

it('handles leap year date arithmetic', function (): void {
    $months = OverpaymentCalculationService::wholeMonths('2024-02-01', '2024-02-29');
    expect($months)->toBe(0);

    $rate = OverpaymentCalculationService::dailyRate(30000, '2024-02-01');
    expect($rate)->toBe(1034.48);
});

it('handles same-month computation', function (): void {
    expect(OverpaymentCalculationService::wholeMonths('2026-03-15', '2026-03-31'))->toBe(0);
    expect(OverpaymentCalculationService::fractionalDays('2026-03-15', '2026-03-31'))->toBe(16);
    expect(OverpaymentCalculationService::totalDays('2026-03-15', '2026-03-31'))->toBe(16);
});

it('handles end-of-month boundary', function (): void {
    expect(OverpaymentCalculationService::wholeMonths('2026-01-31', '2026-03-31'))->toBe(1);
    expect(OverpaymentCalculationService::fractionalDays('2026-01-31', '2026-03-31'))->toBe(31);
    expect(OverpaymentCalculationService::totalDays('2026-01-31', '2026-03-31'))->toBe(59);
});

it('handles multi-month leap year crossing', function (): void {
    expect(OverpaymentCalculationService::wholeMonths('2023-12-15', '2024-02-29'))->toBe(2);
    expect(OverpaymentCalculationService::fractionalDays('2023-12-15', '2024-02-29'))->toBe(14);
    expect(OverpaymentCalculationService::totalDays('2023-12-15', '2024-02-29'))->toBe(76);
});

it('calculates daily rate correctly for different month lengths', function (): void {
    expect(OverpaymentCalculationService::dailyRate(30000, '2026-04-01'))->toBe(1000.0);
    expect(OverpaymentCalculationService::dailyRate(31000, '2026-01-01'))->toBe(1000.0);
    expect(OverpaymentCalculationService::dailyRate(28000, '2025-02-01'))->toBe(1000.0);
});

it('returns zero for invalid date ranges', function (): void {
    expect(OverpaymentCalculationService::wholeMonths('2026-03-31', '2026-03-15'))->toBe(0);
    expect(OverpaymentCalculationService::fractionalDays('2026-03-31', '2026-03-15'))->toBe(0);
    expect(OverpaymentCalculationService::totalDays('2026-03-31', '2026-03-15'))->toBe(0);
});

it('computes overpayment amount correctly', function (): void {
    $amount = OverpaymentCalculationService::overpaymentAmount(30000, '2026-01-15', '2026-03-31');
    expect($amount)->toBeGreaterThan(0);
});

// ── Multi-Component Computation Tests ──

// ── Test: Shared mathematical identity ──
// Grand Total Overpayment should equal componentOverpayment(grossPension)
// i.e., the breakdown is a redistribution, not extra amount

it('grand total equals gross overpayment (mathematical identity)', function (): void {
    $gross = 100000.0;
    $deductions = [
        ['agency_name' => 'LBP', 'amount' => 5000],
        ['agency_name' => 'ALIP', 'amount' => 10000],
        ['agency_name' => 'PVB', 'amount' => 5000],
    ];
    $dod = '2026-01-15';
    $lp = '2026-03-31';

    $netPensionOp = OverpaymentCalculationService::netPensionOverpayment($gross, $deductions, $dod, $lp);
    $agencyOps = OverpaymentCalculationService::agencyOverpayments($deductions, $dod, $lp);
    $grandTotal = OverpaymentCalculationService::grandTotalOverpayment($netPensionOp, $agencyOps);

    $grossOp = OverpaymentCalculationService::overpaymentAmount($gross, $dod, $lp);

    expect(abs($grandTotal - $grossOp))->toBeLessThan(0.01);
});

it('computes net monthly pension with no deductions', function (): void {
    $net = OverpaymentCalculationService::netMonthlyPension(30000, []);
    expect($net)->toBe(30000.0);
});

it('computes net monthly pension with deductions', function (): void {
    $net = OverpaymentCalculationService::netMonthlyPension(30000, [
        ['agency_name' => 'LBP', 'amount' => 5000],
        ['agency_name' => 'AFPSLAI', 'amount' => 3000],
    ]);
    expect($net)->toBe(22000.0);
});

it('clamps net monthly pension to zero when deductions exceed gross', function (): void {
    $net = OverpaymentCalculationService::netMonthlyPension(10000, [
        ['agency_name' => 'LBP', 'amount' => 15000],
    ]);
    expect($net)->toBe(0.0);
});

it('computes component overpayment for a given monthly amount', function (): void {
    $op = OverpaymentCalculationService::componentOverpayment(10000, '2026-01-15', '2026-03-31');
    expect($op)->toBeGreaterThan(0);
});

it('returns zero component overpayment for zero amount', function (): void {
    $op = OverpaymentCalculationService::componentOverpayment(0, '2026-01-15', '2026-03-31');
    expect($op)->toBe(0.0);
});

it('computes net pension overpayment correctly', function (): void {
    $op = OverpaymentCalculationService::netPensionOverpayment(30000, [
        ['agency_name' => 'LBP', 'amount' => 5000],
    ], '2026-01-15', '2026-03-31');
    expect($op)->toBeGreaterThan(0);
    expect($op)->toBeLessThan(OverpaymentCalculationService::overpaymentAmount(30000, '2026-01-15', '2026-03-31'));
});

it('computes agency overpayments for multiple agencies', function (): void {
    $ops = OverpaymentCalculationService::agencyOverpayments([
        ['agency_name' => 'LBP', 'amount' => 5000],
        ['agency_name' => 'AFPSLAI', 'amount' => 3000],
    ], '2026-01-15', '2026-03-31');
    expect($ops)->toHaveCount(2);
    expect($ops[0]['agency_name'])->toBe('LBP');
    expect($ops[0]['overpayment'])->toBeGreaterThan(0);
    expect($ops[1]['agency_name'])->toBe('AFPSLAI');
});

it('computes grand total overpayment as net plus agency sum', function (): void {
    $total = OverpaymentCalculationService::grandTotalOverpayment(10000, [
        ['agency_name' => 'LBP', 'amount' => 5000, 'overpayment' => 2000],
        ['agency_name' => 'AFPSLAI', 'amount' => 3000, 'overpayment' => 1500],
    ]);
    expect($total)->toBe(13500.0);
});

it('returns empty array when no agency deductions exist', function (): void {
    $ops = OverpaymentCalculationService::agencyOverpayments([], '2026-01-15', '2026-03-31');
    expect($ops)->toBe([]);
});

it('stores crediting_agency_name on pensioner creation', function (): void {
    $response = $this->postJson('/api/pensioners', [
        'rank' => 'LCDR',
        'name' => 'Crediting Test',
        'serial_number' => 'CRDT-001',
        'date_of_death' => '2026-01-15',
        'last_payment' => '2026-03-31',
        'cause_of_stoppage' => 'Late Death Reporting',
        'agency_name' => 'LBP',
        'monthly_pension' => 30000,
        'agency_deductions' => [
            ['agency_name' => 'LBP', 'amount' => 5000],
            ['agency_name' => 'AFPSLAI', 'amount' => 3000],
        ],
        'amount_collected' => 0,
        'status' => 'not-yet-recovered',
    ]);

    $response->assertStatus(201);
    $response->assertJsonPath('data.crediting_agency_name', 'LBP');
});

it('includes multi-component fields in pensioner response', function (): void {
    $response = $this->postJson('/api/pensioners', [
        'rank' => 'LCDR',
        'name' => 'Multi Test',
        'serial_number' => 'MULTI-001',
        'date_of_death' => '2026-01-15',
        'last_payment' => '2026-03-31',
        'cause_of_stoppage' => 'Late Death Reporting',
        'agency_name' => 'LBP',
        'monthly_pension' => 30000,
        'agency_deductions' => [
            ['agency_name' => 'LBP', 'amount' => 5000],
        ],
        'amount_collected' => 0,
        'status' => 'not-yet-recovered',
    ]);

    $response->assertStatus(201);
    $response->assertJsonStructure([
        'data' => [
            'net_monthly_pension',
            'net_pension_overpayment',
            'agency_overpayments',
            'grand_total_overpayment',
        ],
    ]);
});

it('rejects creation when deductions exceed monthly pension', function (): void {
    $response = $this->postJson('/api/pensioners', [
        'rank' => 'LCDR',
        'name' => 'Over Test',
        'serial_number' => 'OVER-001',
        'date_of_death' => '2026-01-15',
        'last_payment' => '2026-03-31',
        'cause_of_stoppage' => 'Late Death Reporting',
        'agency_name' => 'LBP',
        'monthly_pension' => 10000,
        'agency_deductions' => [
            ['agency_name' => 'LBP', 'amount' => 8000],
            ['agency_name' => 'AFPSLAI', 'amount' => 5000],
        ],
        'amount_collected' => 0,
        'status' => 'not-yet-recovered',
    ]);

    $response->assertStatus(422);
    $response->assertJsonStructure(['error' => ['details' => ['agency_deductions']]]);
});
