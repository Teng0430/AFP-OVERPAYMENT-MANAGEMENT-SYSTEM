import { describe, it, expect } from 'vitest';

describe('apiClient', () => {
  it('has correct default base URL', async () => {
    const { default: apiClient } = await import('../src/services/api');
    expect(apiClient.defaults.baseURL).toBe('http://localhost:8000/api');
  });

  it('sets Content-Type header', async () => {
    const { default: apiClient } = await import('../src/services/api');
    expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
  });
});
