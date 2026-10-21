import type { Dataset } from '../types.ts';
import { pathToYaml } from './pathToYaml.ts';
import { tokenToYaml } from './tokenToYaml.ts';
import type { YamlDataset } from './types.ts';

/** The lakehouse token name a dataset's linked service points at, when it is one compileText takes. */
function lakehouse(d: Dataset): string | undefined {
    const name = tokenToYaml(d.linkedService?.properties?.typeProperties?.artifactId);
    return name !== undefined && name === d.linkedService?.name ? name : undefined;
}

/**
 * A dataset as a `datasets:` entry: the inverse of compileDataset. Only the
 * fields that differ from csvFile's defaults are written. Undefined when it
 * is not a lakehouse CSV or table; the caller's round trip checks the rest.
 */
export function datasetToYaml(dataset: unknown): YamlDataset | undefined {
    const d = dataset as Dataset | undefined;
    if (!d || typeof d !== 'object' || !d.typeProperties) return undefined;
    const store = lakehouse(d);
    if (store === undefined) return undefined;
    const tp = d.typeProperties as Record<string, any>;
    if (d.type === 'DelimitedText') {
        const folder = pathToYaml(tp.location?.folderPath);
        const file = pathToYaml(tp.location?.fileName);
        if (folder === undefined || file === undefined) return undefined;
        return {
            csv: {
                lakehouse: store,
                folder,
                file,
                ...(tp.columnDelimiter !== ',' && { delimiter: tp.columnDelimiter }),
                ...(tp.firstRowAsHeader === false && { header: false }),
            },
        };
    }
    if (d.type === 'LakehouseTable') {
        const schema = pathToYaml(tp.schema);
        const table = pathToYaml(tp.table);
        if (schema === undefined || table === undefined) return undefined;
        return { table: { lakehouse: store, schema, table } };
    }
    return undefined;
}
