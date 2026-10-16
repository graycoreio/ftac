# @graycore/ftac

Fabric Terraform Actions Compiler. FTAC compiles
[Microsoft Fabric](https://learn.microsoft.com/en-us/fabric/data-factory/)
pipeline definitions (`pipeline-content.json`) from YAML written in a
[GitHub Actions](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax)-style
syntax: SQL stays SQL, expressions are `${{ }}`, and the activity graph is
a list of steps with `needs` instead of `dependsOn` objects. The output is
what the [`microsoft/fabric` Terraform provider](https://registry.terraform.io/providers/microsoft/fabric/latest/docs/resources/data_pipeline)
expects for a data pipeline.

Documentation: <https://graycoreio.github.io/ftac/>

## Install

```sh
npm install --save-dev @graycore/ftac
```

FTAC runs at build time: the JSON is generated, committed next to its
source, and checked in CI. From an npm script, `loadYamlBuild()` turns a
`*-pipeline.yaml` into a build and `run()` writes its JSON, or with
`--check` exits 1 when the committed JSON is stale:

```ts
import { loadYamlBuild, run } from '@graycore/ftac';

process.exit(run(loadYamlBuild('hello-pipeline.yaml')));
```

Nx is supported out of the box. The package is an [Nx](https://nx.dev)
plugin whose `build` executor finds every `*-pipeline.yaml` (and every
`build.ts`) under a project and writes, or with `check: true` verifies,
the JSON each names:

```json
{
  "targets": {
    "build": { "executor": "@graycore/ftac:build", "options": {} },
    "check": { "executor": "@graycore/ftac:build", "options": { "check": true } }
  }
}
```

```sh
npx nx run pipelines:build    # write every pipeline JSON
npx nx run pipelines:check    # exit 1 if any committed JSON is stale
```

## A YAML pipeline

A `*-pipeline.yaml` beside the sources describes one pipeline. The
`output:` path is relative to the YAML file. The schema for editor
validation ships in the package at `yaml/pipeline.schema.json`.

```yaml
name: My_Pipeline
output: ../../my_pipeline.json
inputs:
  date: { type: string, default: '' }
vars:
  date: String
env:
  CONN: 00000000-0000-0000-0000-000000000000      # plain text: a macro
  PERIOD: ${{ formatDateTime(vars.date, 'yyyyMM') }}  # expression: spliced as source
datasets:
  out:
    csv: { lakehouse: brz_lakehouse, folder: Sales, file: out.csv }
steps:
  - id: set_date
    uses: fabric/set-variable
    with: { name: date, value: "${{ if(empty(inputs.date), utcNow(), inputs.date) }}" }
  - id: load
    needs: set_date
    uses: fabric/copy
    timeout: 01:00:00
    retry: { count: 1, interval: 300 }
    with:
      source:
        postgres:
          connection: ${{ env.CONN }}
          query: |-
            SELECT * FROM t WHERE d <= ${{ sql(vars.date) }}::date
      sink:
        csv: out
  - id: only_if_loaded
    needs: load
    if: ${{ greater(steps.load.outputs.rowsCopied, 0) }}
    steps:
      - id: notify
        uses: fabric/wait
        with: { seconds: 1 }
```

How it maps:

- `${{ }}` holds ADF expression source with Actions-style references rewritten: `inputs.x`, `vars.x`, `steps.x.outputs.y`, `item.x`. The functions are ADF's own, not Actions'. A lone `${{ }}` is evaluated; a mix with text becomes `@{ }` interpolation; `${{ sql(expr) }}` inside a query becomes an escaped, quoted literal.
- `env:` is compile-time substitution. Plain text becomes a string literal inside an expression, or the text itself as a whole value (so `connection: ${{ env.CONN }}` works). A `${{ }}` value is spliced as source.
- `needs:` is a name or list (Succeeded), or `{ step, on }` for other conditions.
- `if:` requires nested `steps:` and compiles to an IfCondition with an empty else; a lone activity can't be conditional in Fabric. Write the other path as a second `if:` group with the negated condition. Outputs of steps inside a group are only visible inside it, so keep a Copy and the step that reads its row count in the same group.
- `uses:` names an action. The built-ins are `fabric/<name>`; the [actions reference](https://graycoreio.github.io/ftac/reference/actions/) lists each one with its inputs and the JSON it compiles to. `fabric/raw` takes the activity JSON as `with:` for anything not covered.
- `timeout:` is `HH:MM:SS` or `D.HH:MM:SS`; `retry: { count, interval }`.
- `labels:` is a map of name to text or `${{ }}`, emitted as `userProperties` so a run's monitoring view shows, say, the ForEach item's name on every iteration.
- YAML needs a `${{ }}` inside a flow mapping `{ ... }` to be quoted, as in Actions. Block style avoids it.

The full key list is in [Pipeline syntax](https://graycoreio.github.io/ftac/reference/pipeline-syntax)
and what goes inside `${{ }}` in [Expressions](https://graycoreio.github.io/ftac/reference/expressions).

## A build file

The YAML compiler is a layer over a TypeScript library. A pipeline can
call it directly from a `build.ts` beside its sources; the executor treats
it like a `*-pipeline.yaml`.
A build file must `export const OUT` and `export function build()`.

```ts
import { resolve } from 'node:path';
import { copy, csvFile, csvSink, fn, ifEmpty, lakehouseFiles, loadSql, main, param, pipeline, postgresQuery, setVariable, sqlLiteral, variables } from '@graycore/ftac';

export const OUT = resolve(import.meta.dirname, '../my_pipeline.json');

export function build() {
    return pipeline({
        activities: [
            setVariable('set_date', 'date', ifEmpty(param('date'), fn.utcNow())),
            copy('load', {
                source: postgresQuery({ connection: POSTGRES, query: loadSql('query.pgsql', { $1: sqlLiteral(variables('date')) }) }),
                sink: csvSink({ dataset: csvFile({ store: lakehouseFiles('brz_lakehouse'), folderPath: 'Sales', fileName: 'out.csv' }) }),
            }, { needs: 'set_date' }),
        ],
        parameters: { date: { type: 'string', defaultValue: '' } },
        variables: { date: 'String' },
    });
}

main(import.meta.url, { build, out: OUT });
```

```sh
node build.ts            # write the JSON
node build.ts --check    # exit 1 if the checked-in JSON is stale
```

Every helper returns expression *source text* with no leading `@`, so
pieces compose as plain strings. Wrap the finished source with `expr()`
to put it in a definition slot. `text()` is for plain values in a slot
(a query, a path) and refuses a leading `@`; `literal()` also refuses
`@{ }` interpolation, which Script batches must not contain.

## Layers

| Directory     | What it holds                                                                 |
| ------------- | ----------------------------------------------------------------------------- |
| `expr/`       | ADF expression source: `fn.concat(...)`, `variables()`, `param()`, `output()`, `ifEmpty()`, `sqlLiteral()`; and the slot wrappers `expr()`, `text()`, `literal()`, `interp` |
| `sql/`        | `loadSql()` (header strip, `$n` binding, stray-`@` check), `splitBatches()` for Script activities |
| `stores/`     | Linked services (`lakehouseFiles`, `lakehouseTables`, `warehouse`), datasets, Copy sources and sinks |
| `activities/` | One factory per activity type: `(name, props, { needs, policy })`             |
| `pipeline/`   | `pipeline()` assembles and lints; `render()` is the file format              |
| `cli/`        | `main()`, `run()`, `stale()`                                                   |
| `yaml/`       | The `*-pipeline.yaml` compiler: `loadYamlBuild()` and one `compile*` per construct |
| `yaml/actions/` | One module per built-in `uses:` action, the registry, and the renderer for the site's actions reference |
| `executor/`   | The Nx executor `@graycore/ftac:build`: finds every `build.ts` and `*-pipeline.yaml` under the project and writes or checks it |

## What the lint catches

`pipeline()` throws, listing every problem, when:

- two activities share a name, anywhere in the pipeline
- an activity `needs` one outside its own scope (ADF can't depend across a ForEach or If boundary)
- an expression references a `variables()`, `pipeline().parameters`, or `activity()` that isn't declared
- a declared variable is never set

`loadSql()` throws when a `$n` placeholder is unbound, a binding is unused,
or anything else in the query would be read as expression syntax.

## Conventions the output follows

- Key order matches what the Fabric portal exports, so a generated pipeline diffs cleanly against a captured one.
- Item ids are provider tokens: `lakehouseFiles('brz_lakehouse')` emits `{{ .brz_lakehouse_id }}`; `warehouse()` uses the plain artifact id, since the API rejects the swizzled form.
- The default policy is the portal's (12h timeout, no retry). Pass `policy({ retry: 2 })` to override while keeping key order.

## Contributing

Source, issues and the developer documentation are on
[GitHub](https://github.com/graycoreio/ftac). Released under the
[MIT License](https://github.com/graycoreio/ftac/blob/main/LICENSE).
