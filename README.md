# AriaDM

aria2 원격 제어 모바일 앱 (Android/iOS). React Native + Expo 단일 코드베이스로 WebSocket 기반 실시간 다운로드 제어, 다국어(ko/en/zh-Hans/ja), 완료 알림을 제공한다. 서버의 aria2를 리모컨처럼 제어하며 오픈소스 + Freemium으로 공개 배포한다.

## 문서

- [문서 허브](docs/README.md) — 전체 문서 구조(OKF/archive/superpowers) 안내
- [OKF 문서](docs/okf/README.md) — Diátaxis 기반 안내 문서

## 프로젝트 정보

- 상태: **P0 완료** — 핵심 제어·완료 알림·다국어 4종 (iOS 실기기 검증 2026-08-22)
- 스토어 등록명: AriaDM — aria2 Download Manager
- 라이선스: 오픈소스 + Freemium (MVP 후 public 전환)
- Roadmap: P1 그래프·상세·다국어 확장 → P2 파일 브라우저 → Pro 클라우드 relay push

## 개발

- `pnpm it:docker` — docker aria2 통합 테스트 (자동 기동/정리)
- `pnpm it:heritage` — heritage 운영 인스턴스 통합 테스트 (실데이터)
- `pnpm start` — Metro 실행
- 실기기: `dev:deploy-android-wifi` 스킬 (Android), `pnpm exec expo run:ios -d` (iOS)
- 운영 서버 프로필 (heritage): `ssh heritage`에서 secret 조회 — repo에 저장 금지
- E2E: `maestro test .maestro/`

상세 절차는 [AriaDM 개발 가이드](docs/okf/how-to/dev-guide.md) 참조.
