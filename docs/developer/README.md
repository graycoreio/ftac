# Developer Documentation

## Contributing
Please read the [contributing guidelines here](../../CONTRIBUTING.md).

## Building the Project
### Prerequisites
* [Node](https://nodejs.org) 24 or later. It runs the `.ts` files directly, so there is no compile step.
* [Git](https://git-scm.com/)

## Creating Your Own Fork
[Fork the FTAC Repository](https://github.com/graycoreio/ftac/fork)

## Clone your repository
```bash
git clone git@github.com:{username}/ftac.git && cd ftac
git checkout -b new-branch
```

### Installing Dependencies
```bash
npm ci
```
> Don't run `npm install` as that will modify the `package-lock.json` file.

## The Workspace

This is an [Nx](https://nx.dev) workspace with three projects.

| Project          | Path                  | What it holds                                                                 |
| ---------------- | --------------------- | ----------------------------------------------------------------------------- |
| `ftac` | `lib/ftac`  | The library and the local Nx plugin that provides the `build` executor       |
| `examples`       | `examples`            | Reference pipelines, checked by the executor specs and by CI                  |
| `docs`           | `docs`                | The user documentation site, built with [VitePress](https://vitepress.dev)   |

`lib/ftac` is also a local Nx plugin: its `package.json` points at
`executors.json`, which registers the `build` executor. Any project can use
it as `./lib/ftac:build`; it finds every `*-pipeline.yaml` under the
project root and writes, or with `check: true` verifies, their JSON. The `examples` project's `build` and `check` targets
are the reference wiring.

### Full Build
Write every pipeline JSON under every project:

```bash
npx nx run-many -t build
```

### Partial Build
Build a single project, or a single pipeline by pattern:

```bash
npx nx run examples:build
npx nx run examples:build --pattern '**/hello/*-pipeline.yaml'
```

## Running unit tests

### Full Test Suite
The specs need no Fabric workspace and no database:

```bash
npx nx run-many -t test
```

### Partial Test Suite
Run one project's suite, or a single spec file through vitest directly:

```bash
npx nx run ftac:test
npx vitest run --config lib/ftac/vitest.config.ts lib/ftac/yaml/compileStep.test.ts
```

## Typecheck
```bash
npx nx run-many -t typecheck
```

## Generated files
The JSON of every example pipeline is generated and committed, and CI fails when it is stale. Regenerate with `npx nx run-many -t build`; verify with `npx nx run-many -t check`.

## The documentation site

The site under `docs/` is a [VitePress](https://vitepress.dev) site and an Nx project. This developer page is excluded from it; the site is for people writing pipelines.

```bash
npx nx run docs:dev       # serve with hot reload
npx nx run docs:build     # write docs/.vitepress/dist, failing on dead links
npx nx run docs:preview   # serve the built site
```

The actions reference is not written by hand. `docs:actions`, which `dev` and `build` depend on, renders a page per action from the registry into `docs/reference/actions/`, which is gitignored. Change an action's description, inputs, or example in its module under `lib/ftac/yaml/actions/` and the site follows. CI builds the site, so an example that no longer compiles fails the build.

## Publishing to npm

The library is published as [`@graycore/ftac`](https://www.npmjs.com/package/@graycore/ftac) from `dist/ftac`, which `npx nx run ftac:build` writes: `tsc` emits JavaScript and declarations with the `.ts` import extensions rewritten, and `pack.ts` adds the manifest, the executor registry, the schemas, the README, and the license.

The version in `lib/ftac/package.json` is `0.0.0-PLACEHOLDER`, as is the version of each dependency. Merging the release-please PR tags `v<version>`; the tag runs the build again, and the publish workflow then sets the placeholders from the root `package.json` and publishes. A version with a prerelease suffix goes to the `next` dist-tag, otherwise `latest`. Publishing uses npm trusted publishing, so there is no token to rotate.

## Reference
* [The `ftac` library](../../lib/ftac/README.md): the YAML format, the TypeScript API, the lint, and the output conventions
* [The actions registry](../../lib/ftac/yaml/actions/registry.ts): one module per built-in action
* [Editor schema](../../lib/ftac/yaml/pipeline.schema.json)
* [The hello example](../../examples/hello/hello-pipeline.yaml)
