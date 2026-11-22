# AriaDM 공통 규칙

## 스택

- Expo SDK 57 (expo ~57.0.15), React Native New Architecture, TypeScript strict
- SDK 버전은 `mise.toml` 고정 (node 24·pnpm 12·java 21) — enter hook이 `git pull --ff-only` 자동 실행
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
- `features/` — 기능별 로직 (profiles, downloads, new-download, settings)
- `shared/` — format·base64·i18n(ko/en/zh/ja)·theme(팔레트)·ThemeContext(공급)·ConnChip
- `plugins/` — Expo config plugin (네이티브 빌드 설정의 Single Source of Truth)
- `scripts/` — 테스트 보조 스크립트 · `docker/` — 통합 테스트 인프라 · `__tests__/` — 단위·통합 테스트
- `website/` — 랜딩 페이지 (순수 HTML/CSS/JS · GitHub Pages `ariadm.zzizily.com` · 배포 `.github/workflows/website.yml`)

## iOS 빌드 (무료 Personal Team 서명)

- `aps-environment` entitlement 금지 — 무료 팀은 Push Notifications capability 미지원, `plugins/withNoApsEnvironment.js`가 제거
- `ENABLE_USER_SCRIPT_SANDBOXING=NO` 필수 — react-native-xcode.sh가 앱 번들에 ip.txt를 기록하는데 샌드박싱이 이를 거부해 빌드 실패 (`plugins/withDevSigning.js`)
- DEVELOPMENT_TEAM 등 네이티브 설정 변경은 반드시 `plugins/`의 config plugin으로 — `expo prebuild --clean`이 pbxproj를 재생성하므로 Xcode UI 직접 수정은 휘발된다
- `ios/`·`android/`는 gitignore — 없으면 `pnpm exec expo prebuild`로 재생성, 커밋 금지

## Android 빌드 (로컬)

- release: `JAVA_HOME=$(mise where java) android/gradlew -p android assembleRelease` — 산출물 `android/app/build/outputs/apk/release/app-release.apk` (macOS `java_home`은 mise JDK 미인식 — temurin-17로 폴백해 빌드 정체)
- `expo prebuild`는 --clean 무관하게 `android/`를 클리어할 수 있음 — 이후 빌드 전 `android/local.properties`의 `sdk.dir=/opt/homebrew/share/android-commandlinetools`(brew) 재확인
- NDK 빌드 실패 `CXX1101) NDK ... did not have a source.properties file` — ndk 디렉토리가 비어 있는 것. `sdkmanager --install "ndk;27.1.12297006"`로 재설치
- Expo 57은 app.json `usesCleartextTraffic` 키 미지원(조용히 무시) — http RPC 허용은 `plugins/withCleartextHttp.js`가 manifest에 주입

## 컨벤션

- 주석·커밋 메시지 한국어, Conventional Commits (type은 영어, 설명은 한국어)
- `.git/index.lock` stale lock은 검증·보고 없이 즉시 제거 — 이 repo에서 반복 발생 (mise enter hook의 git pull과 경합 추정)
- secret은 repo에 절대 커밋 금지 — `.env`(gitignore)만 사용, 키 목록은 `.env.example`
- 통합 테스트 secret(`it-secret`)은 docker-compose 고정 테스트 값으로 유일한 예외
- Jest에서 react-native-mmkv(Nitro) 네이티브 부재 — `jest.setup.js`가 전역 인메모리 mock 제공(삭제 API는 v4 기준 `remove`, `delete` 아님). store를 import하는 테스트는 이 mock 위에서 동작

## 문서

- 사람용 문서는 `docs/okf/` (Diátaxis), AI 에이전트 산출물은 `docs/superpowers/`
