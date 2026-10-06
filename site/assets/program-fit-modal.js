(() => {
  const triggers = [...document.querySelectorAll('[data-quiz-modal]')];
  if (!triggers.length || typeof HTMLDialogElement === 'undefined') return;

  const dialog = document.createElement('dialog');
  dialog.className = 'quiz-modal';
  dialog.setAttribute('aria-label', 'Find the right first class');
  dialog.innerHTML = `
    <div class="quiz-modal__shell">
      <button class="quiz-modal__close" type="button" aria-label="Close program quiz">Close <span aria-hidden="true">×</span></button>
      <iframe class="quiz-modal__frame" title="Find the right first class quiz" loading="eager"></iframe>
    </div>`;
  document.body.append(dialog);

  const frame = dialog.querySelector('.quiz-modal__frame');
  const closeButton = dialog.querySelector('.quiz-modal__close');
  let opener = null;

  const close = () => dialog.close();

  // An embedded quiz can move focus into its document. Keep Escape available
  // there as well as on the dialog's own close control (same-origin only).
  frame.addEventListener('load', () => {
    try {
      frame.contentDocument.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && dialog.open) { event.preventDefault(); close(); }
      });
    } catch (_) { /* Cross-origin fallbacks retain the visible close button. */ }
  });

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      if (!dialog.showModal) return;
      event.preventDefault();
      opener = trigger;
      frame.src = trigger.href;
      dialog.showModal();
      document.documentElement.classList.add('quiz-modal-open');
      closeButton.focus();
      window.dataLayer = window.dataLayer || [];
      const routeSource = new URL(trigger.href, window.location.href).searchParams.get('source') || 'unknown';
      window.dataLayer.push({ event: 'quiz_modal_open', quiz_name: 'program_fit', route_source: routeSource.replace(/-/g, '_') });
    });
  });

  closeButton.addEventListener('click', close);
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) close();
  });
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('quiz-modal-open');
    frame.removeAttribute('src');
    if (opener) opener.focus();
  });
})();
