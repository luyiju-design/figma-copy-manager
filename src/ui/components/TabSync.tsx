import React from 'react';
import { AppState, AppAction } from '../store';
interface Props { state: AppState; dispatch: React.Dispatch<AppAction>; }
export default function TabSync({ state, dispatch }: Props) { return <div>Sync Tab</div>; }
