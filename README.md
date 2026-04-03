# Praecipio Workato MCP Server

An [MCP](https://modelcontextprotocol.io) server that connects Claude to [Workato](https://www.workato.com) for recipe management. Review, assess, and create integration recipes directly from Claude Desktop or Claude Code.

## Features

### Tools (9)

#### Read-only

| Tool | Description |
|------|-------------|
| `workato_list_recipes` | List and filter recipes by folder, running status, or tags |
| `workato_get_recipe` | Get recipe metadata (connections, job counts, version, webhook URL) |
| `workato_get_recipe_code` | Get recipe logic as a human-readable summary or raw JSON code tree |
| `workato_get_jobs` | Get job execution history with computed success rate and latest error |
| `workato_list_connections` | List all connections and their authorization status |
| `workato_list_folders` | List projects and folders |

#### Mutating

| Tool | Description |
|------|-------------|
| `workato_create_recipe` | Create a new recipe from a name and Workato recipe code JSON |
| `workato_update_recipe` | Update a recipe's name, description, or code (recipe must be stopped) |
| `workato_toggle_recipe` | Start or stop a recipe |

### Resources (2)

| Resource | Description |
|----------|-------------|
| `workato://workspace/overview` | Dynamic workspace summary: projects, recipe counts, connection health |
| `workato://reference/recipe-code-dsl` | Workato recipe JSON DSL reference for creating recipes |

### Prompts (3)

| Prompt | Description |
|--------|-------------|
| `recipe_audit` | Assess health and quality of recipes in a folder or across the workspace |
| `recipe_design` | Design and create a new recipe from natural language requirements |
| `recipe_explain` | Get a detailed plain-English explanation of what a recipe does |

## Setup

### 1. Get a Workato API Key

Go to **Workato Workspace Admin > API Clients**, create an API client, and copy the Bearer token.

### 2. Install

```bash
git clone https://github.com/praecipio/praecipio-workato-mcp.git
cd praecipio-workato-mcp
npm install
npm run build
```

### 3. Configure

Copy `.env.example` to `.env` and set your API key:

```
WORKATO_API_KEY=wrkaus-your-token-here
```

The base URL defaults to `https://www.workato.com/api` (US datacenter). Set `WORKATO_BASE_URL` for other regions:

| Region | Base URL |
|--------|----------|
| US | `https://www.workato.com/api` |
| EU | `https://app.eu.workato.com/api` |
| Japan | `https://app.jp.workato.com/api` |
| Singapore | `https://app.sg.workato.com/api` |
| Australia | `https://app.au.workato.com/api` |

### 4. Connect to Claude

#### Claude Desktop (MCPB bundle)

```bash
npm run build
npm install --production
npx @anthropic-ai/mcpb validate .
npx @anthropic-ai/mcpb pack . praecipio-workato.mcpb
```

Double-click `praecipio-workato.mcpb` to install. Claude Desktop will prompt for your API key and store it securely in the OS keychain.

#### Claude Desktop (manual config)

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "workato": {
      "command": "node",
      "args": ["/path/to/praecipio-workato-mcp/dist/index.js"],
      "env": {
        "WORKATO_API_KEY": "wrkaus-your-token-here"
      }
    }
  }
}
```

#### Claude Code

Add to `.mcp.json` in your project root:

```json
{
  "mcpServers": {
    "workato": {
      "command": "node",
      "args": ["/path/to/praecipio-workato-mcp/dist/index.js"],
      "env": {
        "WORKATO_API_KEY": "wrkaus-your-token-here"
      }
    }
  }
}
```

## Development

```bash
npm run dev          # Run with tsx (hot reload)
npm run build        # Compile TypeScript
npm run inspector    # Launch MCP Inspector UI
```

## Architecture

```
src/
  index.ts           # MCP server entry point (stdio transport)
  config.ts          # Zod-validated environment config
  api/
    client.ts        # HTTP client (Bearer auth, rate-limit retry, 30s timeout)
    recipes.ts       # Recipes + Jobs API
    connections.ts   # Connections API
    folders.ts       # Folders API
  tools/             # 9 MCP tool handlers
  resources/         # Workspace overview + DSL reference
  prompts/           # recipe_audit, recipe_design, recipe_explain
  utils/             # Recipe code tree summarizer
  types/             # TypeScript interfaces for Workato API responses
```

## How Recipe Code Works

Workato recipes are defined as a JSON tree where each node represents a step:

```json
{
  "number": 0,
  "provider": "workato_webhooks",
  "name": "new_event",
  "keyword": "trigger",
  "input": { ... },
  "block": [
    { "number": 1, "provider": "salesforce", "name": "search_records", "keyword": "action", ... }
  ]
}
```

The `workato_get_recipe_code` tool can return this as either raw JSON or a human-readable summary:

```
Step 0 (trigger): workato_webhooks.new_event — Webhook: new-deal-registration
  Step 1 (action): salesforce.get_custom_object — get custom object (Opportunity)
  Step 2 (if): workato.if — IF condition
  Step 3 (action): partner_central.create_deal — create deal registration
```

Use `format: "raw"` to study existing recipes as templates, then pass the JSON to `workato_create_recipe` to build new ones.

## License

MIT
