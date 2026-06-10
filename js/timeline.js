document.addEventListener('DOMContentLoaded', () => {
  const track    = document.getElementById('timeline-track');
  const viewport = document.querySelector('.tl-viewport');
  const prevBtn  = document.getElementById('tl-prev');
  const nextBtn  = document.getElementById('tl-next');
  const modal    = document.getElementById('event-modal');
  const mBody    = document.getElementById('event-modal-body');

  const MO = ['','sty','lut','mar','kwi','maj','cze','lip','sie','wrz','paź','lis','gru'];
  const MF = ['','stycznia','lutego','marca','kwietnia','maja','czerwca','lipca','sierpnia','września','października','listopada','grudnia'];

  const isPast    = ev => new Date(ev.dateTo)   < TODAY;
  const isOngoing = ev => new Date(ev.dateFrom) <= TODAY && TODAY <= new Date(ev.dateTo);

  function fmtRange(from, to) {
    const f = new Date(from), t = new Date(to);
    if (f.getMonth() === t.getMonth())
      return `${f.getDate()}–${t.getDate()} ${MO[f.getMonth()+1]}`;
    return `${f.getDate()} ${MO[f.getMonth()+1]} – ${t.getDate()} ${MO[t.getMonth()+1]}`;
  }

  function fmtRangeLong(from, to) {
    const f = new Date(from), t = new Date(to);
    if (f.getMonth() === t.getMonth())
      return `${f.getDate()}–${t.getDate()} ${MF[f.getMonth()+1]} ${f.getFullYear()}`;
    return `${f.getDate()} ${MF[f.getMonth()+1]} – ${t.getDate()} ${MF[t.getMonth()+1]} ${t.getFullYear()}`;
  }

  let todayEl = null;
  let offset  = 0;

  EVENTS.forEach(ev => {
    const past    = isPast(ev);
    const ongoing = isOngoing(ev);

    if (!todayEl && !past && !ongoing) {
      todayEl = document.createElement('div');
      todayEl.className = 'tl-today';
      todayEl.innerHTML = `<div class="tl-today__line"></div><div class="tl-today__dot"></div><span class="tl-today__label">DZIŚ</span>`;
      track.appendChild(todayEl);
    }

    const state = past ? 'past' : ongoing ? 'ongoing' : 'future';
    const card  = document.createElement('article');
    card.className = `tl-card tl-card--${state}`;
    card.setAttribute('role', 'listitem');
    card.setAttribute('tabindex', '0');

    const typeBadge = ev.type === 'Beauty Street Pop Up' ? 'BSP' : 'MUC';

    const df = new Date(ev.dateFrom), dt = new Date(ev.dateTo);
    const datePin = df.getMonth() === dt.getMonth()
      ? `${df.getDate()}–${dt.getDate()}.${String(df.getMonth()+1).padStart(2,'0')}`
      : `${df.getDate()}.${String(df.getMonth()+1).padStart(2,'0')}–${dt.getDate()}.${String(dt.getMonth()+1).padStart(2,'0')}`;

    card.innerHTML = `
      <div class="tl-card__inner">
        <span class="tl-card__type tl-card__type--${typeBadge.toLowerCase()}">${typeBadge}</span>
        <div class="tl-card__date">${fmtRange(ev.dateFrom, ev.dateTo)}</div>
        <div class="tl-card__name">${ev.mall}</div>
        <div class="tl-card__city">📍 ${ev.city}</div>
        ${past    ? '<div class="tl-card__done">✓ Odbyło się</div>'  : ''}
        ${ongoing ? '<div class="tl-card__done tl-card__done--live">● Trwa teraz</div>' : ''}
      </div>
      <div class="tl-card__stem"></div>
      <div class="tl-card__dot"></div>
      <div class="tl-card__month">${datePin}</div>`;

    card.addEventListener('click',   () => openModal(ev));
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openModal(ev); });
    track.appendChild(card);
  });

  if (!todayEl) {
    todayEl = document.createElement('div');
    todayEl.className = 'tl-today';
    todayEl.innerHTML = `<div class="tl-today__line"></div><div class="tl-today__dot"></div><span class="tl-today__label">DZIŚ</span>`;
    track.appendChild(todayEl);
  }

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
    const card    = track.querySelector('.tl-card');
    const gap     = parseInt(getComputedStyle(track).gap) || 16;
    const cardStep = card ? card.offsetWidth + gap : 218;
    applyOffset(dir === 'next' ? offset + cardStep : offset - cardStep);
  }

  prevBtn.addEventListener('click', () => step('prev'));
  nextBtn.addEventListener('click', () => step('next'));

  // Ustaw widok na DZIŚ przy załadowaniu
  requestAnimationFrame(() => {
    if (todayEl) {
      const center = viewport.offsetWidth / 2;
      applyOffset(todayEl.offsetLeft - center + todayEl.offsetWidth / 2);
    } else {
      updateBtns();
    }
  });

  function openModal(ev) {
    const past    = isPast(ev);
    const ongoing = isOngoing(ev);
    mBody.innerHTML = `
      <div class="modal__badges">
        <span class="modal__type">${ev.type}</span>
        <span class="modal__cat">Kat. ${ev.cat}</span>
      </div>
      <h3 class="modal__title">${ev.mall}</h3>
      <div class="modal__meta">
        <span>📅 ${fmtRangeLong(ev.dateFrom, ev.dateTo)}</span>
        <span>📍 ${ev.city}</span>
        <span>🏪 Sklep nr ${ev.store}</span>
      </div>
      ${ongoing ? '<p class="modal__ongoing">● Ten event trwa właśnie teraz!</p>' : ''}
      ${past    ? '<p class="modal__past-note">Ten event już się odbył.</p>'      : ''}`;
    modal.showModal();
  }

  document.getElementById('event-modal-close').addEventListener('click', () => modal.close());
  modal.addEventListener('click', e => { if (e.target === modal) modal.close(); });
});
