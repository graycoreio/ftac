import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';
import { findBuilds } from './findBuilds.ts';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const SOVOS = 'terraform/modules/data-workspace/esg/definitions/pipelines/eom_financial_report_generation/Sovos_Tax_File_Monthly/sovos-pipeline.yaml';

it('finds build files under a root, as absolute sorted paths', () =>
    expect(findBuilds(ROOT, '**/Sovos_Tax_File_Monthly/*-pipeline.yaml')).toEqual([resolve(ROOT, SOVOS)]));
it('is empty when nothing matches', () => expect(findBuilds(ROOT, 'nowhere/*.ts')).toEqual([]));
