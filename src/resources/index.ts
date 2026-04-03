import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as foldersApi from '../api/folders.js';
import * as connectionsApi from '../api/connections.js';
import * as recipesApi from '../api/recipes.js';
import { RECIPE_CODE_DSL_REFERENCE } from '../utils/recipe-code-helpers.js';

export function registerResources(server: McpServer): void {
  // Dynamic: workspace overview
  server.resource(
    'workato://workspace/overview',
    'Workato workspace overview — projects, recipe counts, connections',
    async () => {
      try {
        const [folders, connections, recipesResult] = await Promise.all([
          foldersApi.listFolders(),
          connectionsApi.listConnections(),
          recipesApi.listRecipes({ per_page: 100 }),
        ]);

        const projects = folders.filter((f) => f.is_project);
        const recipesByProject = new Map<number, number>();
        for (const r of recipesResult.items) {
          recipesByProject.set(r.project_id, (recipesByProject.get(r.project_id) || 0) + 1);
        }

        const connectionsByStatus = {
          success: connections.filter((c) => c.authorization_status === 'success').length,
          failed: connections.filter((c) => c.authorization_status !== 'success').length,
        };

        const overview = [
          '# Workato Workspace Overview\n',
          `## Projects (${projects.length})\n`,
          ...projects.map((p) =>
            `- **${p.name}** (ID: ${p.id}) — ${recipesByProject.get(p.project_id) || 0} recipes`,
          ),
          '',
          `## Connections (${connections.length})\n`,
          `- Authorized: ${connectionsByStatus.success}`,
          `- Unauthorized/Failed: ${connectionsByStatus.failed}`,
          '',
          '## Unique Providers\n',
          ...Array.from(new Set(connections.map((c) => c.application))).sort().map((p) => `- ${p}`),
        ].join('\n');

        return {
          contents: [{
            uri: 'workato://workspace/overview',
            text: overview,
            mimeType: 'text/markdown',
          }],
        };
      } catch (error) {
        return {
          contents: [{
            uri: 'workato://workspace/overview',
            text: `Error loading workspace overview: ${error instanceof Error ? error.message : String(error)}`,
            mimeType: 'text/plain',
          }],
        };
      }
    },
  );

  // Static: recipe code DSL reference
  server.resource(
    'workato://reference/recipe-code-dsl',
    'Workato recipe code JSON DSL reference — grammar, examples, and common patterns for creating recipes',
    async () => ({
      contents: [{
        uri: 'workato://reference/recipe-code-dsl',
        text: RECIPE_CODE_DSL_REFERENCE,
        mimeType: 'text/markdown',
      }],
    }),
  );
}
