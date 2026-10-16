---
description: "What FTAC is: a compiler that turns a GitHub Actions-style YAML pipeline into the pipeline-content.json a Microsoft Fabric data pipeline expects."
---

# What is FTAC?

FTAC, the Fabric Terraform Actions Compiler, turns a `*-pipeline.yaml` written in [GitHub Actions](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax) vocabulary into the `pipeline-content.json` that the [`microsoft/fabric` Terraform provider](https://registry.terraform.io/providers/microsoft/fabric/latest/docs/resources/data_pipeline) expects for a [Microsoft Fabric](https://learn.microsoft.com/en-us/fabric/data-factory/) data pipeline.

## Why

A Fabric pipeline is a few hundred lines of nested JSON with SQL and ADF expressions buried inside string literals. Reviewing a change in Git means diffing that JSON.

FTAC generates that JSON from sources you can actually read:

- SQL stays SQL.
- Expressions are `${{ }}` with `inputs`, `vars`, `env` and `steps.x.outputs`.
- The activity graph is a list of steps with `needs`.

The generated JSON is committed next to its source. A `check` target verifies it is in sync, so CI fails when someone edits the JSON by hand or forgets to rebuild.

## What a pipeline looks like

```yaml
name: Hello_Pipeline
output: hello.json
inputs:
  date: { type: string, default: '' }
vars:
  date: String
env:
  POSTGRES: 00000000-0000-0000-0000-000000000000
datasets:
  out:
    csv: { lakehouse: brz_lakehouse, folder: Hello, file: hello.csv }
steps:
  - id: set_date
    uses: fabric/set-variable
    with: { name: date, value: "${{ if(empty(inputs.date), formatDateTime(utcNow(), 'yyyy-MM-dd'), inputs.date) }}" }
  - id: load
    needs: set_date
    uses: fabric/copy
    with:
      source:
        postgres:
          connection: ${{ env.POSTGRES }}
          query: SELECT 1 AS one WHERE ${{ sql(vars.date) }}::date <= CURRENT_DATE
      sink:
        csv: out
```

Each `uses:` names a [built-in action](/reference/actions/). Each action page shows its inputs, an example, and the Fabric JSON the example compiles to.

## Two ways to author

The YAML format is the one this guide covers. A pipeline can also be authored as a typed `build.ts` that calls the same library directly; see [The TypeScript API](/guide/typescript). Both produce the same JSON, and the Nx executor picks up either.
