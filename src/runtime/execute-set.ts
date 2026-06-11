import type { ExecuteSet, ToolConfig } from '../types.js';
import type { ToolStore } from './tool-store.js';

export function createExecuteSet(store: ToolStore): ExecuteSet {
  return async function execute_set<
    TOutput = unknown,
    TConfig extends ToolConfig = ToolConfig,
  >(
    tool_name: string,
    input: Record<string, unknown>,
    config?: Partial<TConfig>,
  ): Promise<TOutput> {
    const tool = store.getTool(tool_name);

    if (!tool) {
      throw new Error(`Unknown tool in this instance: ${tool_name}`);
    }

    return (await tool.execute(input, config)) as TOutput;
  };
}
