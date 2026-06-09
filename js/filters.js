document.addEventListener('DOMContentLoaded', () => {
  const tabs       = document.querySelectorAll('.view-tab');
  const viewTL     = document.getElementById('view-timeline');
  const viewMap    = document.getElementById('view-map');
  const citySelect = document.getElementById('filter-city');
  const typeSelect = document.getElementById('filter-type');

  // Populacja selecta miast (z eventów, posortowane)
  const cities = [...new Set(EVENTS.map(e => e.city))].sort();
  cities.forEach(c => {
    const o = document.createElement('option');
    o.value = c; o.textContent = c;
    citySelect.appendChild(o);
  });

  // Tab toggle
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => { t.classList.remove('view-tab--active'); t.setAttribute('aria-selected','false'); });
      tab.classList.add('view-tab--active');
      tab.setAttribute('aria-selected','true');
      const view = tab.dataset.view;
      viewTL.hidden = (view !== 'timeline');
      viewMap.hidden = (view !== 'map');
    });
  });

  // Filtry odświeżają mapę (ukrywają/pokazują punkty miast)
  function applyFilters() {
    const city = citySelect.value;
    const type = typeSelect.value;
    document.querySelectorAll('.map-city').forEach(g => {
      const label = g.getAttribute('aria-label') || '';
      const cityName = label.split(' —')[0].trim();
      const cityEvs = EVENTS.filter(ev =>
        ev.city === cityName &&
        (!city || ev.city === city) &&
        (!type || ev.type === type)
      );
      g.style.display = cityEvs.length ? '' : 'none';
    });
  }

  [citySelect, typeSelect].forEach(el => {
    el.addEventListener('change', applyFilters);
  });
});
