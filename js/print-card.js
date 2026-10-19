// The gem at the bottom of every trading card opens a printable copy of that
// card in a new tab, with Print (also "Save as PDF") and Download PNG buttons.
// html-to-image (js/vendor/html-to-image.js, MIT) renders the PNG in the new tab.

(function () {
    function slugify(text) {
        return String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'card';
    }

    function openPrintableCard(card) {
        const title = (card.querySelector('.card-id')?.textContent || 'Card').trim();
        const base = new URL('./', location.href).href;

        // Copy the card as it is on screen, with absolute image URLs and no live links.
        const clone = card.cloneNode(true);
        clone.removeAttribute('id');
        clone.classList.remove('card-skeleton');
        clone.querySelectorAll('img').forEach(img => {
            img.src = img.src;
            img.removeAttribute('loading');
            img.removeAttribute('onload');
            img.removeAttribute('onerror');
            img.classList.add('loaded');
        });
        clone.querySelectorAll('a').forEach(a => {
            const span = document.createElement('span');
            span.textContent = a.textContent;
            a.replaceWith(span);
        });
        clone.querySelectorAll('button.card-gem').forEach(btn => {
            const gem = document.createElement('div');
            gem.className = 'card-gem';
            btn.replaceWith(gem);
        });

        const styleLinks = [...document.querySelectorAll('link[rel="stylesheet"]')]
            .map(l => `<link rel="stylesheet" href="${l.href}">`).join('\n');

        const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>${title.replace(/</g, '&lt;')} | Calvary Exotics card</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
${styleLinks}
<style>
  body { background: #f2f2f2; margin: 0; font-family: system-ui, sans-serif; color: #111; }
  .toolbar { display: flex; gap: 12px; justify-content: center; padding: 16px; position: sticky; top: 0; background: #fff; border-bottom: 1px solid #ddd; }
  .toolbar button { padding: 10px 20px; font-size: 15px; border: 1px solid #1F6B34; background: #1F6B34; color: #fff; border-radius: 6px; cursor: pointer; }
  .toolbar button.secondary { background: #fff; color: #1F6B34; }
  .sheet { display: flex; justify-content: center; padding: 32px 16px; }
  /* Print layout: MTG / Pokemon size, 2.5in x 3.5in (63mm x 88mm).
     The card is drawn 250px x 350px (same width as on the site, 5:7 ratio),
     then scaled by 0.96 so it measures exactly 2.5in x 3.5in. */
  .sheet .card-listing { margin: 0; height: 350px; transform: scale(0.96); transform-origin: top left; }
  .sheet .card-img { height: 150px; }
  .sheet .card-gem { cursor: default; }
  .card-frame { width: 2.5in; height: 3.5in; overflow: hidden; }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .note { text-align: center; font-size: 13px; color: #555; padding: 0 16px 24px; }
  @page { margin: 0.5in; }
  @media print {
    body { background: #fff; }
    .toolbar, .note { display: none; }
    .sheet { padding: 0; justify-content: flex-start; }
  }
</style></head>
<body>
  <div class="toolbar">
    <button type="button" id="print-btn">Print / Save as PDF</button>
    <button type="button" id="png-btn" class="secondary">Download PNG</button>
  </div>
  <div class="sheet" id="sheet"><div class="card-frame">${clone.outerHTML}</div></div>
  <p class="note">Prints at 2.5 x 3.5 in (63 x 88 mm), the size of a Magic or Pok&eacute;mon card. Set the print scale to 100%.</p>
  <script src="${base}js/vendor/html-to-image.js"><\/script>
  <script>
    document.getElementById('print-btn').onclick = function () { window.print(); };
    document.getElementById('png-btn').onclick = async function () {
      var btn = this; btn.disabled = true; btn.textContent = 'Preparing...';
      try {
        var el = document.querySelector('.card-listing');
        var dataUrl = await htmlToImage.toPng(el, { pixelRatio: 3, cacheBust: true, width: 250, height: 350, style: { transform: 'none', margin: '0' } });
        var a = document.createElement('a');
        a.download = ${JSON.stringify(slugify(title))} + '.png';
        a.href = dataUrl;
        a.click();
      } catch (e) { alert('Could not create the image. Use Print / Save as PDF instead.'); }
      btn.disabled = false; btn.textContent = 'Download PNG';
    };
  <\/script>
</body></html>`;
        const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
        const w = window.open(url, '_blank');
        if (!w) {
            URL.revokeObjectURL(url);
            alert('Please allow pop-ups to open the printable card.');
            return;
        }
        setTimeout(() => URL.revokeObjectURL(url), 60000);
    }

    document.addEventListener('click', e => {
        const gem = e.target.closest('[data-print-card]');
        if (!gem) return;
        const card = gem.closest('.card-listing');
        if (card) openPrintableCard(card);
    });
})();
