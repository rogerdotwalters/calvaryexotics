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
