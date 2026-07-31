#!/usr/bin/env python3
"""Prepare the approved real academy group photo for the homepage hero."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "source-images" / "joao-academy-group-original-2026-07-31.jpg"
OUTPUT_DIR = ROOT / "site" / "assets" / "campaign-images"
CROP = (0, 0, 1280, 960)
SIZES = ((1280, 960, ""), (640, 480, "-640"))


def prepare() -> Image.Image:
    with Image.open(SOURCE) as source:
        image = ImageOps.exif_transpose(source).convert("RGB")

    if image.size != (1280, 960):
        raise ValueError(f"Unexpected source size {image.size}; crop approval must be revisited")

    image = image.crop(CROP)
    image = ImageEnhance.Brightness(image).enhance(1.01)
    image = ImageEnhance.Contrast(image).enhance(1.045)
    image = ImageEnhance.Color(image).enhance(1.025)
    image = image.filter(ImageFilter.UnsharpMask(radius=1.1, percent=72, threshold=3))
    return image


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    master = prepare()

    for width, height, suffix in SIZES:
        image = master if master.size == (width, height) else master.resize(
            (width, height), Image.Resampling.LANCZOS
        )
        image.save(
            OUTPUT_DIR / f"home-academy-group-2026-07{suffix}.webp",
            "WEBP",
            quality=82,
            method=6,
        )
        image.save(
            OUTPUT_DIR / f"home-academy-group-2026-07{suffix}.jpg",
            "JPEG",
            quality=84,
            optimize=True,
            progressive=True,
            subsampling="4:2:0",
        )

    print("Prepared homepage hero at 1280x960 and 640x480 in WebP and JPEG")


if __name__ == "__main__":
    main()
