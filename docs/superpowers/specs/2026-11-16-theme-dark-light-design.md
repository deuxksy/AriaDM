# Dark / Light 테마 — Design Spec

> **Date**: 2026-11-16
> **Status**: Approved (brainstorming 완료)
> **Scope**: 테마 시스템 신설 + 설정 화면 테마 선택 UI

## 목차

- [개요](#개요)
- [목표 / 비목표](#목표--비목표)
- [현재 상태](#현재-상태)
- [설계](#설계)
- [파일별 변경](#파일별-변경)
- [에지 케이스](#에지-케이스)
- [테스트 전략](#테스트-전략)
- [결정 로그](#결정-로그)

## 개요

앱에 Dark / Light 테마를 도입한다. 설정 화면 언어 항목 아래에 테마 선택 UI를 추가하고, 선택은 MMKV에 영속화된다. 시스템 테마를 따라가는 **Auto** 옵션을 기본값으로 한다.

## 목표 / 비목표

**목표**

1. Light / Dark / Auto(시스템) 3옵션 테마 선택 — 언어 선택의 `auto` 패턴과 대칭
2. 선택 즉시 전 화면 실시간 전환
3. StatusBar 아이콘 색상 테마 연동
4. 기존 라이트 팔레트 값은 그대로 유지 (현재 UI 회귀 없음)

**비목표**

1. 사용자 커스텀 색상 / 고대비 테마
2. Navigation 헤더 테마 통합 (@react-navigation Theme) — 헤더를 숨긴 화면 위주라 불필요
3. 웹(website/) 랜딩 테마

## 현재 상태

- `shared/theme.ts` — `Platform.select` 고정 라이트 팔레트, 정적 export `theme`
- 소비자 7파일이 `import { theme }` 사용: `app/(tabs)/_layout.tsx`, `app/(tabs)/settings.tsx`, `features/profiles/ProfileForm.tsx`, `features/downloads/DownloadRow.tsx`, `features/downloads/DownloadList.tsx`, `features/downloads/Detail.tsx`, `features/new-download/AddForm.tsx`
- `features/settings/store.ts` — zustand + MMKV persist (`settings` 키에 `notifyOnComplete`, `lang` 저장, `hydrate` 폴백 포함)
- `app/_layout.tsx` — `StatusBar style="dark"` 고정

## 설계

### 1. 팔레트 — `shared/theme.ts`

기존 플랫폼별 라이트 값을 `light`로 유지하고, 시스템 디자인 가이드 기반 `dark` 신규:

| 토큰 | light (iOS / Android) | dark (iOS / Android) |
| :--- | :--- | :--- |
| bg | #F2F2F7 / #F8F9FA | #000000 / #141218 |
| card | #FFFFFF / #FFFFFF | #1C1C1E / #1D1B20 |
| accent | #007AFF / #6750A4 | #0A84FF / #D0BCFF |
| text | #000000 / #1D1B20 | #FFFFFF / #E6E0E9 |
| muted | #8E8E93 / #79747E | #8E8E93 / #CAC4D0 |
| radius | 12 / 16 | 12 / 16 (변경 없음) |

구조:

```ts
export type ThemeMode = 'auto' | 'light' | 'dark';
export const themes = { light: Platform.select({...}), dark: Platform.select({...}) };
```

다크 값 출처: iOS 시스템 다크(systemBackground, secondarySystemGroupedBackground, systemBlue dark), Android Material 3 다크(surface, surface-container, primary, on-surface).

### 2. 공급 — `shared/ThemeContext.tsx` (신규)

- `ThemeProvider` — `useSettings`의 `themeMode`와 RN `useColorScheme()`을 조합해 팔레트 결정 후 context 공급
- `useTheme()` — 결정된 팔레트 반환. 소비자 문법 `theme.bg` 그대로 유지
- 해석 규칙: `themeMode !== 'auto'`면 해당 팔레트 고정, `'auto'`면 `useColorScheme()` 따름 (undefined 폴백 `'light'`)
- 배치: `app/_layout.tsx`의 `ConnectionProvider` 안쪽. `StatusBar style`을 결정된 모드 기준 `"dark"`/`"light"`로 전환 (ThemeProvider 내부로 이동)

### 3. 상태 — `features/settings/store.ts`

- `SettingsState`에 `themeMode: ThemeMode` (기본 `'auto'`), `setTheme(mode)` 추가
- 기존 패턴 그대로: `hydrate`에서 `parsed.themeMode ?? 'auto'` 폴백, `setNotify`/`setLang`/`setTheme` 저장 시 `themeMode` 필드 포함

### 4. 설정 UI — `app/(tabs)/settings.tsx`

- 언어 선택 칩 아래(버전 표시 위) 동일한 칩 패턴으로 Light / Dark / Auto 3개 배치
- 선택 칩 accent 배경 + 흰 글자, 미선택 card 배경 — 언어 칩과 동일

### 5. i18n — `shared/i18n/*` 4개 언어

| 키 | ko | en | ja | zh |
| :--- | :--- | :--- | :--- | :--- |
| settings_theme | 테마 | Theme | テーマ | 主题 |
| settings_theme_light | 라이트 | Light | ライト | 浅色 |
| settings_theme_dark | 다크 | Dark | ダーク | 深色 |
| settings_theme_auto | 시스템 따르기 | System | システムに従う | 跟随系统 |

## 파일별 변경

| 파일 | 변경 |
| :--- | :--- |
| `shared/theme.ts` | `themes = { light, dark }` 재구성, `ThemeMode` 타입 export |
| `shared/ThemeContext.tsx` | 신규 — `ThemeProvider`, `useTheme` |
| `features/settings/store.ts` | `themeMode`, `setTheme` 추가, persist 스키마 확장 |
| `app/_layout.tsx` | `ThemeProvider` 배치, `StatusBar` 전환 |
| `app/(tabs)/settings.tsx` | 테마 칩 UI, `useTheme` 전환 |
| 소비자 6파일 | 정적 `theme` import → `useTheme()` |
| `shared/i18n/*` | 라벨 4키 추가 |
| `__tests__/` | store·테마 해석 테스트 |

## 에지 케이스

1. **기존 설치 사용자** — MMKV `settings` 키에 `themeMode` 없음 → `?? 'auto'` 폴백 (기존 lang 패턴 동일)
2. **MMKV 손상** — `hydrate` try/catch 기본값 복귀 시 `themeMode: 'auto'` 포함
3. **`useColorScheme()` 초기 undefined** — `'light'` 폴백
4. **accent 배경 흰 글자 칩** — 다크에서도 accent는 충분한 채도(#0A84FF/#D0BCFF)라 대비 유지, 별도 처리 불필요
5. **`placeholderTextColor`** — AddForm 등 명시 지정값이 팔레트 의존(`theme.muted`)이면 `useTheme` 전환으로 자동 연동

## 테스트 전략

1. **store** (TDD RED→GREEN): `hydrate` themeMode 폴백/복원, `setTheme` persist 저장 — 기존 settings store 테스트 확장
2. **테마 해석**: `auto` + system light → light 팔레트, `auto` + system dark → dark 팔레트, `light`/`dark` 고정은 system 무시
3. **회귀**: 기존 48 테스트 + `pnpm typecheck` 통과
4. **기기 검증**: 태블릿(X13) 설치 후 라이트/다크/자동 전환 스크린샷 — 언어 밑 테마 항목, StatusBar 아이콘 색 확인

## 결정 로그

- **Context + `useColorScheme` (안 1) 채택** — 의존성 0, RN 표준. zustand 직접 구독(안 2)은 auto 해석 리스너가 별도 필요해 기각, navigation 테마(안 3)는 헤더리스 UI라 이점 없어 기각
- **Auto 기본값** — 언어 `auto`와 대칭, 신규 사용자에게 시스템 설정 준수가 최소 놀람 원칙
- **라이트 값 동결** — 현재 스토어 배포 버전과의 시각적 연속성
- **StatusBar style 전환** — 다크 배경에 dark 아이콘은 보이지 않음, 모드 연동 필수
