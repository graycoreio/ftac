import { script } from '../../activities/script.ts';
import { splitBatches } from '../../sql/splitBatches.ts';
import { warehouse } from '../../stores/warehouse.ts';
import { compileText } from '../compileText.ts';
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
};
