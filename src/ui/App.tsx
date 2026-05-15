// src/ui/App.tsx
import React, { useEffect } from 'react';
import { useAppStore } from './store';
import { onMainMessage } from './plugin-bridge';
import TabSync from './components/TabSync';
import TabConflicts from './components/TabConflicts';
import TabExport from './components/TabExport';

export default function App() {
  const [state, dispatch] = useAppStore();

  useEffect(() => {
    return onMainMessage(msg => {
      if (msg.type === 'SCAN_RESULT') {
        dispatch({ type: 'SET_CANVAS_ENTRIES', entries: msg.entries });
        dispatch({ type: 'COMPUTE_DIFF' });
        dispatch({ type: 'SET_LOADING', value: false });
      }
      if (msg.type === 'PUSH_DONE') {
        dispatch({ type: 'SET_LOADING', value: false });
      }
      if (msg.type === 'ERROR') {
        dispatch({ type: 'SET_ERROR', message: msg.message });
        dispatch({ type: 'SET_LOADING', value: false });
      }
    });
  }, [dispatch]);

  const conflictCount = state.syncResult?.conflicts.length ?? 0;

  return (
    <div>
      <div className="tabs">
        {(['sync', 'conflicts', 'export'] as const).map(tab => (
          <div
            key={tab}
            className={`tab ${state.activeTab === tab ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'SET_TAB', tab })}
          >
            {tab === 'sync' && '同步'}
            {tab === 'conflicts' && <>衝突{conflictCount > 0 && <span className="tab-badge">{conflictCount}</span>}</>}
            {tab === 'export' && '匯出'}
          </div>
        ))}
      </div>
      <div className="tab-content">
        {state.error && <div className="error">{state.error}</div>}
        {state.activeTab === 'sync' && <TabSync state={state} dispatch={dispatch} />}
        {state.activeTab === 'conflicts' && <TabConflicts state={state} dispatch={dispatch} />}
        {state.activeTab === 'export' && <TabExport state={state} dispatch={dispatch} />}
      </div>
    </div>
  );
}
