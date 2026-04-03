# types

TypeScript interfaces for Workato API response shapes.

## Contents
| File | Purpose | Key Types |
|------|---------|-----------|
| `workato.ts` | All API response interfaces | `Recipe`, `Job`, `Connection`, `Folder`, `Tag`, `RecipeCodeNode`, `RecipeListResponse`, `JobListResponse` |

## Notes
- `RecipeCodeNode.keyword` is typed as `string` (not a union) because Workato uses many undocumented keywords like `if`, `while_condition`, `elsif`
- `Recipe.code` is a JSON string — must be `JSON.parse()`'d to get the `RecipeCodeNode` tree
