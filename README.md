<p align="center">
  <a href="https://github.com/graycoreio/ftac">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="docs/public/wordmark-dark.svg">
      <img src="docs/public/wordmark-light.svg" alt="FTAC" width="300">
    </picture>
  </a>
</p>
<h1 align="center">Fabric pipelines, written like GitHub Actions.</h1>
<h2 align="center">Fabric Terraform Actions Compiler</h2>

<p align="center">
  <em>FTAC compiles <a href="https://learn.microsoft.com/en-us/fabric/data-factory/">Microsoft Fabric</a> pipeline definitions from YAML written in a <a href="https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax">GitHub Actions</a>-style syntax.
  <br>You edit a <code>*-pipeline.yaml</code> and FTAC generates the <code>pipeline-content.json</code>, no more editing and code-reviewing json.</em>
  <br>
</p>

<p align="center">
    <a href="https://github.com/graycoreio/ftac/actions/workflows/build.yml">
      <img src="https://github.com/graycoreio/ftac/actions/workflows/build.yml/badge.svg" alt="Build Status">
    </a>
    <a href="https://www.npmjs.com/package/@graycore/ftac">
      <img src="https://img.shields.io/npm/v/@graycore/ftac.svg" alt="npm version">
    </a>
    <a href="https://www.github.com/graycoreio/ftac">
      <img src="https://img.shields.io/static/v1.svg?label=stability&message=prerelease&color=3eff85" alt="Pre-release">
    </a>
</p>

## Why FTAC?

A typical Fabric pipeline is a few hundred lines of nested JSON with SQL and ADF expressions buried inside string literals. Reviewing a change in Git means diffing that JSON and manually editing and reviewing potentially long-form SQL queries. FTAC is designed to generate the `pipeline-json` that the `microsoft/fabric` terraform provider expects, but generates it from sources you can actually read: 

- SQL stays SQL
- expressions are `${{ }}` with `inputs`, `vars` and `steps.x.outputs`
- The activity graph is a list of steps with `needs`. 

## Install

```bash
npm install --save-dev @graycore/ftac
```

FTAC is published as [`@graycore/ftac`](https://www.npmjs.com/package/@graycore/ftac).

See [Getting started](https://graycoreio.github.io/ftac/guide/getting-started) for the project wiring.

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

- [Getting Started Guide](https://graycoreio.github.io/ftac/guide/getting-started)
- Reference Guides
  - [Pipeline syntax](https://graycoreio.github.io/ftac/reference/pipeline-syntax) 
  - [Expressions](https://graycoreio.github.io/ftac/reference/expressions).
  - [Built-in actions](https://graycoreio.github.io/ftac/reference/actions/): 
- [Developer documentation](./docs/developer/README.md)
- [Contributing](./CONTRIBUTING.md)

## License

FTAC is released under the [MIT License](./LICENSE).

**Think FTAC is the bees-knees? Give our repo a star :star: :heart:.**
