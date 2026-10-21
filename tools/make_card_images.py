#!/usr/bin/env python3
"""Make small WebP copies of listing photos and point data/listings.json at them.

Trading cards display at about 300px wide, but the source photos are 900-1400px
JPEGs. This writes a 640px WebP (2x for high-DPI screens) to images/cards/ for
each cover_url in data/listings.json and rewrites cover_url to the copy. The
originals stay where they are. Safe to re-run after adding new listings.

Usage:
    python3 tools/make_card_images.py

Requires Pillow (pip install pillow). Run tools/prerender_listings.py afterward
so crested-geckos.html picks up the new paths.
"""
import json
import os
from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LISTINGS = os.path.join(ROOT, 'data', 'listings.json')
OUT_DIR = os.path.join(ROOT, 'images', 'cards')
MAX_EDGE = 640
QUALITY = 78


def card_path(src):
    """images/isopods/foo_1.jpg -> images/cards/isopods-foo_1.webp (keeps names unique)."""
    rel = os.path.relpath(os.path.join(ROOT, src), os.path.join(ROOT, 'images'))
    stem = os.path.splitext(rel)[0].replace(os.sep, '-')
    return f'images/cards/{stem}.webp'


def main():
    with open(LISTINGS) as f:
        data = json.load(f)
    os.makedirs(OUT_DIR, exist_ok=True)
    made = skipped = 0
    before = after = 0
    for row in data['listings']:
        src = row.get('cover_url') or ''
        if not src.startswith('images/') or src.startswith('images/cards/'):
            continue
        src_abs = os.path.join(ROOT, src)
        if not os.path.exists(src_abs):
            print(f'missing source, left alone: {src}')
            skipped += 1
            continue
        dest = card_path(src)
        with Image.open(src_abs) as im:
            im = ImageOps.exif_transpose(im)
            if max(im.size) > MAX_EDGE:
                im.thumbnail((MAX_EDGE, MAX_EDGE), Image.LANCZOS)
            im.convert('RGB').save(os.path.join(ROOT, dest), 'WEBP', quality=QUALITY, method=6)
        before += os.path.getsize(src_abs)
        after += os.path.getsize(os.path.join(ROOT, dest))
        row['cover_url'] = dest
        made += 1
    with open(LISTINGS, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write('\n')
    print(f'{made} card images written ({before/1e6:.1f} MB -> {after/1e6:.1f} MB), {skipped} skipped')


if __name__ == '__main__':
    main()
