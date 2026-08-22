# AriaDM 웹사이트(랜딩 페이지) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** AriaDM 랜딩 페이지를 `website/`에 구현하고 GitHub Pages + `ariadm.zzizily.com` 커스텀 도메인으로 배포한다.

**Architecture:** 프레임워크 없는 정적 싱글 페이지(HTML+CSS+~20줄 JS). AriaDM repo의 `website/` 디렉터리에서 GitHub Actions가 Pages에 배포하고, DNS는 `cloudflare-domain-zzizily` repo의 OpenTofu가 관리한다.

**Tech Stack:** HTML5, CSS3, Vanilla JS, cwebp(이미지 변환), GitHub Actions Pages 배포, OpenTofu(Cloudflare DNS)

**Spec:** `docs/superpowers/specs/2026-08-22-ariadm-website-design.md`

## Global Constraints

- 프레임워크·빌드 도구 금지 — 순수 HTML/CSS/JS. CSS 단일 파일 <15KB 목표
- 색 토큰 (spec 고정): bg `#0B0E14`, 카드 `#151A23`, accent `#4C9EFF`, 텍스트 `#E6E9EF`, muted `#8B93A3`
- 스크린샷 원본: `~/Downloads/IMG_3450.PNG`(Downloads), `~/Downloads/IMG_3451.PNG`(Settings), `~/Downloads/IMG_3452.PNG`(Add)
- 번역 대상 노드는 **text-only 자식만** 가진다 (`data-en` textContent 스왑이 안전하도록) — 하이라이트용 인라인 마크업 금지
- 앱 코드 미변경 — `pnpm typecheck`/`test` 게이트 대상 아님
- 커밋: Conventional Commits (type 영어, 설명 한국어) + `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>` footer
- 작업 브랜치: `feat/website` (Task 5에서 main merge 후 배포 트리거)

---

### Task 1: 자산 준비 — WebP 스크린샷·favicon·CNAME

**Files:**
- Create: `website/assets/shot-downloads.webp`
- Create: `website/assets/shot-settings.webp`
- Create: `website/assets/shot-add.webp`
- Create: `website/assets/favicon.png`
- Create: `website/CNAME`

**Interfaces:**
- Consumes: 없음
- Produces: Task 2의 HTML이 참조하는 자산 경로 — `assets/shot-downloads.webp`, `assets/shot-settings.webp`, `assets/shot-add.webp`, `assets/favicon.png`. `CNAME` 내용물 `ariadm.zzizily.com` (Task 5 배포 시 GitHub가 인식)

- [ ] **Step 1: 브랜치 생성**

```bash
git checkout -b feat/website
```

- [ ] **Step 2: 디렉터리 생성 + WebP 변환 (750px 폭 리사이즈, q80)**

```bash
mkdir -p website/assets
cwebp -q 80 -resize 750 0 ~/Downloads/IMG_3450.PNG -o website/assets/shot-downloads.webp
cwebp -q 80 -resize 750 0 ~/Downloads/IMG_3451.PNG -o website/assets/shot-settings.webp
cwebp -q 80 -resize 750 0 ~/Downloads/IMG_3452.PNG -o website/assets/shot-add.webp
cp assets/favicon.png website/assets/favicon.png
```

- [ ] **Step 3: CNAME 파일 작성 (배포 루트 — assets/ 내부는 인식 안 됨)**

`website/CNAME` 내용 (개행 1회):

```text
ariadm.zzizily.com
```

- [ ] **Step 4: 검증 — 치수·용량·CNAME**

```bash
file website/assets/shot-*.webp website/assets/favicon.png
ls -la website/assets/
cat website/CNAME
```

Expected: webp 3장 모두 "750 x 1624" 근처 (원본 1125×2436 비율 유지), 각 ~150KB 이하 (초과 시 `-q 70`으로 재변환). favicon은 PNG. CNAME 출력 `ariadm.zzizily.com`

- [ ] **Step 5: Commit**

