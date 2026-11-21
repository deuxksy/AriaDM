# website Cloud 카드 제거 — 설계

## 의도

랜딩 페이지(ariadm.zzizily.com)에서 Cloud 구독 티어($0.99/월 · $9.99/년)를 제거하고 단일 Pro($9.99 평생) 구조로 통일한다.

**Why**: 클라우드 업로드가 rclone 방식(사용자 서버에서 직접 업로드, [2026-11-21-cloud-upload-design.md](2026-11-21-cloud-upload-design.md) v2)으로 확정되며 "실제 인프라가 따르는" 구독 근거가 사라짐. 서버 운영 비용이 없는 기능을 구독으로 판매할 수 없어 Pro 평생 $9.99로 단일화.

## 변경 범위

1. `website/index.html` — Cloud 카드(`<article class="card">`, 76-85행) 삭제
2. `website/index.html` — Pro 카드 목록에 클라우드 자동 업로드 추가 (ko/en)
3. `website/style.css` — `.cards` grid `repeat(3, 1fr)` → `repeat(2, 1fr)`
4. `website/index.html` — 다운로드 CTA v0.1.0 → v0.2.0 (링크·버튼 문구)
5. 기본 언어 영어 전환 — base 텍스트 en + `data-ko` 속성 구조로 플립, `main.js` 스왑 로직 반전·기본값 navigator.language 한국어 감지(`ko`) / 그 외 `'en'`, `<html lang="en">`·title·meta description 영문화. 한국어 브라우저 첫 방문은 한국어 자동 표시 (2026-11-22 사용자 요청 반영)

**Why (기본 언어 영어)**: aria2 사용자는 글로벌 타깃 — 랜딩 기본은 영어, 한국어는 토글로 제공.

## 비목표

- ROADMAP.md Cloud 구독 항목 갱신 — 별도 작업으로 분리
- 앱 내 IAP 상품 구성·스토어 문서 변경
- Pro 카드 status 문구("준비중 로드맵 P1–P2")·무료 카드 "v0.1.0 출시" 변경 (역사적 사실)
- 콘텐츠·디자인(스크린샷·문구 톤) 재작성

## 검증

- `grep -i "cloud\|0\.99\|v0\.1\.0\|data-en" website/` — Cloud·구독 가격·v0.1.0 CTA·data-en 잔여 없음
- 브라우저 렌더 — 기본 영어 표시, `?lang=ko` 한국어 전환, features 2열 레이아웃, Pro 목록 5개, v0.2.0 링크
