# Dark / Light 테마 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Light / Dark / Auto(시스템) 3옵션 테마 선택을 설정 화면에 추가하고 전 화면에 실시간 적용한다.

**Architecture:** `shared/theme.ts`를 `{ light, dark }` 팔레트로 재구성하고, 신규 `ThemeProvider`/`useTheme`이 settings store의 `themeMode` + RN `useColorScheme()`을 조합해 context로 팔레트를 공급한다. 소비자 7파일은 정적 import를 `useTheme()` hook으로 교체한다. 각 태스크가 typecheck 통과 상태를 유지하도록 기존 `theme` export는 Task 5까지 `themes.light` 별칭으로 유지한다.

**Tech Stack:** React Native New Architecture, Expo SDK 57, zustand + react-native-mmkv v4 (`createMMKV`), jest-expo

**Spec:** `docs/superpowers/specs/2026-11-16-theme-dark-light-design.md`

## Global Constraints

- pnpm만 사용 (npm/yarn 금지), 검증은 `pnpm typecheck` + `pnpm test`
- 기존 라이트 팔레트 값 동결 — spec 팔레트 표의 값만 사용
- 다크 팔레트: iOS `bg #000000, card #1C1C1E, accent #0A84FF, text #FFFFFF, muted #8E8E93, radius 12` / Android `bg #141218, card #1D1B20, accent #D0BCFF, text #E6E0E9, muted #CAC4D0, radius 16` / default는 iOS값
- i18n 키 4개를 4개 언어 전부에 추가: `settings_theme`(테마/Theme/テーマ/主题), `settings_theme_light`(라이트/Light/ライト/浅色), `settings_theme_dark`(다크/Dark/ダーク/深色), `settings_theme_auto`(시스템 따르기/System/システムに従う/跟随系统)
- 주석·커밋 메시지 한국어, Conventional Commits (type 영어, 설명 한국어)
- secret 커밋 금지

## Review Focus

1. **MMKV 손상·무효 themeMode** ('blue' 등) — hydrate가 'auto'로 폴백해야 함 → Task 2 Step 1 테스트
2. **`useColorScheme()` 초기 undefined** — resolveTheme이 'light' 폴백 → Task 3 Step 1 테스트
3. **고정 모드가 시스템 무시** — `('light','dark')` → 'light' → Task 3 Step 1 테스트
4. **setTheme 시 lang·notifyOnComplete 보존** — 저장 스키마 확장 누락이 기존 설정을 지움 → Task 2 Step 1 테스트
5. **i18n 4개 언어 키 누락 시 raw key 노출** — 4개 언어 전부 조회 검증 → Task 4 Step 1 테스트

---

### Task 1: 테마 팔레트 재구성

**Files:**
- Modify: `shared/theme.ts` (전체 재작성)
- Test: `__tests__/theme.test.ts` (신규)

**Interfaces:**
- Consumes: 없음
- Produces:
  - `export type ThemeMode = 'auto' | 'light' | 'dark'`
  - `export interface ThemeTokens { bg: string; card: string; accent: string; text: string; muted: string; radius: number }`
  - `export const themes: Record<'light' | 'dark', ThemeTokens>`
  - `export const theme: ThemeTokens` — 레거시 별칭(`themes.light`), Task 5에서 제거

- [ ] **Step 1: 실패 테스트 작성**

```ts
// __tests__/theme.test.ts
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
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `pnpm test -- theme`
Expected: FAIL — `themes`가 export되지 않아 `Cannot use ... of undefined` 또는 모듈 오류

- [ ] **Step 3: `shared/theme.ts` 재작성**

기존 `Platform.select` 라이트 3분기(ios/android/default)를 그대로 `themes.light` 값으로 이동. `themes.dark`는 Global Constraints의 다크값 3분기. 레거시 호환을 위해 `export const theme = themes.light;` 별칭 유지 (주석: 소비자 useTheme 전환 완료 후 제거).

- [ ] **Step 4: 검증 — 기존 소비자 회귀 없음**

Run: `pnpm typecheck && pnpm test`
Expected: typecheck PASS (레거시 `theme` 별칭이 7개 소비자 컴파일 유지), 전체 테스트 PASS

- [ ] **Step 5: 커밋**

```bash
git add shared/theme.ts __tests__/theme.test.ts
git commit -m "feat: 테마 팔레트 light/dark 이중 구조"
```

### Task 2: settings store themeMode

**Files:**
- Modify: `features/settings/store.ts:7-40`
- Test: `__tests__/settingsStore.test.ts` (신규)

**Interfaces:**
- Consumes: `ThemeMode` (Task 1)
- Produces:
  - `SettingsState.themeMode: ThemeMode` (기본 `'auto'`)
  - `setTheme(m: ThemeMode): void`
  - MMKV `settings` 키 JSON에 `themeMode` 필드 추가 — `hydrate`/`setNotify`/`setLang`/`setTheme` 전부 전체 필드 저장

- [ ] **Step 1: 실패 테스트 작성**

```ts
// __tests__/settingsStore.test.ts
jest.mock('react-native-mmkv', () => {
  const store = new Map<string, string>();
  return {
    createMMKV: () => ({
      getString: (k: string) => store.get(k) ?? null,
      set: (k: string, v: string) => { store.set(k, v); },
      delete: (k: string) => { store.delete(k); },
    }),
  };
});

