# The TypeScript API

The YAML compiler is a layer over a small TypeScript library, `lib/fabric-builder`. A pipeline can call that library directly from a `build.ts` beside its sources. The executor treats a `build.ts` and a `*-pipeline.yaml` the same way, and the JSON it produces is identical.

## A build file

```ts
import { resolve } from 'node:path';
import { copy, csvFile, csvSink, fn, ifEmpty, lakehouseFiles, loadSql, main, param, pipeline, postgresQuery, setVariable, sqlLiteral, variables } from '#fabric-builder';

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

A build file must `export const OUT` and `export function build()`. It imports the library as `#fabric-builder`, a Node subpath import declared in the root `package.json`, so the depth of the pipeline directory does not matter.

```sh
node build.ts            # write the JSON
node build.ts --check    # exit 1 if the checked-in JSON is stale
```

## Layers

| Directory       | What it holds                                                                                                                                |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `expr/`         | ADF expression source: `fn.concat(...)`, `variables()`, `param()`, `output()`, `ifEmpty()`, `sqlLiteral()`; and the slot wrappers `expr()`, `text()`, `literal()`, `interp` |
| `sql/`          | `loadSql()` (header strip, `$n` binding, stray-`@` check), `splitBatches()` for Script activities                                              |
| `stores/`       | Linked services (`lakehouseFiles`, `lakehouseTables`, `warehouse`), datasets, Copy sources and sinks                                          |
| `activities/`   | One factory per activity type: `(name, props, { needs, policy })`                                                                            |
| `pipeline/`     | `pipeline()` assembles and lints; `render()` is the file format                                                                              |
| `cli/`          | `main()`, `run()`, `stale()`                                                                                                                 |
| `yaml/`         | The `*-pipeline.yaml` compiler: `loadYamlBuild()` and one `compile*` per construct                                                           |
| `yaml/actions/` | One module per built-in `uses:` action, the registry, and the generated docs                                                                 |
| `executor/`     | The Nx executor `./lib/fabric-builder:build`: finds every `build.ts` and `*-pipeline.yaml` under the project and writes or checks it         |

## Expression source

Every helper returns expression *source text* with no leading `@`, so pieces compose as plain strings. Wrap the finished source with `expr()` to put it in a definition slot. `text()` is for plain values in a slot, such as a query or a path, and refuses a leading `@`. `literal()` also refuses `@{ }` interpolation, which Script batches must not contain.

## SQL files

`loadSql()` reads a `.sql` or `.pgsql` file, strips its header comment, and binds `$n` placeholders. It throws when a placeholder is unbound, a binding is unused, or anything else in the query would be read as expression syntax.

## Conventions the output follows

- Key order matches what the Fabric portal exports, so a generated pipeline diffs cleanly against a captured one.
- Item ids are provider tokens: `lakehouseFiles('brz_lakehouse')` emits `{{ .brz_lakehouse_id }}`. `warehouse()` uses the plain artifact id, since the API rejects the swizzled form.
- The default policy is the portal's: a 12 hour timeout and no retry. Pass `policy({ retry: 2 })` to override while keeping key order.

## Adding an action

A built-in action is one module under `yaml/actions/` that exports an `Action`: its name, a description, its `with:` inputs, an example that must compile, and a `compile()` function. Register it in `registry.ts` and add a spec. The [actions reference](/reference/actions/) on this site is generated from the registry, so the new action's page appears on the next build.
