# fabric/copy

GENERATED from the registry by `npx nx run fabric-builder:docs`; do not edit. [All actions](README.md).

Copy from a source to a sink. Read the row count as steps.<id>.outputs.rowsCopied.

| `with:` | Takes |
| --- | --- |
| `source` | One of: postgres { connection, query | table { schema, table }, timeout }, table <dataset>, or raw <source JSON>. A query may embed ${{ sql(expr) }}. |
| `sink` | One of: csv <dataset> (plus quote-all, default true), table <dataset> (plus action: OverwriteSchema | Overwrite | Append), or raw <sink JSON>. |
| `translator` | "tabular" for the portal default type-conversion translator. Omitted by default. |
| `staging` | Enable staging. Default false. |

Takes no nested `steps:`.
`timeout:` (HH:MM:SS or D.HH:MM:SS) and `retry: { count, interval }` apply; the default is the portal policy.

## Example

```yaml
- id: load
  uses: fabric/copy
  timeout: 01:00:00
  retry: { count: 1, interval: 300 }
  with:
    source:
      postgres:
        connection: ${{ env.ESG_POSTGRES }}
        query: |-
          SELECT * FROM t WHERE d <= ${{ sql(vars.date) }}::date
    sink:
      csv: out_file
```

with, elsewhere in the file:

```yaml
env:
  ESG_POSTGRES: 7c5329e4-58a9-4317-9d4d-63460450abe9
datasets:
  out_file:
    csv:
      lakehouse: brz_lakehouse
      folder: ESG/Finance
      file: out.csv
```

## Compiles to

```json
{
  "type": "Copy",
  "typeProperties": {
    "source": {
      "type": "PostgreSqlSource",
      "query": {
        "value": "SELECT * FROM t WHERE d <= '@{replace(variables('date'), '''', '''''')}'::date",
        "type": "Expression"
      },
      "queryTimeout": "00:30:00",
      "datasetSettings": {
        "type": "PostgreSqlTable",
        "typeProperties": {},
        "schema": [],
        "externalReferences": {
          "connection": "7c5329e4-58a9-4317-9d4d-63460450abe9"
        },
        "annotations": []
      }
    },
    "sink": {
      "type": "DelimitedTextSink",
      "storeSettings": {
        "type": "LakehouseWriteSettings",
        "copyBehavior": "FlattenHierarchy"
      },
      "formatSettings": {
        "type": "DelimitedTextWriteSettings",
        "fileExtension": ".csv",
        "quoteAllText": true
      },
      "datasetSettings": {
        "type": "DelimitedText",
        "typeProperties": {
          "location": {
            "type": "LakehouseLocation",
            "folderPath": "ESG/Finance",
            "fileName": "out.csv"
          },
          "columnDelimiter": ",",
          "escapeChar": "\"",
          "firstRowAsHeader": true,
          "quoteChar": "\""
        },
        "schema": [],
        "linkedService": {
          "name": "brz_lakehouse",
          "properties": {
            "type": "Lakehouse",
            "typeProperties": {
              "artifactId": "{{ .brz_lakehouse_id }}",
              "workspaceId": "{{ .workspace_id }}",
              "rootFolder": "Files"
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
    "timeout": "0.01:00:00",
    "retry": 1,
    "retryIntervalInSeconds": 300,
    "secureInput": false,
    "secureOutput": false
  },
  "name": "load",
  "dependsOn": []
}
```
