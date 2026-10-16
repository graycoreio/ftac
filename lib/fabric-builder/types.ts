// Shapes of a Fabric pipeline definition, as the fabric provider deploys
// them. Key order in the builders matches what the portal exports.

/** A value in an Expression slot: evaluated when it starts with '@'. */
export type Slot = { value: string; type: 'Expression' };

export type Condition = 'Succeeded' | 'Failed' | 'Completed' | 'Skipped';
export type Need = string | { activity: string; on?: Condition | Condition[] };
export type Needs = Need | Need[];
export type Dependency = { activity: string; dependencyConditions: Condition[] };

export type Policy = {
    timeout?: string;
    retry?: number;
    retryIntervalInSeconds?: number;
    secureInput: boolean;
    secureOutput: boolean;
};

export type LinkedService = {
    name: string;
    properties: {
        type: 'Lakehouse' | 'DataWarehouse';
        typeProperties: Record<string, string>;
        annotations: unknown[];
    };
};

export type Dataset = {
    type: string;
    typeProperties: Record<string, unknown>;
    schema: unknown[];
    linkedService?: LinkedService;
    externalReferences?: { connection: string };
    annotations: unknown[];
};

export type Activity = {
    type: string;
    typeProperties: Record<string, unknown>;
    linkedService?: LinkedService;
    externalReferences?: { connection: string };
    policy?: Policy;
    name: string;
    dependsOn: Dependency[];
    userProperties?: UserProperty[];
};

/** A label shown in run monitoring; the value may be an expression. */
export type UserProperty = { name: string; value: string | Slot };

export type ActivityOptions = {
    needs?: Needs;
    policy?: Policy;
    linkedService?: LinkedService;
    externalReferences?: { connection: string };
    userProperties?: UserProperty[];
};

export type ParameterType = 'string' | 'int' | 'float' | 'bool' | 'array' | 'object' | 'secureString';
export type Parameter = { type: ParameterType; defaultValue?: unknown };
export type VariableType = 'String' | 'Integer' | 'Boolean' | 'Array';
export type Variable = { type: VariableType };

export type PipelineSpec = {
    activities: Activity[];
    parameters?: Record<string, Parameter>;
    variables?: Record<string, VariableType | Variable>;
};

export type Pipeline = {
    properties: {
        activities: Activity[];
        parameters?: Record<string, Parameter>;
        variables?: Record<string, Variable>;
    };
};

export type SqlBindings = Record<`$${number}`, string>;
export type ScriptBatch = { text: Slot; type: 'NonQuery' | 'Query' };
export type NotebookParam = [type: 'string' | 'int' | 'float' | 'bool', value: Slot];

export type Build = { build: () => Pipeline; out: string };
