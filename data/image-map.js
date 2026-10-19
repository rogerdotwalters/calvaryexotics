// Maps listings to locally hosted photos so cards do not depend on remote
// image storage. Lookup order in js/listing.js:
//   1. imageOverrides[animal_id]            (exact, e.g. "26-03-25")
//   2. isopodImages[slug of morph/name]     (slug = lowercase letters/digits only,
//                                            so "Red Koi" -> "redkoi")
//   3. the database cover_url
// First image in each list is used as the card cover; the rest are spare.
// Isopods whose slug is not found log "No local image for isopod: <slug>" in
// the browser console. Add that slug here to fix it.

const imageOverrides = {
};

const isopodImages = {
    "bluepigeon": ["images/isopods/bluepigeon_1.jpg", "images/isopods/bluepigeon_2.jpg"],
    "cherryblossom": ["images/isopods/cherryblossom_1.jpg", "images/isopods/cherryblossom_2.jpg"],
    "citrus": ["images/isopods/citrus_1.jpg", "images/isopods/citrus_2.jpg"],
    "crystal": ["images/isopods/crystal_2.jpg"],
    "crystalpineapple": ["images/isopods/crystalpineapple_1.jpg"],
    "glacier": ["images/isopods/glacier_1.jpg"],
    "happynun": ["images/isopods/happynun_1.jpg", "images/isopods/happynun_2.jpg"],
    "lava": ["images/isopods/lava_1.jpg", "images/isopods/lava_2.jpg"],
    "lemonades": ["images/isopods/lemonades_1.jpg"],
    "montenegroclowns": ["images/isopods/montenegroclowns_1.jpg", "images/isopods/montenegroclowns_2.jpg"],
    "orangecream": ["images/isopods/orangecream_1.jpg", "images/isopods/orangecream_2.jpg"],
    "orangekoi": ["images/isopods/orangekoi_1.jpg", "images/isopods/orangekoi_2.jpg"],
    "orangescaber": ["images/isopods/orangescaber_2.jpg"],
    "pandaking": ["images/isopods/pandaking_1.jpg"],
    "papaya": ["images/isopods/papaya_1.jpg", "images/isopods/papaya_2.jpg", "images/isopods/papaya_3.jpg"],
    "pied": ["images/isopods/pied_1.jpg"],
    "redkoi": ["images/isopods/redkoi_1.jpg", "images/isopods/redkoi_2.jpg"],
    "redpakchong": ["images/isopods/redpakchong_1.jpg", "images/isopods/redpakchong_2.jpg"],
    "redpanda": ["images/isopods/redpanda_1.jpg", "images/isopods/redpanda_2.jpg"],
    "rubberducky": ["images/isopods/rubberducky_1.jpg", "images/isopods/rubberducky_2.jpg", "images/isopods/rubberducky_3.jpg"],
    "sunset": ["images/isopods/sunset_1.jpg", "images/isopods/sunset_2.jpg", "images/isopods/sunset_3.jpg"],
    "titan": ["images/isopods/titan_1.jpg", "images/isopods/titan_2.jpg"],
    "whiteshark": ["images/isopods/whiteshark_1.jpg", "images/isopods/whiteshark_2.jpg", "images/isopods/whiteshark_3.jpg"],
    "zebra": ["images/isopods/zebra_1.jpg", "images/isopods/zebra_2.jpg"],
};

// Alternate spellings that should use the same photos.
const isopodImageAliases = {
    "clown": "montenegroclowns",
    "lemonade": "lemonades",
    "crystalpineapples": "crystalpineapple",
    "pandakings": "pandaking",
    "whitesharks": "whiteshark",
    "zebras": "zebra",
    "sunsets": "sunset",
    "titans": "titan",
    "glaciers": "glacier",
    "lavas": "lava",
    "papayas": "papaya",
};