```bash
git add website/
git commit -m "feat: 랜딩 페이지 자산 — 스크린샷 WebP 변환·favicon·CNAME

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: index.html — 전체 마크업·카피·메타

**Files:**
- Create: `website/index.html`

**Interfaces:**
- Consumes: Task 1 자산 경로 (`assets/shot-*.webp`, `assets/favicon.png`), Task 3의 `style.css`, Task 4의 `main.js`
- Produces: Task 4 JS가 조작하는 구조 — 번역 노드 속성 `data-en` (노드 텍스트는 한국어 기본), 토글 버튼 `id="lang-toggle"`. Task 3 CSS가 대상으로 하는 선택자 — `nav`, `.hero`, `.shots`, `.phone`, `#features .cards .card`, `#download .store-card`, `#open-source`, `footer`

- [ ] **Step 1: index.html 작성 — 아래 전체 내용 그대로**

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>AriaDM — aria2 다운로드 원격 제어</title>
  <meta name="description" content="NAS·서버의 aria2를 iOS·Android에서 원격 제어하는 MIT 오픈소스 앱. 다운로드 관리, 실시간 속도, 완료 알림.">
  <link rel="canonical" href="https://ariadm.zzizily.com/">
  <link rel="icon" type="image/png" href="assets/favicon.png">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://ariadm.zzizily.com/">
  <meta property="og:title" content="AriaDM — aria2 downloads in your pocket">
  <meta property="og:description" content="Open-source aria2 remote control for iOS and Android.">
  <meta property="og:image" content="https://ariadm.zzizily.com/assets/shot-downloads.webp">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="stylesheet" href="style.css">
</head>
<body>

<nav>
  <a class="brand" href="/">
    <img src="assets/favicon.png" alt="AriaDM" width="24" height="24">
    <span>AriaDM</span>
  </a>
  <div class="nav-right">
    <button id="lang-toggle" type="button" aria-label="Switch language">EN</button>
    <a class="github" href="https://github.com/deuxksy/AriaDM" target="_blank" rel="noopener">GitHub</a>
  </div>
</nav>

<header class="hero">
  <h1 data-en="aria2 downloads, in your pocket">aria2 다운로드 관리, 주머니에서</h1>
  <p class="sub" data-en="Control the aria2 on your NAS or server from iOS and Android. Add, pause and resume downloads, watch live speeds, get finish notifications — open source, MIT.">NAS나 서버의 aria2를 iOS·Android 앱으로 원격 제어하세요. 다운로드 추가·일시정지·재개, 실시간 속도 확인, 완료 알림까지 — 오픈소스 MIT.</p>
  <div class="cta">
    <a class="btn primary" href="#download" data-en="Download">다운로드</a>
    <a class="btn" href="https://github.com/deuxksy/AriaDM" target="_blank" rel="noopener" data-en="View on GitHub">GitHub에서 보기</a>
  </div>
  <div class="badges">
    <img src="https://img.shields.io/badge/license-MIT-4C9EFF?style=flat-square&labelColor=151A23" alt="MIT License" width="84" height="20" loading="lazy">
    <img src="https://img.shields.io/github/stars/deuxksy/AriaDM?style=flat-square&labelColor=151A23&color=4C9EFF" alt="GitHub stars" width="70" height="20" loading="lazy">
  </div>
  <div class="shots">
    <div class="phone"><img src="assets/shot-downloads.webp" alt="Downloads screen" width="750" height="1624" fetchpriority="high"></div>
    <div class="phone"><img src="assets/shot-settings.webp" alt="Settings screen" width="750" height="1624" loading="lazy"></div>
    <div class="phone"><img src="assets/shot-add.webp" alt="Add download screen" width="750" height="1624" loading="lazy"></div>
  </div>
</header>

