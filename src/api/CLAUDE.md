# api

Workato REST API client layer. All HTTP communication with Workato goes through `client.ts`.

## Contents
| File | Purpose | Key Exports |
|------|---------|-------------|
| `client.ts` | HTTP client — Bearer auth, 30s timeout, 429 rate-limit retry | `workatoFetch<T>(method, path, body?)`, `WorkatoApiError` |
| `recipes.ts` | Recipes + Jobs endpoints | `listRecipes()`, `getRecipe()`, `createRecipe()`, `updateRecipe()`, `startRecipe()`, `stopRecipe()`, `listJobs()` |
| `connections.ts` | Connections endpoint | `listConnections()` |
| `folders.ts` | Folders endpoint | `listFolders(parentId?)` |

## Relationships
- **Depends on**: `src/types/` for response interfaces, `src/config.ts` for API key and base URL
- **Used by**: `src/tools/` (all tool handlers call these functions), `src/resources/` (workspace overview)

## Conventions
- All functions return typed promises via the generic `workatoFetch<T>()` helper
- `client.ts` retries once on HTTP 429 with exponential backoff capped at 60s
- Error responses are parsed into `WorkatoApiError` with `statusCode` and `message`
