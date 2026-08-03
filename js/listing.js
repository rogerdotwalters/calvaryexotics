console.log("listing.js loaded");

const DB_URL = config.db_url;
const DB_Key = config.db_key;
const dbclient = supabase.createClient(DB_URL, DB_Key);

const crestedContainer = document.getElementById('crested_listings');
const viperContainer = document.getElementById('viper_listings');
const ballContainer = document.getElementById('ball_listings');
const isopodContainer = document.getElementById('isopod_listings');

async function loadAnimals() {
    const { data, error } = await dbclient
    .from('animal_listing')
    .select('*')
    .order('name');

    if (error) {
        console.error('Error loading animal listings from db:', error);
        return;
    }

    data.forEach(animal => {
        const card = document.createElement('div');
        card.className = 'card-listing';
        card.id = 'listing-card'

        card.innerHTML = `
            <div class="card-container">
                <div class="card-accent">
                </div>
                <div class="card-top">
                    <div class="card-id"> #${animal.animal_id}</div>
                    <div class="card-bubble">$${animal.price}</div>
                </div>
                <div class="card-main">
                    <img src="${animal.cover_url}" alt="${animal.name}" class="card-img">
                    <div class="card-line">
                        <h3>${animal.name}</h3>
                    </div>
                    <div class="card-body">
                        <div class="card-parents">
                            Sire: ${animal.sire} <br>
                            Dam: ${animal.dam}
                        </div>
                        <h4>${animal.scientific_name}</h4>
                        <div class="card-description">${animal.description}</div>
                    </div>
                </div>
                <div class="card-footer">
                    <div class="card-info">
                    id:${animal.animal_id} / #${animal.id}
                    </div>
                    <div class="card-weight">
                    Weight: ${animal.weight}g
                    </div>
                </div>
            </div>
        `;

        if (animal.animal_type === 'crested_gecko')
            crestedContainer.appendChild(card);
        if (animal.animal_type === 'viper_gecko')
            viperContainer.appendChild(card);
        if (animal.animal_type === 'ball_python')
            ballContainer.appendChild(card);
        if (animal.animal_type === 'isopod')
            isopodContainer.appendChild(card);
    });
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

function renderListings() {

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
document.addEventListener('DOMContentLoaded', loadAnimals);
