import { CONN_STATE_META } from '../features/downloads/connState';
import { setLang, t } from '../shared/i18n';

const STATES = ['connecting', 'connected', 'degraded', 'disconnected'] as const;

test('4가지 연결 상태 전부 메타 존재', () => {
  for (const s of STATES) {
    expect(CONN_STATE_META[s]).toBeDefined();
    expect(CONN_STATE_META[s].key).toMatch(/^conn_/);
    expect(CONN_STATE_META[s].color).toMatch(/^#[0-9A-F]{6}$/i);
  }
});

// 상태 배지는 언제나 보이는 UI — 4개 언어 사전 전부에 번역 필요 (en fallback 금지)
test('상태 라벨 키는 4개 언어 전부 번역', () => {
  for (const lang of ['en', 'ko', 'zh', 'ja']) {
    setLang(lang);
    for (const s of STATES) {
      expect(t(CONN_STATE_META[s].key)).not.toBe(CONN_STATE_META[s].key);
    }
  }
});
