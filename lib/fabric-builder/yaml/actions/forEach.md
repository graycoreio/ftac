# fabric/for-each

GENERATED from the registry by `npx nx run fabric-builder:docs`; do not edit. [All actions](README.md).

Run the nested steps once per item. Inside, refer to the item as ${{ item.field }}.

| `with:` | Takes |
| --- | --- |
| `items` | A ${{ }} that evaluates to an array, typically steps.<lookup>.outputs.value. |
| `batch` | How many items run at once. Omit for the Fabric default. |
| `sequential` | true to run one at a time. Default false. |

Nested `steps:` are required.
Takes no `timeout:` or `retry:`.

## Example

```yaml
- id: each_table
  uses: fabric/for-each
  with:
    items: ${{ steps.list_tables.outputs.value }}
    batch: 4
  steps:
    - id: load_table
      uses: fabric/copy
      with:
        source:
          postgres:
            connection: ${{ env.ESG_POSTGRES }}
            table:
              schema: cw_titan
              table: ${{ item.table_name }}
        sink:
          table: silver_table
```

with, elsewhere in the file:

```yaml
env:
  ESG_POSTGRES: 7c5329e4-58a9-4317-9d4d-63460450abe9
datasets:
  silver_table:
    table:
      lakehouse: slv_lakehouse
      schema: ESG
      table: ${{ item.table_name }}
```

## Compiles to

```json
{
  "type": "ForEach",
  "typeProperties": {
    "batchCount": 4,
    "items": {
      "value": "@activity('list_tables').output.value",
      "type": "Expression"
    },
    "activities": [
      {
        "type": "Copy",
        "typeProperties": {
          "source": {
            "type": "PostgreSqlSource",
            "queryTimeout": "02:00:00",
            "datasetSettings": {
              "type": "PostgreSqlTable",
              "typeProperties": {
                "table": {
                  "value": "@item().table_name",
                  "type": "Expression"
                },
                "schema": "cw_titan"
              },
              "schema": [],
              "externalReferences": {
                "connection": "7c5329e4-58a9-4317-9d4d-63460450abe9"
              },
              "annotations": []
            }
          },
          "sink": {
            "type": "LakehouseTableSink",
            "tableActionOption": "OverwriteSchema",
            "partitionOption": "None",
            "datasetSettings": {
              "type": "LakehouseTable",
              "typeProperties": {
                "schema": "ESG",
                "table": {
                  "value": "@item().table_name",
                  "type": "Expression"
                }
              },
              "schema": [],
              "linkedService": {
                "name": "slv_lakehouse",
                "properties": {
                  "type": "Lakehouse",
                  "typeProperties": {
                    "artifactId": "{{ .slv_lakehouse_id }}",
                    "workspaceId": "{{ .workspace_id }}",
                    "rootFolder": "Tables"
                  },
                  "annotations": []
                }
              },
              "annotations": []
            }
          },
          "enableStaging": false
        },
        "policy": {
          "timeout": "0.12:00:00",
          "retry": 0,
          "retryIntervalInSeconds": 30,
          "secureInput": false,
          "secureOutput": false
        },
        "name": "load_table",
        "dependsOn": []
      }
    ]
  },
  "name": "each_table",
  "dependsOn": []
}
```
