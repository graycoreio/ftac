import { literal } from '../expr/literal.ts';
import type { ScriptBatch } from '../types.ts';

/** Split T-SQL on GO into Script activity batches of one type. Each batch must be a literal. */
export const splitBatches = (sql: string, type: ScriptBatch['type'] = 'NonQuery'): ScriptBatch[] =>
    sql
        .split(/^\s*GO\s*$/im)
        .map((b) => b.trim())
        .filter(Boolean)
        .map((b) => ({ text: literal(b), type }));
