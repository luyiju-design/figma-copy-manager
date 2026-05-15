import { CopyEntry } from '../types';
import { generateCSV } from '../utils/csv-parser';

const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';
const SHEET_NAME = 'Sheet1';

export async function fetchSheetEntries(
  spreadsheetId: string,
  accessToken: string
): Promise<CopyEntry[]> {
  const range = `${SHEET_NAME}!A:E`;
  const url = `${SHEETS_API}/${spreadsheetId}/values/${encodeURIComponent(range)}`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Failed to fetch sheet');
  }

  const data = await response.json();
  const rows: string[][] = data.values ?? [];
  if (rows.length < 2) return [];

  // Column order: A=key, B=zh-TW, C=en, D=status, E=note. Header names are ignored.
  return rows.slice(1).map(([key = '', zhTW = '', en = '', status = '', note = '']) => ({
    key: key.trim(),
    zhTW: zhTW.trim(),
    en: en.trim(),
    status: (['pending', 'approved', 'needs-revision'].includes(status.trim())
      ? status.trim()
      : 'pending') as CopyEntry['status'],
    note: note.trim(),
  }));
}

export async function writeSheetEntries(
  spreadsheetId: string,
  accessToken: string,
  entries: CopyEntry[]
): Promise<void> {
  const values = [
    ['key', 'zh-TW', 'en', 'status', 'note'],
    ...entries.map(e => [e.key, e.zhTW, e.en, e.status, e.note]),
  ];

  const range = `${SHEET_NAME}!A1`;
  const url = `${SHEETS_API}/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=RAW`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ range, majorDimension: 'ROWS', values }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Failed to write sheet');
  }
}

export function exportCSV(entries: CopyEntry[]): void {
  const csv = generateCSV(entries);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `copy-export-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
