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
