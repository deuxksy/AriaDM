# AriaDM

aria2 원격 제어 모바일 앱 (Android/iOS). React Native + Expo 단일 코드베이스로 WebSocket 기반 실시간 다운로드 제어, 다국어(ko/en/zh-Hans/ja), 완료 알림을 제공한다. 서버의 aria2를 리모컨처럼 제어하며 오픈소스 + Freemium으로 공개 배포한다.

## 문서

- [문서 허브](docs/README.md) — 전체 문서 구조(OKF/archive/superpowers) 안내
- [OKF 문서](docs/okf/README.md) — Diátaxis 기반 안내 문서

## 프로젝트 정보

- 상태: **v0.2.0** (2026-08-22 범프) — [웹사이트](https://ariadm.zzizily.com) · [Releases](https://github.com/deuxksy/AriaDM/releases)
- 스토어 등록명: AriaDM — aria2 Download Manager
- 라이선스: [MIT](LICENSE) · 오픈소스 + Freemium
- Roadmap: [ROADMAP.md](ROADMAP.md) — 무료(Aria2-Explorer 수준) / Pro(그 이상) 경계 확정

## 개발

- 게이트: `pnpm typecheck && pnpm test`
- `pnpm it:docker` — docker aria2 통합 테스트 (자동 기동/정리)
- `pnpm it:heritage` — heritage 운영 인스턴스 통합 테스트 (실데이터)
- `pnpm start` — Metro 실행
- 실기기: `dev:deploy-android-wifi` 스킬 (Android), `pnpm exec expo run:ios -d` (iOS)
- 운영 서버 프로필 (heritage): `ssh heritage`에서 secret 조회 — repo에 저장 금지
- E2E: `maestro test .maestro/`

상세 절차는 [AriaDM 개발 가이드](docs/okf/how-to/dev-guide.md) 참조.
