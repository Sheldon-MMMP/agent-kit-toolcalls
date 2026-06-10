import type { Tool } from '../../types.js';

export type Memory = {
  id: string;
  content: string;
};

export type MemoryListInput = Record<string, never>;

export type MemoryListOutput = {
  memories: Memory[];
};

export const memoryListTool: Tool<MemoryListInput, MemoryListOutput> = {
  name: 'memory_list',
  description: 'List saved memories that the agent can use as context.',
  inputSchema: {
    type: 'object',
    properties: {},
    additionalProperties: false,
  },
  async execute() {
    return { memories: [] };
  },
};
