# AriaDM 공통 규칙

## 스택

- Expo SDK 57 (expo ~57.0.15), React Native New Architecture, TypeScript strict
- Expo는 버전 간 변경이 크다 — 코드 작성 전 https://docs.expo.dev/versions/v57.0.0/ 버전별 문서를 확인한다

## 명령어 (pnpm만 사용 — npm/yarn 금지)

- `pnpm start` / `pnpm android` / `pnpm ios` — Metro 및 앱 실행
- `pnpm typecheck` — tsc --noEmit
- `pnpm test` — 단위 테스트 (jest-expo, jest 29 고정 — jest-expo 57 호환)
- `pnpm it:docker` — docker aria2 통합 테스트 (자동 기동/정리)
- `pnpm it:heritage` — heritage 운영 인스턴스 통합 테스트 (실데이터, secret은 ssh 런타임 조회)

## 구조

- `app/` — expo-router 라우팅
- `core/` — rpc(aria2 JSON-RPC)·notifications·iap
- `features/` — 기능별 로직 (profiles, downloads, new-download, stats, settings)
- `shared/` — format·base64·i18n(ko/en/zh/ja)·theme
- `plugins/` — Expo config plugin (네이티브 빌드 설정의 Single Source of Truth)
- `scripts/` — 테스트 보조 스크립트 · `docker/` — 통합 테스트 인프라 · `__tests__/` — 단위·통합 테스트

## iOS 빌드 (무료 Personal Team 서명)

- `aps-environment` entitlement 금지 — 무료 팀은 Push Notifications capability 미지원, `plugins/withNoApsEnvironment.js`가 제거
- `ENABLE_USER_SCRIPT_SANDBOXING=NO` 필수 — react-native-xcode.sh가 앱 번들에 ip.txt를 기록하는데 샌드박싱이 이를 거부해 빌드 실패 (`plugins/withDevSigning.js`)
- DEVELOPMENT_TEAM 등 네이티브 설정 변경은 반드시 `plugins/`의 config plugin으로 — `expo prebuild --clean`이 pbxproj를 재생성하므로 Xcode UI 직접 수정은 휘발된다
- `ios/`·`android/`는 gitignore — 없으면 `pnpm exec expo prebuild`로 재생성, 커밋 금지

## 컨벤션

- 주석·커밋 메시지 한국어, Conventional Commits (type은 영어, 설명은 한국어)
- secret은 repo에 절대 커밋 금지 — `.env`(gitignore)만 사용, 키 목록은 `.env.example`
- 통합 테스트 secret(`it-secret`)은 docker-compose 고정 테스트 값으로 유일한 예외

## 문서

- 사람용 문서는 `docs/okf/` (Diátaxis), AI 에이전트 산출물은 `docs/superpowers/`
