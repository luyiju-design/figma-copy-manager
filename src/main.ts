/// <reference types="@figma/plugin-typings" />
import { isTrackedLayer, layerNameToKey } from './utils/key-converter';
import { CanvasEntry, UIToMainMessage, MainToUIMessage, PageScope, Language, PushItem } from './types';

figma.showUI(__html__, { width: 360, height: 560, title: 'Copy Manager' });

figma.ui.onmessage = async (msg: UIToMainMessage) => {
  if (msg.type === 'SCAN_CANVAS') {
    const entries = scanCanvas(msg.scope, msg.language);
    sendToUI({ type: 'SCAN_RESULT', entries });
  }

  if (msg.type === 'PUSH_TO_CANVAS') {
    const count = await pushToCanvas(msg.resolutions);
    sendToUI({ type: 'PUSH_DONE', count });
  }

  if (msg.type === 'GET_CURRENT_PAGE') {
    sendToUI({ type: 'SCAN_RESULT', entries: [] });
  }
};

function sendToUI(msg: MainToUIMessage) {
  figma.ui.postMessage(msg);
}

function scanCanvas(scope: PageScope, _language: Language): CanvasEntry[] {
  const entries: CanvasEntry[] = [];
  const pages = scope === 'current' ? [figma.currentPage] : figma.root.children;

  for (const page of pages) {
    traverseNode(page, entries, page.id, page.name);
  }
  return entries;
}

function traverseNode(node: BaseNode, entries: CanvasEntry[], pageId: string, pageName: string) {
  if (node.type === 'TEXT' && isTrackedLayer(node.name)) {
    entries.push({
      key: layerNameToKey(node.name),
      value: node.characters,
      nodeId: node.id,
      pageId,
      pageName,
    });
  }
  if ('children' in node) {
    for (const child of node.children) {
      traverseNode(child, entries, pageId, pageName);
    }
  }
}

async function pushToCanvas(resolutions: PushItem[]): Promise<number> {
  let count = 0;
  for (const item of resolutions) {
    const node = await figma.getNodeByIdAsync(item.nodeId);
    if (node && node.type === 'TEXT') {
      await figma.loadFontAsync(node.fontName as FontName);
      node.characters = item.value;
      count++;
    }
  }
  return count;
}
