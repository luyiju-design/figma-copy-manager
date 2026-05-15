import { layerNameToKey, isTrackedLayer } from '../src/utils/key-converter';

describe('layerNameToKey', () => {
  it('converts slash to dot', () => {
    expect(layerNameToKey('home/hero_title')).toBe('home.hero_title');
  });

  it('handles nested paths', () => {
    expect(layerNameToKey('home/section/cta_btn')).toBe('home.section.cta_btn');
  });

  it('returns same string if no slash', () => {
    expect(layerNameToKey('hero_title')).toBe('hero_title');
  });
});

describe('isTrackedLayer', () => {
  it('returns true for layers with slash', () => {
    expect(isTrackedLayer('home/hero_title')).toBe(true);
  });

  it('returns false for layers without slash', () => {
    expect(isTrackedLayer('Background')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isTrackedLayer('')).toBe(false);
  });
});