<section id="features">
  <h2 data-en="Features">기능</h2>
  <div class="cards">
    <article class="card">
      <h3 data-en="Free">무료</h3>
      <p class="price" data-en="Open source · forever">오픈소스 · 영원히</p>
      <p data-en="The open-source baseline — everything competitor apps offer, free.">오픈소스 기준선 — 경쟁 앱 수준의 기능을 모두 무료로.</p>
      <ul>
        <li data-en="Download list &amp; control (add, pause, resume, remove)">다운로드 목록·제어 (추가·일시정지·재개·삭제)</li>
        <li data-en="Local finish notifications">완료 로컬 알림</li>
        <li data-en="Multiple server profiles">다중 프로필 서버 관리</li>
        <li data-en="Korean · English · 中文 · 日本語">한국어 · English · 中文 · 日本語</li>
      </ul>
      <p class="status" data-en="Shipped in v0.1.0">v0.1.0 출시</p>
    </article>
    <article class="card pro">
      <h3>Pro</h3>
      <p class="price" data-en="$9.99 · lifetime">$9.99 · 평생</p>
      <p data-en="Mobile-native value beyond the baseline.">기준선을 넘어서는 모바일 고유 가치.</p>
      <ul>
        <li data-en="Live speed graph">실시간 속도 그래프</li>
        <li data-en="File browser (WebDAV/SFTP)">파일 브라우저 (WebDAV/SFTP)</li>
        <li data-en="Stats dashboard">통계 대시보드</li>
        <li data-en="Widgets &amp; multi-server monitoring">위젯·멀티 서버 모니터링</li>
      </ul>
      <p class="status" data-en="Coming soon (roadmap P1–P2)">준비중 (로드맵 P1–P2)</p>
    </article>
    <article class="card">
      <h3>Cloud</h3>
      <p class="price" data-en="$0.99/mo · $9.99/yr">$0.99/월 · $9.99/년</p>
      <p data-en="Server-backed features that fund real infrastructure.">실제 인프라가 따르는 서버 기반 기능.</p>
      <ul>
        <li data-en="Cloud relay push notifications">클라우드 relay push 알림</li>
        <li data-en="Cross-device profile sync">기기 간 프로필 동기화</li>
      </ul>
      <p class="status" data-en="Coming soon">준비중</p>
    </article>
  </div>
</section>

<section id="download">
  <h2 data-en="Download">다운로드</h2>
  <div class="store-cards">
    <article class="store-card">
      <h3>iOS</h3>
      <p class="badge" data-en="App Store coming soon">App Store 준비중</p>
      <p data-en="Today: sideload the ipa from GitHub Releases with AltStore or Sideloadly. Free Apple IDs need renewal every 7 days.">지금은 GitHub Releases의 ipa를 AltStore·Sideloadly로 사이드로딩할 수 있습니다. 무료 Apple ID는 7일마다 갱신이 필요합니다.</p>
    </article>
    <article class="store-card">
      <h3>Android</h3>
      <p class="badge" data-en="Google Play coming soon">Google Play 준비중</p>
      <p data-en="APK will be available on GitHub Releases.">APK는 GitHub Releases에서 제공될 예정입니다.</p>
    </article>
  </div>
  <a class="btn primary" href="https://github.com/deuxksy/AriaDM/releases/tag/v0.1.0" target="_blank" rel="noopener">GitHub Releases v0.1.0</a>
</section>

<section id="open-source">
  <h2 data-en="Open Source">오픈소스</h2>
  <p data-en="AriaDM is open source under the MIT license. Localization terms are reused from the AriaNg (MIT) project.">AriaDM은 MIT 라이선스로 공개되어 있습니다. 다국어 용어는 AriaNg(MIT) 프로젝트를 재사용했습니다.</p>
  <div class="cta">
    <a class="btn" href="https://github.com/deuxksy/AriaDM" target="_blank" rel="noopener" data-en="Source code">소스 코드</a>
    <a class="btn primary" href="https://github.com/sponsors/deuxksy" target="_blank" rel="noopener" data-en="Sponsor on GitHub">GitHub Sponsors로 후원</a>
  </div>
</section>

