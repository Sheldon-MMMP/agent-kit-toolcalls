import { getFactory } from '../factories/index.js';
import type { ProviderName, Tool } from '../types.js';
import { saveTools } from './tool-store.js';

export function registerTools<TProviderTool = unknown>(
  tools: Tool[],
  provider: ProviderName,
): TProviderTool[] {
  saveTools(tools);

  const factory = getFactory(provider);

  return tools.map((tool) => factory.convert(tool)) as TProviderTool[];
}
