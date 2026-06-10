# @agent-kit/toolcalls

Lightweight tool definitions and provider conversion helpers for agent projects.

This package is standalone. It does not depend on `agent_server` or any app-specific repository.

## Install

```bash
npm install @agent-kit/toolcalls
```

## Usage

```ts
import {
  execute_set,
  registerTools,
} from '@agent-kit/toolcalls';
import { createMemoryListTool } from '@agent-kit/toolcalls/tools/memory-list';

const memoryListTool = createMemoryListTool({
  listMemories: () => memoryRepository.listMemories(),
});

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
}
```

## Tool Shape

```ts
export type Tool<TInput = Record<string, unknown>, TOutput = unknown> = {
  name: string;
  description: string;
  inputSchema: JsonSchemaObject;
  execute(input: TInput): Promise<TOutput> | TOutput;
};
```

## Design Rule

Runtime files do not import `src/tools/*`. Users import the tools they want and pass them to `registerTools`.

```text
user imports tool
  -> registerTools([tool], provider)
  -> raw tool is saved in store
  -> provider tool structure is returned
  -> execute_set(tool_name, input) runs the raw tool from store
```
