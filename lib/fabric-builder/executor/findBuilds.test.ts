import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';
import { findBuilds } from './findBuilds.ts';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const HELLO = 'examples/hello/hello-pipeline.yaml';

it('finds build files under a root, as absolute sorted paths', () =>
    expect(findBuilds(ROOT, '**/hello/*-pipeline.yaml')).toEqual([resolve(ROOT, HELLO)]));
it('is empty when nothing matches', () => expect(findBuilds(ROOT, 'nowhere/*.ts')).toEqual([]));
