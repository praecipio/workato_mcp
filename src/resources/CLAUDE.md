# resources

MCP resources — read-only data exposed to Claude on demand.

## Contents
| File | Purpose | Resources Defined |
|------|---------|-------------------|
| `index.ts` | Registers 2 resources on the `McpServer` instance | `workato://workspace/overview` (dynamic), `workato://reference/recipe-code-dsl` (static) |

## Relationships
- **Depends on**: `src/api/` for dynamic workspace data, `src/utils/recipe-code-helpers.ts` for the DSL reference string
- **Used by**: `src/index.ts` via `registerResources(server)`
