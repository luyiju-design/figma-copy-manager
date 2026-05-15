import React from 'react';
import { AppState, AppAction } from '../store';
interface Props { state: AppState; dispatch: React.Dispatch<AppAction>; }
export default function TabConflicts({ state, dispatch }: Props) { return <div>Conflicts Tab</div>; }
