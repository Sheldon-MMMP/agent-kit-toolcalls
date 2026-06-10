import type { ProviderName, ToolFactory } from '../types.js';
import { anthropicFactory } from './anthropic.js';
import { geminiFactory } from './gemini.js';
import { openAiFactory } from './openai.js';

const factories: Record<ProviderName, ToolFactory> = {
  openai: openAiFactory,
  anthropic: anthropicFactory,
  gemini: geminiFactory,
};

export function getFactory(provider: ProviderName): ToolFactory {
  return factories[provider];
}
