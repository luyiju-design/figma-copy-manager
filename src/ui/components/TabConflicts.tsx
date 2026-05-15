// src/ui/components/TabConflicts.tsx
import React from 'react';
import { AppState, AppAction } from '../store';
import { sendToMain } from '../plugin-bridge';
import { Resolution, ConflictEntry } from '../../types';

interface Props {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

export default function TabConflicts({ state, dispatch }: Props) {
  const conflicts = state.syncResult?.conflicts ?? [];

  function handleResolve(key: string, resolution: Resolution) {
    if (!state.syncResult) return;

    const conflict = conflicts.find(c => c.key === key);
    if (!conflict) return;

    const value = resolution === 'use-sheet' ? conflict.sheetValue : conflict.canvasValue;

    const updatedCanvas = state.canvasEntries.map(e =>
      e.key === key ? { ...e, value } : e
    );
    dispatch({ type: 'SET_CANVAS_ENTRIES', entries: updatedCanvas });
    dispatch({ type: 'COMPUTE_DIFF' });

    if (resolution === 'use-sheet') {
      sendToMain({ type: 'PUSH_TO_CANVAS', resolutions: [{ nodeId: conflict.nodeId, value }] });
    }
  }

  if (conflicts.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: '#888', padding: 24 }}>
        <div style={{ fontSize: 24 }}>✓</div>
        <div>目前沒有衝突</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 8, color: '#666', fontSize: 11 }}>
        共 {conflicts.length} 筆需要處理
      </div>
      {conflicts.map(entry => (
        <ConflictRow key={entry.key} entry={entry} onResolve={handleResolve} />
      ))}
    </div>
  );
}

function ConflictRow({ entry, onResolve }: { entry: ConflictEntry; onResolve: (key: string, res: Resolution) => void }) {
  return (
    <div style={{ border: '1px solid #fce8e6', borderRadius: 6, padding: 10, marginBottom: 8 }}>
      <div style={{ fontWeight: 600, marginBottom: 4, color: '#c62828', fontSize: 11 }}>{entry.key}</div>
      <div style={{ fontSize: 11, color: '#666', marginBottom: 2 }}>頁面：{entry.pageName}</div>
      <div style={{ background: '#f8f8f8', borderRadius: 4, padding: 6, marginBottom: 6, fontSize: 11 }}>
        <div>📄 Sheets：<strong>{entry.sheetValue}</strong></div>
        <div>🎨 畫布：<strong>{entry.canvasValue}</strong></div>
      </div>
      <div className="row">
        <button className="btn btn-primary" style={{ flex: 1, fontSize: 11 }} onClick={() => onResolve(entry.key, 'use-sheet')}>
          用 Sheets 值
        </button>
        <button className="btn btn-secondary" style={{ flex: 1, fontSize: 11 }} onClick={() => onResolve(entry.key, 'keep-canvas')}>
          保留畫布
        </button>
      </div>
    </div>
  );
}
