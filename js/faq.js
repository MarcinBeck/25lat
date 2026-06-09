// Accordion FAQ
document.querySelectorAll('.faq__question').forEach(btn => {
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    const answerId = btn.getAttribute('aria-controls');
    const answer   = document.getElementById(answerId);

    btn.setAttribute('aria-expanded', String(!expanded));
    answer.hidden = expanded;
  });
});
