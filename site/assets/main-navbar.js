/* Scoped navigation only: no transport, tracking, storage, or lead UI. */
(function () {
  'use strict';
  document.addEventListener('DOMContentLoaded', function () {
    var header = document.querySelector('[data-main-navbar]');
    if (!header || header.dataset.navReady) return;
    header.dataset.navReady = 'true';
    var button = header.querySelector('.jc-main-toggle');
    var nav = header.querySelector('.jc-main-links');
    var programs = header.querySelector('[data-main-programs]');
    var mobile = window.matchMedia('(max-width: 1100px)');
    function offset() {
      header.style.setProperty('--jc-main-top', Math.max(0, header.getBoundingClientRect().bottom) + 'px');
    }
    function setOpen(open, restore) {
      header.toggleAttribute('data-open', open);
      document.body.classList.toggle('jc-main-open', open);
      button.setAttribute('aria-expanded', String(open));
      button.textContent = open ? 'Close' : 'Menu';
      if (open) offset();
      else programs.open = false;
      if (restore) button.focus();
    }
    button.addEventListener('click', function () { setOpen(!header.hasAttribute('data-open'), false); });
    nav.addEventListener('click', function (event) { if (event.target.closest('a')) setOpen(false, false); });
    document.addEventListener('click', function (event) { if (!programs.contains(event.target)) programs.open = false; });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        if (programs.open) { programs.open = false; programs.querySelector('summary').focus(); }
        else if (header.hasAttribute('data-open')) setOpen(false, true);
      }
      if (event.key === 'Tab' && header.hasAttribute('data-open')) {
        var focusable = Array.from(header.querySelectorAll('a,button,summary')).filter(function (el) { return el.getClientRects().length; });
        var first = focusable[0], last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
    window.addEventListener('resize', function () { if (!mobile.matches) setOpen(false, false); else offset(); });
    if (window.visualViewport) window.visualViewport.addEventListener('resize', offset);
  });
})();
