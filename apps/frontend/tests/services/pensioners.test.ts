import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../../src/services/api';

vi.mock('../../src/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('pensioners service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('list maps response data correctly', async () => {
    const mockPensioners = [
      { id: 1, name: 'Test', status: 'recovered' },
      { id: 2, name: 'Test 2', status: 'not-yet-recovered' },
    ];
    const mockMeta = { total: 2, current_page: 1, last_page: 1, per_page: 50, from: 1, to: 2 };

    vi.mocked(apiClient.get).mockResolvedValue({
      data: mockPensioners,
      meta: mockMeta,
    });

    const { list } = await import('../../src/services/pensioners');
    const result = await list({ per_page: 50 });

    expect(result.pensioners).toEqual(mockPensioners);
    expect(result.meta).toEqual(mockMeta);
    expect(apiClient.get).toHaveBeenCalledWith('/pensioners', { params: { per_page: 50 } });
  });

  it('list handles empty response', async () => {
    const mockMeta = { total: 0, current_page: 1, last_page: 1, per_page: 50, from: null, to: null };

    vi.mocked(apiClient.get).mockResolvedValue({
      data: [],
      meta: mockMeta,
    });

    const { list } = await import('../../src/services/pensioners');
    const result = await list();

    expect(result.pensioners).toEqual([]);
    expect(result.meta.total).toBe(0);
  });

  it('remove sends DELETE request', async () => {
    const { remove } = await import('../../src/services/pensioners');
    await remove(42);

    expect(apiClient.delete).toHaveBeenCalledWith('/pensioners/42');
  });

  it('bulkDelete sends POST request with ids', async () => {
    const { bulkDelete } = await import('../../src/services/pensioners');
    await bulkDelete([15, 18]);

    expect(apiClient.post).toHaveBeenCalledWith('/pensioners/bulk-delete', { ids: [15, 18] });
  });

  it('bulkDelete sends POST request with single id', async () => {
    const { bulkDelete } = await import('../../src/services/pensioners');
    await bulkDelete([1]);

    expect(apiClient.post).toHaveBeenCalledWith('/pensioners/bulk-delete', { ids: [1] });
  });

  it('bulkDelete sends POST request with empty array', async () => {
    const { bulkDelete } = await import('../../src/services/pensioners');
    await bulkDelete([]);

    expect(apiClient.post).toHaveBeenCalledWith('/pensioners/bulk-delete', { ids: [] });
  });
});
