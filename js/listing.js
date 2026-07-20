console.log("listing.js loaded");

function renderListings() {
    const crestedContainer = document.getElementById('crested_listings');
    const viperContainer = document.getElementById('viper_listings');
    const ballContainer = document.getElementById('ball_listings');
    const isopodContainer = document.getElementById('isopod_listings');

    // if (typeof listings === 'undefined') {
    //     container.innerHTML = `
    //     <p style="color:red;">ERROR: LISTINGS DATA NOT FOUND.</p>
    //     `;
    //     return;
    // }

    listings.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card-listing';
        card.id = 'listing-card'

        card.innerHTML = `
            <div class="card-container">
                <div class="card-accent">
                </div>
                <div class="card-top">
                    <div class="card-id"> #${item.id}</div>
                    <div class="card-bubble">$${item.price}</div>
                </div>
                <div class="card-main">
                    <img src="${item.cover_url}" alt="${item.name}" class="card-img">
                    <div class="card-line">
                        <h3>${item.name}</h3>
                    </div>
                    <div class="card-body">
                        <div class="card-parents">
                            Sire: ${item.sire} <br>
                            Dam: ${item.dam}
                        </div>
                        <h4>${item.scientific_name}</h4>
                        <div class="card-description">${item.description}</div>
                    </div>
                </div>
                <div class="card-footer">
                    <div class="card-info">
                    id:${item.animal_id} / #${item.id}
                    </div>
                    <div class="card-weight">
                    Weight: ${item.weight}g
                    </div>
                </div>
            </div>
        `;
        
        if (item.animal_type === 'crested_gecko')
            crestedContainer.appendChild(card);
        if (item.animal_type === 'viper_gecko')
            viperContainer.appendChild(card);
        if (item.animal_type === 'ball_python')
            ballContainer.appendChild(card);
        if (item.animal_type === 'isopod')
            isopodContainer.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', renderListings);