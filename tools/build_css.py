#!/usr/bin/env python3
"""Bundle css/fonts.css + css/styles.css into one minified css/styles.min.css.

The HTML pages link css/styles.min.css. Edit css/styles.css (or css/fonts.css),
then run:

    python3 tools/build_css.py

Requires Node (npx) for the csso minifier; the first run downloads it.
"""
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSS = os.path.join(ROOT, 'css')
SOURCES = ['fonts.css', 'styles.css']
OUT = os.path.join(CSS, 'styles.min.css')


def main():
    bundle = '\n'.join(open(os.path.join(CSS, name)).read() for name in SOURCES)
    result = subprocess.run(['npx', '--yes', 'csso-cli@4', '--no-restructure'],
                            input=bundle, capture_output=True, text=True)
    if result.returncode != 0:
        sys.exit(result.stderr or 'csso failed')
    with open(OUT, 'w') as f:
        f.write(result.stdout)
    print(f'{len(bundle)/1024:.1f} KB -> {len(result.stdout)/1024:.1f} KB ({os.path.relpath(OUT, ROOT)})')


if __name__ == '__main__':
    main()
