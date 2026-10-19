// Renders the trading-card layout (same class contract as js/listing.js)
// for static items in data/supplies.js. No database or remote images.

function buildSupplyCard(item) {
    const card = document.createElement('div');
    card.className = 'card-listing';
    card.id = `supply-${item.id}`;

    const img = item.cover_url || PLACEHOLDER_IMG;
    const sci = item.scientific_name ? `<div class="card-description-title">${item.scientific_name}</div>` : '';

    card.innerHTML = `
        <div class="card-container">
            <div class="card-accent"></div>
            <div class="card-top">
                <div class="card-id">${item.name}</div>
                <div class="card-bubble-container">
                    <div class="card-bubble-coin">ask</div>
                </div>
            </div>
            <div class="card-main">
                <img src="${img}" alt="${item.name} ${item.species}" class="card-img" loading="lazy" decoding="async" onload="this.classList.add('loaded')" onerror="this.classList.add('loaded')">
                <div class="card-badge">
                    <div class="card-badge-title">${item.rarity}</div>
                    <div class="card-badge-text">${item.species}</div>
                </div>
                <div class="card-body">
                    ${sci}
                    <div class="card-description-skill">${item.description}</div>
                </div>
            </div>
            <div class="card-footer">
                <div class="card-info">${item.id}</div>
                <button type="button" class="card-gem" data-print-card aria-label="Open printable card" title="Print or download this card"></button>
                <div class="card-quantity"><a href="${item.link}" class="card-link">${item.link.startsWith('#') ? 'Inquire' : 'See listings'}</a></div>
            </div>
        </div>
    `;
    return card;
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-supply-cards]').forEach(container => {
        (supplyCards[container.dataset.supplyCards] || []).forEach(item => {
            container.appendChild(buildSupplyCard(item));
        });
    });
});
