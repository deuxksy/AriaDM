# AriaDM 개발 가이드

> **Date**: 2026-08-22
> **Type**: How-to guide
> **목적**: AriaDM 개발 환경 구성부터 단위·통합 테스트, 실기기 배포, E2E까지의 실무 절차

## 전제 조건

| 항목 | 내용 |
| :--- | :--- |
| 패키지 매니저 | `pnpm`만 사용 — npm/yarn 금지 |
| Node | LTS 버전 (mise 등으로 관리 권장) |
| Docker | 통합 테스트(`pnpm it:docker`)용 aria2 인스턴스 기동에 필요 |
| Android | 에뮬레이터 또는 WiFi ADB 연결 실기기 + dev build |
| iOS | macOS + Xcode, `pnpm exec expo run:ios -d` |
| E2E | [Maestro](https://maestro.mobile.dev/) CLI (`brew install maestro`) |

## 초기 설정

```bash
git clone <repo>
cd AriaDownloaderMananger
pnpm install
```

- secret은 repo에 커밋 금지 — `.env`(gitignore)만 사용, 키 목록은 `.env.example` 참조
- 통합 테스트 secret(`it-secret`)은 docker-compose 고정 테스트 값으로 유일한 예외

## 일상 개발 루프

| 명령 | 용도 |
| :--- | :--- |
| `pnpm start` | Metro 실행 (QR로 기기 연결) |
| `pnpm typecheck` | `tsc --noEmit` — TypeScript strict 검증 |
| `pnpm test` | 단위 테스트 (jest-expo) |

라우팅 파일(`app/**`)을 추가하면 typed routes(`.expo/types/router.d.ts`) 재생성을 위해 `pnpm start`를 한 번 실행해야 `pnpm typecheck`가 새 경로를 인식한다.

## 통합 테스트

### docker aria2 (기본)

```bash
pnpm it:docker
```

- `docker compose up -d --wait`으로 aria2(secret `it-secret`) + 1MB 테스트 파일 서버(`http://localhost:8088/testfile.bin`) 자동 기동
- 테스트 종료 시 컨테이너·볼륨 자동 정리
- 사전 요구: Docker Desktop 실행 상태

### heritage 운영 인스턴스

```bash
pnpm it:heritage
```

- secret을 `ssh heritage`에서 런타임 조회 (repo 저장 금지)
- 테스트 잔여물(파일·대기열 항목) 자동 정리 포함

## 실기기 배포

- **Android (WiFi ADB)**: `dev:deploy-android-wifi` 스킬 — Metro 실행, gradle 빌드, 설치, adb reverse port forwarding 자동 처리
- **iOS**: `pnpm exec expo run:ios -d` (기기 선택)
- 운영 서버 프로필(heritage): `ssh heritage`에서 secret 조회 후 앱 내 수동 등록 — 값은 repo에 저장 금지

```bash
SECRET=$(ssh heritage "docker exec aria2 sh -c 'grep ^rpc-secret= /config/aria2.conf | cut -d= -f2'" | tr -d '\r\n')
```

## E2E (Maestro)

사전 조건: docker aria2 기동 + 에뮬레이터/실기기에 dev build 설치 + **에뮬레이터 로케일 ko 설정** (플로우 셀렉터가 ko 사전값 — '.*설정.*', '.*일시정지.*' 등 — 전제).

```bash
docker compose up -d --wait
pnpm exec expo run:android   # dev build 에뮬레이터 설치 (최초 1회)
maestro test .maestro/add-url.yaml        # 프로필 등록 → URL 추가 → 목록 노출
maestro test .maestro/pause-resume.yaml   # 상세 모달 일시정지/재개
```

주의:

- `add-url.yaml`은 `HOST=10.0.2.2`(에뮬레이터 → 호스트 루프백) 기준. 실기기에서는 호스트 LAN/Tailscale IP로 재정의
- URL은 `http://fileserver/slow/testfile.bin`(20KB/s 스로틀) — 빠른 경로는 1MB가 즉시 완료되어 active 노출·일시정지 탭과 경합함
- 상세 화면 액션은 확인 Alert를 거치므로 각 액션을 2회 탭한다 (버튼 + Alert 확인)
- 폼 입력 탭은 라벨 텍스트 매칭 기반이라 기기·언어에 따라 보정 필요 — 첫 실기 실행 시 캘리브레이션 전제

## 아키텍처 개요

```
app/        — expo-router 라우팅 (tabs: 목록·추가·설정 / modal: 상세·프로필)
core/       — rpc(aria2 JSON-RPC, WS+HTTP fallback)·notifications·iap
features/   — 기능별 로직 (profiles, downloads, new-download, stats, settings)
shared/     — format·base64·i18n(ko/en/zh/ja)·theme
```

- WebSocket 우선·장애 시 HTTP 폴링 fallback (degraded)
- 상태 관리: zustand + react-query
- 프로필 secret은 SecureStore(Keychain/Keystore) 저장
