# AriaDM 웹사이트(랜딩 페이지) 설계

- 날짜: 2026-08-22
- 상태: 승인 (사용자 확정 15:58 — 스크린샷 3장 실물 전달, 다크 풀, 미니멀 JS i18n, AriaDM 모노레포)
- 산출물: AriaDM repo `website/` 디렉터리

## 목표

AriaDM 공개 랜딩 페이지 — 기능 소개, 다운로드 안내, 오픈소스·후원 유도. 영어+한국어 토글. 프레임워크 없는 순수 HTML+CSS(+i18n용 ~10줄 JS).

## 비목표 (YAGNI)

- 라이트 테마 스위치, 블로그, 분석 트래킹, 프레임워크·빌드 도구 체인
- 스토어 직접 링크 — "준비중" 배지로 대체 (등록 후 교체)

## 구조

```text
website/
  index.html          — 싱글 페이지 (섹션 6개, 한국어 기본 마크업)
  style.css           — 다크 테마 단일 파일 (목표 <15KB)
  main.js             — 언어 토글 (~10줄)
  assets/
    favicon.png       — 기존 assets/favicon.png 복사
    shot-downloads.webp  — IMG_3450 변환
    shot-settings.webp   — IMG_3451 변환
    shot-add.webp        — IMG_3452 변환
  CNAME                — ariadm.zzizily.com (배포 루트 — assets/ 내부는 인식 안 됨)
.github/workflows/website.yml  — website/ → GitHub Pages 배포
```

## 배포/DNS

1. **배포**: GitHub Actions(`actions/upload-pages-artifact` + `deploy-pages`)가 `website/`를 Pages에 배포. 트리거: main push 중 `website/**`·워크플로우 변경, + `workflow_dispatch`
2. **DNS**: `cloudflare-domain-zzizily` repo `domain/root/record-cname.tf`에 `ariadm` 리소스 추가 — `CNAME → deuxksy.github.io`, `proxied = true`, `ttl = 1` (`tech` 패턴 준수 — proxied GitHub Pages 실측 HTTP/2 200 검증됨)
3. **GitHub 설정**: AriaDM repo Pages에 custom domain 등록 (`gh api -X PUT /repos/deuxksy/AriaDM/pages -f cname=ariadm.zzizily.com`) + Enforce HTTPS
4. **순서**: ① website/ 구현 → ② Actions 배포, `https://deuxksy.github.io/AriaDM` 200 확인 → ③ DNS IaC push(자동 tofu apply) + custom domain 등록 → ④ `https://ariadm.zzizily.com` 200 확인

### 리스크

- proxied CNAME이 CF IP로 resolve되어 GitHub Pages 설정의 DNS 검증 경고 발생 가능 — `tech`가 동일 조건에서 동작 중이므로 무시. Edge TLS는 Cloudflare가 종단(주황 구름)이므로 GitHub측 Let's Encrypt 발급 의존 없음

## 페이지 섹션

| # | 섹션 | 내용 |
| :--- | :--- | :--- |
| 1 | Nav | sticky + 반투명 blur — 로고, EN/한 토글, GitHub 링크 |
| 2 | Hero | 헤드라인 + 스크린샷 3장(Downloads/Settings/Add) CSS 폰 프레임 — 데스크톱 3열, 모바일 가로 스크롤. MIT·star badge |
| 3 | Features | 무료(기준선 요약) / Pro($9.99 평생) / Cloud($0.99/월) 카드 3열 → 모바일 1열. `ROADMAP.md` 기반 |
| 4 | Download | App Store·Google Play "준비중" 배지 + GitHub Releases ipa 사이드로드 가이드(AltStore/Sideloadly) |
| 5 | Open Source | MIT, GitHub 링크, AriaNg(MIT) 용어 attribution, GitHub Sponsors 버튼 |
| 6 | Footer | Roadmap 링크, 라이선스, © 2026 |

## 비주얼 — 다크 풀

| 토큰 | 값 |
| :--- | :--- |
| bg | `#0B0E14` |
| 카드 | `#151A23` |
| accent | `#4C9EFF` (iOS 블루 다크 보정) |
| 텍스트 | `#E6E9EF` / muted `#8B93A3` |

- 폰 프레임: radius 40 + 테두리 + 은은한 glow — 라이트 스크린샷과 다크 배경의 대비 활용
- system font stack, 모바일 우선 반응형 (375px 기준 설계 → 데스크톱 확장)

## i18n — 미니멀 JS

- 텍스트 노드에 `data-en`/`data-ko` 속성, `textContent` 스왑 (텍스트 양이 적어 가장 단순한 방식)
- 초기 언어 결정 순서: `?lang=` 파라미터 > `localStorage('ariadm-lang')` > `navigator.language` (ko→ko, else en)
- HTML 마크업은 한국어 기본 (LCP·noscript 대응)

## 성능/SEO

- 스크린샷 WebP 변환 목표 ~150KB/장 (원본 1125×2436 PNG)
- Hero 첫 장 `eager`+`fetchpriority="high"`, 나머지 `loading="lazy"`
- `og:title`·`og:description`·`og:image`, canonical `https://ariadm.zzizily.com`
- 목표: Lighthouse 95+, CSS <15KB, JS ~10줄

## 검증 체크리스트

- [ ] 로컬 `python3 -m http.server` + Chrome DevTools — 모바일(375px)·데스크톱 뷰포트 확인
- [ ] 언어 토글 — 버튼 동작, `?lang=` 직접 링크, localStorage 기억
- [ ] 링크 전수 — Releases v0.1.0, GitHub repo, Sponsors, ROADMAP.md
- [ ] 배포 1차 — `https://deuxksy.github.io/AriaDM` 200
- [ ] DNS 적용 후 — `https://ariadm.zzizily.com` 200 + 정상 인증서
