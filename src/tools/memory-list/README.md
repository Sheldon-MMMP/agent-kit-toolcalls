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
import { createMemoryListTool } from '@agent-kit/toolcalls/tools/memory-list';

const memoryListTool = createMemoryListTool({
  listMemories: () => memoryRepository.listMemories(),
});
```
