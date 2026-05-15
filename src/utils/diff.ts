import { CopyEntry, CanvasEntry, ConflictEntry, SyncResult, Language } from '../types';

export function computeDiff(
  sheetEntries: CopyEntry[],
  canvasEntries: CanvasEntry[],
  language: Language
): SyncResult {
  const canvasMap = new Map(canvasEntries.map(e => [e.key, e]));
  const sheetKeySet = new Set(sheetEntries.map(e => e.key));

  const matched: CanvasEntry[] = [];
  const conflicts: ConflictEntry[] = [];
  const unmatchedInSheet: CopyEntry[] = [];

  for (const sheet of sheetEntries) {
    const sheetValue = language === 'zh-TW' ? sheet.zhTW : sheet.en;
    const canvas = canvasMap.get(sheet.key);

    if (!canvas) {
      unmatchedInSheet.push(sheet);
      continue;
    }

    if (canvas.value !== sheetValue) {
      conflicts.push({
        key: sheet.key,
        sheetValue,
        canvasValue: canvas.value,
        nodeId: canvas.nodeId,
        pageId: canvas.pageId,
        pageName: canvas.pageName,
      });
    } else {
      matched.push(canvas);
    }
  }

  const unmatchedInCanvas = canvasEntries.filter(e => !sheetKeySet.has(e.key));

  return { matched, conflicts, unmatchedInSheet, unmatchedInCanvas };
}
