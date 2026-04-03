import { workatoFetch } from './client.js';
import type { Folder } from '../types/workato.js';

export async function listFolders(parentId?: number): Promise<Folder[]> {
  const params = parentId !== undefined ? `?parent_id=${parentId}` : '';
  return workatoFetch<Folder[]>('GET', `/folders${params}`);
}
