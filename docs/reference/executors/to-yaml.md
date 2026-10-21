---
description: "The @graycore/ftac:to-yaml executor: turn existing pipeline JSON into *-pipeline.yaml that builds the same JSON."
---

# to-yaml

Write a `*-pipeline.yaml` next to each pipeline JSON matching `pattern`, checked to compile back to the same JSON.

Use it once per pipeline, to bring a pipeline that was built in the Fabric portal or written by hand under FTAC. For each JSON file it finds, the executor writes `<name>-pipeline.yaml` beside it, with `output:` pointing back at the JSON. From then on, the YAML is the source and the [`build`](build.md) executor writes the JSON.

Before writing, the executor compiles the YAML it generated and compares the result with the original JSON. A file is written only when the two are the same pipeline, so the YAML never changes what the pipeline does. Key order is ignored, so the first build afterwards may reorder keys in the JSON.

## What the YAML contains

- `parameters` become `inputs:`, and `variables` become `vars:`.
- Each activity becomes a step whose `id` is the activity name, and whose `dependsOn` becomes `needs:`.
- An activity a built-in action produces is read back as that action, with its expressions written as `${{ }}` and its `timeout:`, `retry:` and `labels:` read from its policy and user properties. That covers every built-in action except `fabric/raw`, plus `if:` groups (an IfCondition with no else branch). Activities nested in a for-each or an `if:` group are read back the same way.
- The lakehouse CSV files and tables that `fabric/copy` and `fabric/get-metadata` steps use are collected under `datasets:`, named after the file or table, and a dataset used by several steps gets one entry.
- A Terraform token such as `{{ .nb_clean_orders_id }}` is read back as the name it was made from, `nb_clean_orders`. A definition exported from Fabric after deployment has the item's real GUID there instead, and nothing in the file says which name it stands for, so that activity can't be read back.

Any other activity, nested ones included, fails the file, and nothing is written for it. So does an activity whose JSON differs in any way from what the action would write, for example a Fail whose message is plain text rather than an expression, or a Copy whose source is not a Postgres query or table or a lakehouse table, or whose sink is not a lakehouse CSV or table. The failure names the activity and says why: the action that recognised it and where its JSON differs, or why the action can't read it (an else branch, a GUID where a token belongs, a Copy source or sink no store reads), or that no built-in action reads that activity type. To convert such a pipeline, write those steps by hand, as [`fabric/raw`](../actions/raw.md) or with a `raw:` Copy source or sink if nothing else fits, then run `check` to confirm the JSON is unchanged.

The executor prints a warning under each file for each pipeline property YAML has no key for (such as `description` or `annotations`). Those properties are dropped.

Short maps and lists of plain values are written on one line, such as `retry: { count: 1, interval: 300 }`.

## Options

### `pattern`

`string`, required.

Glob for pipeline JSON files, relative to the project root. There is no default, because a project usually has other JSON files, such as `project.json`.

### `force`

`boolean`, default `false`.

Overwrite a `*-pipeline.yaml` that already exists. Without it, a file whose YAML already exists is reported as failed and left alone.

## Example

```json
{
  "name": "pipelines",
  "targets": {
    "to-yaml": {
      "executor": "@graycore/ftac:to-yaml",
      "options": { "pattern": "**/*.DataPipeline/pipeline-content.json" }
    }
  }
}
```

```bash
npx nx run pipelines:to-yaml                               # write each YAML
npx nx run pipelines:to-yaml --pattern 'legacy/orders.json' # one pipeline
```

## Output

```
ok   pipelines/orders.json: wrote pipelines/orders-pipeline.yaml
FAIL pipelines/reports.json: run_report: cannot be written as YAML: fabric/notebook: notebookId is "5a0b77c2-…", not a {{ .<name>_id }} token
1/2 pipelines converted to YAML
```

A file that is not a pipeline, whose YAML already exists, that has an activity no action reads back, or that does not compile back to the same pipeline is listed as `FAIL` with the reason, and nothing is written for it. The compiler rejects some pipelines the portal accepts, for example one that declares a variable but never sets it. Those fail with the compiler's message.
