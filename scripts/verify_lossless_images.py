#!/usr/bin/env python3
"""Generate or verify exact-RGBA WebP derivatives. Requires Pillow with WebP."""
import argparse
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'site' / 'assets'
NAMES = ('joao-crus-bjj-logo', 'campaign-images/trauma-to-triumph', 'campaign-images/grapple-with-emotions')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--write', action='store_true', help='Regenerate only dedicated lossless derivatives')
    args = parser.parse_args()
    saved = 0
    for name in NAMES:
        source = ASSETS / (name + '.png')
        target = ASSETS / (name + '-lossless.webp')
        with Image.open(source) as image:
            if args.write:
                image.save(target, 'WEBP', lossless=True, exact=True, method=6)
            with Image.open(target) as optimized:
                assert image.size == optimized.size, name
                assert image.convert('RGBA').tobytes() == optimized.convert('RGBA').tobytes(), name
        before, after = source.stat().st_size, target.stat().st_size
        assert after < before * .7, name
        saved += before - after
        print(f'{name}: {before} -> {after} bytes; identical dimensions and RGBA pixels')
    print(f'Total reduction: {saved} bytes')


if __name__ == '__main__':
    main()
