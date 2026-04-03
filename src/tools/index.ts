import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as recipesTools from './recipes.js';
import * as jobsTool from './jobs.js';
import * as connectionsTool from './connections.js';
import * as foldersTool from './folders.js';

export function registerTools(server: McpServer): void {
  // --- Recipe tools ---

  server.tool(
    recipesTools.listRecipesName,
    recipesTools.listRecipesDescription,
    recipesTools.listRecipesSchema,
    async (args) => {
      const result = await recipesTools.listRecipesHandler(args as recipesTools.ListRecipesInput);
      return { content: [{ type: 'text', text: result }] };
    },
  );

  server.tool(
    recipesTools.getRecipeName,
    recipesTools.getRecipeDescription,
    recipesTools.getRecipeSchema,
    async (args) => {
      const result = await recipesTools.getRecipeHandler(args as recipesTools.GetRecipeInput);
      return { content: [{ type: 'text', text: result }] };
    },
  );

  server.tool(
    recipesTools.getRecipeCodeName,
    recipesTools.getRecipeCodeDescription,
    recipesTools.getRecipeCodeSchema,
    async (args) => {
      const result = await recipesTools.getRecipeCodeHandler(args as recipesTools.GetRecipeCodeInput);
      return { content: [{ type: 'text', text: result }] };
    },
  );

  server.tool(
    recipesTools.createRecipeName,
    recipesTools.createRecipeDescription,
    recipesTools.createRecipeSchema,
    async (args) => {
      const result = await recipesTools.createRecipeHandler(args as recipesTools.CreateRecipeInput);
      return { content: [{ type: 'text', text: result }] };
    },
  );

  server.tool(
    recipesTools.updateRecipeName,
    recipesTools.updateRecipeDescription,
    recipesTools.updateRecipeSchema,
    async (args) => {
      const result = await recipesTools.updateRecipeHandler(args as recipesTools.UpdateRecipeInput);
      return { content: [{ type: 'text', text: result }] };
    },
  );

  server.tool(
    recipesTools.toggleRecipeName,
    recipesTools.toggleRecipeDescription,
    recipesTools.toggleRecipeSchema,
    async (args) => {
      const result = await recipesTools.toggleRecipeHandler(args as recipesTools.ToggleRecipeInput);
      return { content: [{ type: 'text', text: result }] };
    },
  );

  // --- Jobs tool ---

  server.tool(
    jobsTool.name,
    jobsTool.description,
    jobsTool.schema,
    async (args) => {
      const result = await jobsTool.handler(args as jobsTool.Input);
      return { content: [{ type: 'text', text: result }] };
    },
  );

  // --- Connections tool ---

  server.tool(
    connectionsTool.name,
    connectionsTool.description,
    connectionsTool.schema,
    async (args) => {
      const result = await connectionsTool.handler(args as connectionsTool.Input);
      return { content: [{ type: 'text', text: result }] };
    },
  );

  // --- Folders tool ---

  server.tool(
    foldersTool.name,
    foldersTool.description,
    foldersTool.schema,
    async (args) => {
      const result = await foldersTool.handler(args as foldersTool.Input);
      return { content: [{ type: 'text', text: result }] };
    },
  );
}
