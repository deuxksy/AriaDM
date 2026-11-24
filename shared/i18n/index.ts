import * as Localization from 'expo-localization';
import { useCallback } from 'react';
import { create } from 'zustand';
import { en, type DictKey } from './en';
import { ko } from './ko';
import { zh } from './zh';
import { ja } from './ja';

// 신규 언어 추가: <code>.ts 사전 생성 → DICTS·availableLangs에 등록
const DICTS: Record<string, Partial<Record<DictKey, string>>> = { en, ko, zh, ja };

export const availableLangs = [
  { code: 'auto', label: 'Auto' },
  { code: 'en', label: 'English' },
  { code: 'ko', label: '한국어' },
  { code: 'zh', label: '简体中文' },
  { code: 'ja', label: '日本語' },
];

const useEffectiveLang = create(() => 'en');
type Vars = Record<string, string | number>;

function resolve(code: string): string {
  return code in DICTS ? code : 'en';
}

// pref 'auto'면 기기 언어 따름 — 앱 시작 시 settings store가 호출
export function initLang(pref: string): void {
  setLang(pref === 'auto' ? Localization.getLocales()[0]?.languageCode ?? 'en' : pref);
}

export function setLang(code: string): void { useEffectiveLang.setState(resolve(code), true); }
export function getLang(): string { return useEffectiveLang.getState(); }

function translate(lang: string, key: string, vars?: Vars): string {
  const s = DICTS[lang]?.[key as DictKey] ?? en[key as DictKey] ?? key;
  let out = s;
  if (vars) for (const [k, v] of Object.entries(vars)) out = out.replaceAll(`{${k}}`, String(v));
  return out;
}

export function useTranslation() {
  const lang = useEffectiveLang();
  return useCallback((key: string, vars?: Vars) => translate(lang, key, vars), [lang]);
}

// 백그라운드 알림은 React 밖에서 현재 언어를 조회한다.
export function t(key: string, vars?: Vars): string {
  return translate(getLang(), key, vars);
}
