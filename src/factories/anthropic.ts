import type { ToolFactory } from '../types.js';

export const anthropicFactory: ToolFactory = {
  provider: 'anthropic',
  convert(tool) {
    return {
      name: tool.name,
      description: tool.description,
      input_schema: tool.inputSchema,
    };
  },
};
