document.addEventListener('DOMContentLoaded', async () => {
    // 1. Ładowanie globalnych komponentów (Header, Footer, Widgety)
    await loadGlobalComponents();
    // 1a. Inicjalizacja poprawnie scrollującego się headera
    initSmartHeader();
    // 2. Skrypt widgetu ze strony głównej (ukrywanie przeszłych wydarzeń)
    filterPastEventsInWidget();
    // 2a. Obsługa wspólnych zdarzeń kliknięć i przycisków
    initCommonPageHandlers();
    // 3. Główna inicjalizacja interakcji (filtry, mapy, karuzele)
    initApp();
    // 4. Inicjalizacja licznika countdown widgetu
    initCountdown();
});

async function loadGlobalComponents() {
    async function fetchAndReplace(file, placeholderId) {
        const placeholder = document.getElementById(placeholderId);
        if (!placeholder) return;
        try {
            const response = await fetch(file);
            if (response.ok) {
                const html = await response.text();
                placeholder.outerHTML = html;
            } else {
                placeholder.innerHTML = `BŁĄD 404: Nie znaleziono pliku <u>${file}</u>. Upewnij się, że plik znajduje się w tym samym folderze.`;
            }
        } catch (error) {
            placeholder.innerHTML = `BŁĄD ZABEZPIECZEŃ (CORS). Zablokowano pobieranie pliku <u>${file}</u>. Użyj wtyczki Live Server, aby otworzyć stronę.`;
            console.error(`Błąd przy pobieraniu ${file}:`, error);
        }
    }

    await fetchAndReplace('header.html', 'header-placeholder');
    initMobileMenu();
    await fetchAndReplace('events-widget.html', 'events-widget-placeholder');
    await fetchAndReplace('countdown-widget.html', 'countdown-widget-placeholder');
    await fetchAndReplace('questions-widget.html', 'questions-widget-placeholder');
    await fetchAndReplace('footer.html', 'footer-placeholder');

    setActiveNavLink();
}

// Logika headera - zachowuje się jak zwykły element (scrolluje się w dół),
// a przy przewijaniu w górę przykleja się i wysuwa z góry.
function initSmartHeader() {
    const header = document.querySelector('.main-header');
    if (!header) return;

    const headerHeight = header.offsetHeight;
    document.body.style.paddingTop = headerHeight + 'px';

    let lastScrollTop = window.scrollY;

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        
        if (scrollTop <= headerHeight) {
            // Na samej górze - powrót do naturalnego osadzenia na stronie (znika z opóźnieniem)
            header.classList.remove('is-fixed', 'is-visible');
        } else if (scrollTop > headerHeight * 1.5) {
            // Jesteśmy niżej - dodajemy status fixed (domyślnie schowany na -100%)
            header.classList.add('is-fixed');
            
            if (scrollTop > lastScrollTop) {
                // Scroll w dół - zachowujemy schowany stan
                header.classList.remove('is-visible');
            } else {
                // Scroll w górę - wysuwamy menu
                header.classList.add('is-visible');
            }
        }
        
        lastScrollTop = Math.max(0, scrollTop);
    }, { passive: true });
}

function filterPastEventsInWidget() {
    const widgetCards = document.querySelectorAll('#zajawka-eventy .event-card');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    widgetCards.forEach(card => {
        const endDateStr = card.getAttribute('data-end-date');
        if (endDateStr) {
            const endDate = new Date(endDateStr);
            if (endDate < today) {
                card.style.display = 'none';
                card.classList.add('past-event-hidden');
            }
        }
    });
}