<footer>
  <a href="https://github.com/deuxksy/AriaDM/blob/main/ROADMAP.md" target="_blank" rel="noopener" data-en="Roadmap">로드맵</a>
  <a href="https://github.com/deuxksy/AriaDM/blob/main/LICENSE" target="_blank" rel="noopener">MIT License</a>
  <span>© 2026 AriaDM</span>
</footer>

<script src="main.js" defer></script>
</body>
</html>
```

- [ ] **Step 2: 구조 검증 — 섹션·속성·링크 전수**

```bash
python3 -m http.server 8899 --directory website &
sleep 1
curl -s http://localhost:8899/ | grep -c 'data-en='   # Expected: 35
curl -s http://localhost:8899/ | grep -c 'id="lang-toggle"'  # Expected: 1
curl -s http://localhost:8899/ | grep -oE 'href="https://[^"]+"' | sort -u
kill %1
```

Expected: 외부 링크 7종 — github.com/deuxksy/AriaDM (nav·hero·open-source), releases/tag/v0.1.0, sponsors/deuxksy, ROADMAP.md, LICENSE. 내부 링크: `/`, `#download`, `style.css`, `main.js`

- [ ] **Step 3: Commit**

```bash
git add website/index.html
git commit -m "feat: 랜딩 페이지 index.html — 6섹션 마크업·이중어 카피·OG 메타

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: style.css — 다크 풀 테마

**Files:**
- Create: `website/style.css`

**Interfaces:**
- Consumes: Task 2의 선택자 구조 (`nav`, `.hero`, `.shots`, `.phone`, `.cards`, `.card`, `.store-card`, `.btn`, `footer` 등)
- Produces: 최종 렌더링. Task 5 배포 산출물의 일부

- [ ] **Step 1: style.css 작성 — 아래 전체 내용 그대로**

```css
/* AriaDM 랜딩 — 다크 풀 (spec: docs/superpowers/specs/2026-08-22-ariadm-website-design.md) */
:root {
  --bg: #0B0E14;
  --card: #151A23;
  --accent: #4C9EFF;
  --text: #E6E9EF;
  --muted: #8B93A3;
  --line: #232B3A;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

html { scroll-behavior: smooth; }

body {
  background: var(--bg);
  color: var(--text);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans KR", "Noto Sans", sans-serif;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

img { max-width: 100%; height: auto; display: block; }
a { color: var(--accent); text-decoration: none; }

/* ---- Nav ---- */
nav {
  position: sticky; top: 0; z-index: 10;
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 20px;
  background: rgba(11, 14, 20, 0.72);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--line);
}
.brand { display: flex; align-items: center; gap: 8px; color: var(--text); font-weight: 700; }
.nav-right { display: flex; align-items: center; gap: 16px; }
#lang-toggle {
  background: none; border: 1px solid var(--line); border-radius: 8px;
  color: var(--text); font-size: 14px; font-weight: 600;
  padding: 4px 12px; cursor: pointer;
}
#lang-toggle:hover { border-color: var(--accent); }
.github { color: var(--muted); font-size: 14px; font-weight: 600; }
.github:hover { color: var(--text); }

/* ---- Hero ---- */
.hero {
  text-align: center;
  padding: 72px 20px 48px;
  background: radial-gradient(ellipse 80% 50% at 50% -10%, rgba(76, 158, 255, 0.14), transparent);
}
.hero h1 { font-size: clamp(28px, 6vw, 48px); font-weight: 800; letter-spacing: -0.02em; }
.hero .sub { max-width: 560px; margin: 16px auto 0; color: var(--muted); font-size: 17px; }
.cta { display: flex; justify-content: center; flex-wrap: wrap; gap: 12px; margin-top: 28px; }
.badges { display: flex; justify-content: center; gap: 8px; margin-top: 20px; }

