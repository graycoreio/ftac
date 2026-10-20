import { copy } from '../../activities/copy.ts';
import { tabularTranslator } from '../../stores/tabularTranslator.ts';
import { compileCopySink } from '../compileCopySink.ts';
import { compileCopySource } from '../compileCopySource.ts';
import { decompileCopySink } from '../decompileCopySink.ts';
import { decompileCopySource } from '../decompileCopySource.ts';
import { firstDifference } from '../firstDifference.ts';
import type { Action } from './types.ts';

export const copyAction: Action = {
    name: 'fabric/copy',
    description: 'Copy from a source to a sink. Read the row count as steps.<id>.outputs.rowsCopied.',
    inputs: {
        source: 'One of: postgres { connection, query | table { schema, table }, timeout }, table <dataset>, or raw <source JSON>. A query may embed ${{ sql(expr) }}.',
        sink: 'One of: csv <dataset> (plus quote-all, default true), table <dataset> (plus action: OverwriteSchema | Overwrite | Append), or raw <sink JSON>.',
        translator: '"tabular" for the portal default type-conversion translator. Omitted by default.',
        staging: 'Enable staging. Default false.',
    },
    example: `- id: load
  uses: fabric/copy
  timeout: 01:00:00
  retry: { count: 1, interval: 300 }
  with:
    source:
      postgres:
        connection: \${{ env.POSTGRES }}
        query: |-
          SELECT * FROM t WHERE d <= \${{ sql(vars.date) }}::date
    sink:
      csv: out_file`,
    exampleContext: {
        env: { POSTGRES: '00000000-0000-0000-0000-000000000000' },
        datasets: { out_file: { csv: { lakehouse: 'brz_lakehouse', folder: 'Sales/Orders', file: 'out.csv' } } },
    },
    compile: ({ step, ctx, needs, policy, with: w }) =>
        copy(
            step.id,
            {
                source: compileCopySource(w.source ?? {}, ctx, step.id),
                sink: compileCopySink(w.sink ?? {}, ctx, step.id),
                translator: w.translator === 'tabular' ? tabularTranslator() : undefined,
                staging: w.staging,
            },
            { needs, policy }
        ),
    decompile: ({ activity: { type, typeProperties: tp }, ctx }) => {
        if (type !== 'Copy' || typeof tp.enableStaging !== 'boolean') return undefined;
        if (tp.translator !== undefined && firstDifference(tp.translator, tabularTranslator()) !== undefined) throw new Error('its translator is not the tabular default');
        const source = decompileCopySource(tp.source, ctx);
        const sink = decompileCopySink(tp.sink, ctx);
        return {
            uses: 'fabric/copy',
            rawParts: [...('raw' in source ? ['source'] : []), ...('raw' in sink ? ['sink'] : [])],
            with: {
                source,
                sink,
                ...(tp.translator !== undefined && { translator: 'tabular' }),
                ...(tp.enableStaging && { staging: true }),
            },
        };
    },
};
