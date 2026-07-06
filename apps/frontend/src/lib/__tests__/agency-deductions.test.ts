import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const deductionSchema = z.object({
  agency_name: z.string().min(1, 'Agency is required'),
  amount: z.coerce.number().min(0, 'Cannot be negative'),
});

const deductionsArraySchema = z.array(deductionSchema).min(1).max(10);

describe('Agency deduction validation', () => {
  it('rejects empty agency name', () => {
    const result = deductionSchema.safeParse({ agency_name: '', amount: 500 });
    expect(result.success).toBe(false);
  });

  it('rejects negative amount', () => {
    const result = deductionSchema.safeParse({ agency_name: 'LBP', amount: -100 });
    expect(result.success).toBe(false);
  });

  it('accepts zero amount', () => {
    const result = deductionSchema.safeParse({ agency_name: 'LBP', amount: 0 });
    expect(result.success).toBe(true);
  });

  it('rejects more than 10 deductions', () => {
    const items = Array.from({ length: 11 }, (_, i) => ({
      agency_name: `AGENCY${i}`,
      amount: 100,
    }));
    const result = deductionsArraySchema.safeParse(items);
    expect(result.success).toBe(false);
  });

  it('accepts exactly 10 deductions', () => {
    const items = Array.from({ length: 10 }, (_, i) => ({
      agency_name: `AGENCY${i}`,
      amount: 100,
    }));
    const result = deductionsArraySchema.safeParse(items);
    expect(result.success).toBe(true);
  });

  it('accepts 1 deduction', () => {
    const result = deductionsArraySchema.safeParse([{ agency_name: 'LBP', amount: 500 }]);
    expect(result.success).toBe(true);
  });
});
