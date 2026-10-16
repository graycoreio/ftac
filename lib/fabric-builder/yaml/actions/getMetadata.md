# fabric/get-metadata

GENERATED from the registry by `npx nx run fabric-builder:docs`; do not edit. [All actions](README.md).

Read metadata about a dataset; by default whether a file exists. Read it as steps.<id>.outputs.exists.

| `with:` | Takes |
| --- | --- |
| `dataset` | A name from datasets:. |
| `fields` | Metadata fields to read. Default [exists]. |

Takes no nested `steps:`.
`timeout:` (HH:MM:SS or D.HH:MM:SS) and `retry: { count, interval }` apply; the default is the portal policy.

## Example

```yaml
- id: check_file
  uses: fabric/get-metadata
  with:
    dataset: lookup_file
    fields: [exists]
```

with, elsewhere in the file:

```yaml
datasets:
  lookup_file:
    csv:
      lakehouse: brz_lakehouse
      folder: ESG/Finance
      file: Account_Postal.csv
```

## Compiles to

```json
{
  "type": "GetMetadata",
  "typeProperties": {
    "fieldList": [
      "exists"
    ],
    "datasetSettings": {
      "type": "DelimitedText",
      "typeProperties": {
        "location": {
          "type": "LakehouseLocation",
          "folderPath": "ESG/Finance",
          "fileName": "Account_Postal.csv"
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
    },
    "storeSettings": {
      "type": "LakehouseReadSettings",
      "recursive": true,
      "enablePartitionDiscovery": false
    },
    "formatSettings": {
      "type": "DelimitedTextReadSettings"
    }
  },
  "policy": {
    "timeout": "0.12:00:00",
    "retry": 0,
    "retryIntervalInSeconds": 30,
    "secureInput": false,
    "secureOutput": false
  },
  "name": "check_file",
  "dependsOn": []
}
```
