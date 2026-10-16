import { expect, it } from 'vitest';
import { render } from './render.ts';

it('renders two-space JSON with a trailing newline', () =>
    expect(render({ properties: { activities: [] } })).toBe('{\n  "properties": {\n    "activities": []\n  }\n}\n'));
