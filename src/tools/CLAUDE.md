# tools

MCP tool handlers — 9 tools registered via `index.ts`. Each tool exports `name`, `description`, `schema` (zod), type alias, and `handler` function.

## Contents
| File | Purpose | Tools Defined |
|------|---------|---------------|
| `index.ts` | Registers all tools on the `McpServer` instance | — |
| `recipes.ts` | Recipe CRUD + toggle | `workato_list_recipes`, `workato_get_recipe`, `workato_get_recipe_code`, `workato_create_recipe`, `workato_update_recipe`, `workato_toggle_recipe` |
| `jobs.ts` | Job history with computed stats | `workato_get_jobs` |
| `connections.ts` | Connection listing | `workato_list_connections` |
| `folders.ts` | Folder/project listing | `workato_list_folders` |

## Relationships
- **Depends on**: `src/api/` for all Workato API calls, `src/utils/recipe-code-helpers.ts` for code summarization
- **Used by**: `src/index.ts` via `registerTools(server)`

## Conventions
- Multi-tool files (e.g. `recipes.ts`) use prefixed exports: `listRecipesName`, `listRecipesSchema`, `listRecipesHandler`
- Single-tool files (e.g. `jobs.ts`) use plain exports: `name`, `schema`, `handler`
- Handlers return `JSON.stringify(...)` on success, `"Error ...: message"` on failure — never throw
- All schemas use zod with `.describe()` for Claude-visible parameter hints
