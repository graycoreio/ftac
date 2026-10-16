import type { Activity, Parameter, Variable } from '../types.ts';

export type LintInput = {
    activities: Activity[];
    parameters?: Record<string, Parameter>;
    variables?: Record<string, Variable>;
};

const children = (a: Activity): Activity[][] => {
    const tp = a.typeProperties as Record<string, Activity[] | undefined>;
    return [tp.activities, tp.ifTrueActivities, tp.ifFalseActivities].filter((x): x is Activity[] => Array.isArray(x));
};

/**
 * Check the activity graph is sound. Returns problems, empty when it is:
 * names are unique, dependsOn targets are in the same scope (ADF can't
 * depend across a ForEach/If boundary), and every variables()/parameters/
 * activity() reference resolves to something declared.
 */
export function lint({ activities, parameters = {}, variables = {} }: LintInput): string[] {
    const problems: string[] = [];
    const allNames = new Set<string>();

    const walk = (scope: Activity[], path: string) => {
        const names = new Set<string>();
        for (const a of scope) {
            if (!a.name) problems.push(`${path}/: activity without a name`);
            if (names.has(a.name) || allNames.has(a.name)) problems.push(`${path}/: duplicate activity name '${a.name}'`);
            names.add(a.name);
            allNames.add(a.name);
        }
        for (const a of scope) {
            for (const d of a.dependsOn ?? [])
                if (!names.has(d.activity)) problems.push(`${path}/${a.name}: depends on '${d.activity}', not in this scope`);
            for (const inner of children(a)) walk(inner, `${path}/${a.name}`);
        }
    };
    walk(activities, '');

    const json = JSON.stringify(activities);
    const refs = (re: RegExp) => new Set([...json.matchAll(re)].map((m) => m[1]));
    for (const v of refs(/variables\('([^']+)'\)/g)) if (!(v in variables)) problems.push(`variables('${v}') is not declared`);
    for (const p of refs(/pipeline\(\)\.parameters\.(\w+)/g)) if (!(p in parameters)) problems.push(`pipeline().parameters.${p} is not declared`);
    for (const a of refs(/activity\('([^']+)'\)/g)) if (!allNames.has(a)) problems.push(`activity('${a}') does not exist`);
    for (const v of Object.keys(variables)) if (!json.includes(`"variableName":"${v}"`)) problems.push(`variable '${v}' is never set`);

    return problems;
}
