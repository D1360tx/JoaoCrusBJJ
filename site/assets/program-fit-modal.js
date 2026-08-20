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
      window.dataLayer.push({ event: 'quiz_modal_open', quiz_name: 'program_fit', source: 'practice_under_pressure' });
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
