// Static card data for the bioactive bug sections on supplies.html.
// To use a real photo, drop a compressed image in images/ and point
// cover_url at it (e.g. "images/supplies/powders.webp").
const PLACEHOLDER_IMG = 'assets/placeholder.png';

const supplyCards = {
    // Same fields as the isopod listings, shipped with the site (no database).
    // Update price / count / quantity / in_stock here when stock changes.
    popular_isopods: [
        { "id": 55, "animal_type": "isopod", "name": "Powder Mix", "morph": "Powder Mix", "species": "Isopod", "scientific_name": "Porcellionides pruinosus", "rarity": "common", "price": 10, "count": 5, "quantity": 2, "in_stock": true },
        { "id": 10, "animal_type": "isopod", "name": "Dairy Cow", "morph": "Dairy Cow", "species": "Isopod", "scientific_name": "Porcellio laevis", "rarity": "uncommon", "price": 12, "count": 5, "quantity": 2, "in_stock": true },
        { "id": 41, "animal_type": "isopod", "name": "Giant Canyon", "morph": "Giant Canyon", "species": "Isopod", "scientific_name": "Porcellio dilatatus", "rarity": "uncommon", "price": 12, "count": 5, "quantity": 2, "in_stock": true }
    ],
    cleanup_crew: [
        {
            "id": "springtails",
            "name": "Springtails",
            "species": "Springtail",
            "rarity": "common",
            "scientific_name": "Collembola sp.",
            "description": "Consume mold, bacteria and waste, and cycle nutrients back into the soil.",
            "cover_url": "",
            "stock_label": "10 In Stock",
            "link": "#contact"
        }
    ]
};
