# fabric/fail

GENERATED from the registry by `npx nx run fabric-builder:docs`; do not edit. [All actions](README.md).

Fail the run with a message and an error code.

| `with:` | Takes |
| --- | --- |
| `message` | Plain text, a ${{ }}, or a mix (becomes concat()). |
| `code` | The error code shown in monitoring. |

Takes no nested `steps:`.
Takes no `timeout:` or `retry:`.

## Example

```yaml
- id: empty_bronze
  uses: fabric/fail
  with:
    message: Bronze table ${{ item.table_name }} is empty
    code: BronzeEmpty
```

## Compiles to

```json
{
  "type": "Fail",
  "typeProperties": {
    "message": {
      "value": "@concat('Bronze table ', item().table_name, ' is empty')",
      "type": "Expression"
    },
    "errorCode": "BronzeEmpty"
  },
  "name": "empty_bronze",
  "dependsOn": []
}
```
