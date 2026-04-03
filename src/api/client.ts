import { config } from '../config.js';

const DEFAULT_TIMEOUT_MS = 30_000;
const MAX_RETRY_DELAY_MS = 60_000;

export class WorkatoApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = 'WorkatoApiError';
  }
}

export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
  try {
    return await fetch(url, { ...options, signal: AbortSignal.timeout(timeoutMs) });
  } catch (err) {
    if (err instanceof Error && (err.name === 'AbortError' || err.name === 'TimeoutError')) {
      throw new Error(`Request timed out after ${timeoutMs / 1000}s: ${url}`);
    }
    throw err;
  }
}

function getHeaders(): Record<string, string> {
  return {
    'Authorization': `Bearer ${config.WORKATO_API_KEY}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const body = await response.json() as { message?: string };
      if (body.message) message = body.message;
    } catch {
      // use default message
    }
    throw new WorkatoApiError(message, response.status);
  }
  const text = await response.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

async function retryOn429<T>(
  requestFn: () => Promise<Response>,
): Promise<T> {
  const response = await requestFn();

  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After');
    const delayMs = Math.min(
      (retryAfter ? parseInt(retryAfter, 10) * 1000 : 5000),
      MAX_RETRY_DELAY_MS,
    );
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    const retryResponse = await requestFn();
    return handleResponse<T>(retryResponse);
  }

  return handleResponse<T>(response);
}

export async function workatoFetch<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const url = `${config.WORKATO_BASE_URL}${path}`;
  const options: RequestInit = {
    method,
    headers: getHeaders(),
  };
  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }
  return retryOn429<T>(() => fetchWithTimeout(url, options));
}
