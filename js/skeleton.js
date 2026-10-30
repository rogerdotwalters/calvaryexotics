// Skeleton placeholder cards shown while listings load from the database.
// Loaded before js/listing.js; listing.js calls clearSkeletons() when data
// arrives. A timeout swaps them for a message if the load never completes.

const SKELETON_COUNTS = {
    crested_listings: 3,
    viper_listings: 3,
    ball_listings: 2,
    isopod_listings: 6
};
const SKELETON_TIMEOUT_MS = 12000;

function buildSkeletonCard() {
    const card = document.createElement('div');
    card.className = 'card-listing card-skeleton';
    card.setAttribute('aria-hidden', 'true');
    card.innerHTML = `
        <div class="card-container">
            <div class="skeleton-bar skeleton-bar--top"></div>
            <div class="skeleton-block skeleton-img"></div>
            <div class="skeleton-bar skeleton-bar--badge"></div>
            <div class="skeleton-body">
                <div class="skeleton-line"></div>
                <div class="skeleton-line skeleton-line--short"></div>
                <div class="skeleton-line"></div>
            </div>
            <div class="skeleton-bar skeleton-bar--foot"></div>
        </div>`;
    return card;
}

function showSkeletons() {
    Object.entries(SKELETON_COUNTS).forEach(([id, count]) => {
        const container = document.getElementById(id);
        if (!container || container.querySelector('[data-prerendered]')) return;
        container.setAttribute('aria-busy', 'true');
        for (let i = 0; i < count; i++) container.appendChild(buildSkeletonCard());
    });
}

function clearSkeletons(message) {
    document.querySelectorAll('.card-skeleton').forEach(el => el.remove());
    document.querySelectorAll('[aria-busy="true"]').forEach(el => el.removeAttribute('aria-busy'));
    if (message) {
        const first = document.querySelector('.listings-body');
        if (first && !first.querySelector('.card-listing')) {
            const p = document.createElement('p');
            p.className = 'page-intro';
            p.textContent = message;
            first.appendChild(p);
        }
    }
}

showSkeletons();
setTimeout(() => {
    if (document.querySelector('.card-skeleton')) {
        clearSkeletons('Listings are taking longer than expected to load. Please refresh, or message us for what is available.');
    }
}, SKELETON_TIMEOUT_MS);
