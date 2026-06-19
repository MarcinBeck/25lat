document.addEventListener('DOMContentLoaded', async () => {
    // 1. Ładowanie globalnych komponentów (Header, Footer, Widgety)
    await loadGlobalComponents();

    // 2. Skrypt widgetu ze strony głównej (ukrywanie przeszłych wydarzeń)
    filterPastEventsInWidget();

    // 3. Główna inicjalizacja interakcji (filtry, mapy, karuzele)
    initApp();
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
                placeholder.innerHTML = `<div style="background:#ffcccc; color:red; padding:20px; margin: 10px 0; text-align:center; font-weight:bold; border:2px solid red;">
                    BŁĄD 404: Nie znaleziono pliku <u>${file}</u>. Upewnij się, że plik znajduje się w tym samym folderze.
                </div>`;
            }
        } catch (error) {
            placeholder.innerHTML = `<div style="background:#ffcccc; color:red; padding:20px; margin: 10px 0; text-align:center; font-weight:bold; border:2px solid red;">
                BŁĄD ZABEZPIECZEŃ (CORS). Zablokowano pobieranie pliku <u>${file}</u>.<br>
                Użyj wtyczki Live Server, aby otworzyć stronę.
            </div>`;
            console.error(`Błąd przy pobieraniu ${file}:`, error);
        }
    }

    // Ładujemy pliki po kolei
    await fetchAndReplace('header.html', 'header-placeholder');
    await fetchAndReplace('events-widget.html', 'events-widget-placeholder');
    await fetchAndReplace('footer.html', 'footer-placeholder');

    // Ustawianie stanu "active" dla nowego menu w headerze na wszystkich podstronach
    const path = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.global-nav a');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === path) {
            link.classList.add('active');
        } else if ((path === '' || path === 'index.html') && href === 'index.html') {
            link.classList.add('active');
        }
    });
}

function filterPastEventsInWidget() {
    const widgetCards = document.querySelectorAll('#zajawka-eventy .event-card');
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    
    widgetCards.forEach(card => {
        const endDateStr = card.getAttribute('data-end-date');
        if(endDateStr) {
            const endDate = new Date(endDateStr);
            if(endDate < today) {
                card.style.display = 'none';
                card.classList.add('past-event-hidden'); 
            }
        }
    });
}

function initApp() {
    // --- 1. Obsługa Dropdown w starym menu nawigacyjnym ---
    const dropdownParent = document.querySelector('.has-dropdown');
    const iconCarousel = document.querySelector('.icon-menu-carousel');

    if (dropdownParent) {
        dropdownParent.addEventListener('click', (e) => {
            // Kliknięcie pozycji w rozwiniętym dropdown → nawiguj normalnie
            if (e.target.closest('.dropdown-menu')) return;
            e.preventDefault();
            dropdownParent.classList.toggle('is-open');
        });

        document.addEventListener('click', (e) => {
            if (!dropdownParent.contains(e.target)) {
                dropdownParent.classList.remove('is-open');
            }
        });
    }

    // --- 1b. Hamburger — mobile nav panel ---
    const hamburger = document.getElementById('nav-hamburger');
    const mobilePanel = document.getElementById('nav-mobile-panel');
    if (hamburger && mobilePanel) {
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = mobilePanel.classList.toggle('is-open');
            hamburger.classList.toggle('is-open', isOpen);
            hamburger.setAttribute('aria-expanded', String(isOpen));
        });
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !mobilePanel.contains(e.target)) {
                mobilePanel.classList.remove('is-open');
                hamburger.classList.remove('is-open');
                hamburger.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // --- 2. Logika Podstrony Eventy: Dynamiczne Karuzele i Filtry na Mapie ---
    const masterData = document.getElementById('master-events-data');
    const viewMap = document.getElementById('view-map');
    const eventsListGrid = document.getElementById('events-list-grid');
    
    if (masterData || viewMap || eventsListGrid) {
        
        // Renderowanie z Master Data do trzech list: Trwa, Nadchodzące, Zakończone
        if (masterData) {
            const allCards = Array.from(masterData.querySelectorAll('.event-card'));
            const containerOngoing = document.getElementById('carousel-ongoing');
            const containerUpcoming = document.getElementById('carousel-upcoming');
            const containerPast = document.getElementById('carousel-past');
            
            if(containerOngoing) containerOngoing.innerHTML = '';
            if(containerUpcoming) containerUpcoming.innerHTML = '';
            if(containerPast) containerPast.innerHTML = '';

            const today = new Date();
            today.setHours(0,0,0,0);

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
                        if(cta) {
                            cta.style.pointerEvents = 'none';
                            cta.style.color = 'var(--text-muted)';
                            cta.style.borderColor = 'var(--text-muted)';
                            cta.innerHTML = 'Wydarzenie Zakończone';
                        }
                    } else if (today >= startDate && today <= endDate) {
                        statusClass = 'status-ongoing';
                        targetContainer = containerOngoing;
                        const cta = card.querySelector('.cta-link');
                        if(cta) {
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

                    if(targetContainer) {
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
            
            // Filtrowanie Mapy
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

            // Filtrowanie Karuzel w Widoku Listy
            let totalVisible = 0;
            ['ongoing', 'upcoming', 'past'].forEach(groupName => {
                const groupContainer = document.getElementById(`group-${groupName}`);
                const carousel = document.getElementById(`carousel-${groupName}`);
                if(!groupContainer || !carousel) return;

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

                // Ukrywamy cały rząd jeśli 0 elementów
                groupContainer.style.display = visibleCount > 0 ? 'block' : 'none';

                // Ukrywamy strzałki jeśli elementów za mało na karuzelę
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

        // Obsługa Modala Mapy
        if (viewMap) {
            const mapPins = viewMap.querySelectorAll('.map-pin');
            const today = new Date();
            today.setHours(0,0,0,0);

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
                    if(!modal) return;
                    
                    modal.querySelector('#popup-name').innerText = venue;
                    modal.querySelector('#popup-city').innerText = city;
                    modal.querySelector('#popup-date').innerText = dateStr;
                    
                    const card = modal.querySelector('.map-popup-card');
                    card.classList.remove('status-past', 'status-ongoing', 'status-upcoming');
                    card.classList.add(statusClass);

                    const cta = modal.querySelector('#popup-cta');
                    if(cta) cta.href = link;
                    
                    if(statusClass === 'status-past') {
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
                    if(el) el.style.display = (id === targetId) ? 'block' : 'none';
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
            return {
                element: item,
                year: parseInt(item.getAttribute('data-year')),
                isPl: item.getAttribute('data-pl') === 'true'
            };
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

    // --- 7. Logika Beauty: Filtrowanie mozaiki produktów (podstrona beauty.html) ---
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
                    <span class="promo-badge">TYLKO W DOUGLAS</span>
                    <span class="promo-badge">+ PREZENT GRATIS</span>
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
                if(filterMsg) filterMsg.innerText = `Filtrujemy po: ${brand}`;
            });
        });
        renderProducts(); 
    }

} // Koniec funkcji initApp()