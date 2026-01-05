// Letterboxd RSS feed
const LETTERBOXD_RSS = 'https://letterboxd.com/cjphilip/rss/';
let films = [];

// Parse star rating from title
function parseStars(title) {
    const match = title.match(/([★½]+)/);
    if (!match) return null;
    return [...match[1]].reduce((total, char) => total + (char === '★' ? 1 : 0.5), 0);
}

// Format rating as stars
function formatRating(value) {
    if (!value) return '';
    const full = Math.floor(value);
    const half = value % 1 ? '½' : '';
    return '★'.repeat(full) + half;
}

// Extract image from description
function extractImage(description) {
    const match = description.match(/<img src="(.*?)"/);
    return match ? match[1] : '';
}

// Clean description (remove image tag)
function cleanDescription(description) {
    return description
        .replace(/<img[^>]*>/g, '')
        .replace(/<p>/g, '<p style="margin-bottom: 1rem;">')
        .trim();
}

// Fetch reviews from Letterboxd
async function fetchReviews() {
    try {
        const rssUrl = encodeURIComponent(LETTERBOXD_RSS);
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`);
        const data = await response.json();
        
        if (!data.items || data.items.length === 0) {
            throw new Error('No reviews found');
        }
        
        films = data.items.map(item => {
            const ratingValue = parseStars(item.title);
            const cleanTitle = item.title.split(/[★½]/)[0].trim();
            const image = extractImage(item.description);
            const description = cleanDescription(item.description);
            
            return {
                title: cleanTitle,
                rating: ratingValue,
                ratingStars: formatRating(ratingValue),
                image,
                description,
                link: item.link,
                date: new Date(item.pubDate),
                dateString: new Date(item.pubDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })
            };
        }).slice(0, 12); // Show latest 12
        
        renderFilms(films);
        setupSorting();
    } catch (error) {
        console.error('Error fetching reviews:', error);
        document.getElementById('films-grid').innerHTML = `
            <p style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #666;">
                Failed to load reviews. <a href="https://letterboxd.com/cjphilip/" target="_blank" style="color: #c41e3a;">View on Letterboxd</a>
            </p>
        `;
    }
}

// FLIP animation helper
function getPositions(elements) {
    const positions = new Map();
    elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        positions.set(el.dataset.index, {
            top: rect.top,
            left: rect.left
        });
    });
    return positions;
}

// Render films grid with FLIP animation
function renderFilms(filmsToRender, animate = false) {
    const grid = document.getElementById('films-grid');
    const existingCards = Array.from(grid.querySelectorAll('.film-card'));
    
    // FIRST - Record positions before change
    const firstPositions = animate ? getPositions(existingCards) : null;
    
    // LAST - Update DOM
    grid.innerHTML = filmsToRender.map((film, index) => `
        <div class="film-card" onclick="showReview(${index})" data-index="${index}">
            <div class="film-poster">
                <img src="${film.image}" alt="${film.title}" loading="lazy">
            </div>
            <div class="film-title">${film.title}</div>
            ${film.ratingStars ? `<div class="film-rating">${film.ratingStars}</div>` : ''}
        </div>
    `).join('');
    
    // INVERT & PLAY - Animate if needed
    if (animate && firstPositions) {
        const newCards = Array.from(grid.querySelectorAll('.film-card'));
        
        newCards.forEach(card => {
            const index = card.dataset.index;
            const first = firstPositions.get(index);
            
            if (first) {
                const last = card.getBoundingClientRect();
                const deltaX = first.left - last.left;
                const deltaY = first.top - last.top;
                
                // INVERT
                card.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
                card.style.transition = 'none';
                
                // Force reflow
                card.offsetHeight;
                
                // PLAY
                card.style.transform = '';
                card.style.transition = 'transform 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)';
            } else {
                // Fade in new items
                card.style.opacity = '0';
                card.style.transition = 'opacity 0.4s';
                requestAnimationFrame(() => {
                    card.style.opacity = '1';
                });
            }
        });
    }
}

// Show review overlay
function showReview(index) {
    const film = films[index];
    const overlay = document.getElementById('review-overlay');
    const overlayContent = document.getElementById('overlay-content');
    const details = document.getElementById('review-details');
    
    details.innerHTML = `
        <h2 class="review-film-title">${film.title}</h2>
        ${film.ratingStars ? `<div class="review-rating">${film.ratingStars}</div>` : ''}
        <div class="review-date">Reviewed on ${film.dateString}</div>
        <div class="review-text">${film.description}</div>
        <a href="${film.link}" target="_blank" class="review-link-btn">View on Letterboxd</a>
    `;
    
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Reset scroll position
    overlayContent.scrollTop = 0;
}

// Close overlay
function closeOverlay() {
    const overlay = document.getElementById('review-overlay');
    overlay.classList.remove('show');
    document.body.style.overflow = 'auto';
}

// Setup sorting with animation
function setupSorting() {
    const buttons = document.querySelectorAll('.filter-btn');
    
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const sortType = btn.dataset.sort;
            let sorted = [...films];
            
            switch(sortType) {
                case 'recent-desc':
                    sorted.sort((a, b) => b.date - a.date);
                    break;
                case 'recent-asc':
                    sorted.sort((a, b) => a.date - b.date);
                    break;
                case 'rating-desc':
                    sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                    break;
                case 'rating-asc':
                    sorted.sort((a, b) => (a.rating || 0) - (b.rating || 0));
                    break;
            }
            
            films = sorted;
            renderFilms(sorted, true); // Enable animation
        });
    });
}

// Close overlay on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeOverlay();
    }
});

// Close overlay when clicking outside content
document.getElementById('review-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'review-overlay') {
        closeOverlay();
    }
});

// Initialize
fetchReviews();