// === LICZNIK COUNTDOWN (wspólny dla wszystkich podstron) ===
function initCountdown() {
    const daysEl = document.getElementById('home-days');
    const hoursEl = document.getElementById('home-hours');
    const minsEl = document.getElementById('home-mins');
    const secsEl = document.getElementById('home-secs');

    if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

    function getNextSunday() {
        const now = new Date();
        const daysUntilSunday = 7 - now.getDay();
        const nextSunday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (daysUntilSunday === 7 ? 0 : daysUntilSunday));
        nextSunday.setHours(23, 59, 59, 999);
        return nextSunday;
    }

    const targetDate = getNextSunday();

    function updateCounter() {
        const now = new Date();
        const diff = targetDate - now;

        if (diff <= 0) {
            daysEl.textContent = '00';
            hoursEl.textContent = '00';
            minsEl.textContent = '00';
            secsEl.textContent = '00';
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const mins = Math.floor((diff / (1000 * 60)) % 60);
        const secs = Math.floor((diff / 1000) % 60);

        daysEl.textContent = String(days).padStart(2, '0');
        hoursEl.textContent = String(hours).padStart(2, '0');
        minsEl.textContent = String(mins).padStart(2, '0');
        secsEl.textContent = String(secs).padStart(2, '0');
    }

    updateCounter();
    setInterval(updateCounter, 1000);
}

function toggleConsentBox(id, buttonElement) {
    const container = document.getElementById(id);
    if (!container || !buttonElement) return;

    const isExpanded = container.classList.contains('expanded');
    container.classList.toggle('expanded', !isExpanded);
    buttonElement.textContent = isExpanded ? 'Rozwiń' : 'Zwiń';
}

