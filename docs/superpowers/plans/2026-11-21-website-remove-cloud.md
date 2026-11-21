# website Cloud 카드 제거 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 랜딩에서 Cloud 구독 카드를 제거·클라우드 업로드를 Pro로 편입하고, 다운로드 CTA를 v0.2.0로 갱신하며, 기본 언어를 영어로 전환한다.

**Architecture:** 정적 사이트(순수 HTML/CSS/JS) 수정. i18n은 현재 "한국어 base + `data-en` 스왑" 구조 → "영어 base + `data-ko` 스왑"으로 플립. 테스트 프레임워크 없음 → 검증은 로컬 서버 브라우저 렌더 + grep.

**Tech Stack:** HTML, CSS, vanilla JS (GitHub Pages 정적 배포 `.github/workflows/website.yml`)

**Spec:** docs/superpowers/specs/2026-11-21-website-remove-cloud-design.md

## Global Constraints

- 문구 스왑은 `main.js`가 `[data-ko]` 요소 textContent를 치환 — 신규 항목에 `data-ko` 필수
- 기존 다크 풀 CSS 변수·들여쓰기 스타일 유지, 새 CSS 규칙 추가 금지
- main push 시 자동 배포됨 — 커밋은 로컬까지만, push는 사용자 확인 후

## Review Focus

- 플립 누락 요소 (`data-en` 잔여 → EN 기본인데 한국어 노출) → Step 7 grep `data-en` 0건 확인
- `data-ko` 값 이스케이프 — 원문에 `&amp;`·따옴표 포함 시 손상 → Step 6 브라우저에서 위젯 항목(Widgets &amp; multi-server) 렌더 확인
- 신규 Pro 항목 한국어 미제공 → `?lang=ko`에서 "클라우드 자동 업로드" 표시 확인
- HTML 구조 파손(article 미종료 등) → 브라우저 렌더·DOM으로 확인
- grid 2열 전환 후 카드 너비 과대 확장(1080px 컨테이너 2열) → 스크린샷 육안 확인

---

### Task 1: Cloud 카드 제거·Pro 편입·v0.2.0 CTA·grid·기본 언어 영어

**Files:**
- Modify: `website/index.html` (Cloud 카드 76-85행, Pro `<ul>`, 다운로드 CTA 103행, `<html lang>`·title·meta description)
- Modify: `website/style.css:90` (`.cards` grid)
- Modify: `website/main.js` (스왑 로직 `data-en`→`data-ko` 반전, 기본값 `'en'`)

**Interfaces:**
- 없음 — 정적 마크업 변경 단일 태스크

- [ ] **Step 1: Cloud 카드 삭제**

`index.html`에서 Cloud 카드 전체(`<article class="card">`부터 `</article>`까지, 76-85행) 삭제.

- [ ] **Step 2: Pro 목록에 클라우드 업로드 추가**

Pro 카드 `<ul>` 마지막(위젯 항목 뒤)에 추가 (data-en 형태 — Step 5 플립이 일괄 변환):

```html
<li data-en="Cloud auto-upload (rclone)">클라우드 자동 업로드 (rclone)</li>
```

- [ ] **Step 3: 다운로드 CTA v0.2.0 갱신**

`releases/tag/v0.1.0` 링크 → `releases/tag/v0.2.0`, 버튼 문구 "GitHub Releases v0.1.0" → "GitHub Releases v0.2.0".

- [ ] **Step 4: grid 3열→2열**

`style.css` `.cards` 규칙의 `grid-template-columns: repeat(3, 1fr)` → `repeat(2, 1fr)`.

- [ ] **Step 5: 기본 언어 영어 플립**

`data-en` 요소 전수 변환 (모든 data-en 요소가 단일 행이므로 정규식 일괄 스왑):
- 속성명 `data-en` → `data-ko`, 속성값(영어) ↔ 내부 텍스트(한국어) 교환
- `<html lang="ko">` → `lang="en"`
- title → "AriaDM — aria2 downloads in your pocket", meta description 영문화

`main.js`: 스왑 로직 반전(원문 보존 대상 en, 선택자 `[data-ko]`), 기본값 `navigator.language` 감지 제거 → `'en'`.

- [ ] **Step 6: 브라우저 렌더 검증**

Run: `python3 -m http.server 4173 -d website` 후 Playwright 확인
Expected: 기본 로드 영어, `?lang=ko` 한국어("클라우드 자동 업로드" 포함), features 카드 2장·Pro 5항목, 레이아웃 붕괴 없음, v0.2.0 링크.

- [ ] **Step 7: grep 잔여 확인**

Run: `grep -rn -i "cloud\|0\.99\|v0\.1\.0\|data-en" website/`
Expected: 신규 Pro 항목(en "Cloud auto-upload")만 hit — 구독 가격·v0.1.0 CTA·`data-en` 잔여 없음

- [ ] **Step 8: 커밋 (spec 문서와 분리)**

```bash
git add docs/superpowers/specs/2026-11-21-website-remove-cloud-design.md docs/superpowers/plans/2026-11-21-website-remove-cloud.md
git commit -m "docs: website Cloud 카드 제거·기본 언어 영어 전환 설계"
git add website/index.html website/style.css website/main.js
git commit -m "feat: website Cloud 구독 제거·Pro 편입, v0.2.0 CTA, 기본 언어 영어 전환"
```
