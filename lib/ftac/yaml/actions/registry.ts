import { copyAction } from './copy.ts';
import { failAction } from './fail.ts';
import { forEachAction } from './forEach.ts';
import { getMetadataAction } from './getMetadata.ts';
import { invokePipelineAction } from './invokePipeline.ts';
import { notebookAction } from './notebook.ts';
import { rawAction } from './raw.ts';
import { scriptAction } from './script.ts';
import { setVariableAction } from './setVariable.ts';
import type { Action } from './types.ts';
import { waitAction } from './wait.ts';

/** Every pre-built `uses:` target, by name. The actions reference on the docs site is generated from it. */
export const registry: ReadonlyMap<string, Action> = new Map(
    [setVariableAction, getMetadataAction, copyAction, notebookAction, invokePipelineAction, scriptAction, forEachAction, waitAction, failAction, rawAction].map((a) => [a.name, a])
);
