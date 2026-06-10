import type { Tool } from '../types.js';

const tools = new Map<string, Tool>();

export function saveTools(nextTools: Tool[]): void {
  for (const tool of nextTools) {
    if (tools.has(tool.name)) {
      throw new Error(`Tool already exists: ${tool.name}`);
    }

    tools.set(tool.name, tool);
  }
}

export function getTool(name: string): Tool | undefined {
  return tools.get(name);
}

export function listTools(): Tool[] {
  return [...tools.values()];
}
