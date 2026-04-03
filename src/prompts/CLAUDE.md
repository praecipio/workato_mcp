# prompts

MCP prompt templates that orchestrate multi-tool workflows.

## Contents
| File | Purpose | Prompts Defined |
|------|---------|-----------------|
| `index.ts` | Registers 3 prompts on the `McpServer` instance | `recipe_audit`, `recipe_design`, `recipe_explain` |

## Relationships
- **Used by**: `src/index.ts` via `registerPrompts(server)`
- Prompts instruct Claude to call tools from `src/tools/` and read resources from `src/resources/`
