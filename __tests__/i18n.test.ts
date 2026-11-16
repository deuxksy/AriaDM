import { setLang, t } from '../shared/i18n';

test('ko 사전 조회', () => {
  setLang('ko');
  expect(t('tab_downloads')).toBe('다운로드');
});

test('zh·ja 사전 조회', () => {
  setLang('zh');
  expect(t('tab_downloads')).toBe('下载');
  setLang('ja');
  expect(t('tab_downloads')).toBe('ダウンロード');
});

test('en 전환', () => {
  setLang('en');
  expect(t('tab_downloads')).toBe('Downloads');
});

test('미지원 언어 코드는 en fallback', () => {
  setLang('fr'); // 사전 미등록
  expect(t('tab_downloads')).toBe('Downloads');
});

test('변수 치환', () => {
  setLang('ko');
  expect(t('added', { n: 3 })).toBe('3건 추가됨');
});

test('미등록 키는 키 자체 반환', () => {
  expect(t('no_such_key')).toBe('no_such_key');
});

// T8/T10 이월 키 — 4개 언어 사전 전부에 존재해야 함 (en fallback 금지)
test('row·detail 키는 4개 언어 전부 번역', () => {
  for (const lang of ['en', 'ko', 'zh', 'ja']) {
    setLang(lang);
    expect(t('row_remaining')).not.toBe('row_remaining');
    expect(t('row_error', { code: '1', msg: 'x' })).not.toBe('row_error');
    expect(t('detail_title')).not.toBe('detail_title');
    expect(t('control_failed')).not.toBe('control_failed');
  }
});

test('row_error 변수 치환 (ko)', () => {
  setLang('ko');
  expect(t('row_error', { code: '22', msg: 'timeout' })).toBe('오류 22: timeout');
});

test('테마 라벨 4개 언어', () => {
  setLang('ko');
  expect(t('settings_theme')).toBe('테마');
  expect(t('settings_theme_light')).toBe('라이트');
  setLang('en');
  expect(t('settings_theme_dark')).toBe('Dark');
  setLang('ja');
  expect(t('settings_theme_auto')).toBe('システムに従う');
  setLang('zh');
  expect(t('settings_theme')).toBe('主题');
});
