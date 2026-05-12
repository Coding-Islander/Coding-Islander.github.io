/**
 * Workshops List - Dynamic workshop listing page
 * Loads workshop data from JSON files and renders filterable cards
 */

document.addEventListener('DOMContentLoaded', async () => {
    const workshopsGrid = document.getElementById('workshops-grid');
    const techFilterBtns = document.querySelectorAll('#tech-filter .filter-btn');
    const typeFilterBtns = document.querySelectorAll('#type-filter .filter-btn');
    
    let allWorkshops = [];
    let currentTechFilter = 'all';
    let currentTypeFilter = 'all';

    // Check URL params for initial filter
    const urlParams = new URLSearchParams(window.location.search);
    const typeParam = urlParams.get('type');
    if (typeParam) {
        currentTypeFilter = typeParam;
        // Update active button
        typeFilterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === typeParam);
        });
    }

    /**
     * Fetch the list of workshop slugs from the index
     */
    async function fetchWorkshopIndex() {
        try {
            const response = await fetch('../data/workshops/workshops.json');
            if (!response.ok) throw new Error('Failed to load workshop index');
            const data = await response.json();
            return data.workshops || [];
        } catch (error) {
            console.error('Error loading workshop index:', error);
            return [];
        }
    }

    /**
     * Fetch individual workshop data
     */
    async function fetchWorkshop(slug) {
        try {
            const response = await fetch(`../data/workshops/${slug}.json`);
            if (!response.ok) throw new Error(`Failed to load workshop: ${slug}`);
            const data = await response.json();
            return { ...data, slug };
        } catch (error) {
            console.error(`Error loading workshop ${slug}:`, error);
            return null;
        }
    }

    /**
     * Get technology filter key (lowercase of technology field)
     */
    function getTechFilterKey(technology) {
        if (!technology) return 'other';
        return technology.toLowerCase();
    }

    /**
     * Create a workshop card HTML
     */
    function createWorkshopCard(workshop) {
        const techFilterKey = getTechFilterKey(workshop.technology);
        const techLabel = workshop.technology || 'Other';
        const isWebinar = workshop.type === 'webinar';
        const isFree = !workshop.paid;
        
        // Determine price display
        let priceHtml = '';
        if (isFree) {
            priceHtml = '<span class="workshop-card__price workshop-card__price--free">Free</span>';
        } else if (workshop.promotionPrice) {
            priceHtml = `
                <span class="workshop-card__price workshop-card__price--promo">
                    <span class="workshop-card__price-original">${workshop.price}</span>
                    ${workshop.promotionPrice}
                </span>
            `;
        } else if (workshop.price) {
            priceHtml = `<span class="workshop-card__price">${workshop.price}</span>`;
        }

        // Image or placeholder
        let imageHtml = '';
        if (workshop.heroImage) {
            imageHtml = `<img src="..${workshop.heroImage}" alt="${workshop.title}" class="workshop-card__image" onerror="this.outerHTML='<div class=\\'workshop-card__image-placeholder\\'><i class=\\'bx bx-code-alt\\'></i></div>'">`;
        } else {
            imageHtml = `<div class="workshop-card__image-placeholder"><i class='bx bx-code-alt'></i></div>`;
        }

        return `
            <a href="details.html?w=${workshop.slug}" class="workshop-card" data-tech="${techFilterKey}" data-type="${workshop.type || 'workshop'}">
                ${imageHtml}
                <div class="workshop-card__content">
                    <div class="workshop-card__badges">
                        <span class="workshop-card__badge workshop-card__badge--${isWebinar ? 'webinar' : 'workshop'}">
                            ${isWebinar ? 'Webinar' : 'Workshop'}
                        </span>
                        <span class="workshop-card__badge workshop-card__badge--tech">${techLabel}</span>
                        ${isFree ? '<span class="workshop-card__badge workshop-card__badge--free">Free</span>' : ''}
                    </div>
                    <h3 class="workshop-card__title">${workshop.title}</h3>
                    <p class="workshop-card__headline">${workshop.headline || ''}</p>
                    <div class="workshop-card__meta">
                        ${priceHtml}
                        <span class="workshop-card__cta">
                            View Details <i class='bx bx-right-arrow-alt'></i>
                        </span>
                    </div>
                </div>
            </a>
        `;
    }

    /**
     * Render workshops based on current filters
     */
    function renderWorkshops() {
        const filtered = allWorkshops.filter(workshop => {
            const techFilterKey = getTechFilterKey(workshop.technology);
            const workshopType = workshop.type || 'workshop';
            
            const matchesTech = currentTechFilter === 'all' || techFilterKey === currentTechFilter;
            const matchesType = currentTypeFilter === 'all' || workshopType === currentTypeFilter;
            
            return matchesTech && matchesType;
        });

        if (filtered.length === 0) {
            workshopsGrid.innerHTML = `
                <div class="workshops-empty">
                    <i class='bx bx-search-alt'></i>
                    <p>No workshops found matching your filters.</p>
                </div>
            `;
            return;
        }

        workshopsGrid.innerHTML = filtered.map(createWorkshopCard).join('');
    }

    /**
     * Setup filter button event listeners
     */
    function setupFilters() {
        techFilterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                techFilterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentTechFilter = btn.dataset.filter;
                renderWorkshops();
            });
        });

        typeFilterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                typeFilterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentTypeFilter = btn.dataset.filter;
                renderWorkshops();
            });
        });
    }

    /**
     * Initialize the page
     */
    async function init() {
        try {
            // Fetch workshop index
            const slugs = await fetchWorkshopIndex();
            
            if (slugs.length === 0) {
                workshopsGrid.innerHTML = `
                    <div class="workshops-empty">
                        <i class='bx bx-calendar-x'></i>
                        <p>No workshops available at the moment. Check back soon!</p>
                    </div>
                `;
                return;
            }

            // Fetch all workshop data in parallel
            const workshopPromises = slugs.map(fetchWorkshop);
            const workshops = await Promise.all(workshopPromises);
            
            // Filter out any failed fetches
            allWorkshops = workshops.filter(w => w !== null);

            // Setup filters and render
            setupFilters();
            renderWorkshops();

        } catch (error) {
            console.error('Error initializing workshops page:', error);
            workshopsGrid.innerHTML = `
                <div class="workshops-empty">
                    <i class='bx bx-error-circle'></i>
                    <p>Failed to load workshops. Please try again later.</p>
                </div>
            `;
        }
    }

    // Start initialization
    init();
});
