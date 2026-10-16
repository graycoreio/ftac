---
description: "Every key a *-pipeline.yaml accepts: name, output, inputs, vars, env, datasets and steps."
---

# Pipeline syntax

A `*-pipeline.yaml` describes one Fabric pipeline. The executor picks up every such file under a project and writes the JSON its `output:` names.

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

## `name`

The pipeline name.

## `output`

Where to write the JSON, relative to the YAML file.

## `inputs`

Pipeline parameters: a map of name to `{ type, default }`. Read one as `${{ inputs.x }}`.

```yaml
inputs:
  date: { type: string, default: '' }
```

## `vars`

Pipeline variables: a map of name to Fabric type, one of `String`, `Integer`, `Boolean` or `Array`. Read one as `${{ vars.x }}`. Every declared variable must be set by a step, or the lint fails.

```yaml
vars:
  date: String
```

## `env`

Compile-time substitution, not run-time. There are two kinds of value:

- **Plain text** is a macro. Inside an expression it becomes a string literal. As a whole value it is the text itself, so `connection: ${{ env.CONN }}` yields the id as a plain string.
- **A `${{ }}` value** is spliced in as expression source wherever it is referenced.

```yaml
env:
  CONN: 00000000-0000-0000-0000-000000000000
  PERIOD: ${{ formatDateTime(vars.date, 'yyyyMM') }}
```

## `datasets`

Named store locations that Copy sources and sinks refer to. Each has exactly one kind:

```yaml
datasets:
  out_file:
    csv: { lakehouse: brz_lakehouse, folder: Sales/Orders, file: out.csv }
  silver_table:
    table: { lakehouse: slv_lakehouse, schema: Sales, table: ${{ item.table_name }} }
```

A `csv` dataset also takes an optional `delimiter` and `header`. A Copy sink names a dataset as `csv: out_file` or `table: silver_table`. Fields may hold `${{ }}` expressions.

Lakehouse names become provider tokens in the JSON: `brz_lakehouse` emits `{{ .brz_lakehouse_id }}`, which Terraform fills in.

## `steps`

The activity graph: a list of steps. Each step is one Fabric activity, or with `if:` a group of them.

## `steps[*].id`

The activity name. It must be unique across the whole pipeline, including nested steps.

## `steps[*].uses`

The [action](/reference/actions/) to run, as `fabric/<name>`. A step with `if:` takes no `uses:`.

## `steps[*].with`

The action's inputs. Each action page lists its keys.

## `steps[*].needs`

What must finish first. A name or a list of names means the step runs when they have succeeded:

```yaml
needs: [set_date, load]
```

`{ step, on }` waits for another outcome, one of `succeeded`, `failed`, `completed` or `skipped`, or a list of them:

```yaml
needs: { step: load, on: [succeeded, failed] }
```

`needs:` cannot cross a ForEach or If boundary; ADF does not allow it. The lint reports a step that needs one outside its own scope.

## `steps[*].if`

A `${{ }}` condition. The step must have nested `steps:` and no `uses:`.

A lone activity cannot be conditional in Fabric, so `if:` compiles to an IfCondition activity with the nested steps as its true branch and an empty else. Write the other path as a second `if:` group with the negated condition.

```yaml
- id: only_if_loaded
  needs: load
  if: ${{ greater(steps.load.outputs.rowsCopied, 0) }}
  steps:
    - id: notify
      uses: fabric/wait
      with: { seconds: 1 }
```

Outputs of steps inside a group are only visible inside it. Keep a Copy and the step that reads its row count in the same group.

## `steps[*].steps`

Nested steps, for `if:` and for `fabric/for-each`.

## `steps[*].timeout`

`HH:MM:SS` or `D.HH:MM:SS`. The default is the portal's 12 hours. Not every action takes it; each action page says.

```yaml
timeout: 01:00:00
```

## `steps[*].retry`

`{ count, interval }`, with the interval in seconds. The default is no retry. Not every action takes it; each action page says.

```yaml
retry: { count: 1, interval: 300 }
```

## `steps[*].labels`

A map of name to text or `${{ }}`, emitted as `userProperties` so a run's monitoring view shows, say, the ForEach item's name on every iteration.

```yaml
labels:
  table: ${{ item.table_name }}
```

## What the lint catches

Compilation fails, listing every problem, when:

- two activities share a name, anywhere in the pipeline
- an activity `needs` one outside its own scope
- an expression references a variable, input, or step output that is not declared
- a declared variable is never set

## YAML gotchas

A `${{ }}` inside a flow mapping `{ ... }` must be quoted, exactly as in GitHub Actions:

```yaml
with: { name: date, value: "${{ inputs.date }}" }
```

Block style avoids it:

```yaml
with:
  name: date
  value: ${{ inputs.date }}
```
