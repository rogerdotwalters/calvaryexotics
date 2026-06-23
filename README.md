# Calvary Exotics — Website Scaffolding

A complete, production-ready website scaffold for Calvary Exotics.

## File Structure

```
calvary-exotics/
├── index.html          ← Main HTML (all sections)
├── css/
│   └── styles.css      ← All styling (tokens, layout, responsive)
├── js/
│   └── main.js         ← Interactions (nav, slideshow, form, scroll reveal)
├── images/             ← Drop your photos here (see below)
└── README.md
```

---

## Quick Setup

1. Open `index.html` in a browser — everything works immediately.
2. Swap placeholder content with your real info (see TODOs below).
3. Add your photos (see Images section).
4. Wire up the contact form (see Form section).

---

## TODOs — Things To Customize

### Contact Info (`index.html`)
Search for `<!-- Replace` comments. Update:
- Email address: `hello@calvaryexotics.com`
- Phone: `(555) 000-0000`
- Instagram handle: `@calvaryexotics`

### Animal Prices (`index.html`)
Each `.slide` has a `.price-value` element. Update:
- Crested Gecko: currently `$75`
- Viper Gecko: currently `$60`
- Ball Python: currently `$100`
- Isopods: currently `$20`

### About Stats (`index.html`)
Find `.about-stats` and update your real numbers.

---

## Images

Drop photos into the `images/` folder. For each slide, find the comment:
```html
<!-- <img src="images/crested-gecko.jpg" ... /> -->
```
Uncomment the `<img>` tag and delete the placeholder `<div>` above it.

### Recommended image names:
```
images/
├── about.jpg               ← You holding an animal (4:5 ratio ideal)
├── crested-gecko.jpg       ← Crested gecko (portrait, min 800×1000px)
├── viper-gecko.jpg         ← Viper gecko
├── ball-python.jpg         ← Ball python
├── isopods.jpg             ← Isopod colony or setup
└── seasonal.jpg            ← Rotating/rare species
```

---

## Contact Form

The form is scaffolded and validates on the front end. To actually send emails:

### Option A — Formspree (easiest, free)
1. Go to https://formspree.io and create an account
2. Create a new form → copy the endpoint (looks like `https://formspree.io/f/xxxxx`)
3. In `js/main.js`, find the `TODO: Replace this block` comment
4. Uncomment the `fetch(...)` lines and replace `YOUR_ID` with your form ID
5. Delete the simulation block above it

### Option B — EmailJS (no backend needed)
1. Sign up at https://emailjs.com
2. Follow their docs to get service ID, template ID, and public key
3. Add their SDK to `index.html` and call `emailjs.send()` in the form handler

---

## Add More Animals

Copy any `<article class="slide">` block and paste it inside `#slides-track`.
Then add a matching `<button class="dot-btn">` to `#slide-dots`.
The JS reads the DOM dynamically — no JS changes needed.

---

## Sections Overview

| Section   | ID         | Purpose                                      |
|-----------|------------|----------------------------------------------|
| Nav       | —          | Fixed sticky header, mobile hamburger        |
| Hero      | `#hero`    | Full-screen opener with scale-grid animation |
| About     | `#about`   | Story, stats, photo                          |
| Animals   | `#gallery` | Slideshow — animal cards with prices         |
| Reviews   | `#reviews` | 6 customer testimonials in a grid            |
| Contact   | `#contact` | Channels + inquiry form                      |
| Footer    | —          | Links + copyright                            |

---

## Browser Support
- Chrome, Firefox, Safari, Edge (latest 2 versions)
- Mobile: iOS Safari 15+, Android Chrome 100+
- Responsive breakpoints: 480px / 768px / 1024px
