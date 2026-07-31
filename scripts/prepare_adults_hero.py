#!/usr/bin/env python3
"""Prepare the supplied real adults-program group photo for responsive web use."""

from pathlib import Path
from PIL import Image, ImageEnhance, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets/source-images/adults-black-belt-group-original-2026-07-31.jpg"
OUT = ROOT / "site/assets/campaign-images"
BASENAME = "adults-black-belt-group-2026-07"
WIDTHS = (640, 480)


def prepare() -> None:
    with Image.open(SOURCE) as original:
        image = ImageOps.exif_transpose(original).convert("RGB")

    # Restrained global corrections only. Do not alter identities, gis, belts, or logos.
    image = ImageEnhance.Contrast(image).enhance(1.03)
    image = ImageEnhance.Color(image).enhance(1.02)
    image = ImageEnhance.Sharpness(image).enhance(1.08)

    OUT.mkdir(parents=True, exist_ok=True)
    for width in WIDTHS:
        if width == image.width:
            resized = image.copy()
            suffix = ""
        else:
            height = round(image.height * width / image.width)
            resized = image.resize((width, height), Image.Resampling.LANCZOS)
            suffix = f"-{width}"

        resized.save(
            OUT / f"{BASENAME}{suffix}.webp",
            "WEBP",
            quality=84,
            method=6,
        )
        resized.save(
            OUT / f"{BASENAME}{suffix}.jpg",
            "JPEG",
            quality=86,
            optimize=True,
            progressive=True,
            subsampling="4:2:0",
        )

    print("Prepared adults hero at 640x616 and 480x462 in WebP and JPEG")


if __name__ == "__main__":
    prepare()
