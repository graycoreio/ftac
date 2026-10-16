# fabric/invoke-pipeline

GENERATED from the registry by `npx nx run fabric-builder:docs`; do not edit. [All actions](README.md).

Invoke another pipeline in this workspace. Steps with no needs: between them run in parallel.

| `with:` | Takes |
| --- | --- |
| `pipeline` | The token name of the pipeline (pl_x emits {{ .pl_x_id }}), or a ${{ }} that evaluates to its id, such as ${{ item.id }} inside a for-each. |
| `connection` | The Fabric Data Pipelines connection the invoke goes through. |
| `parameters` | Map of the child pipeline's parameter names to values; a value is text or ${{ }}. Omitted parameters take the child's defaults. |
| `wait` | Wait for the child to finish, so its failure fails this step. Default true. |

Takes no nested `steps:`.
`timeout:` (HH:MM:SS or D.HH:MM:SS) and `retry: { count, interval }` apply; the default is the portal policy.

## Example

```yaml
- id: run_sovos
  uses: fabric/invoke-pipeline
  timeout: 02:00:00
  with:
    pipeline: pl_sovos_tax_file
    connection: ${{ env.PIPELINES }}
    parameters:
      processing_date_from: ${{ inputs.date_from }}
```

with, elsewhere in the file:

```yaml
env:
  PIPELINES: 936c6e1a-87d0-41b0-bc41-6840aafad6ce
```

## Compiles to

```json
{
  "type": "InvokePipeline",
  "typeProperties": {
    "parameters": {
      "processing_date_from": {
        "value": "@pipeline().parameters.date_from",
        "type": "Expression"
      }
    },
    "waitOnCompletion": true,
    "workspaceId": "{{ .workspace_id }}",
    "pipelineId": "{{ .pl_sovos_tax_file_id }}",
    "operationType": "InvokeFabricPipeline"
  },
  "externalReferences": {
    "connection": "936c6e1a-87d0-41b0-bc41-6840aafad6ce"
  },
  "policy": {
    "timeout": "0.02:00:00",
    "retry": 0,
    "retryIntervalInSeconds": 30,
    "secureInput": false,
    "secureOutput": false
  },
  "name": "run_sovos",
  "dependsOn": []
}
```
