import { registry } from './registry.ts';
import { renderActionDoc } from './renderActionDoc.ts';
import { moduleName, renderActionsDoc } from './renderActionsDoc.ts';

/** Every action page for the docs site: file name -> Markdown. index.md is the list. */
export function actionDocs(): Map<string, string> {
    const docs = new Map<string, string>([['index.md', renderActionsDoc()]]);
    for (const a of registry.values()) docs.set(`${moduleName(a.name)}.md`, renderActionDoc(a));
    return docs;
}
