import { themes, type ThemeTokens } from '../shared/theme';
import { resolveTheme } from '../shared/ThemeContext';

describe('resolveTheme', () => {
  test('auto는 시스템 따름', () => {
    expect(resolveTheme('auto', 'dark')).toBe('dark');
    expect(resolveTheme('auto', 'light')).toBe('light');
  });
  test('auto + 시스템 undefined는 light 폴백', () => {
    expect(resolveTheme('auto', undefined)).toBe('light');
    expect(resolveTheme('auto', null)).toBe('light');
  });
  test('고정 모드는 시스템 무시', () => {
    expect(resolveTheme('light', 'dark')).toBe('light');
    expect(resolveTheme('dark', 'light')).toBe('dark');
  });
  test('무효 모드는 auto 취급', () => {
    expect(resolveTheme('blue', 'dark')).toBe('dark');
  });
});

const TOKENS: (keyof ThemeTokens)[] = ['bg', 'card', 'accent', 'text', 'muted', 'radius', 'onAccent'];

describe('themes 토큰', () => {
  test.each(TOKENS)('light.%s 존재', (k) => {
    expect(typeof themes.light[k]).not.toBe('undefined');
  });
  test.each(TOKENS)('dark.%s 존재', (k) => {
    expect(typeof themes.dark[k]).not.toBe('undefined');
  });
  test('light 카드는 흰 배경 유지 (라이트 동결)', () => {
    expect(themes.light.card).toBe('#FFFFFF');
  });
  test('dark 텍스트는 밝은 색', () => {
    expect(['#FFFFFF', '#E6E0E9']).toContain(themes.dark.text);
  });
});