.btn {
  display: inline-block; border-radius: 12px; padding: 12px 24px;
  font-size: 15px; font-weight: 700;
  border: 1px solid var(--line); color: var(--text);
}
.btn:hover { border-color: var(--accent); }
.btn.primary { background: var(--accent); border-color: var(--accent); color: #05070B; }
.btn.primary:hover { filter: brightness(1.1); }

/* ---- 스크린샷 (폰 프레임) ---- */
.shots {
  display: flex; gap: 24px; justify-content: center;
  margin: 48px auto 0; max-width: 1080px;
  overflow-x: auto; scroll-snap-type: x mandatory;
  padding: 10px 20px 24px;
}
.phone {
  flex: 0 0 min(280px, 72vw);
  scroll-snap-align: center;
  border-radius: 40px;
  border: 1px solid var(--line);
  background: #05070B;
  padding: 10px;
  box-shadow: 0 0 60px rgba(76, 158, 255, 0.12);
}
.phone img { border-radius: 32px; width: 100%; height: auto; }

/* ---- 섹션 공통 ---- */
section { max-width: 1080px; margin: 0 auto; padding: 72px 20px; }
section h2 { font-size: clamp(24px, 4vw, 34px); font-weight: 800; letter-spacing: -0.01em; margin-bottom: 32px; }

/* ---- Features 카드 ---- */
.cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.card {
  background: var(--card); border: 1px solid var(--line);
  border-radius: 16px; padding: 28px;
}
.card.pro { border-color: var(--accent); }
.card h3 { font-size: 20px; font-weight: 800; }
.card .price { color: var(--accent); font-weight: 700; margin: 4px 0 12px; }
.card > p { color: var(--muted); font-size: 14px; }
.card ul { list-style: none; margin: 16px 0; display: grid; gap: 8px; }
.card li { font-size: 15px; padding-left: 20px; position: relative; }
.card li::before { content: "✓"; position: absolute; left: 0; color: var(--accent); font-weight: 700; }
.card .status {
  margin-top: 16px; font-size: 13px; font-weight: 600;
  color: var(--muted); border-top: 1px solid var(--line); padding-top: 14px;
}

/* ---- Download ---- */
.store-cards { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 28px; }
.store-card { background: var(--card); border: 1px solid var(--line); border-radius: 16px; padding: 28px; }
.store-card h3 { font-size: 20px; font-weight: 800; margin-bottom: 8px; }
.store-card .badge {
  display: inline-block; font-size: 13px; font-weight: 600;
  color: var(--accent); background: rgba(76, 158, 255, 0.1);
  border-radius: 999px; padding: 4px 12px; margin-bottom: 12px;
}
.store-card p:not(.badge) { color: var(--muted); font-size: 14px; }
#download .btn { margin-top: 8px; }

/* ---- Open Source ---- */
#open-source { text-align: center; }
#open-source p { max-width: 560px; margin: 0 auto 8px; color: var(--muted); }

/* ---- Footer ---- */
footer {
  display: flex; justify-content: center; flex-wrap: wrap; gap: 20px;
  padding: 32px 20px; border-top: 1px solid var(--line);
  color: var(--muted); font-size: 14px;
}

/* ---- 모바일 ---- */
@media (max-width: 720px) {
  .cards, .store-cards { grid-template-columns: 1fr; }
  section { padding: 48px 20px; }
}
```

- [ ] **Step 2: 검증 — 뷰포트 렌더링 (Chrome DevTools MCP)**

```bash
python3 -m http.server 8899 --directory website &
```

Chrome DevTools MCP로 `http://localhost:8899` 열어 확인:
1. `resize_page` 375×812 (iPhone) — 카드 1열, 스크린샷 가로 스크롤, nav sticky 확인
2. `resize_page` 1280×800 — 카드 3열·스토어카드 2열 확인
3. `take_screenshot` 각 1장 — 다크 배경·폰 프레임 glow·대비 육안 확인

완료 후 `kill %1`

- [ ] **Step 3: 용량 확인**

```bash
ls -la website/style.css
```

Expected: <15KB (위 내용 기준 ~4.5KB)

- [ ] **Step 4: Commit**

```bash
git add website/style.css
git commit -m "feat: 랜딩 페이지 다크 풀 스타일시트 — 폰 프레임·반응형 카드

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: main.js — 언어 토글

**Files:**
- Create: `website/main.js`

**Interfaces:**
- Consumes: Task 2의 `data-en` 속성 노드·`id="lang-toggle"` 버튼
- Produces: 완성된 정적 사이트 (Task 5 배포 산출물). 동작 — `?lang=` 파라미터 > `localStorage('ariadm-lang')` > `navigator.language` (ko→ko, else en)

- [ ] **Step 1: main.js 작성 — 아래 전체 내용 그대로**

```js
// AriaDM 랜딩 언어 토글 — 우선순위: ?lang= > localStorage > navigator.language
(function () {
  var KEY = 'ariadm-lang';

  function apply(lang) {
    document.documentElement.lang = lang;
    localStorage.setItem(KEY, lang);
    document.querySelectorAll('[data-en]').forEach(function (el) {
      if (!el.dataset.ko) el.dataset.ko = el.textContent; // 첫 스왑 전 원문(한국어) 보존
      el.textContent = lang === 'en' ? el.dataset.en : el.dataset.ko;
    });
    var btn = document.getElementById('lang-toggle');
    if (btn) btn.textContent = lang === 'ko' ? 'EN' : '한';
  }

  var param = new URLSearchParams(location.search).get('lang');
  var initial = param === 'en' || param === 'ko'
    ? param
    : localStorage.getItem(KEY) || (navigator.language.indexOf('ko') === 0 ? 'ko' : 'en');

  apply(initial);

  document.getElementById('lang-toggle').addEventListener('click', function () {
    apply(document.documentElement.lang === 'ko' ? 'en' : 'ko');
  });
})();
```

- [ ] **Step 2: 검증 — Chrome DevTools MCP로 3케이스**

```bash
python3 -m http.server 8899 --directory website &
```

1. `http://localhost:8899/?lang=en` → 헤드라인 "aria2 downloads, in your pocket"·버튼 "한" 표시
2. `http://localhost:8899/` (localStorage en 유지) → 영어 유지 → 버튼 클릭 → 한국어 복원·버튼 "EN"
3. `evaluate_script`로 `document.documentElement.lang` 값 'ko'/'en' 확인 + nav 라벨 토글 확인

완료 후 `kill %1`

- [ ] **Step 3: Commit**

```bash
git add website/main.js
git commit -m "feat: 랜딩 페이지 언어 토글 — data-en 스왑·URL 파라미터·기억 저장

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: 배포 — Actions workflow·Pages 활성화·1차 검증

**Files:**
- Create: `.github/workflows/website.yml`

**Interfaces:**
- Consumes: Task 1–4의 `website/` 산출물
- Produces: `https://deuxksy.github.io/AriaDM`에서 서빙되는 사이트. Task 6이 custom domain을 여기에 연결

- [ ] **Step 1: workflow 작성 — 아래 전체 내용 그대로**

```yaml
name: Deploy website to GitHub Pages

on:
  push:
    branches: [main]
    paths: ['website/**', '.github/workflows/website.yml']
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: website
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Pages 활성화 (source: workflow) + commit + main merge**

```bash
gh api -X POST /repos/deuxksy/AriaDM/pages -f build_type=workflow
git add .github/workflows/website.yml
git commit -m "ci: 웹사이트 GitHub Pages 배포 워크플로우

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
git checkout main && git merge --no-ff feat/website && git push origin main
```

Expected: POST 성공 (409 Conflict면 이미 활성화된 것 — 무시). push 후 Actions 자동 실행

- [ ] **Step 3: 배포 완료 대기 + 1차 검증**

```bash
gh run watch $(gh run list --workflow=website.yml --limit=1 --json databaseId --jq '.[0].databaseId')
curl -sI https://deuxksy.github.io/AriaDM | head -5
```

Expected: run conclusion success, HTTP 200. `https://deuxksy.github.io/AriaDM/assets/shot-downloads.webp`도 200 확인 (자산 경로 정상)

- [ ] **Step 4: 브랜치 정리**

```bash
git branch -d feat/website
```

---

### Task 6: 커스텀 도메인 — DNS IaC + GitHub 설정·최종 검증

**Files:**
- Modify: `~/git/cloudflare-domain-zzizily/domain/root/record-cname.tf` (파일 끝에 리소스 추가 — 다른 repo!)

**Interfaces:**
- Consumes: Task 5의 배포된 사이트
- Produces: `https://ariadm.zzizily.com` 최종 URL

- [ ] **Step 1: DNS 레코드 IaC 추가 (cloudflare-domain-zzizily repo)**

`domain/root/record-cname.tf` 끝에 추가 — 기존 `tech` 리소스와 동일 패턴:

```hcl
resource "cloudflare_dns_record" "ariadm" {
  zone_id = var.cloudflare_zone_id
  type    = "CNAME"
  name    = "ariadm.${var.cloudflare_domain}"
  content = "deuxksy.github.io"
  ttl     = 1
  proxied = true
}
```

```bash
cd ~/git/cloudflare-domain-zzizily
git checkout -b feat/ariadm-pages
# (위 리소스 추가 후)
git add domain/root/record-cname.tf
git commit -m "feat: ariadm CNAME 레코드 추가 — GitHub Pages 연결"
```

push는 사용자 승인 후 main에 merge하여 CI(tofu apply)가 반영:

```bash
git checkout main && git merge --no-ff feat/ariadm-pages && git push origin main
gh run watch $(gh run list --workflow=tofu.yml --limit=1 --json databaseId --jq '.[0].databaseId')
```

Expected: tofu apply에 `cloudflare_dns_record.ariadm` 1 added, conclusion success

- [ ] **Step 2: GitHub custom domain 등록 + HTTPS 강제**

```bash
gh api -X PUT /repos/deuxksy/AriaDM/pages -f cname=ariadm.zzizily.com
gh api -X PUT /repos/deuxksy/AriaDM/pages -F https_enforced=true
```

주의: proxied CNAME이 Cloudflare IP로 resolve되어 GitHub DNS 검증 경고가 나올 수 있음 — `tech.zzizily.com`이 동일 조건에서 동작 중이므로 무시 (spec 리스크 항목)

- [ ] **Step 3: 최종 검증**

```bash
sleep 60  # DNS·인증서 전파 대기
curl -sI https://ariadm.zzizily.com | head -8
curl -s https://ariadm.zzizily.com | grep -c 'data-en='
```

Expected: HTTP 200 (`server: cloudflare`), `data-en` 35. 실패 시 3-Strike: ① dig A ariadm.zzizily.com → CF IP(104.x/172.x) 확인 ② `gh api /repos/deuxksy/AriaDM/pages`에서 cname·https_enforced 확인 ③ CF→GitHub 라우팅은 cname 등록 직후 수 분 소요 가능 — 5분 후 재시도

- [ ] **Step 4: 양 repo 상태 정리·기록**

```bash
cd ~/git/cloudflare-domain-zzizily && git branch -d feat/ariadm-pages && git checkout main && git pull
cd ~/git/AriaDownloaderMananger
git tag -a checkpoint-website-v1 -m "랜딩 페이지 배포 완료 checkpoint"
```

---

## 완료 기준 (spec 검증 체크리스트 매핑)

| Spec 항목 | 달성 task |
| :--- | :--- |
| 로컬 모바일·데스크톱 확인 | Task 3 Step 2 |
| 언어 토글 (버튼·?lang=·localStorage) | Task 4 Step 2 |
| 링크 전수 | Task 2 Step 2 + Task 5 Step 3 |
| 배포 1차 (github.io 200) | Task 5 Step 3 |
| 최종 도메인 200 + 인증서 | Task 6 Step 3 |
