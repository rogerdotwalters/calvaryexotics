#!/usr/bin/env python3
"""Builds the Calvary Exotics Facebook ads (feed 4:5 and Stories 9:16) from one template.

Usage: python3 marketing/build_ads.py
Writes facebook-ad*.html and renders facebook-ad*.png next to this file (needs Chromium).
"""
import glob, os, random, subprocess
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
CHROME = (glob.glob('/opt/pw-browsers/chromium-*/chrome-linux/chrome') or ['chromium'])[0]

# ---------- illustrated assets ----------
PUMPKIN_PAL = {
    'pOr': ('#FFA43A', '#E8731A', '#A8430C'), 'pWh': ('#FFFFFF', '#F2E9D6', '#C9BC9E'),
    'pBl': ('#B9CDC9', '#7E9E9C', '#4B6A6A'), 'pGr': ('#5E8F52', '#2F6A3A', '#143F22'),
    'pYl': ('#FFE08A', '#F0B93A', '#B97A12'), 'pBu': ('#F3CF92', '#DDA55A', '#A8702E'),
}
LEAF_GRADS = {
    'gRed': ('#E0452B', '#8E1F12'), 'gOrange': ('#FFB13B', '#D8611A'),
    'gGold': ('#FFE07A', '#E49A1E'), 'gRust': ('#C9692B', '#6E2E12'),
}
VEIN = 'stroke="rgba(60,20,0,.38)" stroke-width="1.4" fill="none" stroke-linecap="round"'
OUT = 'stroke="rgba(60,20,0,.35)" stroke-width="1.5" stroke-linejoin="round"'
DEFS = (
    ''.join(f'<linearGradient id="{k}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{a}"/><stop offset="1" stop-color="{b}"/></linearGradient>' for k, (a, b) in LEAF_GRADS.items())
    + ''.join(f'<radialGradient id="{k}" cx=".38" cy=".3" r=".85"><stop offset="0" stop-color="{a}"/><stop offset=".55" stop-color="{b}"/><stop offset="1" stop-color="{c}"/></radialGradient>' for k, (a, b, c) in PUMPKIN_PAL.items())
    + '<linearGradient id="stem" x1="0" x2="1"><stop offset="0" stop-color="#7A5A2A"/><stop offset="1" stop-color="#4A3214"/></linearGradient>'
    + f'''<symbol id="maple" viewBox="0 0 100 100"><path d="M50 6 L57 22 L66 15 L65 34 L82 26 L77 44 L95 46 L83 58 L90 70 L67 67 L60 76 L53 74 L53 97 L47 97 L47 74 L40 76 L33 67 L10 70 L17 58 L5 46 L23 44 L18 26 L35 34 L34 15 L43 22 Z" {OUT}/><g {VEIN}><path d="M50 97V14M50 70L20 52M50 70L80 52M50 62L30 34M50 62L70 34M50 74L18 66M50 74L82 66"/></g></symbol>
<symbol id="oak" viewBox="0 0 100 100"><path d="M50 97 L50 80 C30 80 26 66 38 62 C22 58 22 44 38 44 C26 36 32 22 44 26 C42 14 50 6 50 6 C50 6 58 14 56 26 C68 22 74 36 62 44 C78 44 78 58 62 62 C74 66 70 80 50 80 Z" {OUT}/><g {VEIN}><path d="M50 97V12M50 72L32 66M50 72L68 66M50 56L30 48M50 56L70 48M50 40L40 32M50 40L60 32"/></g></symbol>
<symbol id="leaf" viewBox="0 0 100 100"><path d="M50 4 C84 28 90 62 50 90 C10 62 16 28 50 4 Z" {OUT}/><path d="M50 90 L50 99" stroke="rgba(60,20,0,.6)" stroke-width="3" stroke-linecap="round"/><g {VEIN}><path d="M50 90V10M50 74L28 54M50 74L72 54M50 56L30 38M50 56L70 38M50 40L38 26M50 40L62 26"/></g></symbol>
<symbol id="rib" viewBox="0 0 200 160" overflow="visible"><g stroke="rgba(60,20,0,.45)" stroke-width="2"><ellipse cx="52" cy="98" rx="46" ry="58"/><ellipse cx="148" cy="98" rx="46" ry="58"/><ellipse cx="76" cy="98" rx="46" ry="62"/><ellipse cx="124" cy="98" rx="46" ry="62"/><ellipse cx="100" cy="98" rx="42" ry="64"/></g><path d="M90 40 C88 22 92 14 98 8 L112 10 C108 20 112 30 112 42 Z" fill="url(#stem)" stroke="rgba(0,0,0,.4)" stroke-width="1.5"/></symbol>
<symbol id="butter" viewBox="0 0 120 200" overflow="visible"><path d="M50 12 C42 12 40 36 40 64 C40 86 8 100 8 142 C8 180 36 194 60 194 C84 194 112 180 112 142 C112 100 80 86 80 64 C80 36 78 12 70 12 Z" stroke="rgba(60,20,0,.45)" stroke-width="2"/><path d="M60 14 V190 M46 90 C52 120 52 160 52 186 M74 90 C68 120 68 160 68 186" stroke="rgba(90,45,10,.3)" stroke-width="2" fill="none"/><path d="M50 12 C48 2 54 -4 60 -6 L70 -4 C68 4 70 8 70 12 Z" fill="url(#stem)" stroke="rgba(0,0,0,.4)" stroke-width="1.5"/></symbol>'''
)


