import { themes, type ThemeTokens } from '../shared/theme';

const TOKENS: (keyof ThemeTokens)[] = ['bg', 'card', 'accent', 'text', 'muted', 'radius'];

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
