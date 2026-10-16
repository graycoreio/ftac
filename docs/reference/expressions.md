# Expressions

`${{ }}` holds ADF expression source. The functions are ADF's own, such as `if`, `empty`, `greater`, `concat`, `utcNow` and `formatDateTime`, not GitHub Actions'. Only the references are Actions-style, and FTAC rewrites them:

| You write                | Compiles to                             |
| ------------------------ | --------------------------------------- |
| `inputs.date`            | `pipeline().parameters.date`            |
| `vars.date`              | `variables('date')`                     |
| `steps.load.outputs.rowsCopied` | `activity('load').output.rowsCopied` |
| `item.table_name`        | `item().table_name`                     |
| `env.CONN`               | The `env:` value, substituted at compile time |

## Where an expression lands

How a value is emitted depends on what surrounds the `${{ }}`:

- **A lone `${{ expr }}`** becomes an evaluated expression: `{ "value": "@expr", "type": "Expression" }`.
- **A mix of text and `${{ }}`** becomes `@{ }` string interpolation.
- **`${{ sql(expr) }}` inside a query** becomes an escaped, quoted SQL literal, so a variable can be spliced into a `WHERE` clause safely.

```yaml
query: |-
  SELECT * FROM t WHERE d <= ${{ sql(vars.date) }}::date
```

compiles to

```json
{
  "value": "SELECT * FROM t WHERE d <= '@{replace(variables('date'), '''', '''''')}'::date",
  "type": "Expression"
}
```

## Script batches

`fabric/script` splits T-SQL on `GO` lines. The batches must not contain `${{ }}`; a Script activity has no interpolation slot for them.