function initMobileMenu() {
    const hamburger = document.getElementById('hamburger-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (!hamburger || !mobileMenu) return;

    hamburger.addEventListener('click', () => {
        const icon = hamburger.querySelector('img');
        if (mobileMenu.style.display === 'block') {
            mobileMenu.style.display = 'none';
            if (icon) icon.src = 'assets/ikony/icon-menu.svg';
        } else {
            mobileMenu.style.display = 'block';
            if (icon) icon.src = 'assets/ikony/icon-close-menu.png';
        }
    });
}

function initCommonPageHandlers() {
    document.addEventListener('click', (e) => {
        const uploadTrigger = e.target.closest('[data-upload-target]');
        if (uploadTrigger) {
            e.preventDefault();
            const targetId = uploadTrigger.dataset.uploadTarget;
            const input = targetId ? document.getElementById(targetId) : null;
            if (input) input.click();
            return;
        }

        const consentBtn = e.target.closest('.toggle-consent-btn');
        if (consentBtn) {
            e.preventDefault();
            const targetId = consentBtn.dataset.toggleTarget;
            if (targetId) toggleConsentBox(targetId, consentBtn);
            return;
        }

        const checkAllTrigger = e.target.closest('#check-all-trigger');
        if (checkAllTrigger) {
            e.preventDefault();
            document.querySelectorAll('.consent-cb').forEach(cb => cb.checked = true);
            return;
        }

        const smoothAnchor = e.target.closest('a[href^="#"]');
        if (smoothAnchor) {
            const href = smoothAnchor.getAttribute('href');
            if (href && href.startsWith('#') && href.length > 1) {
                const targetElement = document.getElementById(href.slice(1));
                if (targetElement) {
                    e.preventDefault();
                    // Offset by the header height to avoid scrolling under the fixed header
                    const headerOffset = document.querySelector('.main-header')?.offsetHeight || 0;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    
                    window.scrollTo({
                         top: offsetPosition,
                         behavior: "smooth"
                    });
                }
            }
        }
    });
}

function setActiveNavLink() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.global-nav a');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === path || ((path === '' || path === 'index.html') && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function initApp() {

    // --- ANIMACJA OBROTU BADGE'A CELEBRATION, IKONY GLOW ORAZ WAHADŁA DLA WITH LOVE ---
    const badgeTextElement = document.querySelector('.badge-text');
    const glowBadgeElement = document.querySelector('.glow-badge');
    const countdownBadgeRotating = document.querySelector('.countdown-badge-rotating');
    const withLoveBadge = document.querySelector('.with-love-badge');

    if (badgeTextElement || glowBadgeElement || countdownBadgeRotating || withLoveBadge) {
        window.addEventListener('scroll', () => {
            const scrollValue = window.scrollY;
            const rotation = scrollValue * 0.15;

            // Pełna rotacja dla okrągłych badges:
            if (badgeTextElement) badgeTextElement.style.transform = `rotate(${rotation}deg)`;
            if (glowBadgeElement) glowBadgeElement.style.transform = `rotate(${rotation}deg)`;
            if (countdownBadgeRotating) countdownBadgeRotating.style.transform = `rotate(${rotation}deg)`;
            
            // Oscylacja od -45st do 45st (wahadło) dla pofalowanego badga With Love
            if (withLoveBadge) {
                const oscillation = Math.sin(scrollValue * 0.004) * 45; 
                withLoveBadge.style.transform = `rotate(${oscillation}deg)`;
            }
        }, { passive: true });
    }

    // --- ANIMACJA SCROLLOWANEJ WSTĄŻKI (MULTIPLE TRACKS) ---
    const marqueeTracks = document.querySelectorAll('.marquee-track-scroll');
    if (marqueeTracks.length > 0) {
        let offset = 0;
        let lastScrollY = window.scrollY;
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            const delta = currentScrollY - lastScrollY;
            lastScrollY = currentScrollY;

            offset += delta * 0.75; 
            
            marqueeTracks.forEach(track => {
                const blockWidth = track.children[0].offsetWidth;
                if(blockWidth > 0) {
                    let boundedOffset = offset % blockWidth;
                    track.style.transform = `translateX(calc(-50% + ${boundedOffset}px))`;
                }
            });
        });
    }

    // --- 1. Obsługa Dropdown w starym menu nawigacyjnym ---
    const dropdownParent = document.querySelector('.has-dropdown');
    const iconCarousel = document.querySelector('.icon-menu-carousel');
    if (dropdownParent) {
        dropdownParent.addEventListener('click', (e) => {
            if (e.target.closest('a')) return;
            e.preventDefault();
            dropdownParent.classList.toggle('is-open');
            if (iconCarousel) {
                iconCarousel.style.overflowX = dropdownParent.classList.contains('is-open') ? 'visible' : 'auto';
            }
        });
        document.addEventListener('click', (e) => {
            if (!dropdownParent.contains(e.target)) {
                dropdownParent.classList.remove('is-open');
                if (iconCarousel) iconCarousel.style.overflowX = 'auto';
            }
        });
    }

    // --- 2. Logika Podstrony Eventy: Dynamiczne Karuzele i Filtry na Mapie ---
    const masterData = document.getElementById('master-events-data');
    const viewMap = document.getElementById('view-map');
    const eventsListGrid = document.getElementById('events-list-grid');
    if (masterData || viewMap || eventsListGrid) {
        if (masterData) {
            const allCards = Array.from(masterData.querySelectorAll('.event-card'));
            const containerOngoing = document.getElementById('carousel-ongoing');
            const containerUpcoming = document.getElementById('carousel-upcoming');
            const containerPast = document.getElementById('carousel-past');
            if (containerOngoing) containerOngoing.innerHTML = '';
            if (containerUpcoming) containerUpcoming.innerHTML = '';
            if (containerPast) containerPast.innerHTML = '';
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            allCards.forEach(card => {
                const startStr = card.getAttribute('data-start-date');
                const endStr = card.getAttribute('data-end-date');
                let targetContainer = null;
                let statusClass = '';
                if (startStr && endStr) {
                    const startDate = new Date(startStr);
                    const endDate = new Date(endStr);
                    if (today > endDate) {
                        statusClass = 'status-past';
                        targetContainer = containerPast;
                        const cta = card.querySelector('.cta-link');
                        if (cta) {
                            cta.style.pointerEvents = 'none';
                            cta.style.color = 'var(--text-muted)';
                            cta.style.borderColor = 'var(--text-muted)';
                            cta.innerHTML = 'Wydarzenie Zakończone';
                        }
                    } else if (today >= startDate && today <= endDate) {
                        statusClass = 'status-ongoing';
                        targetContainer = containerOngoing;
                        const cta = card.querySelector('.cta-link');
                        if (cta) {
                            cta.style.color = 'var(--hover-orange)';
                            cta.style.borderColor = 'var(--hover-orange)';
                            cta.innerHTML = 'Dołącz teraz';
                        }
                    } else {
                        statusClass = 'status-upcoming';
                        targetContainer = containerUpcoming;
                    }
                    card.classList.remove('status-past', 'status-ongoing', 'status-upcoming');
                    card.classList.add(statusClass);
                    if (targetContainer) {
                        targetContainer.appendChild(card.cloneNode(true));
                    }
                }
            });
        }

        const typeTabs = document.querySelectorAll('.type-tabs a');
        const citySelect = document.getElementById('city-select');
        const noEventsMsg = document.getElementById('no-events-msg');

        function applyCombinedFilters() {
            const activeTypeTab = document.querySelector('.type-tabs a.active');
            const activeType = activeTypeTab ? activeTypeTab.getAttribute('data-tab') : 'all';
            const activeCity = citySelect ? citySelect.value : 'all';

            if (viewMap) {
                const mapPins = viewMap.querySelectorAll('.map-pin');
                mapPins.forEach(pin => {
                    const pinType = pin.getAttribute('data-category');
                    const pinCity = pin.getAttribute('data-city');
                    const matchType = (activeType === 'all' || activeType === pinType);
                    const matchCity = (activeCity === 'all' || activeCity === pinCity);
                    pin.style.display = (matchType && matchCity) ? 'flex' : 'none';
                });
            }

            let totalVisible = 0;
            ['ongoing', 'upcoming', 'past'].forEach(groupName => {
                const groupContainer = document.getElementById(`group-${groupName}`);
                const carousel = document.getElementById(`carousel-${groupName}`);
                if (!groupContainer || !carousel) return;
                const groupCards = carousel.querySelectorAll('.event-card');
                let visibleCount = 0;
                groupCards.forEach(card => {
                    const cardType = card.getAttribute('data-category');
                    const cardCity = card.getAttribute('data-city');
                    const matchType = (activeType === 'all' || activeType === cardType);
                    const matchCity = (activeCity === 'all' || activeCity === cardCity);
                    if (matchType && matchCity) {
                        card.style.display = 'flex';
                        visibleCount++;
                        totalVisible++;
                    } else {
                        card.style.display = 'none';
                    }
                });
                groupContainer.style.display = visibleCount > 0 ? 'block' : 'none';
                const arrows = groupContainer.querySelectorAll('.carousel-arrow');
                arrows.forEach(arrow => {
                    arrow.style.display = visibleCount > 1 ? 'flex' : 'none';
                });
            });
            if (noEventsMsg) {
                noEventsMsg.style.display = totalVisible === 0 ? 'block' : 'none';
            }
        }

        if (typeTabs.length > 0) {
            typeTabs.forEach(tab => {
                tab.addEventListener('click', (e) => {
                    e.preventDefault();
                    typeTabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    applyCombinedFilters();
                });
            });
        }
        if (citySelect) {
            citySelect.addEventListener('change', applyCombinedFilters);
        }

        if (viewMap) {
            const mapPins = viewMap.querySelectorAll('.map-pin');
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            mapPins.forEach(pin => {
                const startStr = pin.getAttribute('data-start-date');
                const endStr = pin.getAttribute('data-end-date');
                let statusClass = 'status-upcoming';
                if (startStr && endStr) {
                    const startDate = new Date(startStr);
                    const endDate = new Date(endStr);
                    if (today > endDate) statusClass = 'status-past';
                    else if (today >= startDate && today <= endDate) statusClass = 'status-ongoing';
                }
                pin.classList.add(statusClass);
                pin.addEventListener('click', () => {
                    const venue = pin.getAttribute('data-venue');
                    const city = pin.getAttribute('data-city');
                    const dateStr = pin.getAttribute('data-date-str');
                    const link = pin.getAttribute('data-link');
                    const modal = document.getElementById('map-popup-modal');
                    if (!modal) return;
                    modal.querySelector('#popup-name').innerText = venue;
                    modal.querySelector('#popup-city').innerText = city;
                    modal.querySelector('#popup-date').innerText = dateStr;
                    const card = modal.querySelector('.map-popup-card');
                    card.classList.remove('status-past', 'status-ongoing', 'status-upcoming');
                    card.classList.add(statusClass);
                    const cta = modal.querySelector('#popup-cta');
                    if (cta) cta.href = link;
                    if (statusClass === 'status-past') {
                        cta.style.pointerEvents = 'none';
                        cta.style.color = 'var(--text-muted)';
                        cta.style.borderColor = 'var(--text-muted)';
                        cta.innerHTML = 'Wydarzenie Zakończone';
                    } else if (statusClass === 'status-ongoing') {
                        cta.style.pointerEvents = 'auto';
                        cta.style.color = 'var(--hover-orange)';
                        cta.style.borderColor = 'var(--hover-orange)';
                        cta.innerHTML = 'Dołącz teraz';
                    } else {
                        cta.style.pointerEvents = 'auto';
                        cta.style.color = 'var(--text-color)';
                        cta.style.borderColor = 'var(--text-color)';
                        cta.innerHTML = 'Zapisz się';
                    }
                    modal.style.display = 'flex';
                });
            });
        }
        applyCombinedFilters();
    }

    // --- 3. Przełączanie widoków (Mapa / Lista) ---
    const viewToggleLinks = document.querySelectorAll('.view-toggle a');
    if (viewToggleLinks.length > 0) {
        viewToggleLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const toggleContainer = link.closest('.view-toggle');
                toggleContainer.querySelectorAll('a').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                const targetId = link.getAttribute('data-target');
                ['view-map', 'view-timeline', 'view-list'].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.style.display = (id === targetId) ? 'block' : 'none';
                });
            });
        });
    }

    // --- 4. Taby Wydarzeń z Widgetu na Stronie Głównej ---
    const widgetTabs = document.querySelectorAll('.event-tabs a');
    const widgetCards = document.querySelectorAll('#zajawka-eventy .event-card:not(.past-event-hidden)');
    if (widgetTabs.length > 0 && widgetCards.length > 0) {
        widgetTabs.forEach(tab => {
            const cat = tab.getAttribute('data-tab');
            if (cat !== 'all') {
                const count = Array.from(widgetCards).filter(card => card.getAttribute('data-category') === cat).length;
                if (count === 0) tab.classList.add('disabled');
            }
        });
        widgetTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                if (tab.classList.contains('disabled')) return;
                widgetTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const filter = tab.getAttribute('data-tab');
                widgetCards.forEach(card => {
                    card.style.display = (filter === 'all' || card.getAttribute('data-category') === filter) ? 'flex' : 'none';
                });
            });
        });
    }

    // --- 5. Taby Osi Czasu (Nasza Historia) ---
    const timelineContainer = document.querySelector('.v-timeline');
    const timelineTabs = document.querySelectorAll('.timeline-tabs a');
    if (timelineContainer && timelineTabs.length > 0) {
        const allTimelineItems = Array.from(timelineContainer.querySelectorAll('.v-timeline-item')).map(item => {
            return { element: item, year: parseInt(item.getAttribute('data-year')), isPl: item.getAttribute('data-pl') === 'true' };
        });
        timelineTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                timelineTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const filter = tab.getAttribute('data-tab');
                let filteredItems = [...allTimelineItems];
                if (filter === 'newest') {
                    filteredItems.sort((a, b) => b.year - a.year);
                } else if (filter === 'oldest') {
                    filteredItems.sort((a, b) => a.year - b.year);
                } else if (filter === 'last10') {
                    const currentYear = new Date().getFullYear();
                    filteredItems = filteredItems.filter(item => item.year >= (currentYear - 10));
                    filteredItems.sort((a, b) => a.year - b.year);
                } else if (filter === 'douglas-pl') {
                    filteredItems = filteredItems.filter(item => item.isPl);
                    filteredItems.sort((a, b) => a.year - b.year);
                }
                timelineContainer.innerHTML = '';
                filteredItems.forEach((item, index) => {
                    item.element.classList.remove('left', 'right');
                    item.element.classList.add(index % 2 === 0 ? 'left' : 'right');
                    timelineContainer.appendChild(item.element);
                });
            });
        });
    }

    // --- 6. Taby Urodzinowej Strefy Beauty ---
    const beautyTabs = document.querySelectorAll('.beauty-tabs:not(.event-tabs):not(.timeline-tabs):not(.type-tabs):not(.week-filters) a');
    const beautyCarousel = document.getElementById('beauty-carousel');
    const beautyData = {
        'bestsellery': [
            { brand: 'Prada', name: 'Perfumy' },
            { brand: 'Armani', name: 'Woda toaletowa spray' },
            { brand: 'Versace', name: 'Cień do powiek' },
            { brand: 'L\'Oréal', name: 'Błyszczyk do ust' },
            { brand: 'Lancôme', name: 'Tusz do rzęs' }
        ],
        'ikony': [
            { brand: 'Chanel', name: 'Perfumy' },
            { brand: 'Dior', name: 'Krem na dzień' },
            { brand: 'Estée Lauder', name: 'Serum na noc' },
            { brand: 'YSL', name: 'Podkład' },
            { brand: 'Guerlain', name: 'Puder brązujący' }
        ],
        'virale': [
            { brand: 'Rare Beauty', name: 'Róż w płynie' },
            { brand: 'Fenty Beauty', name: 'Błyszczyk powiększający' },
            { brand: 'Charlotte Tilbury', name: 'Rozświetlacz' },
            { brand: 'Olaplex', name: 'Olejek do włosów' },
            { brand: 'Drunk Elephant', name: 'Krem nawilżający' }
        ]
    };
    if (beautyTabs.length > 0 && beautyCarousel) {
        beautyTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                beautyTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const tabKey = tab.getAttribute('data-tab');
                const products = beautyData[tabKey];
                if (products) {
                    beautyCarousel.innerHTML = products.map(p => `
                        <div class="product-card">
                            <div class="placeholder-img product-img"><span>Zdjęcie produktu</span></div>
                            <div class="brand-name">${p.brand}</div>
                            <div class="product-name">${p.name}</div>
                        </div>
                    `).join('');
                }
            });
        });
    }

    // --- 7. Logika Beauty: Filtrowanie mozaiki produktów ---
    const mosaic = document.getElementById('products-mosaic');
    const brandButtons = document.querySelectorAll('.brand-item');
    const filterMsg = document.getElementById('active-filter-msg');
    if (mosaic && brandButtons.length > 0) {
        const products = [
            { brand: 'Douglas', name: 'Skin Augmenting Hydra Powder', price: '110,00 zł' },
            { brand: 'Douglas', name: 'SERUM FOUNDATION', price: '124,00 zł' },
            { brand: 'Dior', name: 'Capture Totale Serum', price: '450,00 zł' },
            { brand: 'Chanel', name: 'Le Lift Cream', price: '520,00 zł' }
        ];
        function renderProducts(brandFilter = 'all') {
            const filtered = brandFilter === 'all' ? products : products.filter(p => p.brand === brandFilter);
            mosaic.innerHTML = filtered.map(p => `
                <div class="product-item">
                    <div class="placeholder-img product-img-box"><span>Foto</span></div>
                    <span class="brand-name-tag">${p.brand.toUpperCase()}</span>
                    <span class="product-name-tag">${p.name}</span>
                    <span class="promo-badge">TYLKO W DOUGLAS + PREZENT GRATIS</span>
                    <span class="price-tag">${p.price}</span>
                </div>
            `).join('');
        }
        brandButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                brandButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const brand = btn.getAttribute('data-brand');
                renderProducts(brand);
                if (filterMsg) filterMsg.innerText = `Filtrujemy po: ${brand}`;
            });
        });
        renderProducts();
    }
}