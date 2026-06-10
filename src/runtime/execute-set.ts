import { getTool } from './tool-store.js';

export async function execute_set<TOutput = unknown>(
  tool_name: string,
  input: Record<string, unknown>,
): Promise<TOutput> {
  const tool = getTool(tool_name);

  if (!tool) {
    throw new Error(`Unknown tool: ${tool_name}`);
  }

  return (await tool.execute(input)) as TOutput;
}
