import type { RecipeCodeNode } from '../types/workato.js';

/**
 * Walk a recipe code tree and produce a human-readable step summary.
 */
export function summarizeRecipeCode(codeJson: string): string {
  try {
    const root = JSON.parse(codeJson) as RecipeCodeNode;
    const lines: string[] = [];
    walkNode(root, 0, lines);
    return lines.join('\n');
  } catch {
    return 'Unable to parse recipe code';
  }
}

function walkNode(node: RecipeCodeNode, indent: number, lines: string[]): void {
  const prefix = '  '.repeat(indent);
  const label = formatNodeLabel(node);
  const provider = node.provider || 'workato';
  const name = node.name || node.keyword;
  lines.push(`${prefix}Step ${node.number} (${node.keyword}): ${provider}.${name} — ${label}`);

  if (node.block) {
    for (const child of node.block) {
      walkNode(child, indent + 1, lines);
    }
  }
}

function formatNodeLabel(node: RecipeCodeNode): string {
  const input = node.input ?? {};

  // Trigger labels
  if (node.keyword === 'trigger') {
    if (node.provider === 'workato_webhooks') {
      const suffix = (input as Record<string, string>).webhook_suffix;
      return suffix ? `Webhook: ${suffix}` : 'Webhook trigger';
    }
    if (node.provider === 'clock') {
      return 'Scheduled trigger';
    }
    return `${node.provider} trigger`;
  }

  // Control flow keywords
  if (node.keyword === 'if') return 'IF condition';
  if (node.keyword === 'elsif') return 'ELSE IF condition';
  if (node.keyword === 'else') return 'ELSE';
  if (node.keyword === 'while_condition') return 'While condition';
  if (node.keyword === 'catch') return 'Error handler';
  if (node.keyword === 'repeat' || node.keyword === 'foreach') return 'Loop';
  if (node.keyword === 'stop') return 'Stop recipe';

  // Action labels — try to extract meaningful context
  if (node.keyword === 'action') {
    if (node.provider === 'logger') return 'Log message';
    if (node.name === 'if') return 'IF condition';
    if (node.name === 'elsif') return 'ELSE IF condition';
    if (node.name === 'else') return 'ELSE';

    const actionName = node.name ? node.name.replace(/_/g, ' ') : 'action';

    const objectName = (input as Record<string, string>).object_name
      || (input as Record<string, string>).table_name
      || (input as Record<string, string>).sobject_name;
    if (objectName) return `${actionName} (${objectName})`;

    return actionName;
  }

  return node.name ? node.name.replace(/_/g, ' ') : node.keyword;
}

/**
 * Static DSL reference for Claude to use when creating recipes.
 */
export const RECIPE_CODE_DSL_REFERENCE = `# Workato Recipe Code DSL Reference

## Structure

A Workato recipe's \`code\` field is a JSON string representing a tree of steps.
Each node has this structure:

\`\`\`json
{
  "number": 0,          // Step number (0-based, sequential)
  "provider": "string", // Connector/app name (e.g., "salesforce", "jira", "workato_webhooks")
  "name": "string",     // Action/trigger name (e.g., "search_records", "create_issue", "new_event")
  "as": "string",       // Unique alias for this step (hex string, e.g., "830726c1")
  "keyword": "trigger", // One of: "trigger", "action", "catch", "repeat", "foreach", "stop"
  "input": {},          // Input fields specific to the connector action
  "block": [],          // Child steps (for triggers, conditions, loops, error handlers)
  "extended_input_schema": [],  // Schema definition for dynamic input fields
  "extended_output_schema": []  // Schema definition for output fields
}
\`\`\`

## Rules

1. Step 0 is always the trigger (keyword: "trigger")
2. Steps are numbered sequentially across the entire tree
3. The trigger's \`block\` array contains all top-level actions
4. Conditional blocks (if/elsif/else) contain their own \`block\` arrays
5. The \`as\` field must be a unique hex string for each step
6. Reference data from previous steps using datapills: \`{"_junction":{"number":0},"path":"field_name"}\`

## Common Providers

- \`workato_webhooks\` — Webhook triggers (new_event)
- \`clock\` — Scheduled triggers (cron-based)
- \`salesforce\` — Salesforce CRM (search_records, create_record, update_record, get_record_by_id)
- \`jira\` — Jira (create_issue, update_issue, search_issues, get_issue_by_id)
- \`jira_service_desk\` — JSM (create_request, search_requests)
- \`rest\` — Generic HTTP (http_request)
- \`logger\` — Debug logging (log_message)
- \`workato_formula\` — Data transformation
- \`lookup_table\` — Lookup table operations

## Conditional Pattern

\`\`\`json
{
  "number": 1,
  "provider": "workato_formula",
  "name": "if",
  "keyword": "action",
  "input": {
    "type": "compound",
    "operand": "and",
    "conditions": [
      {
        "operand": "present",
        "lhs": "datapill_reference",
        "rhs": ""
      }
    ]
  },
  "block": [
    // Steps to execute if condition is true
  ]
}
\`\`\`

## Datapill Reference Pattern

To reference output from a previous step:
\`\`\`json
{
  "_junction": { "number": 0 },
  "path": "field_name"
}
\`\`\`

This references the \`field_name\` output from step 0.

## Error Handling Pattern

\`\`\`json
{
  "number": 1,
  "provider": "workato_formula",
  "name": "monitor",
  "keyword": "action",
  "block": [
    // Steps to try
    {
      "number": 2,
      "provider": "workato_formula",
      "name": "handle_error",
      "keyword": "catch",
      "block": [
        // Error handling steps
      ]
    }
  ]
}
\`\`\`
`;
