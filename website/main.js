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
