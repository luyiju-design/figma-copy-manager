// src/ui/components/LanguageSwitcher.tsx
import React from 'react';
import { Language } from '../../types';

interface Props {
  value: Language;
  onChange: (lang: Language) => void;
}

export default function LanguageSwitcher({ value, onChange }: Props) {
  return (
    <div className="row" style={{ marginBottom: 0 }}>
      {(['zh-TW', 'en'] as Language[]).map(lang => (
        <button
          key={lang}
          className={`btn ${value === lang ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => onChange(lang)}
          style={{ flex: 1 }}
        >
          {lang === 'zh-TW' ? '中文' : 'English'}
        </button>
      ))}
    </div>
  );
}