def leaves(excl, side_max, dy):
    r = random.Random(7)
    syms = ['maple', 'oak', 'leaf', 'maple', 'leaf', 'oak']
    gr = ['gRed', 'gOrange', 'gGold', 'gRust', 'gOrange', 'gRed', 'gGold']
    items = []

    def add(cx, cy, sz):
        if any(a <= cx <= b and c <= cy <= d for a, b, c, d in excl):
            return
        items.append((r.choice(syms), r.choice(gr), cx - sz / 2, cy - sz / 2, sz, r.randint(-70, 70)))
    y = 40
    while y < side_max:
        add(r.randint(-5, 40), y, r.randint(100, 140)); add(1080 - r.randint(-5, 40), y + 30, r.randint(100, 140)); y += 62
    y = 130
    while y < side_max - 60:
        add(r.randint(55, 85), y, r.randint(60, 80)); add(1080 - r.randint(55, 85), y + 25, r.randint(60, 80)); y += 95
    x = 60
    while x < 250:
        add(x, r.randint(-5, 25), r.randint(100, 130)); x += 60
    x = 830
    while x < 1060:
        add(x, r.randint(-5, 25), r.randint(100, 130)); x += 60
    items += [('oak', 'gOrange', 10, 1030 + dy, 170, 30), ('maple', 'gRed', 110, 1110 + dy, 120, -20), ('leaf', 'gGold', 200, 1160 + dy, 70, 50),
              ('maple', 'gGold', 930, 1020 + dy, 150, -25), ('oak', 'gRed', 860, 1120 + dy, 110, 35), ('leaf', 'gOrange', 980, 1130 + dy, 90, -50)]
    return ''.join(f'<use href="#{s}" fill="url(#{g})" x="{x:.0f}" y="{y:.0f}" width="{sz}" height="{sz}" transform="rotate({rot} {x + sz / 2:.0f} {y + sz / 2:.0f})"/>\n' for s, g, x, y, sz, rot in items)


PUMPKINS = [('rib', 'pOr', -30, 170, -4), ('rib', 'pWh', 140, 120, 5), ('butter', 'pBu', 250, 76, -8), ('rib', 'pBl', 320, 125, 3),
            ('rib', 'pGr', 440, 100, -5), ('rib', 'pYl', 530, 85, 8), ('butter', 'pBu', 600, 72, 10), ('rib', 'pOr', 660, 135, 4),
            ('rib', 'pWh', 780, 105, -6), ('rib', 'pGr', 870, 95, 8), ('rib', 'pOr', 940, 140, -3)]


def pumpkins(base):
    out = []
    for s, g, x, w, rot in PUMPKINS:
        h = w * .8 if s == 'rib' else w * 200 / 120
        y = base - h
        out.append(f'<use href="#{s}" fill="url(#{g})" x="{x}" y="{y:.0f}" width="{w}" height="{h:.0f}" transform="rotate({rot} {x + w / 2} {base})"/>')
    return '\n'.join(out)


