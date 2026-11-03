import { Document, isCollection, isMap, isPair, isScalar, isSeq, type Node, visit } from 'yaml';
import type { YamlDocument } from './types.ts';

/** The widest a collection may be, as JSON, to go on one line. */
const FLOW_WIDTH = 60;

/** A short map or list of plain one-line values, which reads best on one line: `retry: { count: 1, interval: 300 }`. */
function fitsOnOneLine(node: Node): boolean {
    if (!isCollection(node) || !node.items.length) return false;
    const values = isMap(node) ? node.items.map((p) => p.value) : node.items;
    const plain = values.every((v) => isScalar(v) && !(typeof v.value === 'string' && (v.value.includes('\n') || v.value.includes('${{'))));
    return plain && JSON.stringify(node.toJSON()).length <= FLOW_WIDTH;
}

/**
 * A document as *-pipeline.yaml text: a blank line between top-level keys
 * and between steps, no line folding. Short maps and lists inside a step or
 * a top-level entry go on one line; top-level sections and steps don't.
 */
export function renderYaml(doc: YamlDocument): string {
    const d = new Document(doc);
    if (isMap(d.contents)) for (const p of d.contents.items.slice(1)) (p.key as Node).spaceBefore = true;
    const steps = d.get('steps');
    if (isSeq(steps)) for (const s of steps.items.slice(1)) (s as Node).spaceBefore = true;
    visit(d, {
        Collection(_, node, path) {
            // Two collections up is inside a top-level section; a list item is a step.
            const nesting = path.filter((p) => isCollection(p)).length;
            if (nesting >= 2 && isPair(path[path.length - 1]) && fitsOnOneLine(node)) node.flow = true;
        },
    });
    return d.toString({ lineWidth: 0 });
}
