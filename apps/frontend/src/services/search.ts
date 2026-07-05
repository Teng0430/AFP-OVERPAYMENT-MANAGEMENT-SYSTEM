import apiClient from './api';

export interface SearchResult {
  type: string;
  id: number;
  rank?: string;
  name: string;
  serial_number?: string;
  match_field: string;
  match_preview: string;
}

export interface SearchResponse {
  results: SearchResult[];
}

export async function search(
  query: string,
  type?: string,
): Promise<SearchResponse> {
  const data = await apiClient.get('/search', {
    params: { q: query, ...(type ? { type } : {}) },
  }) as SearchResponse;
  return data;
}
