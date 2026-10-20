console.log("listing.js loaded");

const crestedContainer = document.getElementById('crested_listings');
const viperContainer = document.getElementById('viper_listings');
const ballContainer = document.getElementById('ball_listings');
const isopodContainer = document.getElementById('isopod_listings');

async function loadAnimals() {
    // Pages can restrict the cards with <body data-animal-type="isopod">
    const pageAnimalType = document.body.dataset.animalType;
    let data;
    try {
        const response = await fetch('data/listings.json');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        data = (await response.json()).listings;
    } catch (error) {
        console.error('Error loading listings:', error);
        if (typeof clearSkeletons === 'function') clearSkeletons('We could not load listings right now. Please refresh, or message us for what is available.');
        return;
    }
    if (typeof clearSkeletons === 'function') clearSkeletons();
    if (pageAnimalType) data = data.filter(a => a.animal_type === pageAnimalType);

    data.forEach(animal => {
        const card = buildAnimalCard(animal);
        try {
            if (animal.animal_type === 'crested_gecko')
                crestedContainer.appendChild(card);
            if (animal.animal_type === 'viper_gecko')
                viperContainer.appendChild(card);
            if (animal.animal_type === 'ball_python')
                ballContainer.appendChild(card);
            if (animal.animal_type === 'isopod')
                isopodContainer.appendChild(card);
        } catch (e) {
            console.log(e);
            console.log(animal.animal_id);
            console.log(animal.animal_name);
            console.log(animal.animal_name);
        }
    });
    addEmptyCards();
}

// Adds a "None available" card to any listing section that ended up empty.
function addEmptyCards() {
    [
        [crestedContainer, 'Crested Geckos'],
        [viperContainer, 'Viper Geckos'],
        [ballContainer, 'Ball Pythons'],
        [isopodContainer, 'Isopods']
    ].forEach(([container, label]) => {
        if (!container || container.querySelector('.card-listing')) return;
        const card = document.createElement('div');
        card.className = 'card-listing card-empty';
        card.innerHTML = `
            <div class="card-container">
                <div class="card-accent"></div>
                <div class="card-top">
                    <div class="card-id">None Available</div>
                    <div class="card-bubble-container"><div class="card-bubble-coin">0</div></div>
                </div>
                <div class="card-main">
                    <img src="./assets/placeholder.png" alt="No ${label} available right now" class="card-img loaded">
                    <div class="card-badge">
                        <div class="card-badge-title">Check back soon</div>
                        <div class="card-badge-text">${label}</div>
                    </div>
                    <div class="card-body">
                        <div class="card-description-title">Nothing listed right now</div>
                        <div class="card-description-skill">New ${label.toLowerCase()} are added as they become available. Message us or follow us on Instagram to be first to know.</div>
                    </div>
                </div>
                <div class="card-footer">
                    <div class="card-info">${label.toLowerCase()}</div>
                    <div class="card-gem"></div>
                    <div class="card-quantity"><a href="#contact" class="card-link">Contact us</a></div>
                </div>
            </div>`;
        container.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', loadAnimals);
