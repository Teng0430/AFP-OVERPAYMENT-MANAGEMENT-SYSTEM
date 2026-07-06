import { describe, it, expect } from 'vitest';
import { computeOverpayment, computeOverpaymentFactors, computeComponentOverpayment, computeFullBreakdown } from '../financial-calculations';

describe('Overpayment computation', () => {
  it('computes standard scenario (15-Jan-2026 to 31-Mar-2026 / 30k pension)', () => {
    const result = computeOverpayment({
      dateOfDeath: new Date('2026-01-15'),
      lastPayment: new Date('2026-03-31'),
      monthlyPension: 30000,
    });
    expect(result.wholeMonths).toBe(2);
    expect(result.fractionalDays).toBe(16);
    expect(result.totalDays).toBe(75);
    expect(result.dailyRate).toBe(967.74);
  });

  it('handles leap year (01-Feb-2024 to 29-Feb-2024 / 30k pension)', () => {
    const result = computeOverpayment({
      dateOfDeath: new Date('2024-02-01'),
      lastPayment: new Date('2024-02-29'),
      monthlyPension: 30000,
    });
    expect(result.wholeMonths).toBe(0);
    expect(result.fractionalDays).toBe(28);
    expect(result.totalDays).toBe(28);
    expect(result.dailyRate).toBe(1034.48);
  });

  it('handles same-month computation (15-Mar-2026 to 31-Mar-2026)', () => {
    const result = computeOverpayment({
      dateOfDeath: new Date('2026-03-15'),
      lastPayment: new Date('2026-03-31'),
      monthlyPension: 30000,
    });
    expect(result.wholeMonths).toBe(0);
    expect(result.fractionalDays).toBe(16);
    expect(result.totalDays).toBe(16);
  });

  it('handles end-of-month boundary (31-Jan-2026 to 31-Mar-2026)', () => {
    const result = computeOverpayment({
      dateOfDeath: new Date('2026-01-31'),
      lastPayment: new Date('2026-03-31'),
      monthlyPension: 30000,
    });
    expect(result.startDate.toISOString()).toBe(new Date('2026-02-01').toISOString());
    expect(result.endDate.toISOString()).toBe(new Date('2026-03-31').toISOString());
    expect(result.wholeMonths).toBe(1);
    expect(result.fractionalDays).toBe(31);
    expect(result.totalDays).toBe(59);
  });

  it('handles multi-month leap year crossing (15-Dec-2023 to 29-Feb-2024)', () => {
    const result = computeOverpayment({
      dateOfDeath: new Date('2023-12-15'),
      lastPayment: new Date('2024-02-29'),
      monthlyPension: 30000,
    });
    expect(result.wholeMonths).toBe(2);
    expect(result.fractionalDays).toBe(14);
    expect(result.totalDays).toBe(76);
  });

  it('handles months with 28/30/31 days', () => {
    const aprilStart = computeOverpayment({
      dateOfDeath: new Date('2026-04-01'),
      lastPayment: new Date('2026-04-30'),
      monthlyPension: 30000,
    });
    expect(aprilStart.dailyRate).toBe(1000);

    const janStart = computeOverpayment({
      dateOfDeath: new Date('2026-01-01'),
      lastPayment: new Date('2026-01-31'),
      monthlyPension: 31000,
    });
    expect(janStart.dailyRate).toBe(1000);

    const febNonLeap = computeOverpayment({
      dateOfDeath: new Date('2025-02-01'),
      lastPayment: new Date('2025-02-28'),
      monthlyPension: 28000,
    });
    expect(febNonLeap.dailyRate).toBe(1000);
  });

  it('returns zero values when end date is before start date', () => {
    const result = computeOverpayment({
      dateOfDeath: new Date('2026-03-31'),
      lastPayment: new Date('2026-03-15'),
      monthlyPension: 30000,
    });
    expect(result.wholeMonths).toBe(0);
    expect(result.fractionalDays).toBe(0);
    expect(result.totalDays).toBe(0);
    expect(result.overpaymentAmount).toBe(0);
  });

  describe('Multi-component computation', () => {
    it('computes overpayment factors', () => {
      const factors = computeOverpaymentFactors(new Date('2026-01-15'), new Date('2026-03-31'), 30000);
      expect(factors.wholeMonths).toBe(2);
      expect(factors.fractionalDays).toBe(16);
      expect(factors.dailyRate).toBe(967.74);
    });

    it('computes component overpayment', () => {
      const result = computeComponentOverpayment(10000, new Date('2026-01-15'), new Date('2026-03-31'));
      expect(result.overpayment).toBeGreaterThan(0);
      expect(result.factors.wholeMonths).toBe(2);
    });

    it('computes full breakdown with multiple agencies', () => {
      const result = computeFullBreakdown(
        30000,
        [
          { agency_name: 'LBP', amount: 5000 },
          { agency_name: 'AFPSLAI', amount: 3000 },
        ],
        new Date('2026-01-15'),
        new Date('2026-03-31'),
      );
      expect(result.netMonthlyPension).toBe(22000);
      expect(result.netPensionOverpayment).toBeGreaterThan(0);
      expect(result.agencyOverpayments).toHaveLength(2);
      expect(result.agencyOverpayments[0].agency_name).toBe('LBP');
      expect(result.agencyOverpayments[0].overpayment).toBeGreaterThan(0);
      expect(result.grandTotalOverpayment).toBeGreaterThan(result.netPensionOverpayment);
    });

    it('handles no agency deductions', () => {
      const result = computeFullBreakdown(
        30000,
        [],
        new Date('2026-01-15'),
        new Date('2026-03-31'),
      );
      expect(result.netMonthlyPension).toBe(30000);
      expect(result.agencyOverpayments).toHaveLength(0);
      expect(result.grandTotalOverpayment).toBe(result.netPensionOverpayment);
    });

    it('clamps net to zero when deductions exceed gross', () => {
      const result = computeFullBreakdown(
        10000,
        [{ agency_name: 'LBP', amount: 15000 }],
        new Date('2026-01-15'),
        new Date('2026-03-31'),
      );
      expect(result.netMonthlyPension).toBe(0);
      expect(result.netPensionOverpayment).toBe(0);
    });

    it('grand total equals gross overpayment (mathematical identity)', () => {
      const gross = 100000;
      const deductions = [
        { agency_name: 'LBP', amount: 5000 },
        { agency_name: 'ALIP', amount: 10000 },
        { agency_name: 'PVB', amount: 5000 },
      ];
      const dod = new Date('2026-01-15');
      const lp = new Date('2026-03-31');

      const breakdown = computeFullBreakdown(gross, deductions, dod, lp);
      const grossOp = computeOverpayment({ dateOfDeath: dod, lastPayment: lp, monthlyPension: gross });

      expect(Math.abs(breakdown.grandTotalOverpayment - grossOp.overpaymentAmount)).toBeLessThan(0.01);
    });
  });
});
