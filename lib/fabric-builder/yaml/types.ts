// The YAML document shape: GitHub Actions vocabulary over Fabric activities.

export type YamlInput = { type: 'string' | 'int' | 'float' | 'bool' | 'array' | 'object'; default?: unknown; description?: string };
export type YamlVar = 'String' | 'Integer' | 'Boolean' | 'Array' | { type: 'String' | 'Integer' | 'Boolean' | 'Array' };

export type YamlCsv = { lakehouse: string; folder: string; file: string; delimiter?: string; header?: boolean };
export type YamlTable = { lakehouse: string; schema: string; table: string };
export type YamlDataset = { csv: YamlCsv } | { table: YamlTable };

export type YamlNeed = string | { step: string; on: 'succeeded' | 'failed' | 'completed' | 'skipped' | ('succeeded' | 'failed' | 'completed' | 'skipped')[] };

export type YamlStep = {
    id: string;
    uses?: string;
    with?: Record<string, unknown>;
    needs?: YamlNeed | YamlNeed[];
    if?: string;
    steps?: YamlStep[];
    timeout?: string;
    retry?: { count?: number; interval?: number };
    labels?: Record<string, string>;
};

export type YamlDocument = {
    name: string;
    output: string;
    inputs?: Record<string, YamlInput>;
    vars?: Record<string, YamlVar>;
    env?: Record<string, string>;
    datasets?: Record<string, YamlDataset>;
    steps: YamlStep[];
};

/** Everything a compile step may need to look up. */
export type Context = {
    env: Record<string, string>;
    datasets: Record<string, YamlDataset>;
};

export type Segment = { kind: 'code' | 'literal'; text: string };
export type Part = { kind: 'text'; text: string } | { kind: 'expr'; inner: string };
