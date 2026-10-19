#!/usr/bin/env python3
"""Resize and recompress site photos in place (same filename and format).

Usage:
    python3 tools/optimize_images.py                 # every image under images/ and data/images/
    python3 tools/optimize_images.py path/to/new.jpg # just specific files or folders

Size rules (long edge, in pixels):
    images/isopods/, data/images/  ->  900   (trading cards display ~250px wide)
    images/rainforest-dark.jpeg    -> 2400   (full-width hero background)
    everything else under images/  -> 1400   (slideshow, care guide, about)
Files already under their cap and under 300 KB are left alone, so the script
is safe to re-run. Requires Pillow (pip install pillow).
"""
import os
import sys
from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXTS = {'.jpg', '.jpeg', '.png'}
SMALL_ENOUGH = 300 * 1024


def cap_for(path):
    rel = os.path.relpath(os.path.abspath(path), ROOT).replace(os.sep, '/')
    if rel.startswith('images/isopods/') or rel.startswith('data/images/'):
        return 900
    if os.path.basename(rel).lower() == 'rainforest-dark.jpeg':
        return 2400
    return 1400


def optimize(path):
    before = os.path.getsize(path)
    ext = os.path.splitext(path)[1].lower()
    with Image.open(path) as im:
        im = ImageOps.exif_transpose(im)  # bake in phone rotation, since EXIF is dropped
        cap = cap_for(path)
        if max(im.size) <= cap and before <= SMALL_ENOUGH:
            return before, before, False
        if max(im.size) > cap:
            im.thumbnail((cap, cap), Image.LANCZOS)
        tmp = path + '.tmp'
        if ext == '.png':
            im.save(tmp, 'PNG', optimize=True)
        else:
            im.convert('RGB').save(tmp, 'JPEG', quality=80, optimize=True, progressive=True)
    after = os.path.getsize(tmp)
    if after >= before:
        os.remove(tmp)
        return before, before, False
    os.replace(tmp, path)
    return before, after, True


def collect(args):
    targets = args or [os.path.join(ROOT, 'images'), os.path.join(ROOT, 'data', 'images')]
    for t in targets:
        if os.path.isdir(t):
            for r, _, fs in os.walk(t):
                for f in fs:
                    if os.path.splitext(f)[1].lower() in EXTS:
                        yield os.path.join(r, f)
        elif os.path.splitext(t)[1].lower() in EXTS:
            yield t


if __name__ == '__main__':
    tb = ta = n = 0
    for p in collect(sys.argv[1:]):
        b, a, changed = optimize(p)
        tb += b; ta += a; n += changed
        if changed:
            print(f'{os.path.relpath(p, ROOT)}: {b/1e6:.2f} MB -> {a/1e6:.2f} MB')
    print(f'\n{n} files optimized. Total {tb/1e6:.1f} MB -> {ta/1e6:.1f} MB')
