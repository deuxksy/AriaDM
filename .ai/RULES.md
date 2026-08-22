# AriaDM 공통 규칙

## 스택

- Expo SDK 57 (expo ~57.0.15), React Native New Architecture, TypeScript strict
- Expo는 버전 간 변경이 크다 — 코드 작성 전 https://docs.expo.dev/versions/v57.0.0/ 버전별 문서를 확인한다

## 명령어 (pnpm만 사용 — npm/yarn 금지)

- `pnpm start` / `pnpm android` / `pnpm ios` — Metro 및 앱 실행
- `pnpm typecheck` — tsc --noEmit
- `pnpm test` — 단위 테스트 (jest-expo, jest 29 고정 — jest-expo 57 호환)
- `pnpm it` — docker aria2 통합 테스트 (자동 기동/정리)

## 구조

- `app/` — expo-router 라우팅
- `core/` — rpc(aria2 JSON-RPC)·notifications·iap
- `features/` — 기능별 로직 (profiles, downloads, new-download, stats, settings)
- `shared/` — format·base64·i18n(ko/en/zh/ja)·theme

## 컨벤션

- 주석·커밋 메시지 한국어, Conventional Commits (type은 영어, 설명은 한국어)
- secret은 repo에 절대 커밋 금지 — `.env`(gitignore)만 사용, 키 목록은 `.env.example`
- 통합 테스트 secret(`it-secret`)은 docker-compose 고정 테스트 값으로 유일한 예외

## 문서

- 사람용 문서는 `docs/okf/` (Diátaxis), AI 에이전트 산출물은 `docs/superpowers/`
