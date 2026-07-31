#!/usr/bin/env python3
"""Prepare the selected Joao coaching concept for the adults-program hero."""

from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets/source-images/adults-joao-coaching-ai-original-2026-07-31.png"
OUT = ROOT / "site/assets/campaign-images"
BASENAME = "adults-joao-coaching-hero-2026-07"


def save_pair(image: Image.Image, suffix: str) -> None:
    image.save(
        OUT / f"{BASENAME}{suffix}.webp",
        "WEBP",
        quality=88,
        method=6,
    )
    image.save(
        OUT / f"{BASENAME}{suffix}.jpg",
        "JPEG",
        quality=90,
        optimize=True,
        progressive=True,
        subsampling="4:2:0",
    )


def prepare() -> None:
    with Image.open(SOURCE) as original:
        image = original.convert("RGB")

    if image.size != (1536, 1024):
        raise ValueError(f"Unexpected source dimensions: {image.size}")

    # 4:3 desktop crop preserves the left student's foot and Joao's full gesture.
    desktop = image.crop((0, 0, 1365, 1024)).resize(
        (1280, 960), Image.Resampling.LANCZOS
    )
    # 16:9 mobile crop keeps the full horizontal lesson while trimming safe wall/floor space.
    mobile = image.crop((0, 80, 1536, 944)).resize(
        (800, 450), Image.Resampling.LANCZOS
    )

    OUT.mkdir(parents=True, exist_ok=True)
    save_pair(desktop, "")
    save_pair(mobile, "-mobile")
    print("Prepared Joao adults hero at 1280x960 and 800x450 in WebP and JPEG")


if __name__ == "__main__":
    prepare()
