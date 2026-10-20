// Shared trading-card builder for animal_listing rows (used by js/listing.js
// and the isopod sections on supplies.html).

function buildAnimalCard(animal) {
        // Isopods and springtails share the bug-card layout (morph title, stock, skill line).
        const isBug = animal.animal_type === 'isopod' || animal.animal_type === 'springtail';
        const card = document.createElement('div');
        card.className = 'card-listing';
        // Use a unique ID if you have one, otherwise fall back
        card.id = animal.animal_id ? `listing-${animal.animal_id}` : `listing-${Date.now()}-${Math.random().toString(36).slice(2)}`;

        // ---------- Top section (ID + Price) ----------
        let topHTML = `<div class="card-top">`;
        if (isBug) {
            topHTML += `<div class="card-id">${animal.morph || animal.name}</div>`;
        } else if (animal.card_title) {
            topHTML += `<div class="card-id">${animal.card_title}</div>`;
        } else if (animal.animal_id != null && animal.price !== '') {
            topHTML += `<div class="card-id">#${animal.id} - ${animal.animal_name}</div>`;
        }
        
        topHTML += '<div class="card-bubble-container">'
        if (isBug) {
            if (animal.quantity != null && animal.price != null) {
                topHTML += `<div class="card-bubble-price">$${animal.price}</div>`;
                topHTML += `<div class="card-bubble-coin">${animal.count}</div>`;
            }
            else 
                topHTML += `<div class="card-bubble-coin">ask</div>`;
        } else if (animal.price != null && animal.price !== '') {
            topHTML += `<div class="card-bubble-price">$${animal.price}${animal.price_suffix || ''}</div>`;
            topHTML += `<div class="card-bubble-coin-leaf"></div>`;
        }

        topHTML += `</div></div>`;

        // ---------- Main section ----------
        let mainHTML = `<div class="card-main">`;

        // Image (only if cover_url exists)
        const coverImg = localCoverFor(animal) || animal.cover_url;
        if (coverImg != null && animal.price !== '') {
            mainHTML += `<img src="${coverImg}" alt="${animal.name || animal.animal_name || 'Isopod'}" class="card-img" decoding="async" onload="this.classList.add('loaded')" onerror="this.classList.add('loaded')">`;
        } else {
            mainHTML += `<img src="./assets/placeholder.png" alt="${animal.name || animal.animal_name || 'Isopod'}" class="card-img" decoding="async" onload="this.classList.add('loaded')" onerror="this.classList.add('loaded')">`;
        }

        // Title
        mainHTML += `
            <div class="card-badge">
                <div class="card-badge-title">
                    ${animal.rarity}
                </div>
                <div class="card-badge-text">
                    ${animal.species}
                </div>
            </div>
        `;
        

        // Body
        mainHTML += `<div class="card-body">`;


        // Description
        if (isBug) {
            mainHTML += `<div class="card-description-title">${animal.scientific_name}</div>`;
            mainHTML += `<div class="card-description-skill">${animal.skill || 'Conglobate: Transforms into a ball. +1 Def'}</div>`;
        } else {
            mainHTML += `<div class="card-description-title">${animal.name}</div>`
        }

        // Parents (only show the whole block if at least one exists)
        if (animal.sire || animal.dam) {
            mainHTML += `<div class="card-parents">`;
            if (animal.sire) mainHTML += `Sire: ${animal.sire}<br>`;
            mainHTML += `</div>`;
            mainHTML += `<div class="card-parents">`;
            if (animal.dam)  mainHTML += `Dam: ${animal.dam}`;
            mainHTML += `</div>`;
        }
    
        if(animal.hold === true && animal.sold === false) {
            const rotateVar = getRandomArbitrary(-10, 15);
            mainHTML += `<div class="card-stamp-hold" style="transform: rotate(${rotateVar}deg)"></div>`;
        }
    
        if(animal.sold === true) {
            const rotateVar = getRandomArbitrary(-10, 15);
            mainHTML += `<div class="card-stamp-sold" style="transform: rotate(${rotateVar}deg)"></div>`;
        }

        mainHTML += `</div></div>`; // close card-body + card-main

        // ---------- Footer ----------
        let footerHTML = `<div class="card-footer">`;

        // ID info
        let idInfo = [];
        if (animal.animal_id) idInfo.push(`id:${animal.animal_id}`);
        if (animal.id)         idInfo.push(`#${animal.id}`);
        if (idInfo.length) {
            footerHTML += `<div class="card-info">${idInfo.join(' / ')}</div>`;
        }
        footerHTML += '<button type="button" class="card-gem" data-print-card aria-label="Open printable card" title="Print or download this card"></button>';

        // Weight
        if (isBug) {
            if (animal.in_stock && animal.quantity >= 0) {
                footerHTML += `<div class="card-quantity" style="color: lime">`;
                footerHTML += `In Stock - ${animal.quantity} Left`;
            } else {
                footerHTML += `<div class="card-quantity" style="color: red">`;
                footerHTML += `Out of Stock`;
            }
            footerHTML += `</div>`;
        } else if (animal.stock_label) {
            footerHTML += `<div class="card-quantity" style="color: lime">${animal.stock_label}</div>`;
        } else if (animal.weight != null && animal.weight !== '') {
            footerHTML += `<div class="card-quantity">`;
            footerHTML += `<div class="card-weight">Weight: ${animal.weight}g</div>`;
        }

        footerHTML += `</div>`;

        // ---------- Assemble everything ----------
        card.innerHTML = `
            <div class="card-container">
                <div class="card-accent"></div>
                ${topHTML}
                ${mainHTML}
                ${footerHTML}
            </div>
        `;
    return card;
}

// Finds a locally hosted cover photo from data/image-map.js, if one is mapped.
function localCoverFor(animal) {
    if (typeof imageOverrides !== 'undefined' && imageOverrides[animal.animal_id]) {
        return imageOverrides[animal.animal_id];
    }
    // Same photo the listing already uses, served from this site instead of Supabase.
    if (typeof localByUpload !== 'undefined' && animal.cover_url) {
        const uploaded = String(animal.cover_url).split('/').pop().replace(/^\d+-/, '');
        if (localByUpload[uploaded]) return localByUpload[uploaded];
    }
    if (animal.animal_type !== 'isopod' || typeof isopodImages === 'undefined') return null;
    // Try the full name first ("Armadillidium Sunset"), then the morph ("Sunset"),
    // so two listings that share a morph can have different photos.
    const slugs = [animal.name, animal.morph].filter(Boolean)
        .map(v => String(v).toLowerCase().replace(/[^a-z0-9]/g, ''));
    for (const slug of slugs) {
        const key = isopodImages[slug] ? slug : isopodImageAliases[slug];
        if (key && isopodImages[key]) return isopodImages[key][0];
    }
    console.warn('No local image for isopod:', slugs.join(' / '));
    return null;
}

function getRandomArbitrary(min, max) {
return Math.random() * (max - min) + min;
}

