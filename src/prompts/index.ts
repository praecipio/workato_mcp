import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export function registerPrompts(server: McpServer): void {
  server.prompt(
    'recipe_audit',
    'Assess the health and quality of recipes in a folder or across the workspace',
    {
      folder_id: z.string().optional().describe('Folder/project ID to scope the audit (omit for all recipes)'),
    },
    async ({ folder_id }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Perform a health audit of Workato recipes${folder_id ? ` in folder ${folder_id}` : ''}.

Steps:
1. Use workato_list_recipes${folder_id ? ` with folder_id ${folder_id}` : ''} to get all recipes
2. For each recipe (or at minimum the running ones), use workato_get_jobs to check execution history
3. Use workato_list_connections to check for unauthorized or lost connections
4. Produce a health scorecard with:
   - Total recipes (running vs stopped)
   - Overall success rate across all recipes
   - Recipes with recent failures (last 7 days) — include the error message
   - Recipes with no recent activity (possibly stale)
   - Connections that are unauthorized or lost
   - Recommendations for improvement`,
        },
      }],
    }),
  );

  server.prompt(
    'recipe_design',
    'Design and create a new Workato recipe from requirements',
    {
      requirements: z.string().describe('Description of what the recipe should do'),
      target_folder: z.string().optional().describe('Folder/project ID to create the recipe in'),
    },
    async ({ requirements, target_folder }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Design and create a new Workato recipe based on these requirements:

${requirements}

${target_folder ? `Target folder ID: ${target_folder}` : ''}

Steps:
1. Read the resource workato://reference/recipe-code-dsl to understand the code format
2. Use workato_list_connections to see what connections are available
3. Use workato_list_recipes to find similar existing recipes, then use workato_get_recipe_code with format "raw" on 1-2 of them to study the code patterns
4. Draft the recipe code JSON following the DSL reference and patterns from existing recipes
5. Present the draft to the user for review before creating
6. Once approved, use workato_create_recipe to create it`,
        },
      }],
    }),
  );

  server.prompt(
    'recipe_explain',
    'Get a detailed explanation of what a specific recipe does',
    {
      recipe_id: z.string().describe('Recipe ID to explain'),
    },
    async ({ recipe_id }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Provide a detailed explanation of Workato recipe ${recipe_id}.

Steps:
1. Use workato_get_recipe to get the recipe metadata
2. Use workato_get_recipe_code with format "summary" for a high-level walkthrough
3. Use workato_get_recipe_code with format "raw" to understand the exact logic
4. Use workato_get_jobs to check recent execution history
5. Produce a comprehensive explanation:
   - What triggers this recipe
   - What it does step by step in plain English
   - What applications/connections it uses
   - Any conditional logic or error handling
   - Recent performance (success rate, common errors)
   - Potential issues or improvements`,
        },
      }],
    }),
  );
}
