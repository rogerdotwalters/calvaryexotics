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
        return;
    }

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
        const coverImg = (typeof imageOverrides !== 'undefined' && imageOverrides[animal.animal_id]) || animal.cover_url;
        if (coverImg != null && animal.price !== '') {
            mainHTML += `<img src="${coverImg}" alt="${animal.name || animal.animal_name || 'Isopod'}" class="card-img">`;
        } else {
            mainHTML += `<img src="./assets/placeholder.png" alt="${animal.name || animal.animal_name || 'Isopod'}" class="card-img">`;
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
        footerHTML += '<div class="card-gem"></div>'

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
