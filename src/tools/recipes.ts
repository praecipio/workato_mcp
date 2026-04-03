import { z } from 'zod';
import * as recipes from '../api/recipes.js';
import { summarizeRecipeCode } from '../utils/recipe-code-helpers.js';

// --- workato_list_recipes ---

export const listRecipesName = 'workato_list_recipes';
export const listRecipesDescription = 'List and filter Workato recipes. Returns recipe metadata without code.';
export const listRecipesSchema = {
  folder_id: z.number().optional().describe('Filter by folder/project ID'),
  running: z.boolean().optional().describe('Filter by running status (true = active, false = stopped)'),
  include_tags: z.boolean().optional().describe('Include tags in response'),
  page: z.number().optional().describe('Page number (starts at 1)'),
  per_page: z.number().optional().default(50).describe('Results per page (max 100)'),
};
export type ListRecipesInput = z.infer<z.ZodObject<typeof listRecipesSchema>>;

export async function listRecipesHandler(input: ListRecipesInput): Promise<string> {
  try {
    const result = await recipes.listRecipes({
      folder_id: input.folder_id,
      running: input.running,
      include_tags: input.include_tags,
      page: input.page,
      per_page: input.per_page,
    });

    const summary = {
      count: result.items.length,
      recipes: result.items.map((r) => ({
        id: r.id,
        name: r.name,
        running: r.running,
        folder_id: r.folder_id,
        project_id: r.project_id,
        trigger: r.trigger_application,
        actions: r.action_applications,
        job_succeeded: r.job_succeeded_count,
        job_failed: r.job_failed_count,
        last_run_at: r.last_run_at,
        updated_at: r.updated_at,
        tags: r.tags?.map((t) => t.title),
      })),
    };

    return JSON.stringify(summary, null, 2);
  } catch (error) {
    return `Error listing recipes: ${error instanceof Error ? error.message : String(error)}`;
  }
}

// --- workato_get_recipe ---

export const getRecipeName = 'workato_get_recipe';
export const getRecipeDescription = 'Get recipe metadata (name, status, connections, job counts). Does not return code — use workato_get_recipe_code for the logic.';
export const getRecipeSchema = {
  recipe_id: z.number().describe('Recipe ID'),
};
export type GetRecipeInput = z.infer<z.ZodObject<typeof getRecipeSchema>>;

export async function getRecipeHandler(input: GetRecipeInput): Promise<string> {
  try {
    const r = await recipes.getRecipe(input.recipe_id, true);

    const summary = {
      id: r.id,
      name: r.name,
      description: r.description,
      running: r.running,
      folder_id: r.folder_id,
      project_id: r.project_id,
      trigger_application: r.trigger_application,
      action_applications: r.action_applications,
      version_no: r.version_no,
      job_succeeded_count: r.job_succeeded_count,
      job_failed_count: r.job_failed_count,
      lifetime_task_count: r.lifetime_task_count,
      last_run_at: r.last_run_at,
      stopped_at: r.stopped_at,
      stop_cause: r.stop_cause,
      created_at: r.created_at,
      updated_at: r.updated_at,
      webhook_url: r.webhook_url,
      tags: r.tags?.map((t) => t.title),
      connections: r.config
        .filter((c) => c.keyword === 'application' && c.account_id)
        .map((c) => ({ provider: c.provider, account_id: c.account_id })),
    };

    return JSON.stringify(summary, null, 2);
  } catch (error) {
    return `Error getting recipe: ${error instanceof Error ? error.message : String(error)}`;
  }
}

// --- workato_get_recipe_code ---

export const getRecipeCodeName = 'workato_get_recipe_code';
export const getRecipeCodeDescription = 'Get recipe logic. "summary" format returns a human-readable step-by-step walkthrough. "raw" format returns the full JSON code tree (useful for studying patterns or modifying recipes).';
export const getRecipeCodeSchema = {
  recipe_id: z.number().describe('Recipe ID'),
  format: z.enum(['summary', 'raw']).optional().default('summary').describe('Output format: "summary" for readable walkthrough, "raw" for full JSON code'),
};
export type GetRecipeCodeInput = z.infer<z.ZodObject<typeof getRecipeCodeSchema>>;

