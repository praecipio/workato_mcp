import { z } from 'zod';
import * as connections from '../api/connections.js';

export const name = 'workato_list_connections';
export const description = 'List all Workato connections and their authorization status. Useful for checking connection health and finding available connections for new recipes.';
export const schema = {};
export type Input = z.infer<z.ZodObject<typeof schema>>;

export async function handler(_input: Input): Promise<string> {
  try {
    const result = await connections.listConnections();

    const summary = {
      count: result.length,
      connections: result.map((c) => ({
        id: c.id,
        name: c.name,
        provider: c.application,
        authorization_status: c.authorization_status,
        authorized_at: c.authorized_at,
        folder_id: c.folder_id,
        project_id: c.project_id,
        connection_lost_at: c.connection_lost_at,
        connection_lost_reason: c.connection_lost_reason,
      })),
    };

    return JSON.stringify(summary, null, 2);
  } catch (error) {
    return `Error listing connections: ${error instanceof Error ? error.message : String(error)}`;
  }
}
