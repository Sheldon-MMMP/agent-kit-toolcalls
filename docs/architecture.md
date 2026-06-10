# Toolcalls Architecture

## First Version

The package is independent from `agent_server`.

```text
toolcalls/
├── package.json
├── tsconfig.json
├── README.md
└── src/
    ├── index.ts
    ├── types.ts
    ├── factories/
    ├── runtime/
    └── tools/
```

## Flow

```mermaid
sequenceDiagram
    participant App as Agent project
    participant Register as registerTools
    participant Store as tool-store
    participant Factory as Provider factory
    participant Provider as Model provider
    participant Execute as execute_set
    participant Tool as Raw Tool

    App->>App: import needed tools only
    App->>Register: registerTools([tool], 'openai')
    Register->>Store: store raw tools by name
    Register->>Factory: convert raw tools to provider format
    Register-->>App: provider tools
    App->>Provider: send tools to model
    Provider-->>App: tool call { name, input }
    App->>Execute: execute_set(tool_name, input)
    Execute->>Store: get raw Tool by name
    Execute->>Tool: tool.execute(input)
    Tool-->>Execute: output
    Execute-->>App: output
```

## Boundary Rules

- `src/index.ts` must not import `src/tools/*`.
- `src/runtime/register-tools.ts` must not import `src/tools/*`.
- `src/runtime/execute-set.ts` must not import `src/tools/*`.
- `src/runtime/tool-store.ts` must not import `src/tools/*`.
- Tools are only loaded when users import their subpath.
- `registerTools()` only handles the tools passed by the user.
- `execute_set()` only executes tools already stored by `registerTools()`.
