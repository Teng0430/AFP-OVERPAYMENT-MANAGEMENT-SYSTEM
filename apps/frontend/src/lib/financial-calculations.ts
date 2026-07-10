export interface OverpaymentInput {
  dateOfDeath: Date;
  lastPayment: Date;
  monthlyPension: number;
}

export interface OverpaymentResult {
  startDate: Date;
  endDate: Date;
  wholeMonths: number;
  fractionalDays: number;
  totalDays: number;
  dailyRate: number;
  overpaymentAmount: number;
}

function startDate(dateOfDeath: Date): Date {
  const d = new Date(dateOfDeath);
  d.setUTCDate(d.getUTCDate() + 1);
  return d;
}

function endDate(lastPayment: Date): Date {
  const d = new Date(lastPayment);
  d.setUTCMonth(d.getUTCMonth() + 1, 0);
  return d;
}

function daysInMonth(d: Date): number {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
}

function wholeMonths(dod: Date, lp: Date): number {
  const start = startDate(dod);
  const end = endDate(lp);

  if (end < start) return 0;

  let months = (end.getUTCFullYear() - start.getUTCFullYear()) * 12;
  months += end.getUTCMonth() - start.getUTCMonth();

  if (end.getUTCDate() < start.getUTCDate()) {
    months--;
  }

  return Math.max(0, months);
}

function fractionalDays(dod: Date, lp: Date): number {
  const start = startDate(dod);
  const end = endDate(lp);

  if (end < start) return 0;

  const months = wholeMonths(dod, lp);

  const afterMonths = new Date(start);
  afterMonths.setUTCMonth(afterMonths.getUTCMonth() + months);

  if (afterMonths > end) return 0;

  const diffTime = end.getTime() - afterMonths.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

  if (diffDays < 0) {
    const prevMonth = new Date(end);
    prevMonth.setUTCMonth(prevMonth.getUTCMonth() - 1);
    const prevMonthEnd = new Date(Date.UTC(prevMonth.getUTCFullYear(), prevMonth.getUTCMonth() + 1, 0));
    const adjustDays = Math.floor((end.getTime() - prevMonthEnd.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, adjustDays);
  }

  return diffDays;
}

function totalDays(dod: Date, lp: Date): number {
  const start = startDate(dod);
  const end = endDate(lp);

  if (end < start) return 0;

  const diffTime = end.getTime() - start.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

function dailyRate(monthlyPension: number, dateOfDeath: Date): number {
  const start = startDate(dateOfDeath);
  const dim = daysInMonth(start);
  if (dim === 0 || monthlyPension <= 0) return 0;
  return Math.round((monthlyPension / dim) * 100) / 100;
}

export function computeOverpayment(input: OverpaymentInput): OverpaymentResult {
  const start = startDate(input.dateOfDeath);
  const end = endDate(input.lastPayment);
  const months = wholeMonths(input.dateOfDeath, input.lastPayment);
  const fracDays = fractionalDays(input.dateOfDeath, input.lastPayment);
  const totDays = totalDays(input.dateOfDeath, input.lastPayment);
  const rate = dailyRate(input.monthlyPension, input.dateOfDeath);
  const amount = months * input.monthlyPension + fracDays * rate;

  return {
    startDate: start,
    endDate: end,
    wholeMonths: months,
    fractionalDays: fracDays,
    totalDays: totDays,
    dailyRate: rate,
    overpaymentAmount: Math.round(amount * 100) / 100,
  };
}

export interface AgencyDeductionEntry {
  agency_name: string;
  amount: number;
  crediting_agency?: boolean;
}

export interface OverpaymentFactors {
  wholeMonths: number;
  fractionalDays: number;
  dailyRate: number;
}

export interface ComponentOverpaymentResult {
  overpayment: number;
  factors: OverpaymentFactors;
}

export interface AgencyOverpaymentEntry {
  agency_name: string;
  amount: number;
  overpayment: number;
}

export interface FullBreakdownResult {
  netMonthlyPension: number;
  totalNonCrediting: number;
  netPensionOverpayment: number;
  agencyOverpayments: AgencyOverpaymentEntry[];
  grandTotalOverpayment: number;
}

export function computeOverpaymentFactors(
  dateOfDeath: Date,
  lastPayment: Date,
  monthlyAmount: number,
): OverpaymentFactors {
  const months = wholeMonths(dateOfDeath, lastPayment);
  const fracDays = fractionalDays(dateOfDeath, lastPayment);
  const rate = dailyRate(monthlyAmount, dateOfDeath);

  return { wholeMonths: months, fractionalDays: fracDays, dailyRate: rate };
}

export function computeComponentOverpayment(
  monthlyAmount: number,
  dateOfDeath: Date,
  lastPayment: Date,
): ComponentOverpaymentResult {
  const factors = computeOverpaymentFactors(dateOfDeath, lastPayment, monthlyAmount);
  const amount = factors.wholeMonths * monthlyAmount + factors.fractionalDays * factors.dailyRate;

  return {
    overpayment: Math.round(amount * 100) / 100,
    factors,
  };
}

export function computeFullBreakdown(
  grossMonthlyPension: number,
  agencyDeductions: AgencyDeductionEntry[],
  dateOfDeath: Date,
  lastPayment: Date,
): FullBreakdownResult {
  const nonCreditingDeductions = agencyDeductions.filter((d) => !d.crediting_agency);
  const totalDeductions = nonCreditingDeductions.reduce((sum, d) => sum + Number(d.amount), 0);
  const totalNonCrediting = totalDeductions;
  const net = Math.max(0, grossMonthlyPension - totalDeductions);

  const netOp = computeComponentOverpayment(net, dateOfDeath, lastPayment);

  const agencyOps = agencyDeductions.map((d) => {
    const amount = Number(d.amount);
    const op = computeComponentOverpayment(amount, dateOfDeath, lastPayment);
    return {
      agency_name: d.agency_name,
      amount,
      overpayment: op.overpayment,
    };
  });

  const totalAgencyOp = agencyOps.reduce((sum, a) => sum + a.overpayment, 0);
  const grandTotal = Math.round((netOp.overpayment + totalAgencyOp) * 100) / 100;

  return {
    netMonthlyPension: Math.round(net * 100) / 100,
    totalNonCrediting: Math.round(totalNonCrediting * 100) / 100,
    netPensionOverpayment: netOp.overpayment,
    agencyOverpayments: agencyOps,
    grandTotalOverpayment: grandTotal,
  };
}

export function formatCurrency(amount: number): string {
  return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(d: Date): string {
  const day = String(d.getUTCDate()).padStart(2, '0');
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const year = d.getUTCFullYear();
  return `${day}-${month}-${year}`;
}

export function formatDisplayDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
