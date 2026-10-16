# fabric/wait

GENERATED from the registry by `npx nx run fabric-builder:docs`; do not edit. [All actions](README.md).

Pause.

| `with:` | Takes |
| --- | --- |
| `seconds` | How long to wait. |

Takes no nested `steps:`.
Takes no `timeout:` or `retry:`.

## Example

```yaml
- id: settle
  uses: fabric/wait
  with:
    seconds: 5
```

## Compiles to

```json
{
  "type": "Wait",
  "typeProperties": {
    "waitTimeInSeconds": 5
  },
  "name": "settle",
  "dependsOn": []
}
```
