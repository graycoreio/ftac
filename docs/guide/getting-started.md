---
description: "Clone the repository, write a first *-pipeline.yaml and compile it to Fabric pipeline JSON with the Nx executor."
---

# Getting started

FTAC is not yet published to npm. It runs from a clone of the repository, which is an [Nx](https://nx.dev) workspace.

## Prerequisites

- [Node](https://nodejs.org) 24 or later. It runs the `.ts` files directly, so there is no compile step.
- [Git](https://git-scm.com/)

## Install

```bash
git clone git@github.com:graycoreio/ftac.git && cd ftac
npm ci
```

## Build the examples

The `examples` project holds the reference pipelines. Build every pipeline under it:

```bash
npx nx run examples:build
```

This finds every `*-pipeline.yaml` (and every `build.ts`) under `examples/` and writes the JSON named by its `output:`. For the [hello pipeline](https://github.com/graycoreio/ftac/blob/main/examples/hello/hello-pipeline.yaml) that is `examples/hello/hello.json`.

Verify the committed JSON is in sync instead of writing it:

```bash
npx nx run examples:check
```

## Write your first pipeline

1. Create a directory under `examples/` and put a `<name>-pipeline.yaml` in it. Copy the hello pipeline to start.
2. Set `output:` to where the JSON should go, relative to the YAML file.
3. Build it on its own by pattern:

   ```bash
   npx nx run examples:build --pattern '**/<name>/*-pipeline.yaml'
   ```

4. Review the JSON diff, then commit the YAML and the JSON together.

[Pipeline syntax](/reference/pipeline-syntax) covers every key the file takes, and [Expressions](/reference/expressions) what goes inside `${{ }}`.

## Editor validation

A JSON Schema for the YAML format lives at [`lib/ftac/yaml/pipeline.schema.json`](https://github.com/graycoreio/ftac/blob/main/lib/ftac/yaml/pipeline.schema.json). Point your editor's YAML language server at it for completion and validation.

## Use it from another project

Any Nx project can use the executor as `./lib/ftac:build`. The `examples` project's `build` and `check` targets are the reference wiring:

```json
{
  "targets": {
    "build": {
      "executor": "./lib/ftac:build",
      "options": {}
    },
    "check": {
      "executor": "./lib/ftac:build",
      "options": { "check": true }
    }
  }
}
```
