# Pre-built actions

GENERATED from `registry.ts` by `npx nx run fabric-builder:docs`; do not edit.

Every `uses:` names an action. These are the ones built in, as `fabric/<name>`.
Each has its own page with inputs, an example, and what the example compiles to.

Every step also takes `id`, `needs`, `labels` (userProperties for monitoring), and, where noted, `timeout` / `retry` and nested `steps`.
A step with `if:` takes no `uses:`; it is a group of nested steps.

| Action | Purpose |
| --- | --- |
| [`fabric/set-variable`](setVariable.md) | Set a pipeline variable declared under vars: |
| [`fabric/get-metadata`](getMetadata.md) | Read metadata about a dataset; by default whether a file exists |
| [`fabric/copy`](copy.md) | Copy from a source to a sink |
| [`fabric/notebook`](notebook.md) | Run a notebook in this workspace |
| [`fabric/invoke-pipeline`](invokePipeline.md) | Invoke another pipeline in this workspace |
| [`fabric/script`](script.md) | Run T-SQL inside a warehouse |
| [`fabric/for-each`](forEach.md) | Run the nested steps once per item |
| [`fabric/wait`](wait.md) | Pause |
| [`fabric/fail`](fail.md) | Fail the run with a message and an error code |
| [`fabric/raw`](raw.md) | An activity given as its Fabric JSON, for anything the other actions do not cover |