import { createMMKV } from 'react-native-mmkv';
import { useSettings } from '../features/settings/store';

const mmkv = createMMKV({ id: 'test' });

beforeEach(() => { mmkv.delete('settings'); });

test('hydrate — 신규 설치: themeMode auto 폴백', () => {
  useSettings.getState().hydrate();
  expect(useSettings.getState().themeMode).toBe('auto');
});

test('hydrate — 저장된 themeMode dark 복원', () => {
  mmkv.set('settings', JSON.stringify({ notifyOnComplete: false, lang: 'ko', themeMode: 'dark' }));
  useSettings.getState().hydrate();
  expect(useSettings.getState().themeMode).toBe('dark');
});

test('hydrate — 무효 값은 auto 폴백', () => {
  mmkv.set('settings', JSON.stringify({ themeMode: 'blue' }));
  useSettings.getState().hydrate();
  expect(useSettings.getState().themeMode).toBe('auto');
});

test('setTheme — 저장 + lang·notify 보존', () => {
  useSettings.getState().hydrate();
  useSettings.getState().setLang('ko');
  useSettings.getState().setNotify(false);
  useSettings.getState().setTheme('dark');
  expect(useSettings.getState().themeMode).toBe('dark');
  expect(JSON.parse(mmkv.getString('settings')!)).toMatchObject({ themeMode: 'dark', lang: 'ko', notifyOnComplete: false });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `pnpm test -- settingsStore`
Expected: FAIL — `themeMode` 프로퍼티 없음

- [ ] **Step 3: store 구현**

`SettingsState`에 `themeMode: ThemeMode`와 `setTheme` 추가. `hydrate`는 `parsed.themeMode`가 `'light'|'dark'` 아니면(무효 포함) `'auto'` 폴백. `setNotify`/`setLang` 저장 객체에 `themeMode: useSettings.getState().themeMode` 포함, `setTheme`은 기존 setter들과 동일 패턴(전체 필드 저장 후 `set({ themeMode })`).

- [ ] **Step 4: 테스트 통과 확인**

Run: `pnpm test -- settingsStore && pnpm typecheck`
Expected: PASS 4건

- [ ] **Step 5: 커밋**

```bash
git add features/settings/store.ts __tests__/settingsStore.test.ts
git commit -m "feat: 설정 스토어 themeMode 추가 (MMKV 영속화)"
```

### Task 3: ThemeProvider와 resolveTheme

**Files:**
- Create: `shared/ThemeContext.tsx`
- Test: `__tests__/theme.test.ts` (resolveTheme 케이스 추가)

**Interfaces:**
- Consumes: `themes`, `ThemeTokens` (Task 1), `useSettings().themeMode` (Task 2)
- Produces:
  - `resolveTheme(mode: string, system: string | null | undefined): 'light' | 'dark'`
  - `ThemeProvider({ children }: { children: React.ReactNode }): JSX.Element`
  - `useTheme(): ThemeTokens & { mode: 'light' | 'dark' }`

- [ ] **Step 1: 실패 테스트 작성** — `__tests__/theme.test.ts`에 추가

```ts
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
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `pnpm test -- theme`
Expected: FAIL — 모듈 없음

- [ ] **Step 3: `shared/ThemeContext.tsx` 구현**

`resolveTheme`: `mode === 'light' || mode === 'dark'`면 그대로 반환, 아니면 `system === 'dark' ? 'dark' : 'light'`. `ThemeProvider`는 `useSettings((s) => s.themeMode)` + `useColorScheme()`으로 resolved 계산 후 `createContext` 기본값 `themes.light`에 `{ ...themes[resolved], mode: resolved }` 공급. `useTheme`은 `useContext` 반환.

- [ ] **Step 4: 테스트 통과 확인**

Run: `pnpm test -- theme && pnpm typecheck`
Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add shared/ThemeContext.tsx __tests__/theme.test.ts
git commit -m "feat: ThemeProvider·useTheme 컨텍스트"
```

### Task 4: 레이아웃 적용 + 설정 UI + i18n

**Files:**
- Modify: `app/_layout.tsx:9-22`
- Modify: `app/(tabs)/settings.tsx:45-55`
- Modify: `shared/i18n/en.ts`, `ko.ts`, `zh.ts`, `ja.ts` (각 4키)
- Test: `__tests__/i18n.test.ts` (키 추가)

**Interfaces:**
- Consumes: `ThemeProvider`, `useTheme`, `setTheme`, `themeMode` (Task 2·3)
- Produces: 설정 화면 테마 칩 UI, i18n 키 `settings_theme{,_light,_dark,_auto}`

- [ ] **Step 1: 실패 테스트 작성** — `__tests__/i18n.test.ts`에 추가

```ts
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
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `pnpm test -- i18n`
Expected: FAIL — 미등록 키가 키 자체 반환

- [ ] **Step 3: i18n 4키 추가**

Global Constraints의 키/값 표 그대로 4개 언어 파일에 추가 (en이 `DictKey` 소스).

- [ ] **Step 4: i18n 테스트 통과 확인**

Run: `pnpm test -- i18n`
Expected: PASS

- [ ] **Step 5: `app/_layout.tsx` — ThemeProvider 배치 + StatusBar 전환**

`ConnectionProvider` 안쪽에 `ThemeProvider` 배치. 기존 `<StatusBar style="dark" />`를 ThemeProvider 내부 컴포넌트로 교체:

```tsx
function ThemedStatusBar() {
  const theme = useTheme();
  return <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />;
}
```

- [ ] **Step 6: `settings.tsx` — 테마 칩 + useTheme 전환**

언어 칩 블록(`settings_lang`) 아래, 버전 표시 위에 동일 칩 패턴 추가:

```tsx
const { themeMode, setTheme } = useSettings();
// ...
<Text style={{ fontWeight: '600', color: theme.text }}>{t('settings_theme')}</Text>
<View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
  {(['light', 'dark', 'auto'] as const).map((m) => (
    <Pressable key={m} onPress={() => setTheme(m)}
      style={{ padding: 10, borderRadius: theme.radius, backgroundColor: themeMode === m ? theme.accent : theme.card }}>
      <Text style={{ color: themeMode === m ? '#fff' : theme.text }}>{t(`settings_theme_${m}`)}</Text>
    </Pressable>
  ))}
</View>
```

같은 파일의 정적 `import { theme }` 제거 → `const theme = useTheme();` (컴포넌트 상단).

- [ ] **Step 7: 검증**

Run: `pnpm typecheck && pnpm test`
Expected: 전체 PASS

- [ ] **Step 8: 커밋**

```bash
git add app/_layout.tsx "app/(tabs)/settings.tsx" shared/i18n/
git commit -m "feat: 설정 화면 테마 선택 UI·StatusBar 테마 연동"
```

### Task 5: 소비자 전환 + 레거시 제거

**Files:**
- Modify: `app/(tabs)/_layout.tsx`, `features/downloads/DownloadRow.tsx`, `features/downloads/DownloadList.tsx`, `features/downloads/Detail.tsx`, `features/new-download/AddForm.tsx`, `features/profiles/ProfileForm.tsx`
- Modify: `shared/theme.ts` (레거시 `theme` export 제거)

**Interfaces:**
- Consumes: `useTheme` (Task 3)
- Produces: 없음 — 최종 상태

- [ ] **Step 1: 6파일 전환**

각 파일에서 `import { theme } from '.../shared/theme'` 제거 → `import { useTheme } from '.../shared/ThemeContext'` 추가, 컴포넌트 함수 상단에 `const theme = useTheme();` 배치. `(tabs)/_layout.tsx`는 `screenOptions` 클로저 밖 함수 상단(`TabsLayout` 내)에 배치. 하드코딩 색상은 그대로 둔다 (Surgical Changes).

- [ ] **Step 2: 레거시 export 제거**

`shared/theme.ts`에서 `export const theme = themes.light` 별칭과 그 주석 삭제.

- [ ] **Step 3: 검증**

Run: `pnpm typecheck && pnpm test`
Expected: typecheck PASS (theme 미참조 잔여 없음), 전체 테스트 PASS (기존 48+ 신규)

- [ ] **Step 4: 기기 검증 (수동)**

release APK 빌드 → 태블릿 adb 설치 → 라이트/다크/자동 전환 스크린샷: 언어 밑 테마 항목 렌더, 다크 전환 시 전 화면 배경·카드·Statusbar 아이콘, 자동 모드에서 시스템 다크모드 연동, accent 배경 흰 글자 칩 대비.

- [ ] **Step 5: 커밋**

```bash
git add app/ features/ shared/theme.ts
git commit -m "refactor: 정적 theme import를 useTheme으로 전환"
```
