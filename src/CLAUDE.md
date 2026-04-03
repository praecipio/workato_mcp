# src

MCP server source code. Entry point is `index.ts`, which initializes the `McpServer` and registers tools, resources, and prompts via their respective `index.ts` modules.

## Contents
| File | Purpose | Key Exports |
|------|---------|-------------|
| `index.ts` | Server entry point — creates `McpServer`, connects stdio transport | — |
| `config.ts` | Zod-validated env config (`WORKATO_API_KEY`, `WORKATO_BASE_URL`) | `config` singleton |

## Directory Map
| Directory | Purpose |
|-----------|---------|
| `api/` | Workato REST API client (HTTP, auth, rate-limit retry) |
| `tools/` | 9 MCP tool handlers (recipes, jobs, connections, folders) |
| `resources/` | 2 MCP resources (workspace overview, DSL reference) |
| `prompts/` | 3 MCP prompts (audit, design, explain) |
| `types/` | TypeScript interfaces for Workato API responses |
| `utils/` | Recipe code tree summarizer + DSL reference string |

## Data Flow
```
index.ts → registerTools/Resources/Prompts
  tools/*.ts → api/*.ts → Workato REST API
  resources/index.ts → api/*.ts + utils/recipe-code-helpers.ts
```
