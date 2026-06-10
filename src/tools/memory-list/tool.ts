import type { Tool } from '../../types.js';

export type Memory = {
  id: string;
  content: string;
};

export type MemoryListInput = Record<string, never>;

export type MemoryListOutput = {
  memories: Memory[];
};

export type MemoryListDeps = {
  listMemories(): Promise<Memory[]>;
};

export function createMemoryListTool(
  deps: MemoryListDeps,
): Tool<MemoryListInput, MemoryListOutput> {
  return {
    name: 'memory_list',
    description: 'List saved memories that the agent can use as context.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    async execute() {
      const memories = await deps.listMemories();
      return { memories };
    },
  };
}
