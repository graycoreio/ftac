import type { Activity, Need, Policy } from '../../types.ts';
import type { Context, YamlStep } from '../types.ts';

export type CompileArgs = {
    step: YamlStep;
    ctx: Context;
    needs: Need[];
    policy: Policy;
    /** step.with, or {} */
    with: Record<string, any>;
};

export type DecompileArgs = {
    activity: Activity;
    ctx: Context;
    /** Nested activities as steps, each read back the way a top-level one is. */
    steps: (activities: Activity[]) => YamlStep[];
};

/**
 * What decompile() reads back: the step without id, needs, timeout, retry or
 * labels, which are read centrally. rawParts names the with: fields it kept
 * as raw: JSON, such as a Copy source no store reads, so they can be reported.
 */
export type DecompiledBody = Omit<YamlStep, 'id' | 'needs' | 'timeout' | 'retry' | 'labels'> & { rawParts?: string[] };

/** A pre-built `uses:` target. Everything but compile() and decompile() is documentation. */
export type Action = {
    name: `fabric/${string}`;
    description: string;
    /** `with:` fields and what each takes. */
    inputs: Record<string, string>;
    /** Whether the step takes nested steps:. Default 'forbidden'. */
    steps?: 'required' | 'forbidden';
    /** Whether timeout:/retry: apply. Default true. */
    policy?: boolean;
    /** A YAML snippet for the docs: exactly one step. It must compile. */
    example: string;
    /** The env and datasets the example refers to. */
    exampleContext?: Partial<Context>;
    compile: (args: CompileArgs) => Activity;
    /**
     * Read an activity back as this action's step, or undefined when it
     * isn't one. A step is kept only when it compiles to exactly the
     * activity, so a guess that loses something is harmless. Throw to say
     * why an activity of this action's type can't be read back; the message
     * is reported as the reason it stayed raw.
     */
    decompile?: (args: DecompileArgs) => DecompiledBody | undefined;
};
