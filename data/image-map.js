// Maps listings to locally hosted photos so cards do not depend on remote
// image storage. Lookup order in js/listing.js:
//   1. imageOverrides[animal_id]            (exact, e.g. "26-03-25")
//   1b. localByUpload[file name of cover_url] (local copy of an already-uploaded photo)
//   2. isopodImages[slug of morph/name]     (slug = lowercase letters/digits only,
//                                            so "Red Koi" -> "redkoi")
//   3. the database cover_url
// First image in each list is used as the card cover; the rest are spare.
// Isopods whose slug is not found log "No local image for isopod: <slug>" in
// the browser console. Add that slug here to fix it.

const imageOverrides = {
};

const isopodImages = {
    "white": ["images/isopods/white_1.jpg"],
    "giantcanyon": ["images/isopods/giantcanyon_1.jpg"],
    "soil": ["images/isopods/soil_1.jpg"],
    "ornatus": ["images/isopods/ornatus_1.jpg"],
    "powdermix": ["images/isopods/powdermix_1.jpg"],
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

// Photos already uploaded to Supabase storage, matched by original file name
// (the storage path is "<timestamp>-<file name>"). Cards use these local copies
// instead of the remote URL, so no image bandwidth comes from Supabase.
// For a new upload, put a file with the same name in images/ and add it here.
const localByUpload = {
    "Ornatus.jpg": "images/isopods/ornatus_1.jpg",
    "Trogs-Soils.jpg": "images/isopods/soil_1.jpg",
    "giant-canyon.jpg": "images/isopods/giantcanyon_1.jpg",
    "powdermix.jpg": "images/isopods/powdermix_1.jpg",
    "whites.jpg": "images/isopods/white_1.jpg",
    "bluepigeon_1.jpg": "images/isopods/bluepigeon_1.jpg",
    "bort_1.jpg": "images/bort_1.jpg",
    "cherryblossom_1.jpg": "images/isopods/cherryblossom_1.jpg",
    "citrus_1.jpg": "images/isopods/citrus_1.jpg",
    "crystalpineapple_1.jpg": "images/isopods/crystalpineapple_1.jpg",
    "darkbase_1.jpg": "images/darkbase_1.jpg",
    "darkbase_2.jpg": "images/darkbase_2.jpg",
    "darkpin_1.jpg": "images/darkpin_1.jpg",
    "darkwhitewall_1.jpg": "images/darkwhitewall_1.jpg",
    "glacier_1.jpg": "images/isopods/glacier_1.jpg",
    "happynun_1.jpg": "images/isopods/happynun_1.jpg",
    "harley_1.jpg": "images/harley_1.jpg",
    "hetax_1.jpg": "images/hetax_1.jpg",
    "hetax_2.jpg": "images/hetax_2.jpg",
    "lava_1.jpg": "images/isopods/lava_1.jpg",
    "lemonades_1.jpg": "images/isopods/lemonades_1.jpg",
    "montenegroclowns_1.jpg": "images/isopods/montenegroclowns_1.jpg",
    "orangekoi_1.jpg": "images/isopods/orangekoi_1.jpg",
    "pandaking_1.jpg": "images/isopods/pandaking_1.jpg",
    "papaya_3.jpg": "images/isopods/papaya_3.jpg",
    "phantom_1.jpg": "images/phantom_1.jpg",
    "pied_1.jpg": "images/isopods/pied_1.jpg",
    "redkoi_1.jpg": "images/isopods/redkoi_1.jpg",
    "redpakchong_1.jpg": "images/isopods/redpakchong_1.jpg",
    "redpanda_1.jpg": "images/isopods/redpanda_1.jpg",
    "rubberducky_1.jpg": "images/isopods/rubberducky_1.jpg",
    "springtails.jpg": "images/springtails.jpg",
    "sunset_1.jpg": "images/isopods/sunset_1.jpg",
    "tiger_1.jpg": "images/tiger_1.jpg",
    "titan_1.jpg": "images/isopods/titan_1.jpg",
    "tri-colorharley_1.jpg": "images/tri-colorharley_1.jpg",
    "tricolor_1.jpg": "images/tricolor_1.jpg",
    "whiteshark_1.jpg": "images/isopods/whiteshark_1.jpg",
    "zebra_1.jpg": "images/isopods/zebra_1.jpg",
};
