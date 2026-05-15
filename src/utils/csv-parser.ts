import { CopyEntry, CopyStatus } from '../types';

export function parseCSV(csvText: string): CopyEntry[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  return lines.slice(1).map(line => {
    const [key, zhTW, en, status, note] = parseCSVLine(line);
    return {
      key: key.trim(),
      zhTW: zhTW.trim(),
      en: en.trim(),
      status: (status.trim() || 'pending') as CopyStatus,
      note: note?.trim() ?? '',
    };
  });
}

export function generateCSV(entries: CopyEntry[]): string {
  const header = 'key,zh-TW,en,status,note';
  const rows = entries.map(e =>
    [e.key, e.zhTW, e.en, e.status, e.note]
      .map(v => `"${String(v).replace(/"/g, '""')}"`)
      .join(',')
  );
  return [header, ...rows].join('\n');
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}
