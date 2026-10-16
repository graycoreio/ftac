# lib/fabric-builder

A small TypeScript library for generating Fabric pipeline definitions
(`pipeline-content.json`) from source files that are pleasant to edit:
SQL in `.pgsql`/`.sql` files, ADF expressions as function calls, and the
activity graph as a list with `needs` instead of `dependsOn` objects.

One function per file. `index.ts` re-exports everything. Node 24 runs the
`.ts` files directly, so a build is `node build.ts` with no compile step.

The directory is also a local nx plugin (`package.json` + `executors.json`).
The `terraform` project's `build` and `check` targets use its `build`
executor, which imports every `build.ts` under `terraform/` and writes or
verifies its JSON. A build file must `export const OUT` and
`export function build()`.

## A build file

```ts
import { resolve } from 'node:path';
import { copy, loadSql, main, pipeline, postgresQuery, setVariable, sqlLiteral, variables, ... } from '../../lib/fabric-builder/index.ts';

export const OUT = resolve(import.meta.dirname, '../my_pipeline.json');

export function build() {
    return pipeline({
        activities: [
            setVariable('set_date', 'date', ifEmpty(param('date'), fn.utcNow())),
            copy('load', {
                source: postgresQuery({ connection: ESG_POSTGRES, query: loadSql('query.pgsql', { $1: sqlLiteral(variables('date')) }) }),
                sink: csvSink({ dataset: csvFile({ store: lakehouseFiles('brz_lakehouse'), folderPath: 'ESG', fileName: 'out.csv' }) }),
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
npx nx run terraform:check   # typecheck every build.ts + library specs, then check=true
npx nx run terraform:build   # write every pipeline JSON
```

Build files import the library as `#fabric-builder`, a Node subpath import
declared in the root `package.json`, so the depth of the pipeline directory
doesn't matter.

## A YAML pipeline

A `*-pipeline.yaml` beside the sources is the other way to author a
pipeline, in GitHub Actions vocabulary. The executor picks it up like a
`build.ts`. The Sovos monthly pipeline
(`terraform/.../Sovos_Tax_File_Monthly/sovos-pipeline.yaml`) is the
reference; the schema for editor validation is `yaml/pipeline.schema.json`.

```yaml
name: My_Pipeline
output: ../../my_pipeline.json
inputs:
  date: { type: string, default: '' }
vars:
  date: String
env:
  CONN: 7c5329e4-58a9-4317-9d4d-63460450abe9      # plain text: a macro
  PERIOD: ${{ formatDateTime(vars.date, 'yyyyMM') }}  # expression: spliced as source
datasets:
  out:
    csv: { lakehouse: brz_lakehouse, folder: ESG, file: out.csv }
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
- `uses:` names an action. The built-ins are `fabric/<name>` and are documented in `yaml/actions/README.md`, which is generated from the registry (`npx nx run fabric-builder:docs`; a spec fails when it is stale). `fabric/raw` takes the activity JSON as `with:` for anything not covered.
- `timeout:` is `HH:MM:SS` or `D.HH:MM:SS`; `retry: { count, interval }`.
- `labels:` is a map of name to text or `${{ }}`, emitted as `userProperties` so a run's monitoring view shows, say, the ForEach item's name on every iteration.
- YAML needs a `${{ }}` inside a flow mapping `{ ... }` to be quoted, as in Actions. Block style avoids it.

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
| `yaml/actions/` | One module per built-in `uses:` action, the registry, and the generated README |
| `executor/`   | The nx executor `./lib/fabric-builder:build`: finds every `build.ts` under the project and writes or checks it |

Every helper returns expression *source text* with no leading `@`, so
pieces compose as plain strings. Wrap the finished source with `expr()`
to put it in a definition slot. `text()` is for plain values in a slot
(a query, a path) and refuses a leading `@`; `literal()` also refuses
`@{ }` interpolation, which Script batches must not contain.

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

## Checks

```sh
npx nx run fabric-builder:test       # the specs, no database needed
npx nx run fabric-builder:typecheck  # tsc --noEmit
```

The root `vitest.config.js` has a database preflight, so these specs use
their own config. The root run still discovers them and they pass there
too, just behind the preflight.

## Migrating an existing build.js

To YAML: write `<name>-pipeline.yaml` beside the sources with `output:` pointing at the JSON, run `npx nx run terraform:build`, and review the JSON diff; then delete the build files. Or to a `build.ts`:

1. Copy the pipeline-specific constants (connection ids, folder names, policies) into a new `build.ts` beside the sources, importing from `#fabric-builder`.
2. Rewrite each activity with its factory; replace `dependsOn` with `needs`. Export `build()` and `OUT`, and end with `main(import.meta.url, { build, out: OUT })`.
3. `npx nx run terraform:check` must pass before anything else changes. The JSON is the contract.
4. Delete `build.js` and `build.test.js`. Keep a one-line `build.test.ts` that asserts `stale({ build, out: OUT })` is empty, as the Sovos pipeline does.
