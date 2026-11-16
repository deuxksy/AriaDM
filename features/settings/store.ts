import { create } from 'zustand';
// react-native-mmkv v4(Nitro) — createMMKV 팩토리 사용 (features/profiles/storage.ts 패턴)
import { createMMKV } from 'react-native-mmkv';
import { initLang } from '../../shared/i18n';
import type { ThemeMode } from '../../shared/theme';

const mmkv = createMMKV({ id: 'ariadm-settings' });

interface SettingsState {
  notifyOnComplete: boolean;
  lang: string; // 'auto' | 언어 코드 — 기본 auto(기기 언어)
  themeMode: ThemeMode; // 기본 auto(시스템 테마)
  hydrate(): void;
  setNotify(v: boolean): void;
  setLang(l: string): void;
  setTheme(m: ThemeMode): void;
}

function normalizeTheme(v: unknown): ThemeMode {
  return v === 'light' || v === 'dark' ? v : 'auto';
}

export const useSettings = create<SettingsState>((set) => ({
  notifyOnComplete: true,
  lang: 'auto',
  themeMode: 'auto',
  hydrate() {
    // MMKV 손상 등으로 parse 실패 시 기본값 폴백 — 부팅 루프 크래시 방지
    try {
      const raw = mmkv.getString('settings');
      const parsed = raw ? (JSON.parse(raw) as Partial<SettingsState>) : {};
      const lang = parsed.lang ?? 'auto';
      const themeMode = normalizeTheme(parsed.themeMode);
      initLang(lang);
      set({ notifyOnComplete: parsed.notifyOnComplete ?? true, lang, themeMode });
    } catch {
      initLang('auto');
      set({ notifyOnComplete: true, lang: 'auto', themeMode: 'auto' });
    }
  },
  setNotify(v) {
    mmkv.set('settings', JSON.stringify({ notifyOnComplete: v, lang: useSettings.getState().lang, themeMode: useSettings.getState().themeMode }));
    set({ notifyOnComplete: v });
  },
  setLang(l) {
    mmkv.set('settings', JSON.stringify({ notifyOnComplete: useSettings.getState().notifyOnComplete, lang: l, themeMode: useSettings.getState().themeMode }));
    initLang(l);
    set({ lang: l });
  },
  setTheme(m) {
    mmkv.set('settings', JSON.stringify({ notifyOnComplete: useSettings.getState().notifyOnComplete, lang: useSettings.getState().lang, themeMode: m }));
    set({ themeMode: m });
  },
}));
