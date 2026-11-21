# AriaDM Roadmap

> **무료/Pro 경계 원칙**: 무료 = [Aria2-Explorer](https://github.com/alexhua/Aria2-Explorer)(AriaNg 내장) 수준의 기능, Pro = 그 이상의 모바일 고유 가치
> 결정: 2026-08-22 · 갱신: 2026-11-21 — Cloud 구독 제거, 클라우드 기능 Pro 편입 (단일 Pro 통합)

## 완료

- **v0.1.0** (2026-08-22) — P0: 프로필·다운로드 목록·제어·추가·완료 알림·다국어 4종 — [릴리스](https://github.com/deuxksy/AriaDM/releases/tag/v0.1.0)

## P1 — 무료: 기준선 도달 (Aria2-Explorer/AriaNg 수준)

채택 확보 단계 — 경쟁 기준선 기능은 모두 무료로 제공.

| 기능 | 내용 | aria2 RPC |
| :--- | :--- | :--- |
| 파일 선택 다운로드 | 토렌트/멀탈링크 파일 단위 선택 | `select-file` 옵션 |
| 전역 설정 편집기 | aria2 전역 옵션 조회·변경 UI | `getGlobalOption`·`changeGlobalOption` |
| 속도 제한 | 전역·작업별 다운/업로드 제한 | `changeGlobalOption`·`changeOption` |
| Peer·Tracker 뷰 | 작업 상세에 peer·tracker·서버 탭 | `getPeers` |
| 재시도 | 실패 작업 원클릭 재추가 | `addUri` |
| 배치 추가 | 멀티라인 URL 붙여넣기 일괄 추가 | `addUri` (URI 배열) |
| 대기열 순서 변경 | 대기 세그먼트 ↑↓ 버튼 | `changePosition` |
| Share sheet 통합 | iOS/Android 공유 시트에서 바로 추가 (브라우저 캡처의 모바일 등가) | — |
| 라우팅 규칙 | URL 패턴 → 서버/폴더 자동 선택 | — |
| 작업 검색·필터 | 이름·상태·GID 검색 | — |
| 소스 확장 | `ftp://`·`sftp://` 스킴, Metalink 파일 | `addMetalink` |
| 폴링 최적화 | multicall로 요청 통합 (왕복 3→1) | `multicall` |

## P1 — Pro: 수익 시작

> 💰 **Pro 평생 구매 $9.99** — 아래 클라이언트 기능 포함

| 기능 | 내용 |
| :--- | :--- |
| 속도 그래프 | 실시간 업/다운 시계열 차트 — AriaNg은 숫자 표시만 제공 |

## P2 — Pro

> 💰 **Pro 평생 구매 $9.99** — 아래 클라이언트·클라우드 기능 포함

| 기능 | 내용 | 등급 |
| :--- | :--- | :--- |
| 클라우드 relay push | 실시간 백그라운드 완료 알림 (APNs/FCM 중계) | Pro |
| 파일 브라우저 | WebDAV/SFTP 완료 파일 탐색·미리보기·재생 | Pro |
| 통계 대시보드 | 일/주/월 트래픽, 서버별 통계 | Pro |
| 클라우드 동기화 | 기기 간 프로필·라우팅 규칙 동기화 | Pro |
| 클라우드 자동 업로드 | 완료 파일 rclone으로 클라우드 스토리지 자동 업로드 (aria2 훅) | Pro |
| 위젯·멀티 서버 | 홈 화면 위젯, 복수 서버 동시 모니터링 | Pro |
| 자동화 규칙 | 완료 시 웹훅·조건부 알림 라우팅 | Pro |

## 후원

- **GitHub Sponsors** — 오픈소스 사용자층 후원 채널 (수수료 0)

## 다국어 확장 (무료·상시)

ko/en/zh-Hans/ja → es·ru·de·fr·it·pl·cz·zh-Hant — AriaNg(MIT) 용어 재사용 + 커뮤니티 번역 PR 접수
