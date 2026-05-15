import { computeDiff } from '../src/utils/diff';
import { CopyEntry, CanvasEntry } from '../src/types';

const sheet: CopyEntry[] = [
  { key: 'home.hero_title', zhTW: '歡迎回來', en: 'Welcome back', status: 'approved', note: '' },
  { key: 'home.cta_btn', zhTW: '立即開始', en: 'Get Started', status: 'pending', note: '' },
  { key: 'nav.login', zhTW: '登入', en: 'Login', status: 'approved', note: '' },
];

const canvas: CanvasEntry[] = [
  { key: 'home.hero_title', value: '歡迎回來', nodeId: 'n1', pageId: 'p1', pageName: '首頁' },
  { key: 'home.cta_btn', value: '開始使用', nodeId: 'n2', pageId: 'p1', pageName: '首頁' }, // 衝突
];

describe('computeDiff', () => {
  it('identifies matched entries', () => {
    const result = computeDiff(sheet, canvas, 'zh-TW');
    expect(result.matched.map((e: CanvasEntry) => e.key)).toContain('home.hero_title');
  });

  it('identifies conflicts', () => {
    const result = computeDiff(sheet, canvas, 'zh-TW');
    expect(result.conflicts).toHaveLength(1);
    expect(result.conflicts[0].key).toBe('home.cta_btn');
    expect(result.conflicts[0].sheetValue).toBe('立即開始');
    expect(result.conflicts[0].canvasValue).toBe('開始使用');
  });

  it('identifies sheet entries not on canvas', () => {
    const result = computeDiff(sheet, canvas, 'zh-TW');
    expect(result.unmatchedInSheet.map((e: CopyEntry) => e.key)).toContain('nav.login');
  });

  it('identifies canvas entries not in sheet', () => {
    const extraCanvas: CanvasEntry[] = [
      ...canvas,
      { key: 'footer.copyright', value: '版權所有', nodeId: 'n3', pageId: 'p1', pageName: '首頁' },
    ];
    const result = computeDiff(sheet, extraCanvas, 'zh-TW');
    expect(result.unmatchedInCanvas.map((e: CanvasEntry) => e.key)).toContain('footer.copyright');
  });

  it('uses english values when language is en', () => {
    const enCanvas: CanvasEntry[] = [
      { key: 'home.hero_title', value: 'Welcome back', nodeId: 'n1', pageId: 'p1', pageName: 'Home' },
    ];
    const result = computeDiff(sheet, enCanvas, 'en');
    expect(result.matched).toHaveLength(1);
    expect(result.conflicts).toHaveLength(0);
  });
});
