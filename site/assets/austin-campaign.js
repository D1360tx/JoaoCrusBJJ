(() => {
  const attributionKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'utm_id', 'gclid', 'fbclid'];
  const currentParams = new URLSearchParams(window.location.search);
  const quizLinks = [...document.querySelectorAll('[data-austin-quiz]')];
  const year = document.querySelector('[data-year]');
  const mobileCta = document.querySelector('[data-mobile-cta]');
  const heroCta = document.querySelector('.mk-hero');
  const finalSection = document.querySelector('.mk-final');

  // Meta's in-app browser can reuse a WebView and restore this dedicated ad
  // page to the visitor's previous scroll position. Paid entries should always
  // begin at the hero unless an intentional hash target is present.
  const resetAdEntryScroll = () => {
    if (!window.location.hash) window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  };

  if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
  resetAdEntryScroll();
  window.addEventListener('pageshow', () => {
    resetAdEntryScroll();
    window.requestAnimationFrame(resetAdEntryScroll);
  });

  if (year) year.textContent = new Date().getFullYear();

  quizLinks.forEach((link) => {
    const target = new URL(link.href, window.location.href);
    attributionKeys.forEach((key) => {
      const value = currentParams.get(key);
      if (value && !target.searchParams.has(key)) target.searchParams.set(key, value);
    });
    link.href = target.pathname + target.search + target.hash;
  });

  if (mobileCta && heroCta && finalSection && 'IntersectionObserver' in window) {
    const isVisible = (element) => {
      const rect = element.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < window.innerHeight;
    };
    const sync = () => mobileCta.classList.toggle('is-visible', !isVisible(heroCta) && !isVisible(finalSection) && !isVisible(document.querySelector('.austin-schedule')) && !document.documentElement.classList.contains('quiz-modal-open'));

    new IntersectionObserver(sync, { threshold: 0.05 }).observe(heroCta);
    new IntersectionObserver(sync, { threshold: 0.05 }).observe(finalSection);

    window.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    sync();
  }
})();
