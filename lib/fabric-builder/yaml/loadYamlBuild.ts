import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { parse } from 'yaml';
import type { Build } from '../types.ts';
import { compileDocument } from './compileDocument.ts';
import type { YamlDocument } from './types.ts';

/** A *-pipeline.yaml as a Build: the executor and stale() treat it like a build.ts. */
export function loadYamlBuild(path: string): Build {
    const doc = parse(readFileSync(path, 'utf8')) as YamlDocument;
    if (!doc || typeof doc !== 'object' || Array.isArray(doc)) throw new Error(`${path}: not a YAML mapping`);
    return { build: () => compileDocument(doc), out: resolve(dirname(path), String(doc.output)) };
}
