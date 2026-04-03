import { workatoFetch } from './client.js';
import type { Connection } from '../types/workato.js';

export async function listConnections(): Promise<Connection[]> {
  return workatoFetch<Connection[]>('GET', '/connections');
}
