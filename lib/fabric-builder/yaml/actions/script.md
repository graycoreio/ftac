# fabric/script

GENERATED from the registry by `npx nx run fabric-builder:docs`; do not edit. [All actions](README.md).

Run T-SQL inside a warehouse. Batches are split on GO lines and must not contain ${{ }}.

| `with:` | Takes |
| --- | --- |
| `warehouse` | The token name of the warehouse; gld_datawarehouse emits {{ .gld_datawarehouse_id }}. |
| `sql` | The T-SQL, GO-separated. |
| `timeout` | Per-block execution timeout, HH:MM:SS. Default 02:00:00. |

Takes no nested `steps:`.
`timeout:` (HH:MM:SS or D.HH:MM:SS) and `retry: { count, interval }` apply; the default is the portal policy.

## Example

```yaml
- id: merge_gold
  uses: fabric/script
  with:
    warehouse: gld_datawarehouse
    sql: |-
      CREATE SCHEMA IF NOT EXISTS History
      GO
      MERGE History.Period ...
```

## Compiles to

```json
{
  "type": "Script",
  "typeProperties": {
    "scripts": [
      {
        "text": {
          "value": "CREATE SCHEMA IF NOT EXISTS History",
          "type": "Expression"
        },
        "type": "NonQuery"
      },
      {
        "text": {
          "value": "MERGE History.Period ...",
          "type": "Expression"
        },
        "type": "NonQuery"
      }
    ],
    "scriptBlockExecutionTimeout": "02:00:00"
  },
  "linkedService": {
    "name": "gld_datawarehouse",
    "properties": {
      "type": "DataWarehouse",
      "typeProperties": {
        "artifactId": "{{ .gld_datawarehouse_id }}",
        "endpoint": "{{ .sql_endpoint_host }}",
        "workspaceId": "{{ .workspace_id }}"
      },
      "annotations": []
    }
  },
  "policy": {
    "timeout": "0.12:00:00",
    "retry": 0,
    "retryIntervalInSeconds": 30,
    "secureInput": false,
    "secureOutput": false
  },
  "name": "merge_gold",
  "dependsOn": []
}
```
