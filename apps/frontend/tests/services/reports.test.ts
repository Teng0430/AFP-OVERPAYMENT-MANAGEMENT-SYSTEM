import { describe, it, expect } from 'vitest';
import { getGenerateUrl } from '../../src/services/reports';

describe('reports service', () => {
  it('generates export URL with all params', () => {
    const url = getGenerateUrl({
      type: 'custom',
      format: 'pdf',
      date_from: '2026-01-01',
      date_to: '2026-06-30',
    });
    expect(url).toContain('/api/reports/export?');
    expect(url).toContain('type=custom');
    expect(url).toContain('format=pdf');
    expect(url).toContain('date_from=2026-01-01');
    expect(url).toContain('date_to=2026-06-30');
    expect(url).toContain('token=');
  });

  it('generates export URL with minimal params', () => {
    const url = getGenerateUrl({
      type: 'monthly',
      format: 'csv',
    });
    expect(url).toContain('/api/reports/export?');
    expect(url).toContain('type=monthly');
    expect(url).toContain('format=csv');
  });
});
