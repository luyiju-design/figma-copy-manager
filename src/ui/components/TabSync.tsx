// src/ui/components/TabSync.tsx
import React from 'react';
import { AppState, AppAction } from '../store';
import { sendToMain } from '../plugin-bridge';
import { getStoredToken, buildAuthUrl, exchangeCodeForToken, storeToken } from '../../services/auth';
import { fetchSheetEntries } from '../../services/sheets';
import LanguageSwitcher from './LanguageSwitcher';

interface Props {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

export default function TabSync({ state, dispatch }: Props) {
  async function handleConnect() {
    dispatch({ type: 'SET_LOADING', value: true });
    dispatch({ type: 'SET_ERROR', message: null });
    try {
      const state_param = Math.random().toString(36).slice(2);
      const authUrl = buildAuthUrl(state_param);

      const code = await new Promise<string>((resolve, reject) => {
        const popup = window.open(authUrl, '_blank', 'width=500,height=600');
        const handler = (e: MessageEvent) => {
          if (e.data?.type === 'OAUTH_CODE') {
            window.removeEventListener('message', handler);
            popup?.close();
            resolve(e.data.code);
          }
        };
        window.addEventListener('message', handler);
        setTimeout(() => {
          window.removeEventListener('message', handler);
          reject(new Error('授權逾時，請重試'));
        }, 120000);
      });

      const token = await exchangeCodeForToken(code);
      await storeToken(token);
      dispatch({ type: 'SET_AUTHENTICATED', value: true });
    } catch (e) {
      dispatch({ type: 'SET_ERROR', message: String(e) });
    } finally {
      dispatch({ type: 'SET_LOADING', value: false });
    }
  }

  async function handleSync() {
    if (!state.spreadsheetId) {
      dispatch({ type: 'SET_ERROR', message: '請輸入 Spreadsheet ID' });
      return;
    }
    dispatch({ type: 'SET_LOADING', value: true });
    dispatch({ type: 'SET_ERROR', message: null });
    try {
      const token = await getStoredToken();
      if (!token) throw new Error('尚未授權，請先連結 Google');
      const entries = await fetchSheetEntries(state.spreadsheetId, token.accessToken);
      dispatch({ type: 'SET_SHEET_ENTRIES', entries });
      sendToMain({ type: 'SCAN_CANVAS', scope: state.scope, language: state.language });
    } catch (e) {
      dispatch({ type: 'SET_ERROR', message: String(e) });
      dispatch({ type: 'SET_LOADING', value: false });
    }
  }

  function handlePush() {
    const conflicts = state.syncResult?.conflicts ?? [];
    const matched = state.syncResult?.matched ?? [];
    if (conflicts.length > 0) {
      dispatch({ type: 'SET_ERROR', message: `還有 ${conflicts.length} 筆衝突未解決，請先到「衝突」頁面處理` });
      return;
    }
    const items = matched.map(e => ({ nodeId: e.nodeId, value: e.value }));
    sendToMain({ type: 'PUSH_TO_CANVAS', resolutions: items });
    dispatch({ type: 'SET_LOADING', value: true });
  }

  const result = state.syncResult;

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <label>Spreadsheet ID</label>
        <input
          placeholder="從 Google Sheets URL 複製"
          value={state.spreadsheetId}
          onChange={e => dispatch({ type: 'SET_SPREADSHEET_ID', id: e.target.value })}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>語言</label>
        <LanguageSwitcher
          value={state.language}
          onChange={lang => dispatch({ type: 'SET_LANGUAGE', language: lang })}
        />
      </div>

      <div className="row" style={{ marginBottom: 12 }}>
        {(['current', 'all'] as const).map(s => (
          <button
            key={s}
            className={`btn ${state.scope === s ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => dispatch({ type: 'SET_SCOPE', scope: s })}
            style={{ flex: 1 }}
          >
            {s === 'current' ? '目前頁面' : '全部頁面'}
          </button>
        ))}
      </div>

      {!state.isAuthenticated ? (
        <button className="btn btn-primary" onClick={handleConnect} disabled={state.isLoading}>
          {state.isLoading ? '授權中...' : '連結 Google 帳號'}
        </button>
      ) : (
        <button className="btn btn-primary" onClick={handleSync} disabled={state.isLoading} style={{ marginBottom: 8 }}>
          {state.isLoading ? '讀取中...' : '讀取 Sheets 並掃描畫布'}
        </button>
      )}

      {result && (
        <div style={{ marginTop: 12 }}>
          <div className="row">
            <span className="badge badge-ok">✓ 一致 {result.matched.length}</span>
            <span className="badge badge-conflict">⚠ 衝突 {result.conflicts.length}</span>
            <span className="badge badge-unmatched">○ 未對應 {result.unmatchedInSheet.length}</span>
          </div>
          <button
            className="btn btn-primary"
            onClick={handlePush}
            disabled={state.isLoading || result.conflicts.length > 0}
            style={{ marginTop: 8 }}
          >
            推送到畫布
          </button>
        </div>
      )}
    </div>
  );
}