def hay_svg():
    r = random.Random(11)
    W, H, M = 940, 150, 20
    cols = ['#F6D77A', '#E9BE55', '#D9A53A', '#F0CA66', '#C8912B', '#FBE39A']
    o = [f'<svg class="haybg" width="{W + 2 * M}" height="{H + 2 * M}" viewBox="0 0 {W + 2 * M} {H + 2 * M}">']
    for _ in range(110):
        side = r.choice('lrtb')
        if side in 'lr':
            x = M + (0 if side == 'l' else W) + r.randint(-6, 6); y = M + r.randint(8, H - 8); dx = (-1 if side == 'l' else 1) * r.randint(10, M + 2); dy = r.randint(-9, 9)
        else:
            x = M + r.randint(10, W - 10); y = M + (0 if side == 't' else H) + r.randint(-4, 4); dx = r.randint(-12, 12); dy = (-1 if side == 't' else 1) * r.randint(8, M + 2)
        o.append(f'<path d="M{x} {y}l{dx} {dy}" stroke="{r.choice(cols[1:4])}" stroke-width="{r.choice([2, 3, 3, 4])}" stroke-linecap="round"/>')
    o.append(f'<rect x="{M}" y="{M}" width="{W}" height="{H}" rx="22" fill="#EBC25A"/><clipPath id="hc"><rect x="{M}" y="{M}" width="{W}" height="{H}" rx="22"/></clipPath><g clip-path="url(#hc)">')
    for _ in range(420):
        x = r.uniform(M - 20, M + W); y = r.uniform(M, M + H); L = r.uniform(40, 170); a = r.uniform(-.09, .09)
        o.append(f'<path d="M{x:.0f} {y:.0f}l{L:.0f} {L * a:.0f}" stroke="{r.choice(cols)}" stroke-width="{r.choice([1.5, 2, 2.5, 3])}" stroke-linecap="round" opacity=".85"/>')
    for _ in range(60):
        x = r.uniform(M, M + W); y = r.uniform(M, M + H); L = r.uniform(30, 90)
        o.append(f'<path d="M{x:.0f} {y:.0f}l{L:.0f} {L * r.uniform(-.1, .1):.0f}" stroke="#A8741A" stroke-width="1.2" opacity=".35" stroke-linecap="round"/>')
    o.append('</g>')
    o.append(f'<rect x="{M + 7}" y="{M + 7}" width="{W - 14}" height="{H - 14}" rx="16" fill="none" stroke="#8A5A12" stroke-width="2.5" stroke-dasharray="11 8" opacity=".55"/>')
    for bx in (M + 34, M + W - 52):
        o.append(f'<rect x="{bx}" y="{M - 6}" width="18" height="{H + 12}" fill="#8A5A12"/><path d="M{bx} {M - 6}v{H + 12}M{bx + 18} {M - 6}v{H + 12}" stroke="#5E3A08" stroke-width="2"/>')
        o.append(f'<path d="M{bx} {M}l18 10' + ''.join(f'M{bx} {M + 14 * k}l18 10' for k in range(1, 11)) + '" stroke="#C99A4A" stroke-width="2" opacity=".7"/>')
    o.append('</svg>')
    return ''.join(o)


CSS = '''
@font-face{font-family:Cinzel;font-weight:900;src:url(../fonts/cinzel-latin-900-normal.woff2)}
@font-face{font-family:Inter;font-weight:600;src:url(../fonts/inter-latin-600-normal.woff2)}
*{margin:0;box-sizing:border-box}
:root{--pumpkin:#F29A2E;--cream:#FFF4E0;--deep:#0B2415;--gold:#E3B94F}
body{width:1080px;height:%(H)spx;background:var(--deep);font-family:Inter,sans-serif;color:var(--cream);position:relative;overflow:hidden}
.photo{position:absolute;left:0;top:%(PT)spx;width:1080px;height:%(PH)spx;background:url(../images/%(img)s) %(pos)s/cover}
.photo::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(11,36,21,.85) 0,rgba(11,36,21,0) 24%%,rgba(11,36,21,0) 62%%,var(--deep) 100%%)}
.logo{position:absolute;top:%(logoY)spx;left:50%%;transform:translateX(-50%%);width:560px;z-index:3;filter:drop-shadow(0 2px 6px rgba(0,0,0,.8))}
.leaves{position:absolute;left:0;top:0;z-index:2}
.pumpkins{position:absolute;left:0;top:0;z-index:3}
.panel{position:absolute;left:0;right:0;top:%(panelTop)spx;text-align:center;z-index:3;padding:0 40px}
.eyebrow{font-weight:600;font-size:25px;letter-spacing:.13em;text-transform:uppercase;color:#FFD98A;text-shadow:0 2px 8px #000c,0 0 3px #000}
.cap{font-weight:600;font-size:30px;color:#FFD98A;margin-top:6px;text-shadow:0 2px 8px #000c}
h1{font-family:Cinzel;font-weight:900;font-size:%(h1)spx;line-height:1.02;margin:14px 0 6px;color:var(--pumpkin);text-shadow:0 4px 0 #000a,0 0 24px #000a;letter-spacing:.01em;white-space:nowrap}
h1 span{color:var(--cream)}
h1 small{display:block;font-size:56px;color:var(--cream);margin-bottom:8px;letter-spacing:.02em}
.hay{position:relative;display:inline-block;width:940px;height:150px;margin-top:%(hayMt)spx;transform:rotate(-1.2deg);filter:drop-shadow(0 6px 8px rgba(0,0,0,.55))}
.haybg{position:absolute;left:-20px;top:-20px;width:980px;height:190px;overflow:visible}
.hay p{position:relative;z-index:2;height:150px;line-height:150px;text-align:center;font-weight:600;color:#1d1204;font-size:%(hayFs)spx;white-space:nowrap}
.hay b{color:#7A2208}
.cta{position:absolute;left:0;right:0;top:%(ctaTop)spx;bottom:0;background:linear-gradient(90deg,#E8761E,#F29A2E);z-index:4;color:#1b0f04}
.ctain{height:140px;display:flex;align-items:center;justify-content:space-between;padding:0 56px}
.flogo{width:400px;height:33px;background:#0b2415;-webkit-mask:url(../logo_white.svg) center/contain no-repeat;mask:url(../logo_white.svg) center/contain no-repeat}
.ft{text-align:right;line-height:1.2}
.ft b{display:block;font-family:Cinzel;font-weight:900;font-size:38px}
.ft span{font-weight:600;font-size:30px}
'''

