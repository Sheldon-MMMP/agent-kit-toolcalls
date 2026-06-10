export type JsonSchemaObject = {
  type: 'object';
  properties?: Record<string, unknown>;
  required?: string[];
  additionalProperties?: boolean;
};

export type Tool<TInput = Record<string, unknown>, TOutput = unknown> = {
  name: string;
  description: string;
  inputSchema: JsonSchemaObject;
  execute(input: TInput): Promise<TOutput> | TOutput;
};

export type ProviderName = 'openai' | 'anthropic' | 'gemini';

export type ToolFactory<TProviderTool = unknown> = {
  provider: ProviderName;
  convert(tool: Tool): TProviderTool;
};
