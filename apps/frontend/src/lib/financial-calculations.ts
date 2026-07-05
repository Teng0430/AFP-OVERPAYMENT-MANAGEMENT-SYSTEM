import type { Pensioner } from '../types';

export function computeDaysInMonth(monthlyPension: number, fractionalDays: number): number {
  return monthlyPension * fractionalDays;
}

export function computeInMonths(monthlyPension: number, wholeMonths: number): number {
  return monthlyPension * wholeMonths;
}

export function computeOverpaymentSubtotal(daysAmount: number, monthsAmount: number): number {
  return daysAmount + monthsAmount;
}

export function computeBalance(overpaymentTotal: number, amountCollected: number): number {
  return Math.max(0, overpaymentTotal - amountCollected);
}

export function computeRecoveryRate(amountCollected: number, overpaymentTotal: number): number {
  if (overpaymentTotal === 0) return 0;
  return (amountCollected / overpaymentTotal) * 100;
}

export interface FinancialSummary {
  computationOfDays: number;
  computationInMonths: number;
  overpaymentSubtotal: number;
  overpaymentTotal: number;
  balance: number;
  recoveryRate: number;
}

export function computeFinancialSummary(pensioner: Partial<Pensioner>): FinancialSummary {
  const monthlyPension = pensioner.monthly_pension ?? 0;
  const fractionalDays = pensioner.fractional_days ?? 0;
  const wholeMonths = pensioner.whole_months ?? 0;
  const amountCollected = pensioner.amount_collected ?? 0;

  const computationOfDays = computeDaysInMonth(monthlyPension, fractionalDays);
  const computationInMonths = computeInMonths(monthlyPension, wholeMonths);
  const overpaymentSubtotal = computeOverpaymentSubtotal(computationOfDays, computationInMonths);
  const overpaymentTotal = pensioner.overpayment_total ?? overpaymentSubtotal;
  const balance = computeBalance(overpaymentTotal, amountCollected);
  const recoveryRate = computeRecoveryRate(amountCollected, overpaymentTotal);

  return {
    computationOfDays,
    computationInMonths,
    overpaymentSubtotal,
    overpaymentTotal,
    balance,
    recoveryRate,
  };
}
