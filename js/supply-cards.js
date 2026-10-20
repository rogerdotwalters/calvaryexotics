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

// Isopod sections show the same live cards as isopods.html: each item is matched
// (by its "match" text) against the isopod listings in the database. An item with
// no matching listing keeps its static card above.
async function loadSupplyIsopods(containers) {
    let listings = [];
    try {
        const dbclient = supabase.createClient(config.db_url, config.db_key);
        const { data, error } = await dbclient.from('animal_listing').select('*').eq('animal_type', 'isopod').order('name');
        if (error) throw error;
        listings = data || [];
    } catch (e) {
        console.error('Error loading isopod listings from db:', e);
    }
    containers.forEach(container => {
        const items = supplyCards[container.dataset.supplyCards] || [];
        items.forEach(item => {
            const matches = item.match
                ? listings.filter(a => `${a.name || ''} ${a.morph || ''}`.toLowerCase().includes(item.match))
                : [];
            if (matches.length) matches.forEach(a => container.appendChild(buildAnimalCard(a)));
            else container.appendChild(buildSupplyCard(item));
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const live = [];
    document.querySelectorAll('[data-supply-cards]').forEach(container => {
        if (container.hasAttribute('data-live-isopods')) { live.push(container); return; }
        (supplyCards[container.dataset.supplyCards] || []).forEach(item => {
            container.appendChild(buildSupplyCard(item));
        });
    });
    if (live.length) loadSupplyIsopods(live);
});
