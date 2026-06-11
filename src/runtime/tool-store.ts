import type { Tool, ToolKit } from '../types.js';

export type ToolStore = {
  saveTools(nextTools: ToolKit): void;
  getTool(name: string): Tool | undefined;
  listTools(): Tool[];
};

export function createToolStore(initialTools: ToolKit = []): ToolStore {
  const tools = new Map<string, Tool>();

  function saveTools(nextTools: ToolKit): void {
    for (const tool of nextTools) {
      if (tools.has(tool.name)) {
        throw new Error(`Tool already exists in this instance: ${tool.name}`);
      }

      tools.set(tool.name, tool);
    }
  }

  function getTool(name: string): Tool | undefined {
    return tools.get(name);
  }

  function listTools(): Tool[] {
    return [...tools.values()];
  }

  saveTools(initialTools);

  return {
    saveTools,
    getTool,
    listTools,
  };
}
