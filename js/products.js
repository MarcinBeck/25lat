document.addEventListener('DOMContentLoaded', () => {
  const viewport = document.querySelector('.prod-viewport');
  const track    = document.querySelector('.prod-track');
  const prevBtn  = document.getElementById('prod-prev');
  const nextBtn  = document.getElementById('prod-next');

  if (!viewport || !track || !prevBtn || !nextBtn) return;

  let offset = 0;

  function maxOff() {
    return Math.max(0, track.scrollWidth - viewport.offsetWidth);
  }

  function applyOffset(v) {
    offset = Math.max(0, Math.min(v, maxOff()));
    track.style.transform = `translateX(-${offset}px)`;
    updateBtns();
  }

  function updateBtns() {
    prevBtn.disabled = offset <= 0;
    nextBtn.disabled = offset >= maxOff() - 1;
  }

  function step(dir) {
    const card = track.querySelector('.product-card');
    const gap  = parseInt(getComputedStyle(track).gap) || 24;
    const cardStep = card ? card.offsetWidth + gap : 304;
    applyOffset(dir === 'next' ? offset + cardStep : offset - cardStep);
  }

  prevBtn.addEventListener('click', () => step('prev'));
  nextBtn.addEventListener('click', () => step('next'));
  updateBtns();
});
