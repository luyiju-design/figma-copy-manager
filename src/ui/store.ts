// src/ui/store.ts
import { useReducer } from 'react';
import { CanvasEntry, ConflictEntry, CopyEntry, Language, PageScope, SyncResult } from '../types';
import { computeDiff } from '../utils/diff';

export interface AppState {
  activeTab: 'sync' | 'conflicts' | 'export';
  language: Language;
  scope: PageScope;
  spreadsheetId: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  sheetEntries: CopyEntry[];
  canvasEntries: CanvasEntry[];
  syncResult: SyncResult | null;
}

export type AppAction =
  | { type: 'SET_TAB'; tab: AppState['activeTab'] }
  | { type: 'SET_LANGUAGE'; language: Language }
  | { type: 'SET_SCOPE'; scope: PageScope }
  | { type: 'SET_SPREADSHEET_ID'; id: string }
  | { type: 'SET_AUTHENTICATED'; value: boolean }
  | { type: 'SET_LOADING'; value: boolean }
  | { type: 'SET_ERROR'; message: string | null }
  | { type: 'SET_SHEET_ENTRIES'; entries: CopyEntry[] }
  | { type: 'SET_CANVAS_ENTRIES'; entries: CanvasEntry[] }
  | { type: 'COMPUTE_DIFF' };

const initialState: AppState = {
  activeTab: 'sync',
  language: 'zh-TW',
  scope: 'current',
  spreadsheetId: '',
  isAuthenticated: false,
  isLoading: false,
  error: null,
  sheetEntries: [],
  canvasEntries: [],
  syncResult: null,
};

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_TAB': return { ...state, activeTab: action.tab };
    case 'SET_LANGUAGE': return { ...state, language: action.language };
    case 'SET_SCOPE': return { ...state, scope: action.scope };
    case 'SET_SPREADSHEET_ID': return { ...state, spreadsheetId: action.id };
    case 'SET_AUTHENTICATED': return { ...state, isAuthenticated: action.value };
    case 'SET_LOADING': return {
      ...state,
      isLoading: action.value,
      error: action.value ? null : state.error,
    };
    case 'SET_ERROR': return { ...state, error: action.message };
    case 'SET_SHEET_ENTRIES': return { ...state, sheetEntries: action.entries };
    case 'SET_CANVAS_ENTRIES': return { ...state, canvasEntries: action.entries };
    case 'COMPUTE_DIFF':
      return {
        ...state,
        syncResult: computeDiff(state.sheetEntries, state.canvasEntries, state.language),
      };
    default: return state;
  }
}

export function useAppStore() {
  return useReducer(reducer, initialState);
}
