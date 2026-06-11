import { getFactory } from '../factories/index.js';
import type { ProviderName, ToolCallInstance, ToolKit } from '../types.js';
import { createExecuteSet } from './execute-set.js';
import { createToolStore } from './tool-store.js';

export function registerTools<TProviderTool = unknown>(
  tools: ToolKit,
  provider: ProviderName,
): ToolCallInstance<TProviderTool> {
  const store = createToolStore(tools);
  const factory = getFactory(provider);
  const providerTools = tools.map((tool) =>
    factory.convert(tool),
  ) as TProviderTool[];

  return {
    tools: providerTools,
    execute_set: createExecuteSet(store),
    getTool: store.getTool,
    listTools: store.listTools,
  };
}
