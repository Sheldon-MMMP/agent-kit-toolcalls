# @agent-kit/toolcalls

[中文](./README.md)

`@agent-kit/toolcalls` is a collection of reusable tools for building AI agents.

When building agents, developers often recreate the same basic tools again and again: memory access, memory updates, search, file operations, HTTP requests, database queries, knowledge retrieval, and more. This package aims to collect those common tools and provide a consistent way to define, register, convert, and execute them.

The package is framework-agnostic. It does not depend on a specific agent runtime, application repository, or model provider. You can use it with your own agent runtime, the OpenAI SDK, Anthropic SDK, Gemini SDK, or any custom model integration.

### What It Helps With

- Reuse common tools across agent projects.
- Define tools with a consistent TypeScript shape.
- Convert the same tools into provider-specific tool definitions.
- Execute registered tools by tool name.
- Avoid rebuilding tool registries and provider adapters in every agent project.

### Core Idea

Every tool starts with the same raw structure:

```ts
export type Tool<TInput = Record<string, unknown>, TOutput = unknown> = {
  name: string;
  description: string;
  inputSchema: JsonSchemaObject;
  execute(input: TInput): Promise<TOutput> | TOutput;
};
```

Then call:

```ts
registerTools([tool], provider)
```

This does two things:

1. Stores the raw tool internally so it can later be executed with `execute_set(tool_name, input)`.
2. Returns provider-specific tool definitions for OpenAI, Anthropic, Gemini, or another supported provider.

### Installation

```bash
npm install @agent-kit/toolcalls
```

### Quick Start

```ts
import {
  memoryListTool,
  execute_set,
  registerTools,
} from '@agent-kit/toolcalls';

const tools = registerTools([memoryListTool], 'openai');

const completion = await openai.chat.completions.create({
  model: 'gpt-4.1',
  messages,
  tools,
});

const toolCall = completion.choices[0]?.message.tool_calls?.[0];

if (toolCall) {
  const output = await execute_set(
    toolCall.function.name,
    JSON.parse(toolCall.function.arguments),
  );

  console.log(output);
}
```

### Runtime Flow

```text
import tools from @agent-kit/toolcalls
  -> choose the tools to register
  -> registerTools([tools], provider)
  -> store raw Tools internally
  -> return provider-specific tool definitions
  -> send tools to the model
  -> model returns a tool call
  -> execute_set(tool_name, input)
  -> run the raw Tool's execute function
```

### Supported Providers

```ts
type ProviderName = 'openai' | 'anthropic' | 'gemini';
```

Different providers expect different tool shapes. This package converts the shared `Tool` definition into provider-specific structures through factories.

### Built-in Tools

| Tool | Description |
| --- | --- |
| `memoryListTool` | Lists memories available to the agent. |

Future tools may include:

- `memorySaveTool`
- `webSearchTool`
- `httpFetchTool`
- `fileReadTool`
- `knowledgeSearchTool`
- `databaseQueryTool`

### Using Custom Tools

If you want to add a new tool to your own agent, you do not need to modify this npm package.

You only need to do two things in your project:

1. Define a tool that follows the `Tool` type.
2. Pass that tool to `registerTools([tool], provider)`.

Example:

```ts
import type { Tool } from '@agent-kit/toolcalls';
import {
  execute_set,
  registerTools,
} from '@agent-kit/toolcalls';

type SearchInput = {
  query: string;
};

type SearchOutput = {
  results: string[];
};

export const searchTool: Tool<SearchInput, SearchOutput> = {
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
  async execute(input) {
    return {
      results: [`Result for ${input.query}`],
    };
  },
};

const tools = registerTools([searchTool], 'openai');

const output = await execute_set('search', {
  query: 'agent tools',
});
```

That is all you need to add a custom tool.

`registerTools` stores `searchTool` internally and returns the provider-specific tool definition. Later, when the model calls this tool, use `execute_set('search', input)` to run the raw tool.

You can register multiple custom tools at once:

```ts
const tools = registerTools([
  searchTool,
  readFileTool,
  webSearchTool,
], 'openai');
```
