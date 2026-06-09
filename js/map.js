document.addEventListener('DOMContentLoaded', () => {
  const citiesG = document.getElementById('map-cities');
  const modal   = document.getElementById('event-modal');
  const mBody   = document.getElementById('event-modal-body');

  const MF = ['','stycznia','lutego','marca','kwietnia','maja','czerwca','lipca','sierpnia','września','października','listopada','grudnia'];
  const isPast    = ev => new Date(ev.dateTo)   < TODAY;
  const isOngoing = ev => new Date(ev.dateFrom) <= TODAY && TODAY <= new Date(ev.dateTo);

  function fmtRangeLong(from, to) {
    const f = new Date(from), t = new Date(to);
    if (f.getMonth() === t.getMonth())
      return `${f.getDate()}–${t.getDate()} ${MF[f.getMonth()+1]} ${f.getFullYear()}`;
    return `${f.getDate()} ${MF[f.getMonth()+1]} – ${t.getDate()} ${MF[t.getMonth()+1]} ${t.getFullYear()}`;
  }

  const NS = 'http://www.w3.org/2000/svg';

  function svgEl(tag, attrs) {
    const el = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k,v]) => el.setAttribute(k, v));
    return el;
  }

  CITIES.forEach(city => {
    const evs = EVENTS.filter(e => e.city === city.name);
    if (!evs.length) return;

    const cx = city.cx, cy = city.cy;

    const g = svgEl('g', {
      class: 'map-city',
      tabindex: '0',
      role: 'button',
      'aria-label': `${city.name} — ${evs.length} ${evs.length === 1 ? 'event' : 'eventy'}`
    });

    // Soft drop shadow
    g.appendChild(svgEl('circle', { class: 'map-city__shadow', cx: cx + 1.5, cy: cy + 2, r: '13' }));

    // Pink sticker circle
    g.appendChild(svgEl('circle', { class: 'map-city__sticker', cx, cy, r: '13' }));

    // Event count
    const num = svgEl('text', { class: 'map-city__count', x: cx, y: cy + 1 });
    num.textContent = evs.length;
    g.appendChild(num);

    // City name (hidden until hover)
    const lbl = svgEl('text', { class: 'map-city__label', x: cx, y: cy - 17 });
    lbl.textContent = city.name;
    g.appendChild(lbl);

    g.addEventListener('click', () => showCityModal(city, evs));
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') showCityModal(city, evs); });

    citiesG.appendChild(g);
  });

  function showCityModal(city, evs) {
    const count = evs.length;
    mBody.innerHTML = `
      <div class="modal__badges">
        <span class="modal__type">📍 ${city.name}</span>
        <span class="modal__cat">${count} ${count === 1 ? 'event' : 'eventy'}</span>
      </div>
      <h3 class="modal__title">${city.name}</h3>
      <ul class="map-modal__list">
        ${evs.map(ev => {
          const past    = isPast(ev);
          const ongoing = isOngoing(ev);
          return `<li class="map-modal__item">
            <span class="modal__type" style="font-size:.65rem">${ev.type === 'Beauty Street Pop Up' ? 'BSP' : 'MUC'} — ${ev.type}</span>
            <div class="map-modal__mall">${ev.mall}</div>
            <div class="modal__meta">
              <span>📅 ${fmtRangeLong(ev.dateFrom, ev.dateTo)}</span>
              <span>🏪 Sklep nr ${ev.store}</span>
            </div>
            ${ongoing ? '<p class="modal__ongoing">● Trwa właśnie teraz!</p>' : ''}
            ${past    ? '<p class="modal__past-note">Odbyło się</p>' : ''}
          </li>`;
        }).join('')}
      </ul>`;
    modal.showModal();
  }
});
