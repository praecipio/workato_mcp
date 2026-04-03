import { z } from 'zod';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

const envSchema = z.object({
  WORKATO_API_KEY: z.string().min(1),
  WORKATO_BASE_URL: z.string().url().default('https://www.workato.com/api'),
});

function loadConfig() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('Invalid environment configuration:');
    console.error(result.error.format());
    throw new Error('Missing or invalid environment variables');
  }
  return result.data;
}

export const config = loadConfig();
export type Config = z.infer<typeof envSchema>;
