# fabric/raw

GENERATED from the registry by `npx nx run fabric-builder:docs`; do not edit. [All actions](README.md).

An activity given as its Fabric JSON, for anything the other actions do not cover. with: is the activity; id and needs are applied over it.

| `with:` | Takes |
| --- | --- |
| `type` | The activity type, e.g. WebActivity. |
| `typeProperties` | As Fabric expects them; expressions are written in ADF syntax here, not ${{ }}. |
| `...` | policy, externalReferences, and any other activity-level key pass through. |

Takes no nested `steps:`.
Takes no `timeout:` or `retry:`.

## Example

```yaml
- id: get_token
  uses: fabric/raw
  with:
    type: WebActivity
    typeProperties:
      method: POST
      headers: { Content-Type: application/x-www-form-urlencoded }
    externalReferences:
      connection: 940e1054-f8c0-47e0-a0f0-636b36af5892
```

## Compiles to

```json
{
  "type": "WebActivity",
  "typeProperties": {
    "method": "POST",
    "headers": {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  },
  "externalReferences": {
    "connection": "940e1054-f8c0-47e0-a0f0-636b36af5892"
  },
  "name": "get_token",
  "dependsOn": []
}
```
