import { http } from '@/lib/http';
import type { Estado } from '@/types/estado';

export function getEstados(signal?: AbortSignal) {
  return http<Estado[]>('/estado', { method: 'GET', signal });
}