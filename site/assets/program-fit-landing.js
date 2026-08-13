(() => {
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();

  const attributionKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid'];
  const params = new URLSearchParams(window.location.search);
  const attribution = new URLSearchParams();
  attributionKeys.forEach((key) => {
    const value = params.get(key);
    if (value) attribution.set(key, value);
  });

  document.querySelectorAll('[data-quiz-cta]').forEach((link) => {
    const url = new URL(link.getAttribute('href'), window.location.href);
    attribution.forEach((value, key) => url.searchParams.set(key, value));
    link.href = url.href;
    link.addEventListener('click', () => {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'program_fit_landing_cta',
        placement: url.searchParams.get('source') || 'unknown'
      });
    });
  });

  const mobileCta = document.querySelector('[data-mobile-cta]');
  const heroCta = document.querySelector('.lp-hero [data-quiz-cta]');
  const final = document.querySelector('.lp-final');
  if (mobileCta && heroCta && 'IntersectionObserver' in window) {
    let heroVisible = true;
    let finalVisible = false;
    const sync = () => mobileCta.classList.toggle('is-visible', !heroVisible && !finalVisible);
    const heroObserver = new IntersectionObserver(([entry]) => {
      heroVisible = entry.isIntersecting;
      sync();
    }, { threshold: 0 });
    const finalObserver = new IntersectionObserver(([entry]) => {
      finalVisible = entry.isIntersecting;
      sync();
    }, { threshold: 0 });
    heroObserver.observe(heroCta);
    if (final) finalObserver.observe(final);
  }
})();
