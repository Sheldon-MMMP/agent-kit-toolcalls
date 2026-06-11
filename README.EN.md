# @agent-kit/toolcalls

[中文](./README.md)

`@agent-kit/toolcalls` is a tools foundation package for building AI agents.

It does not bind you to a specific agent framework. Instead, it provides a stable way to define tools, register tools, convert tools into provider-specific formats, and execute the original tool functions.

Over time, this repository will collect common agent tools such as time tools, HTTP tools, file tools, search tools, code execution tools, and more. The current focus is to stabilize the core tool protocol and runtime design first.

## Installation

```bash
npm install @agent-kit/toolcalls
```

## Quick Start

The example below imports a basic tool and registers it for OpenAI.

```ts
import { createGetTimeTool, registerTools } from '@agent-kit/toolcalls';

const toolcalls = registerTools([createGetTimeTool()], 'openai');

const completion = await openai.chat.completions.create({
  model: 'gpt-4.1',
  messages,
  tools: toolcalls.tools,
});

const toolCall = completion.choices[0]?.message.tool_calls?.[0];

if (toolCall) {
  const output = await toolcalls.execute_set(
    toolCall.function.name,
    JSON.parse(toolCall.function.arguments),
  );

  console.log(output);
}
```

## What It Helps With

- Define agent tools with a consistent TypeScript shape.
- Convert the same `Tool` into provider-specific tool definitions.
- Register a group of tools and get an isolated execution instance.
- Use the same tool names across different instances without conflicts.
- Avoid rebuilding tool registries and provider adapters in every agent project.

## Core Concepts

### Tool

`Tool` is the standard structure for a single tool.

```ts
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
```

### ToolKit

`ToolKit` is a group of related tools.

```ts
export type ToolKit = Tool[];
```

If a capability naturally contains multiple tools, expose it as `createXxxToolKit(config): ToolKit`. If it is a single tool, expose it as `createXxxTool(config): Tool`.

### ToolCallInstance

Every `registerTools` call returns an isolated instance. In most cases, you only need `tools` and `execute_set` from that instance.

```ts
const toolcalls = registerTools([createGetTimeTool()], 'openai');

// Pass this to the provider SDK
toolcalls.tools;

// Execute a raw tool registered in this instance
await toolcalls.execute_set('get_time', {});
```

This means you can register tools with the same names multiple times, as long as they live in different instances.

## Runtime Flow

```text
define Tool or ToolKit
  -> registerTools(tools, provider)
  -> return an isolated ToolCallInstance
  -> instance.tools contains provider-specific tool definitions
  -> send instance.tools to the model
  -> the model returns a tool call
  -> instance.execute_set(tool_name, input)
  -> execute the raw Tool inside this instance
```

## Instance Isolation

`registerTools` does not use a global store. Every call creates a new isolated instance.

```ts
const agentA = registerTools([createGetTimeTool()], 'openai');
const agentB = registerTools([createGetTimeTool()], 'openai');

await agentA.execute_set('get_time', {});
await agentB.execute_set('get_time', {});
```

Both instances contain `get_time`, but their stores are isolated. If a tool later receives different paths, API keys, or business config, it will not affect other instances.

## Supported Providers

```ts
type ProviderName = 'openai' | 'anthropic' | 'gemini';
```

Different providers expect different tool shapes. This package converts the shared `Tool` definition into provider-specific structures through factories.

## Built-in Tools

The current version does not include built-in tools yet.

The first step is to stabilize the tool protocol, registration flow, instance isolation, and provider conversion. Future built-in tools may include:

- `createGetTimeTool`
- `createHttpFetchTool`
- `createReadFileTool`
- `createWriteFileTool`
- `createWebSearchTool`

## Custom Tools

To add a tool in your own project, you only need two steps:

1. Define a tool that matches the `Tool` type.
2. Pass it to `registerTools([tool], provider)`.

Example:

```ts
import { readEnv, registerTools, type Tool } from '@agent-kit/toolcalls';

type SearchInput = {
  query: string;
};

type SearchOutput = {
  results: string[];
};

type SearchConfig = {
  apiKey?: string;
};

export function createSearchTool(
  config: Partial<SearchConfig> = {},
): Tool<SearchInput, SearchOutput, SearchConfig> {
  return {
    name: 'search',
    description: 'Search for information by query.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query.',
        },
      },
      required: ['query'],
      additionalProperties: false,
    },
    async execute(input, executeConfig = {}) {
      const apiKey =
        executeConfig.apiKey ?? config.apiKey ?? readEnv('SEARCH_API_KEY');

      return {
        results: [`Result for ${input.query} with ${apiKey ?? 'no-api-key'}`],
      };
    },
  };
}

const search = registerTools(
  [
    createSearchTool({
      apiKey: 'create-time-api-key',
    }),
  ],
  'openai',
);

const output = await search.execute_set(
  'search',
  {
    query: 'agent tools',
  },
  {
    apiKey: 'runtime-api-key',
  },
);
```

Recommended config precedence:

```text
execute_set config > createXxxTool config > environment variables
```

## Custom ToolKits

If one capability contains multiple related tools, define it as a `ToolKit`.

```ts
import type { ToolKit } from '@agent-kit/toolcalls';

export function createFileToolKit(config: FileToolKitConfig): ToolKit {
  return [
    createReadFileTool(config),
    createWriteFileTool(config),
  ];
}

const fileTools = registerTools(
  [
    ...createFileToolKit({
      rootDir: './workspace',
    }),
  ],
  'openai',
);
```

Recommended naming:

```text
createXxxTool(config): Tool
createXxxToolKit(config): ToolKit
```

Use one file per tool. Use `tool.ts` to assemble a toolkit.
