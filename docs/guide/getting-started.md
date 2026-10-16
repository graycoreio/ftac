---
description: "Install @graycore/ftac from npm, write a first *-pipeline.yaml and compile it to Fabric pipeline JSON from an npm script or with the Nx plugin."
---

# Getting started

FTAC is published to npm as [`@graycore/ftac`](https://www.npmjs.com/package/@graycore/ftac). It compiles a `*-pipeline.yaml` into the JSON a Fabric data pipeline expects, and it does so at build time: the JSON is generated, committed next to its source, and checked in CI.

There are two ways to run it. A plain npm script works in any repository. If your repository is an [Nx](https://nx.dev) workspace, the package is also an Nx plugin with a ready-made executor.

## Prerequisites

- [Node](https://nodejs.org) 22.18 or later.

## Install

```bash
npm install --save-dev @graycore/ftac
```

## Write your first pipeline

1. Put a `<name>-pipeline.yaml` beside the sources it belongs to. Copy the [hello pipeline](https://github.com/graycoreio/ftac/blob/main/examples/hello/hello-pipeline.yaml) to start.
2. Set `output:` to where the JSON should go, relative to the YAML file.
3. Compile it with one of the two setups below.
4. Review the JSON diff, then commit the YAML and the JSON together.

[Pipeline syntax](/reference/pipeline-syntax) covers every key the file takes, and [Expressions](/reference/expressions) what goes inside `${{ }}`.

## Compile from an npm script

The library exports `loadYamlBuild()`, which turns a YAML file into a build, and `run()`, which writes the build's JSON or, with `--check`, exits 1 when the committed JSON is stale. A short script compiles every pipeline in the repository:

```ts
// scripts/pipelines.ts
import { globSync } from 'node:fs';
import { loadYamlBuild, run } from '@graycore/ftac';

let code = 0;
for (const file of globSync('**/*-pipeline.yaml', { exclude: (p: string) => p.includes('node_modules') })) {
    code = run(loadYamlBuild(file)) || code;
}
process.exit(code);
```

Wire it into `package.json`:

```json
{
  "scripts": {
    "pipelines": "node scripts/pipelines.ts",
    "pipelines:check": "node scripts/pipelines.ts --check"
  }
}
```

```bash
npm run pipelines          # write every pipeline JSON
npm run pipelines:check    # exit 1 if any committed JSON is stale
```

Run the check in CI so a hand-edited JSON, or a forgotten rebuild, fails the build.

## Compile with Nx

Nx is supported out of the box: `@graycore/ftac` is an Nx plugin, and its `build` executor finds every `*-pipeline.yaml` under a project and writes, or verifies, the JSON each names. No script is needed.

```bash
npm install --save-dev nx
```

Add `build` and `check` targets to the project that holds your pipelines:

```json
{
  "name": "pipelines",
  "targets": {
    "build": {
      "executor": "@graycore/ftac:build",
      "options": {}
    },
    "check": {
      "executor": "@graycore/ftac:build",
      "options": { "check": true }
    }
  }
}
```

```bash
npx nx run pipelines:build    # write every pipeline JSON under the project
npx nx run pipelines:check    # exit 1 if any committed JSON is stale
```

One pipeline at a time, by a glob relative to the project root:

```bash
npx nx run pipelines:build --pattern '**/<name>/*-pipeline.yaml'
```

The [executors reference](/reference/executors/build) lists every option.

## Editor validation

The package ships a JSON Schema for the YAML format at `node_modules/@graycore/ftac/yaml/pipeline.schema.json`. Point your editor's YAML language server at it for completion and validation; with the [VS Code YAML extension](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml) a comment on the first line is enough:

```yaml
# yaml-language-server: $schema=../../node_modules/@graycore/ftac/yaml/pipeline.schema.json
name: My_Pipeline
```

The same schema is on GitHub at [`lib/ftac/yaml/pipeline.schema.json`](https://github.com/graycoreio/ftac/blob/main/lib/ftac/yaml/pipeline.schema.json).