export async function getRecipeCodeHandler(input: GetRecipeCodeInput): Promise<string> {
  try {
    const r = await recipes.getRecipe(input.recipe_id);

    if (input.format === 'raw') {
      const parsed = JSON.parse(r.code);
      return JSON.stringify({
        recipe_id: r.id,
        recipe_name: r.name,
        code: parsed,
      }, null, 2);
    }

    const summary = summarizeRecipeCode(r.code);
    return `Recipe: ${r.name} (ID: ${r.id})\n\n${summary}`;
  } catch (error) {
    return `Error getting recipe code: ${error instanceof Error ? error.message : String(error)}`;
  }
}

// --- workato_create_recipe ---

export const createRecipeName = 'workato_create_recipe';
export const createRecipeDescription = 'Create a new Workato recipe. The code field must be a valid Workato recipe JSON code string. Use workato_get_recipe_code with format "raw" on existing recipes to study the code structure first.';
export const createRecipeSchema = {
  name: z.string().describe('Recipe name'),
  code: z.string().describe('Recipe code as JSON string (Workato recipe DSL)'),
  folder_id: z.number().optional().describe('Folder/project ID to create the recipe in'),
  description: z.string().optional().describe('Recipe description'),
};
export type CreateRecipeInput = z.infer<z.ZodObject<typeof createRecipeSchema>>;

export async function createRecipeHandler(input: CreateRecipeInput): Promise<string> {
  try {
    const r = await recipes.createRecipe({
      name: input.name,
      code: input.code,
      folder_id: input.folder_id,
      description: input.description,
    });

    return JSON.stringify({
      id: r.id,
      name: r.name,
      folder_id: r.folder_id,
      created_at: r.created_at,
      message: `Recipe "${r.name}" created successfully`,
    }, null, 2);
  } catch (error) {
    return `Error creating recipe: ${error instanceof Error ? error.message : String(error)}`;
  }
}

// --- workato_update_recipe ---

export const updateRecipeName = 'workato_update_recipe';
export const updateRecipeDescription = 'Update an existing recipe\'s name, description, or code. The recipe must be stopped before updating code.';
export const updateRecipeSchema = {
  recipe_id: z.number().describe('Recipe ID to update'),
  name: z.string().optional().describe('New recipe name'),
  description: z.string().optional().describe('New recipe description'),
  code: z.string().optional().describe('New recipe code as JSON string'),
};
export type UpdateRecipeInput = z.infer<z.ZodObject<typeof updateRecipeSchema>>;

export async function updateRecipeHandler(input: UpdateRecipeInput): Promise<string> {
  try {
    const payload: recipes.UpdateRecipePayload = {};
    if (input.name) payload.name = input.name;
    if (input.description) payload.description = input.description;
    if (input.code) payload.code = input.code;

    const r = await recipes.updateRecipe(input.recipe_id, payload);

    return JSON.stringify({
      id: r.id,
      name: r.name,
      updated_at: r.updated_at,
      version_no: r.version_no,
      message: `Recipe "${r.name}" updated successfully`,
    }, null, 2);
  } catch (error) {
    return `Error updating recipe: ${error instanceof Error ? error.message : String(error)}`;
  }
}

// --- workato_toggle_recipe ---

export const toggleRecipeName = 'workato_toggle_recipe';
export const toggleRecipeDescription = 'Start or stop a recipe.';
export const toggleRecipeSchema = {
  recipe_id: z.number().describe('Recipe ID'),
  action: z.enum(['start', 'stop']).describe('Action to perform: "start" or "stop"'),
};
export type ToggleRecipeInput = z.infer<z.ZodObject<typeof toggleRecipeSchema>>;

export async function toggleRecipeHandler(input: ToggleRecipeInput): Promise<string> {
  try {
    if (input.action === 'start') {
      await recipes.startRecipe(input.recipe_id);
    } else {
      await recipes.stopRecipe(input.recipe_id);
    }

    return JSON.stringify({
      recipe_id: input.recipe_id,
      action: input.action,
      message: `Recipe ${input.recipe_id} ${input.action === 'start' ? 'started' : 'stopped'} successfully`,
    }, null, 2);
  } catch (error) {
    return `Error ${input.action}ing recipe: ${error instanceof Error ? error.message : String(error)}`;
  }
}
