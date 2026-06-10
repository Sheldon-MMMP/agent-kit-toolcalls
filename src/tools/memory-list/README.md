# memory_list

List saved memories that the agent can use as context.

## Input

No input.

## Output

```json
{
  "memories": [
    {
      "id": "memory_1",
      "content": "User prefers concise answers."
    }
  ]
}
```

## Usage

```ts
import { memoryListTool, registerTools } from '@agent-kit/toolcalls';

const tools = registerTools([memoryListTool], 'openai');
```
