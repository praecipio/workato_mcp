import { z } from 'zod';
import * as folders from '../api/folders.js';

export const name = 'workato_list_folders';
export const description = 'List Workato projects and folders. Omit parent_id to get root-level projects. Provide parent_id to list subfolders.';
export const schema = {
  parent_id: z.number().optional().describe('Parent folder ID. Omit for root-level projects.'),
};
export type Input = z.infer<z.ZodObject<typeof schema>>;

export async function handler(input: Input): Promise<string> {
  try {
    const result = await folders.listFolders(input.parent_id);

    const summary = {
      count: result.length,
      folders: result.map((f) => ({
        id: f.id,
        name: f.name,
        parent_id: f.parent_id,
        project_id: f.project_id,
        is_project: f.is_project ?? false,
        created_at: f.created_at,
      })),
    };

    return JSON.stringify(summary, null, 2);
  } catch (error) {
    return `Error listing folders: ${error instanceof Error ? error.message : String(error)}`;
  }
}
