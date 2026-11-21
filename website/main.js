// AriaDM 랜딩 언어 토글 — 우선순위: ?lang= > localStorage > 기본 영어
(function () {
  var KEY = 'ariadm-lang';

  function apply(lang) {
    document.documentElement.lang = lang;
    localStorage.setItem(KEY, lang);
    document.querySelectorAll('[data-ko]').forEach(function (el) {
      if (!el.dataset.en) el.dataset.en = el.textContent; // 첫 스왑 전 원문(영어) 보존
      el.textContent = lang === 'ko' ? el.dataset.ko : el.dataset.en;
    });
    var btn = document.getElementById('lang-toggle');
    if (btn) btn.textContent = lang === 'ko' ? 'EN' : '한';
  }

  var param = new URLSearchParams(location.search).get('lang');
  var initial = param === 'en' || param === 'ko'
    ? param
    : localStorage.getItem(KEY) || 'en';

  apply(initial);

  document.getElementById('lang-toggle').addEventListener('click', function () {
    apply(document.documentElement.lang === 'ko' ? 'en' : 'ko');
  });
})();
