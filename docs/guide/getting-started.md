---
description: "Install @graycore/ftac from npm, write a first *-pipeline.yaml and compile it to Fabric pipeline JSON with the Nx executor."
---

# Getting started

FTAC is published to npm as [`@graycore/ftac`](https://www.npmjs.com/package/@graycore/ftac). It is a library and an [Nx](https://nx.dev) plugin: the plugin's `build` executor finds every `*-pipeline.yaml` under a project and writes the JSON it names.

## Prerequisites

- [Node](https://nodejs.org) 24 or later.
- An [Nx](https://nx.dev) workspace. Any repository with an `nx.json` and `nx` installed will do.

## Install

```bash
npm install --save-dev @graycore/ftac nx
```

## Wire up a project

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

`build` finds every `*-pipeline.yaml` (and every `build.ts`) under the project root and writes the JSON named by its `output:`. `check` verifies the committed JSON is in sync instead of writing it, so CI fails when someone edits the JSON by hand or forgets to rebuild.

## Write your first pipeline

1. Put a `<name>-pipeline.yaml` in a directory under the project. Copy the [hello pipeline](https://github.com/graycoreio/ftac/blob/main/examples/hello/hello-pipeline.yaml) to start.
2. Set `output:` to where the JSON should go, relative to the YAML file.
3. Build it:

   ```bash
   npx nx run pipelines:build
   ```

   Or one pipeline by pattern, relative to the project root:

   ```bash
   npx nx run pipelines:build --pattern '**/<name>/*-pipeline.yaml'
   ```

4. Review the JSON diff, then commit the YAML and the JSON together.

[Pipeline syntax](/reference/pipeline-syntax) covers every key the file takes, and [Expressions](/reference/expressions) what goes inside `${{ }}`.

## Editor validation

The package ships a JSON Schema for the YAML format at `node_modules/@graycore/ftac/yaml/pipeline.schema.json`. Point your editor's YAML language server at it for completion and validation; with the [VS Code YAML extension](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml) a comment on the first line is enough:

```yaml
# yaml-language-server: $schema=../../node_modules/@graycore/ftac/yaml/pipeline.schema.json
name: My_Pipeline
```

The same schema is on GitHub at [`lib/ftac/yaml/pipeline.schema.json`](https://github.com/graycoreio/ftac/blob/main/lib/ftac/yaml/pipeline.schema.json).

## Without Nx

The executor is a thin layer over two exported functions. A script can compile one YAML file directly:

```ts
import { loadYamlBuild, run } from '@graycore/ftac';

process.exit(run(loadYamlBuild('hello-pipeline.yaml')));
```

`run()` writes the JSON, or with `--check` on the command line exits 1 when the committed JSON is stale.

## Working from a clone

To run FTAC from its source instead, clone the repository and follow the [developer documentation](https://github.com/graycoreio/ftac/blob/main/docs/developer/README.md). The `examples` project there is the reference wiring.
