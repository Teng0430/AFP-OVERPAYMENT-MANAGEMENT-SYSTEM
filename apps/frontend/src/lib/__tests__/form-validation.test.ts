import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const pensionerSchema = z.object({
  rank: z.string().min(1, 'Rank is required'),
  name: z.string().min(1, 'Name is required'),
  serial_number: z.string().min(1, 'Serial number is required'),
  date_of_death: z.string().min(1, 'Date of death is required'),
  last_payment: z.string().min(1, 'Last payment is required'),
  cause_of_stoppage: z.string().min(1, 'Cause of stoppage is required'),
  agency_name: z.string().min(1, 'Agency name is required'),
  monthly_pension: z.coerce.number().gt(0, 'Must be greater than 0'),
  agency_deductions: z.array(z.object({
    agency_name: z.string().min(1, 'Agency is required'),
    amount: z.coerce.number().min(0, 'Cannot be negative'),
  })).min(1).max(10).optional(),
  amount_collected: z.coerce.number().min(0).optional(),
  status: z.string().min(1, 'Status is required'),
}).refine(
  (data) => {
    if (!data.date_of_death || !data.last_payment) return true;
    return new Date(data.last_payment) >= new Date(data.date_of_death);
  },
  { message: 'Last payment must be on or after date of death', path: ['last_payment'] },
);

describe('Form validation schema', () => {
  it('rejects empty required fields', () => {
    const result = pensionerSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.issues.map((i) => i.path[0]);
      expect(fields).toContain('rank');
      expect(fields).toContain('name');
      expect(fields).toContain('serial_number');
    }
  });

  it('rejects monthly_pension of 0', () => {
    const result = pensionerSchema.safeParse({
      rank: 'LCDR',
      name: 'Test',
      serial_number: 'TST-001',
      date_of_death: '2026-01-15',
      last_payment: '2026-03-31',
      cause_of_stoppage: 'Late Death Reporting',
      agency_name: 'LBP',
      monthly_pension: 0,
      status: 'not-yet-recovered',
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative monthly_pension', () => {
    const result = pensionerSchema.safeParse({
      rank: 'LCDR',
      name: 'Test',
      serial_number: 'TST-001',
      date_of_death: '2026-01-15',
      last_payment: '2026-03-31',
      cause_of_stoppage: 'Late Death Reporting',
      agency_name: 'LBP',
      monthly_pension: -100,
      status: 'not-yet-recovered',
    });
    expect(result.success).toBe(false);
  });

  it('rejects last_payment before date_of_death', () => {
    const result = pensionerSchema.safeParse({
      rank: 'LCDR',
      name: 'Test',
      serial_number: 'TST-001',
      date_of_death: '2026-03-31',
      last_payment: '2026-03-15',
      cause_of_stoppage: 'Late Death Reporting',
      agency_name: 'LBP',
      monthly_pension: 30000,
      status: 'not-yet-recovered',
    });
    expect(result.success).toBe(false);
  });

  it('accepts valid form data', () => {
    const result = pensionerSchema.safeParse({
      rank: 'LCDR',
      name: 'Test',
      serial_number: 'TST-001',
      date_of_death: '2026-01-15',
      last_payment: '2026-03-31',
      cause_of_stoppage: 'Late Death Reporting',
      agency_name: 'LBP',
      monthly_pension: 30000,
      agency_deductions: [{ agency_name: 'LBP', amount: 500 }],
      amount_collected: 0,
      status: 'not-yet-recovered',
    });
    expect(result.success).toBe(true);
  });
});
