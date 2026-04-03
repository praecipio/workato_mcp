import { z } from 'zod';
import * as recipes from '../api/recipes.js';

export const name = 'workato_get_jobs';
export const description = 'Get job execution history for a recipe. Includes a computed success rate and most recent error.';
export const schema = {
  recipe_id: z.number().describe('Recipe ID'),
  status: z.enum(['succeeded', 'failed', 'pending']).optional().describe('Filter by job status'),
  per_page: z.number().optional().default(20).describe('Number of jobs to return (max 100)'),
};
export type Input = z.infer<z.ZodObject<typeof schema>>;

export async function handler(input: Input): Promise<string> {
  try {
    const result = await recipes.listJobs(input.recipe_id, {
      status: input.status,
      per_page: input.per_page,
    });

    const successRate = result.job_count > 0
      ? ((result.job_succeeded_count / result.job_count) * 100).toFixed(1)
      : 'N/A';

    const latestError = result.items.find((j) => j.is_error);

    const summary = {
      recipe_id: input.recipe_id,
      total_succeeded: result.job_succeeded_count,
      total_failed: result.job_failed_count,
      total_jobs: result.job_count,
      success_rate: `${successRate}%`,
      latest_error: latestError ? {
        job_id: latestError.id,
        started_at: latestError.started_at,
        message: latestError.error_parts?.message ?? latestError.error,
        error_type: latestError.error_parts?.error_type,
      } : null,
      jobs: result.items.map((j) => ({
        id: j.id,
        status: j.status,
        started_at: j.started_at,
        completed_at: j.completed_at,
        error: j.is_error ? (j.error_parts?.message ?? j.error) : null,
      })),
    };

    return JSON.stringify(summary, null, 2);
  } catch (error) {
    return `Error getting jobs: ${error instanceof Error ? error.message : String(error)}`;
  }
}
