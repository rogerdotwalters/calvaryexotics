// Card maker: lets visitors fill in a trading card, load a photo from their own
// device, drag/zoom it into place, then print it or save it as a PNG.
// Photos stay in the browser; nothing is uploaded. Printing reuses js/print-card.js
// (the gem on the card opens the printable page).

(function () {
    const $ = id => document.getElementById(id);
    const card = $('cm-card');
    const img = card.querySelector('.card-img');
    const stage = $('cm-stage');
    const zoomInput = $('cm-zoom');
    const photoControls = $('cm-photo-controls');
    const fileInput = $('cm-file');
    const status = $('cm-status');

    const OUTPUT_SCALE = 3;          // crop is rendered at 3x for sharp prints
    const MAX_ZOOM = 4;
    const PLACEHOLDER = 'assets/placeholder.png';

    // ---------- Text fields ----------
    const el = {
        title: card.querySelector('.card-id'),
        rarity: card.querySelector('.card-badge-title'),
        type: card.querySelector('.card-badge-text'),
        subtitle: card.querySelector('.card-description-title'),
        ability: card.querySelector('.card-description-skill'),
        bubbles: card.querySelector('.card-bubble-container'),
        info: card.querySelector('.card-info'),
        quantity: card.querySelector('.card-quantity'),
        body: card.querySelector('.card-body')
    };

    function value(id) { return $(id).value.trim(); }

    function bubble(className, text) {
        const div = document.createElement('div');
        div.className = className;
        div.textContent = text;
        return div;
    }

    // Shrinks the ability text until it fits the parchment box (min 8px).
    function fitAbility() {
        el.ability.style.fontSize = '';
        let size = parseFloat(getComputedStyle(el.ability).fontSize);
        while (el.body.scrollHeight > el.body.clientHeight && size > 8) {
            size -= 0.5;
            el.ability.style.fontSize = size + 'px';
        }
    }

    function updateText() {
        el.title.textContent = value('cm-title') || 'Card Name';
        el.rarity.textContent = $('cm-rarity').value;
        el.type.textContent = value('cm-type');
        el.subtitle.textContent = value('cm-subtitle');
        el.ability.textContent = value('cm-ability');
        el.info.textContent = value('cm-left');
        el.quantity.textContent = value('cm-right');

        el.bubbles.replaceChildren();
        if (value('cm-price')) el.bubbles.append(bubble('card-bubble-price', value('cm-price')));
        if (value('cm-coin')) el.bubbles.append(bubble('card-bubble-coin', value('cm-coin')));

        if (typeof fitCardTitle === 'function') fitCardTitle(el.title);
        fitAbility();
    }

    // ---------- Photo crop ----------
    const view = { photo: null, zoom: 1, cx: 0, cy: 0 };

    function frame() {              // size of the visible photo area on the card
        return { w: img.clientWidth || 232, h: img.clientHeight || 146 };
    }

    function coverScale() {
        const f = frame();
        return Math.max(f.w / view.photo.naturalWidth, f.h / view.photo.naturalHeight);
    }

    function clampCenter() {
        const f = frame(), scale = coverScale() * view.zoom;
        const vw = f.w / scale, vh = f.h / scale;
        view.cx = Math.min(view.photo.naturalWidth - vw / 2, Math.max(vw / 2, view.cx));
        view.cy = Math.min(view.photo.naturalHeight - vh / 2, Math.max(vh / 2, view.cy));
    }

    function render() {
        if (!view.photo) return;
        clampCenter();
        const f = frame(), scale = coverScale() * view.zoom;
        const vw = f.w / scale, vh = f.h / scale;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(f.w * OUTPUT_SCALE);
        canvas.height = Math.round(f.h * OUTPUT_SCALE);
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(view.photo, view.cx - vw / 2, view.cy - vh / 2, vw, vh, 0, 0, canvas.width, canvas.height);
        img.src = canvas.toDataURL('image/jpeg', 0.92);
    }

    function setStatus(message) { status.textContent = message; }

    function loadPhoto(file) {
        if (!file || !file.type.startsWith('image/')) {
            setStatus('That file is not an image. Try a JPG, PNG or WebP photo.');
            return;
        }
        const url = URL.createObjectURL(file);
        const photo = new Image();
        photo.onload = () => {
            URL.revokeObjectURL(url);
            view.photo = photo;
            view.zoom = 1;
            view.cx = photo.naturalWidth / 2;
            view.cy = photo.naturalHeight / 2;
            zoomInput.value = 1;
            photoControls.hidden = false;
            stage.classList.add('has-photo');
            img.alt = 'Your photo on the card';
            img.classList.add('loaded');
            render();
            setStatus('Photo added. Drag it to move it, and use the zoom slider to resize it.');
        };
        photo.onerror = () => {
            URL.revokeObjectURL(url);
            setStatus('We could not open that photo. Try a JPG, PNG or WebP file.');
        };
        photo.src = url;
    }

    function removePhoto() {
        view.photo = null;
        img.src = PLACEHOLDER;
        img.alt = 'Photo area. Choose a photo to fill it.';
        photoControls.hidden = true;
        stage.classList.remove('has-photo');
        fileInput.value = '';
        setStatus('Photo removed.');
    }

    fileInput.addEventListener('change', () => loadPhoto(fileInput.files[0]));
    $('cm-remove').addEventListener('click', removePhoto);

    zoomInput.addEventListener('input', () => {
        view.zoom = parseFloat(zoomInput.value);
        render();
    });
    $('cm-zoom-in').addEventListener('click', () => nudgeZoom(0.25));
    $('cm-zoom-out').addEventListener('click', () => nudgeZoom(-0.25));
    function nudgeZoom(step) {
        view.zoom = Math.min(MAX_ZOOM, Math.max(1, view.zoom + step));
        zoomInput.value = view.zoom;
        render();
    }

    // Drag the photo on the card to reposition it (mouse, touch or pen).
    let drag = null;
    img.addEventListener('pointerdown', e => {
        if (!view.photo) return;
        drag = { id: e.pointerId, x: e.clientX, y: e.clientY };
        img.setPointerCapture(e.pointerId);
        img.classList.add('dragging');
    });
    img.addEventListener('pointermove', e => {
        if (!drag || e.pointerId !== drag.id) return;
        const scale = coverScale() * view.zoom;
        view.cx -= (e.clientX - drag.x) / scale;
        view.cy -= (e.clientY - drag.y) / scale;
        drag.x = e.clientX;
        drag.y = e.clientY;
        render();
    });
    const endDrag = e => {
        if (!drag || e.pointerId !== drag.id) return;
        drag = null;
        img.classList.remove('dragging');
    };
    img.addEventListener('pointerup', endDrag);
    img.addEventListener('pointercancel', endDrag);
    img.addEventListener('dragstart', e => e.preventDefault());

    // Arrow keys move the photo too, for keyboard users.
    img.addEventListener('keydown', e => {
        if (!view.photo) return;
        const step = 20 / (coverScale() * view.zoom);
        const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
        if (!moves[e.key]) return;
        e.preventDefault();
        view.cx += moves[e.key][0];
        view.cy += moves[e.key][1];
        render();
    });

    // Drop a photo straight onto the card.
    ['dragenter', 'dragover'].forEach(type => stage.addEventListener(type, e => {
        e.preventDefault();
        stage.classList.add('drop-ready');
    }));
    ['dragleave', 'drop'].forEach(type => stage.addEventListener(type, e => {
        e.preventDefault();
        stage.classList.remove('drop-ready');
    }));
    stage.addEventListener('drop', e => loadPhoto(e.dataTransfer.files[0]));

    // ---------- Actions ----------
    $('cm-print').addEventListener('click', () => {
        updateText();
        card.querySelector('[data-print-card]').click();
    });

    $('cm-reset').addEventListener('click', () => {
        $('cm-form').reset();
        removePhoto();
        updateText();
        setStatus('Card reset.');
    });

    $('cm-form').addEventListener('input', updateText);
    $('cm-form').addEventListener('submit', e => e.preventDefault());
    window.addEventListener('resize', () => { if (view.photo) render(); });
    if (document.fonts) document.fonts.ready.then(updateText);
    updateText();
})();
