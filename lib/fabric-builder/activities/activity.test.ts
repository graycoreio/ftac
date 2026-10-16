import { expect, it } from 'vitest';
import { warehouse } from '../stores/warehouse.ts';
import { activity } from './activity.ts';
import { policy } from './policy.ts';

it('orders keys as Fabric exports them', () =>
    expect(Object.keys(activity('Script', 'x', {}, { linkedService: warehouse('w'), policy: policy(), needs: 'y' }))).toEqual([
        'type', 'typeProperties', 'linkedService', 'policy', 'name', 'dependsOn',
    ]));
it('puts userProperties last, as the portal does', () =>
    expect(Object.keys(activity('Wait', 'x', {}, { userProperties: [{ name: 'Table', value: 't' }] }))).toEqual(['type', 'typeProperties', 'name', 'dependsOn', 'userProperties']));
it('omits optional envelope keys when not given', () =>
    expect(Object.keys(activity('Wait', 'x', {}))).toEqual(['type', 'typeProperties', 'name', 'dependsOn']));
