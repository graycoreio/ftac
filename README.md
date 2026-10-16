<h1 align="center">FTAC - Fabric pipelines, written like GitHub Actions.</h1>

<p align="center">
  <em>FTAC builds <a href="https://learn.microsoft.com/en-us/fabric/data-factory/">Microsoft Fabric</a> pipeline definitions from source files that are pleasant to edit:
  <br>a <code>*-pipeline.yaml</code> in GitHub Actions vocabulary, or a typed <code>build.ts</code>, instead of a hand-maintained <code>pipeline-content.json</code>.</em>
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

A Fabric pipeline is a few hundred lines of nested JSON with SQL and ADF expressions buried inside string literals. Reviewing a change means diffing that JSON. FTAC keeps the JSON as the contract Fabric and Terraform consume, but generates it from sources you can actually read: SQL stays SQL, expressions are `${{ }}` with `inputs`, `vars` and `steps.x.outputs`, and the activity graph is a list of steps with `needs`. A lint catches the mistakes the portal only reports at run time, and a `check` target fails CI when a committed JSON drifts from its source.

## Quickstart

```bash
npm ci
npx nx run examples:build    # write every pipeline JSON under examples/
npx nx run examples:check    # exit 1 if any committed JSON is stale
```

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

Drop a `*-pipeline.yaml` (or a `build.ts`) anywhere under a project that uses the `./lib/fabric-builder:build` executor and the next `build` picks it up.

## Documentation

- [The `fabric-builder` library](./lib/fabric-builder/README.md): the YAML format, the TypeScript API, what the lint catches, and the conventions the generated JSON follows.
- [Built-in actions](./lib/fabric-builder/yaml/actions/README.md): every `fabric/<name>` you can put in `uses:`, with an example and its compiled output.
- [Editor schema](./lib/fabric-builder/yaml/pipeline.schema.json): point `yaml-language-server` at it for validation and completion.
- [Developer documentation](./docs/developer/README.md): the Nx workspace, how to build, test, and regenerate the committed output.
- [Contributing](./CONTRIBUTING.md): submission guidelines, coding rules, and the commit message format.

**Think FTAC is the bees-knees? Give our repo a star :star: :heart:.**
