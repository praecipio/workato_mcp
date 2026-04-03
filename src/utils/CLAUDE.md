# utils

Recipe code intelligence — tree summarizer and DSL reference documentation.

## Contents
| File | Purpose | Key Exports |
|------|---------|-------------|
| `recipe-code-helpers.ts` | Walks a recipe code JSON tree to produce step-by-step summaries; also contains the static DSL reference string | `summarizeRecipeCode(codeJson)`, `RECIPE_CODE_DSL_REFERENCE` |

## Warnings
- The summarizer must handle nodes with missing `provider`/`name` fields (control flow nodes like `if`, `repeat`, `while_condition` omit these)
- `RECIPE_CODE_DSL_REFERENCE` is a large template literal used by the `workato://reference/recipe-code-dsl` resource
