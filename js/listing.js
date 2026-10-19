console.log("listing.js loaded");

const DB_URL = config.db_url;
const DB_Key = config.db_key;
const dbclient = supabase.createClient(DB_URL, DB_Key);

const crestedContainer = document.getElementById('crested_listings');
const viperContainer = document.getElementById('viper_listings');
const ballContainer = document.getElementById('ball_listings');
const isopodContainer = document.getElementById('isopod_listings');

async function loadAnimals() {
    // Pages can restrict the query with <body data-animal-type="isopod">
    const pageAnimalType = document.body.dataset.animalType;
    let query = dbclient
    .from('animal_listing')
    .select('*')
    .order('name');
    if (pageAnimalType) query = query.eq('animal_type', pageAnimalType);
    const { data, error } = await query;

    if (error) {
        console.error('Error loading animal listings from db:', error);
        if (typeof clearSkeletons === 'function') clearSkeletons('We could not load listings right now. Please refresh, or message us for what is available.');
        return;
    }
    if (typeof clearSkeletons === 'function') clearSkeletons();

    data.forEach(animal => {
        const card = document.createElement('div');
        card.className = 'card-listing';
        // Use a unique ID if you have one, otherwise fall back
        card.id = animal.animal_id ? `listing-${animal.animal_id}` : `listing-${Date.now()}-${Math.random().toString(36).slice(2)}`;

        // ---------- Top section (ID + Price) ----------
        let topHTML = `<div class="card-top">`;
        if (animal.animal_type === 'isopod') {
            topHTML += `<div class="card-id">${animal.morph}</div>`;
        } else if (animal.animal_id != null && animal.price !== '') {
            topHTML += `<div class="card-id">#${animal.id} - ${animal.animal_name}</div>`;
        }
        
        topHTML += '<div class="card-bubble-container">'
        if (animal.animal_type === 'isopod') {
            if (animal.quantity != null) {
                topHTML += `<div class="card-bubble-price">$${animal.price}</div>`;
                topHTML += `<div class="card-bubble-coin">${animal.count}</div>`;
            }
            else 
                topHTML += `<div class="card-bubble-coin">ask</div>`;
        } else if (animal.price != null && animal.price !== '') {
            topHTML += `<div class="card-bubble-price">$${animal.price}</div>`;
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
        if (animal.animal_type === 'isopod') {
            mainHTML += `<div class="card-description-title">${animal.scientific_name}</div>`;
            mainHTML += `<div class="card-description-skill">Conglobate: Transforms into a ball. +1 Def</div>`;
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
        if (animal.animal_type === 'isopod') {
            if (animal.in_stock && animal.quantity >= 0) {
                footerHTML += `<div class="card-quantity" style="color: lime">`;
                footerHTML += `In Stock - ${animal.quantity} Left`;
            } else {
                footerHTML += `<div class="card-quantity" style="color: red">`;
                footerHTML += `Out of Stock`;
            }
            footerHTML += `</div>`;
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

//Supabase storage bucket name = animal_photos

// import { createClient } from '@supabase/supabase-js'

// const supabase = createClient('YOUR_PROJECT_URL', 'YOUR_ANON_KEY')

// const { data } = supabase
//   .storage
//   .from('your-bucket-name')
//   .getPublicUrl('path/to/photo.jpg')   // e.g. 'avatars/user123.jpg'

// console.log(data.publicUrl)
// const { data, error } = await supabase
//   .storage
//   .from('your-bucket-name')
//   .createSignedUrl('path/to/photo.jpg', 3600)  // expires in 1 hour (seconds)

// if (error) {
//   console.error(error)
// } else {
//   console.log(data.signedUrl)
// }
document.addEventListener('DOMContentLoaded', loadAnimals);
