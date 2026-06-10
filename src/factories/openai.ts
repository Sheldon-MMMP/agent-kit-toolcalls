import type { ToolFactory } from '../types.js';

export const openAiFactory: ToolFactory = {
  provider: 'openai',
  convert(tool) {
    return {
      type: 'function' as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.inputSchema,
      },
    };
  },
};
