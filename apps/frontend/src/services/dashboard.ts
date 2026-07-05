import apiClient from './api';
import type { DashboardKpi, DashboardCharts } from '../types';

export async function getKpis(): Promise<DashboardKpi> {
  const data = await apiClient.get('/dashboard/kpis') as DashboardKpi;
  return data;
}

export async function getCharts(period?: 'monthly' | 'quarterly' | 'annual'): Promise<DashboardCharts> {
  const data = await apiClient.get('/dashboard/charts', {
    params: period ? { period } : undefined,
  }) as DashboardCharts;
  return data;
}
