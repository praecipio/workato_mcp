import { workatoFetch } from './client.js';
import type { Recipe, RecipeListResponse, JobListResponse } from '../types/workato.js';

export interface ListRecipesOptions {
  folder_id?: number;
  running?: boolean;
  include_tags?: boolean;
  page?: number;
  per_page?: number;
}

export async function listRecipes(options: ListRecipesOptions = {}): Promise<RecipeListResponse> {
  const params = new URLSearchParams();
  if (options.folder_id !== undefined) params.set('folder_id', String(options.folder_id));
  if (options.running !== undefined) params.set('running', String(options.running));
  if (options.include_tags) params.append('includes[]', 'tags');
  if (options.page !== undefined) params.set('page', String(options.page));
  params.set('per_page', String(options.per_page ?? 50));

  const qs = params.toString();
  return workatoFetch<RecipeListResponse>('GET', `/recipes?${qs}`);
}

export async function getRecipe(recipeId: number, includeTags = false): Promise<Recipe> {
  const params = includeTags ? '?includes[]=tags' : '';
  return workatoFetch<Recipe>('GET', `/recipes/${recipeId}${params}`);
}

export interface CreateRecipePayload {
  name: string;
  code: string;
  folder_id?: number;
  description?: string;
}

export async function createRecipe(payload: CreateRecipePayload): Promise<Recipe> {
  return workatoFetch<Recipe>('POST', '/recipes', { recipe: payload });
}

export interface UpdateRecipePayload {
  name?: string;
  code?: string;
  description?: string;
}

export async function updateRecipe(recipeId: number, payload: UpdateRecipePayload): Promise<Recipe> {
  return workatoFetch<Recipe>('PUT', `/recipes/${recipeId}`, { recipe: payload });
}

export async function startRecipe(recipeId: number): Promise<void> {
  await workatoFetch<unknown>('PUT', `/recipes/${recipeId}/start`);
}

export async function stopRecipe(recipeId: number): Promise<void> {
  await workatoFetch<unknown>('PUT', `/recipes/${recipeId}/stop`);
}

export interface ListJobsOptions {
  status?: 'succeeded' | 'failed' | 'pending';
  per_page?: number;
  page?: number;
}

export async function listJobs(recipeId: number, options: ListJobsOptions = {}): Promise<JobListResponse> {
  const params = new URLSearchParams();
  if (options.status) params.set('status', options.status);
  if (options.per_page !== undefined) params.set('per_page', String(options.per_page));
  if (options.page !== undefined) params.set('page', String(options.page));

  const qs = params.toString();
  return workatoFetch<JobListResponse>('GET', `/recipes/${recipeId}/jobs?${qs}`);
}
