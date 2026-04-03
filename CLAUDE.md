# Praecipio Workato MCP Server

MCP server for Workato recipe management — review, assess, and create recipes from Claude Desktop or Claude Code.

## Tech Stack
- TypeScript (ES2022, NodeNext modules)
- `@modelcontextprotocol/sdk` ^1.12.0
- `zod` for input validation
- Workato REST API with Bearer auth

## Directory Map
| Directory | Purpose | Key Entry Points |
|-----------|---------|-----------------|
| `src/` | Server source code | `src/index.ts` |
| `src/api/` | Workato HTTP client + endpoint wrappers | `src/api/client.ts` |
| `src/tools/` | 9 MCP tool handlers | `src/tools/index.ts` |
| `src/resources/` | 2 MCP resources | `src/resources/index.ts` |
| `src/prompts/` | 3 MCP prompts | `src/prompts/index.ts` |
| `src/types/` | TypeScript interfaces for API responses | `src/types/workato.ts` |
| `src/utils/` | Recipe code summarizer + DSL reference | `src/utils/recipe-code-helpers.ts` |

## Development
- **Install**: `npm install`
- **Build**: `npm run build` (tsc → dist/)
- **Dev**: `npm run dev` (tsx hot reload)
- **Test**: `npm run inspector` (MCP Inspector UI)
- **Bundle**: `npm run build && npm install --production && npx @anthropic-ai/mcpb pack . praecipio-workato.mcpb`

## Environment
Copy `.env.example` to `.env` and set `WORKATO_API_KEY` (Bearer token from Workato Workspace Admin > API Clients). Defaults to US datacenter; set `WORKATO_BASE_URL` for other regions.

## Conventions
- Mirrors the `prae_atl_mcp` architecture: modular api/ + tools/ + resources/ + prompts/ layout
- Tool handlers return JSON strings on success, error strings on failure — never throw
- All zod schemas use `.describe()` for Claude-visible parameter documentation
- ES modules throughout — all imports use `.js` extensions

## Warnings
- Recipe code JSON uses undocumented `keyword` values (`if`, `while_condition`, `elsif`) — the summarizer handles these but new ones may appear
- The `workato_update_recipe` tool requires the recipe to be stopped first or the API returns 400
- Rate limits vary by endpoint (recipes list: 2000/min, create: 1/sec) — the client retries once on 429