ADS = {
    'facebook-ad': dict(H=1350, PH=810, ctaTop=1210, base=1236, logoY=44, panelTop=655, side_max=760, hayMt=18, img='harley_1.jpg', pos='60% 40%', excl=[(80, 420, 120, 440)],
                        eyebrow='Welcoming the next generation of keepers', h1='Have <span>Morph Fun</span><br>This Fall!', h1fs=100, cap='',
                        hay='We have <b>new amazing geckos</b> available.', hayFs=42),
    'facebook-ad-2': dict(H=1350, PH=810, ctaTop=1210, base=1236, logoY=44, panelTop=670, side_max=760, hayMt=52, img='cappuccino_1.jpg', pos='50% 52%', excl=[(60, 320, 440, 640)],
                          eyebrow='', h1='<small>Tired of pumpkin lattes?</small>Get a <span>Cappuccino.</span>', h1fs=96, cap='',
                          hay='<b>New crested geckos</b> available.', hayFs=52),
}
# Stories / Reels: keep key content out of the top ~250px and bottom ~340px (platform UI)
for k, v in list(ADS.items()):
    s = dict(v)
    s.update(H=1920, PT=340, PH=780, ctaTop=1440, base=1476, logoY=270, panelTop=880, side_max=900, hayMt=34)
    s['excl'] = [(60, 420, 420, 700)] if k == 'facebook-ad' else [(60, 340, 560, 800)]
    if k == 'facebook-ad-2': s['hayMt'] = 60
    ADS[k + '-story'] = s


def build(name, a):
    css = CSS % dict(PT=a.get('PT', 0), H=a['H'], PH=a['PH'], img=a['img'], pos=a['pos'], logoY=a['logoY'], panelTop=a['panelTop'], h1=a['h1fs'] if 'h1fs' in a else 100,
                     hayMt=a['hayMt'], hayFs=a['hayFs'], ctaTop=a['ctaTop'])
    dy = a['base'] - 1236
    body = f'''<div class="photo"></div>
<img class="logo" src="../logo_white.svg" alt="Calvary Exotics">
<svg width="0" height="0" style="position:absolute"><defs>{DEFS}</defs></svg>
<svg class="leaves" width="1080" height="{a['H']}" viewBox="0 0 1080 {a['H']}"><g style="filter:drop-shadow(0 5px 6px rgba(0,0,0,.5))">
{leaves(a['excl'], a['side_max'], dy)}</g></svg>
<div class="panel">
  {f'<div class="eyebrow">{a["eyebrow"]}</div>' if a['eyebrow'] else ''}
  <h1>{a['h1']}</h1>
  {f'<div class="cap">{a["cap"]}</div>' if a['cap'] else ''}
  <div class="hay">{hay_svg()}<p>{a['hay']}</p></div>
</div>
<svg class="pumpkins" width="1080" height="{a['H']}" viewBox="0 0 1080 {a['H']}"><g style="filter:drop-shadow(0 -2px 6px rgba(0,0,0,.45))">
{pumpkins(a['base'])}</g></svg>
<div class="cta"><div class="ctain"><div class="flogo"></div><div class="ft"><b>calvaryexotics.com</b><span>Local Delivery · Shipping Available</span></div></div></div>'''
    html = f'<!doctype html>\n<html><head><meta charset="utf-8"><title>Calvary Exotics {name}</title>\n<style>{css}</style></head><body>\n{body}\n</body></html>\n'
    path = os.path.join(HERE, name + '.html')
    open(path, 'w').write(html)
    shot = os.path.join(HERE, '.shot.png')
    subprocess.run([CHROME, '--headless', '--no-sandbox', '--disable-gpu', '--allow-file-access-from-files', f'--window-size=1080,{a["H"] + 250}',
                    '--hide-scrollbars', f'--screenshot={shot}', 'file://' + path], check=True, stderr=subprocess.DEVNULL)
    Image.open(shot).crop((0, 0, 1080, a['H'])).save(os.path.join(HERE, name + '.png'))
    os.remove(shot)


if __name__ == '__main__':
    for n, a in ADS.items():
        build(n, a)
        print('built', n)
