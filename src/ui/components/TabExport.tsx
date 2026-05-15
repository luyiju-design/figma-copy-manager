// src/ui/components/TabExport.tsx
import React, { useState } from 'react';
import { AppState, AppAction } from '../store';
import { exportCSV, writeSheetEntries } from '../../services/sheets';
import { getStoredToken } from '../../services/auth';

interface Props {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

export default function TabExport({ state, dispatch }: Props) {
  const [isWritingBack, setIsWritingBack] = useState(false);

  function handleExport() {
    if (state.sheetEntries.length === 0) {
      dispatch({ type: 'SET_ERROR', message: '請先同步一次再匯出' });
      return;
    }
    exportCSV(state.sheetEntries);
  }

  async function handleWriteBack() {
    if (!state.spreadsheetId || state.sheetEntries.length === 0) {
      dispatch({ type: 'SET_ERROR', message: '請先同步一次再寫回' });
      return;
    }
    setIsWritingBack(true);
    dispatch({ type: 'SET_ERROR', message: null });
    try {
      const token = await getStoredToken();
      if (!token) throw new Error('尚未授權，請先連結 Google');
      await writeSheetEntries(state.spreadsheetId, token.accessToken, state.sheetEntries);
    } catch (e) {
      dispatch({ type: 'SET_ERROR', message: String(e) });
    } finally {
      setIsWritingBack(false);
    }
  }

  const entryCount = state.sheetEntries.length;

  return (
    <div>
      <div style={{ background: '#f8f8f8', borderRadius: 6, padding: 12, marginBottom: 12, fontSize: 11, color: '#666' }}>
        <div>共 <strong>{entryCount}</strong> 筆文案</div>
        <div>欄位：key, zh-TW, en, status, note</div>
      </div>

      <button
        className="btn btn-primary"
        onClick={handleExport}
        disabled={entryCount === 0}
        style={{ marginBottom: 8 }}
      >
        下載 CSV
      </button>

      <button
        className="btn btn-secondary"
        onClick={handleWriteBack}
        disabled={entryCount === 0 || isWritingBack}
      >
        {isWritingBack ? '寫回中...' : '寫回 Google Sheets'}
      </button>

      <div style={{ marginTop: 12, fontSize: 10, color: '#aaa', lineHeight: 1.6 }}>
        「下載 CSV」可寄給客戶確認。<br />
        「寫回 Google Sheets」會將目前狀態覆蓋 Sheets 內容。
      </div>
    </div>
  );
}
