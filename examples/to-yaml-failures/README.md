# to-yaml failures

Pipeline JSON that the `to-yaml` executor refuses to convert, one reason per file, used by the to-yaml tests. Each is a working pipeline with one thing changed. There are no `*-pipeline.yaml` files here, so `build` and `check` skip this folder.

| File | Why to-yaml fails |
| --- | --- |
| `unsupported-activity.json` | A WebActivity, which no built-in action reads. |
| `nested-activity.json` | The same WebActivity, nested in a ForEach. |
| `copy-source.json` | The hello example with a SQL Server Copy source. |
| `copy-sink.json` | The hello example with a Parquet Copy sink. |
| `deployed-guid.json` | A notebook whose id is a deployed GUID, not a `{{ .<name>_id }}` token. |
| `activity-differs.json` | A Wait with an activity `description`, which `fabric/wait` doesn't write. |

`dropped-property.json` is the hello example with a pipeline `description`. It converts, with a warning that the description was dropped.
