---
description: "The @graycore/ftac:build executor: compile every *-pipeline.yaml under a project, or verify the committed JSON is current."
---

# build

Compile every `*-pipeline.yaml` under the project: write the pipeline JSON, or with `check: true` verify the checked-in JSON is current.

The executor finds every pipeline file under the project root, compiles each one, and either writes the JSON its `output:` names, or compares the committed JSON against what the build produces now. It prints one line per file and a summary, and fails when any file fails. Files under `node_modules` are skipped.

## Options

### `check`

`boolean`, default `false`.

Verify each checked-in JSON matches its build instead of writing it. A build whose JSON is missing or differs from the current output is reported as stale, and the target fails. Nothing is written.

### `pattern`

`string`, default `**/*-pipeline.yaml`.

Glob for pipeline files, relative to the project root. Use it to build one pipeline, or one directory, at a time.

## Example

The usual wiring is one target that writes and one that checks:

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
npx nx run pipelines:build                                        # write every pipeline JSON
npx nx run pipelines:check                                        # exit 1 if any committed JSON is stale
npx nx run pipelines:build --pattern '**/hello/*-pipeline.yaml'   # one pipeline
```

Run `check` in CI so a hand-edited JSON, or a forgotten rebuild, fails the build.

## Output

```
ok   pipelines/hello/hello-pipeline.yaml: wrote /work/pipelines/hello/hello.json
1/1 builds written
```

With `check: true`:

```
FAIL pipelines/hello/hello-pipeline.yaml: pipelines/hello/hello.json is stale — run the build
0/1 builds in sync
```

A pipeline that fails to compile is listed the same way with its error message.
