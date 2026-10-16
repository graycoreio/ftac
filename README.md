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

## Workspace

This is an [Nx](https://nx.dev) workspace with two projects.

| Project          | Path                  | What it holds                                                                 |
| ---------------- | --------------------- | ----------------------------------------------------------------------------- |
| `fabric-builder` | `lib/fabric-builder`  | The library and the local Nx plugin that provides the `build` executor       |
| `examples`       | `examples`            | Reference pipelines, checked by the executor specs and by CI                  |

```bash
npx nx run-many -t typecheck   # tsc --noEmit
npx nx run-many -t test        # the vitest specs, no Fabric or database needed
npx nx run-many -t check       # every committed pipeline JSON is current
npx nx run fabric-builder:docs # regenerate the built-in actions README
```

Node 24 runs the `.ts` files directly, so there is no compile step.

## Contributing

### Want to Help?

Want to report a bug, contribute some code, or improve the documentation? Excellent! Open an issue or a pull request against `main`. CI runs the typecheck, the specs, and the stale-output check on every pull request.

### Conventions

- One function per file; `index.ts` re-exports everything.
- Every change to a `*-pipeline.yaml`, a `build.ts`, or an action's example commits the regenerated output alongside it. The JSON is the contract.
- The key order of the generated JSON matches what the Fabric portal exports, so a generated pipeline diffs cleanly against a captured one.

**Think FTAC is the bees-knees? Give our repo a star :star: :heart:.**
