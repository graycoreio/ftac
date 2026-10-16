<h1 align="center">FTAC - Fabric pipelines, written like GitHub Actions.</h1>
<h2 align="center">Fabric Terraform Actions Compiler</h2>

<p align="center">
  <em>FTAC compiles <a href="https://learn.microsoft.com/en-us/fabric/data-factory/">Microsoft Fabric</a> pipeline definitions from YAML written in a <a href="https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax">GitHub Actions</a>-style syntax.
  <br>You edit a <code>*-pipeline.yaml</code>. FTAC generates the <code>pipeline-content.json</code> so you never have to.</em>
  <br>
</p>

<p align="center">
    <a href="https://github.com/graycoreio/ftac/actions/workflows/build.yml">
      <img src="https://github.com/graycoreio/ftac/actions/workflows/build.yml/badge.svg" alt="Build Status">
    </a>
    <a href="https://www.github.com/graycoreio/ftac">
      <img src="https://img.shields.io/static/v1.svg?label=stability&message=prerelease&color=3eff85" alt="Pre-release">
    </a>
</p>

## Why FTAC?

A Fabric pipeline is a few hundred lines of nested JSON with SQL and ADF expressions buried inside string literals. Reviewing a change in Git means diffing that JSON. FTAC is designed to generate the `pipeline-json` that the `microsoft/fabric` terraform provider expects, but generates it from sources you can actually read: 

- SQL stays SQL
- expressions are `${{ }}` with `inputs`, `vars` and `steps.x.outputs`
- The activity graph is a list of steps with `needs`. 

## Quickstart

The smallest pipeline that exercises the compiler end to end lives in [`examples/hello`](./examples/hello/hello-pipeline.yaml):

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

## Documentation

- [Guide](./docs/guide/index.md): what FTAC is, getting started, and the TypeScript API.
- Reference: [pipeline syntax](./docs/reference/pipeline-syntax.md) and [expressions](./docs/reference/expressions.md).
- Built-in actions: every `fabric/<name>` action, its inputs, and what it compiles to. Generated from the registry onto the docs site; run `npm run docs:dev` to browse it.
- [Developer documentation](./docs/developer/README.md): the Nx workspace, how to build, test, and regenerate the committed output.
- [Contributing](./CONTRIBUTING.md): submission guidelines, coding rules, and the commit message format.

**Think FTAC is the bees-knees? Give our repo a star :star: :heart:.**
