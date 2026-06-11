# @agent-kit/toolcalls

[English](./README.EN.md)

![Toolcalls poster](./docs/assets/toolcalls-poster.png)

`@agent-kit/toolcalls` 是一个面向 Agent 开发的 tools 基础库。

它的目标不是绑定某个 Agent 框架，而是提供一套稳定的工具定义、工具注册、厂商结构转换和工具执行方式。你可以用它来快速组织 Agent 项目里的 tools，并把同一批 tools 转换成 OpenAI、Anthropic、Gemini 等模型厂商需要的格式。

这个仓库后续会逐步收集 Agent 开发中常用的基础工具，例如时间工具、HTTP 请求工具、文件读写工具、搜索工具、代码执行工具等。当前阶段先把核心工具协议和运行时设计稳定下来。

## 安装

```bash
npm install @agent-kit/toolcalls
```

## 快速开始

下面示例直接导入一个基础工具，然后注册给 OpenAI 使用。

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

## 适合解决什么问题

- 用统一的 TypeScript 类型定义 Agent 工具。
- 把同一个 `Tool` 转换成不同模型厂商的 tools 结构。
- 注册一组 tools 后，得到一个独立的执行实例。
- 支持同名 tools 在不同实例里隔离运行。
- 避免每个 Agent 项目都重复实现 tool registry 和 provider adapter。

## 核心概念

### Tool

`Tool` 是单个工具的标准结构。

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

`ToolKit` 是一组相关工具。

```ts
export type ToolKit = Tool[];
```

如果一个能力天然是一组工具，可以用 `createXxxToolKit(config)` 返回 `ToolKit`。如果只是单个工具，可以用 `createXxxTool(config)` 返回 `Tool`。

### ToolCallInstance

`registerTools` 每次调用都会返回一个独立实例。你通常只需要使用实例上的 `tools` 和 `execute_set`。

```ts
const toolcalls = registerTools([createGetTimeTool()], 'openai');

// 传给模型厂商 SDK
toolcalls.tools;

// 执行当前实例里注册过的原始工具
await toolcalls.execute_set('get_time', {});
```

这意味着你可以多次注册同名工具，只要它们在不同实例里，就不会互相冲突。

## 运行流程

```text
定义 Tool 或 ToolKit
  -> registerTools(tools, provider)
  -> 返回独立 ToolCallInstance
  -> instance.tools 是当前 provider 的 tools 结构
  -> 把 instance.tools 传给模型
  -> 模型返回 tool call
  -> instance.execute_set(tool_name, input)
  -> 执行当前实例内的原始 Tool
```

## 实例隔离

`registerTools` 不使用全局 store。每次注册都会创建一个独立实例。

```ts
const agentA = registerTools([createGetTimeTool()], 'openai');
const agentB = registerTools([createGetTimeTool()], 'openai');

await agentA.execute_set('get_time', {});
await agentB.execute_set('get_time', {});
```

上面两个实例都包含 `get_time`，但它们的 store 是相互隔离的。后续如果某个工具在 `config` 中传入不同路径、API key 或业务参数，也不会影响其他实例。

## 当前支持的 Provider

```ts
type ProviderName = 'openai' | 'anthropic' | 'gemini';
```

不同厂商对 tools 的结构要求不同。这个包内部通过 factory 把统一的 `Tool` 转换成目标厂商需要的结构。

## 当前内置工具

当前版本暂时不内置具体工具。

我们先稳定工具协议、注册机制、实例隔离和厂商转换。后续会逐步加入更基础、更通用的 Agent tools，例如：

- `createGetTimeTool`
- `createHttpFetchTool`
- `createReadFileTool`
- `createWriteFileTool`
- `createWebSearchTool`

## 自定义工具

在自己的项目里添加工具，只需要两步：

1. 定义一个符合 `Tool` 类型的工具。
2. 传入 `registerTools([tool], provider)` 完成注册。

示例：

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

配置优先级建议统一为：

```text
execute_set 传入的 config > createXxxTool 传入的 config > 环境变量
```

## 自定义 ToolKit

如果一个能力包含多个相关工具，可以定义为 `ToolKit`。

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

推荐命名方式：

```text
createXxxTool(config): Tool
createXxxToolKit(config): ToolKit
```

单个工具一个文件，成套工具由 `tool.ts` 负责组装。
