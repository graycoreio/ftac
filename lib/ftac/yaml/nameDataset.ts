import { firstDifference } from './firstDifference.ts';
import type { Context, YamlDataset } from './types.ts';

/** A name for a dataset: its file (without extension) or table, else its lakehouse and kind. */
function baseName(d: YamlDataset): string {
    const [lakehouse, plain, kind] = 'csv' in d ? [d.csv.lakehouse, d.csv.file.replace(/\.[^.]*$/, ''), 'file'] : [d.table.lakehouse, d.table.table, 'table'];
    const name = (plain.includes('${{') ? `${lakehouse}_${kind}` : plain).replace(/\W+/g, '_').replace(/^_+|_+$/g, '');
    return name || kind;
}

/**
 * The `datasets:` name for a dataset, adding it to the context when no
 * identical entry is there yet: one entry however many steps use it.
 * A name taken by a different dataset gets a numeric suffix.
 */
export function nameDataset(d: YamlDataset, ctx: Context): string {
    for (const [name, existing] of Object.entries(ctx.datasets)) if (firstDifference(existing, d) === undefined) return name;
    const base = baseName(d);
    let name = base;
    for (let n = 2; name in ctx.datasets; n++) name = `${base}_${n}`;
    ctx.datasets[name] = d;
    return name;
}
