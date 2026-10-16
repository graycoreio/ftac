---
description: "The Nx executors @graycore/ftac provides, and how to wire one into a project."
---

# Executors

`@graycore/ftac` is an [Nx](https://nx.dev) plugin as well as a library. Once it is installed, every project in the workspace can run its executors by name, with no script of your own:

```bash
npm install --save-dev @graycore/ftac nx
```

An executor is wired into a project as a target in its `project.json`. The target's `executor` names the plugin and the executor, `@graycore/ftac:<name>`, and `options` are the executor's inputs:

```json
{
  "targets": {
    "build": {
      "executor": "@graycore/ftac:build",
      "options": {}
    }
  }
}
```

```bash
npx nx run <project>:<target>
```

Any option can also be set on the command line as `--<option>`, which overrides the value in `project.json`. `npx nx list @graycore/ftac` prints the executors and their options.

- [`build`](build.md): Run every `build.ts` and `*-pipeline.yaml` under the project: write the pipeline JSON, or with `check: true` verify the checked-in JSON is current.
