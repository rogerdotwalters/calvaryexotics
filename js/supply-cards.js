// Fills the card sections on supplies.html from data/listings.json.
// A container lists the listing ids to show: <div data-listing-ids="55,10,41">.

document.addEventListener('DOMContentLoaded', async () => {
    const containers = document.querySelectorAll('[data-listing-ids]');
    if (!containers.length) return;
    let listings;
    try {
        const response = await fetch('data/listings.json');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        listings = (await response.json()).listings;
    } catch (error) {
        console.error('Error loading listings:', error);
        return;
    }
    containers.forEach(container => {
        container.dataset.listingIds.split(',').forEach(id => {
            const animal = listings.find(a => String(a.id) === id.trim());
            if (animal) container.appendChild(buildAnimalCard(animal));
        });
    });
    fitCardTitles();
});
