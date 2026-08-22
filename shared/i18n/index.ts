import * as Localization from 'expo-localization';
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

let effective = 'en';

function resolve(code: string): string {
  return code in DICTS ? code : 'en';
}

// pref 'auto'면 기기 언어 따름 — 앱 시작 시 settings store가 호출
export function initLang(pref: string): void {
  effective = pref === 'auto'
    ? resolve(Localization.getLocales()[0]?.languageCode ?? 'en')
    : resolve(pref);
}

export function setLang(code: string): void { effective = resolve(code); }
export function getLang(): string { return effective; }

export function t(key: string, vars?: Record<string, string | number>): string {
  const s = DICTS[effective]?.[key as DictKey] ?? en[key as DictKey] ?? key;
  let out = s;
  if (vars) for (const [k, v] of Object.entries(vars)) out = out.replaceAll(`{${k}}`, String(v));
  return out;
}
