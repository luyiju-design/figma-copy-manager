import { parseCSV, generateCSV } from '../src/utils/csv-parser';
import { CopyEntry } from '../src/types';

const SAMPLE_CSV = `key,zh-TW,en,status,note
home.hero_title,歡迎回來,Welcome back,approved,
home.cta_btn,立即開始,Get Started,pending,客戶尚未回覆
nav.login,登入,Login,approved,`;

const SAMPLE_ENTRIES: CopyEntry[] = [
  { key: 'home.hero_title', zhTW: '歡迎回來', en: 'Welcome back', status: 'approved', note: '' },
  { key: 'home.cta_btn', zhTW: '立即開始', en: 'Get Started', status: 'pending', note: '客戶尚未回覆' },
  { key: 'nav.login', zhTW: '登入', en: 'Login', status: 'approved', note: '' },
];

describe('parseCSV', () => {
  it('parses header and data rows', () => {
    const result = parseCSV(SAMPLE_CSV);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual(SAMPLE_ENTRIES[0]);
  });

  it('handles notes with commas inside quotes', () => {
    const csv = `key,zh-TW,en,status,note\nfoo.bar,值,Value,pending,"備註,含逗號"`;
    const result = parseCSV(csv);
    expect(result[0].note).toBe('備註,含逗號');
  });

  it('returns empty array for header-only CSV', () => {
    expect(parseCSV('key,zh-TW,en,status,note')).toEqual([]);
  });
});

describe('generateCSV', () => {
  it('produces parseable output', () => {
    const csv = generateCSV(SAMPLE_ENTRIES);
    const roundTrip = parseCSV(csv);
    expect(roundTrip).toEqual(SAMPLE_ENTRIES);
  });

  it('escapes double quotes in values', () => {
    const entries: CopyEntry[] = [
      { key: 'a.b', zhTW: '說"你好"', en: 'Say "Hi"', status: 'approved', note: '' },
    ];
    const csv = generateCSV(entries);
    const result = parseCSV(csv);
    expect(result[0].zhTW).toBe('說"你好"');
  });
});
