# fabric/set-variable

GENERATED from the registry by `npx nx run fabric-builder:docs`; do not edit. [All actions](README.md).

Set a pipeline variable declared under vars:.

| `with:` | Takes |
| --- | --- |
| `name` | The variable. |
| `value` | Plain text becomes a string literal; a lone ${{ }} is evaluated; a mix becomes concat(). |

Takes no nested `steps:`.
Takes no `timeout:` or `retry:`.

## Example

```yaml
- id: set_date
  uses: fabric/set-variable
  with:
    name: date
    value: ${{ if(empty(inputs.date), utcNow(), inputs.date) }}
```

## Compiles to

```json
{
  "type": "SetVariable",
  "typeProperties": {
    "variableName": "date",
    "value": {
      "value": "@if(empty(pipeline().parameters.date), utcNow(), pipeline().parameters.date)",
      "type": "Expression"
    }
  },
  "policy": {
    "secureInput": false,
    "secureOutput": false
  },
  "name": "set_date",
  "dependsOn": []
}
```
