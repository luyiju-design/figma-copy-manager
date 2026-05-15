export type Language = 'zh-TW' | 'en';
export type CopyStatus = 'pending' | 'approved' | 'needs-revision';
export type PageScope = 'current' | 'all';
export type Resolution = 'use-sheet' | 'keep-canvas';

export interface CopyEntry {
  key: string;
  zhTW: string;
  en: string;
  status: CopyStatus;
  note: string;
}

export interface CanvasEntry {
  key: string;
  value: string;
  nodeId: string;
  pageId: string;
  pageName: string;
}

export interface ConflictEntry {
  key: string;
  sheetValue: string;
  canvasValue: string;
  nodeId: string;
  pageId: string;
  pageName: string;
}

export interface SyncResult {
  matched: CanvasEntry[];
  conflicts: ConflictEntry[];
  unmatchedInSheet: CopyEntry[];   // Sheets 有，畫布找不到
  unmatchedInCanvas: CanvasEntry[]; // 畫布有，Sheets 找不到
}

// Plugin Sandbox → UI 訊息
export type MainToUIMessage =
  | { type: 'SCAN_RESULT'; entries: CanvasEntry[] }
  | { type: 'PUSH_DONE'; count: number }
  | { type: 'ERROR'; message: string };

// UI → Plugin Sandbox 訊息
export type UIToMainMessage =
  | { type: 'SCAN_CANVAS'; scope: PageScope; language: Language }
  | { type: 'PUSH_TO_CANVAS'; resolutions: PushItem[] }
  | { type: 'GET_CURRENT_PAGE' };

export interface PushItem {
  nodeId: string;
  value: string;
}
