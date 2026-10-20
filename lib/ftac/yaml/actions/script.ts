import { script } from '../../activities/script.ts';
import { splitBatches } from '../../sql/splitBatches.ts';
import { warehouse } from '../../stores/warehouse.ts';
import { compileText } from '../compileText.ts';
import { isSlot } from '../decompileSlot.ts';
import { tokenName } from '../decompileToken.ts';
import type { Action } from './types.ts';

export const scriptAction: Action = {
    name: 'fabric/script',
    description: 'Run T-SQL inside a warehouse. Batches are split on GO lines and must not contain ${{ }}.',
    inputs: {
        warehouse: 'The token name of the warehouse; gld_datawarehouse emits {{ .gld_datawarehouse_id }}.',
        sql: 'The T-SQL, GO-separated.',
        timeout: 'Per-block execution timeout, HH:MM:SS. Default 02:00:00.',
    },
    example: `- id: merge_gold
  uses: fabric/script
  with:
    warehouse: gld_datawarehouse
    sql: |-
      CREATE SCHEMA IF NOT EXISTS History
      GO
      MERGE History.Period ...`,
    compile: ({ step, ctx, needs, policy, with: w }) =>
        script(step.id, { store: warehouse(compileText(String(w.warehouse), ctx, `${step.id}.warehouse`)), scripts: splitBatches(String(w.sql)), timeout: w.timeout }, { needs, policy }),
    decompile: ({ activity: { type, typeProperties: tp, linkedService } }) => {
        if (type !== 'Script' || !Array.isArray(tp.scripts)) return undefined;
        const name = tokenName(linkedService?.properties.typeProperties.artifactId, 'the warehouse artifactId');
        const batches = (tp.scripts as unknown[]).map((s) => (isSlot((s as { text?: unknown })?.text) ? (s as { text: { value: string } }).text.value : undefined));
        if (batches.some((b) => b === undefined)) return undefined;
        return {
            uses: 'fabric/script',
            with: { warehouse: name, sql: batches.join('\nGO\n'), ...(tp.scriptBlockExecutionTimeout !== '02:00:00' && { timeout: tp.scriptBlockExecutionTimeout }) },
        };
    },
};
