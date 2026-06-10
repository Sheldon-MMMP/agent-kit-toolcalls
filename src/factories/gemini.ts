import type { ToolFactory } from '../types.js';

export const geminiFactory: ToolFactory = {
  provider: 'gemini',
  convert(tool) {
    return {
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema,
    };
  },
};
