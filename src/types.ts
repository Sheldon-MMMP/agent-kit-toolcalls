export type JsonSchemaObject = {
  type: 'object';
  properties?: Record<string, unknown>;
  required?: string[];
  additionalProperties?: boolean;
};

export type ToolConfig = Record<string, unknown>;

export type Tool<
  TInput = Record<string, unknown>,
  TOutput = unknown,
  TConfig extends ToolConfig = ToolConfig,
> = {
  name: string;
  description: string;
  inputSchema: JsonSchemaObject;
  execute(input: TInput, config?: Partial<TConfig>): Promise<TOutput> | TOutput;
};

export type ToolKit = Tool[];

export type ExecuteSet = <
  TOutput = unknown,
  TConfig extends ToolConfig = ToolConfig,
>(
  tool_name: string,
  input: Record<string, unknown>,
  config?: Partial<TConfig>,
) => Promise<TOutput>;

export type ToolCallInstance<TProviderTool = unknown> = {
  tools: TProviderTool[];
  execute_set: ExecuteSet;
  getTool(name: string): Tool | undefined;
  listTools(): Tool[];
};

export type ProviderName = 'openai' | 'anthropic' | 'gemini';

export type ToolFactory<TProviderTool = unknown> = {
  provider: ProviderName;
  convert(tool: Tool): TProviderTool;
};
