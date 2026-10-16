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

/** A pre-built `uses:` target. Everything but compile() is documentation. */
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
};
