#!/usr/bin/env python3
from __future__ import annotations

import csv
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "assets" / "source-images" / "meta-wave1-2026-08-26"
OUT = ROOT / "assets" / "meta-leadgen-wave1-variations"
OUT.mkdir(parents=True, exist_ok=True)

BLACK = "#101010"
WHITE = "#FFFDF8"
YELLOW = "#F5C400"
BLUE = "#194FC3"
DISPLAY = "/mnt/c/Windows/Fonts/impact.ttf"
BODY = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

VARIANTS = [
    {
        "ad": "AD01_TAP-MEANS-STOP_STATIC",
        "version": "V2",
        "slug": "ad01-tap-means-stop-v2-coach-cue",
        "source": "coach-stop-cue.jpg",
        "headline": ["TAP MEANS", "STOP."],
        "sub": "SAFE BOUNDARIES START HERE.",
        "footer": "KIDS BJJ • DRIPPING SPRINGS",
        "accent": YELLOW,
        "focus": (0.50, 0.53),
        "note": "Joao gives a clear coaching cue while two students practice.",
    },
    {
        "ad": "AD01_TAP-MEANS-STOP_STATIC",
        "version": "V3",
        "slug": "ad01-tap-means-stop-v3-coached-boundaries",
        "source": "coach-observes-partner-practice.jpg",
        "headline": ["TAP MEANS", "STOP."],
        "sub": "SAFE BOUNDARIES START HERE.",
        "footer": "KIDS BJJ • DRIPPING SPRINGS",
        "accent": YELLOW,
        "focus": (0.50, 0.53),
        "note": "Joao closely observes a partner drill in progress.",
    },
    {
        "ad": "AD02_CONFIDENCE-PRACTICE_STATIC",
        "version": "V2",
        "slug": "ad02-confidence-practice-v2-boys-partner-work",
        "source": "boys-partner-practice.jpg",
        "headline": ["CONFIDENCE", "GROWS THROUGH", "PRACTICE."],
        "sub": "NO PERFECT KID REQUIRED.",
        "footer": "JOAO CRUS BJJ • EST. 2003",
        "accent": BLUE,
        "focus": (0.52, 0.49),
        "note": "Two students practice together without a posed camera moment.",
    },
    {
        "ad": "AD02_CONFIDENCE-PRACTICE_STATIC",
        "version": "V3",
        "slug": "ad02-confidence-practice-v3-girls-partner-work",
        "source": "girls-partner-practice.jpg",
        "headline": ["CONFIDENCE", "GROWS THROUGH", "PRACTICE."],
        "sub": "NO PERFECT KID REQUIRED.",
        "footer": "JOAO CRUS BJJ • EST. 2003",
        "accent": BLUE,
        "focus": (0.55, 0.55),
        "note": "Two girls work through a live partner position.",
    },
    {
        "ad": "AD03_START-AT-3_STATIC",
        "version": "V2",
        "slug": "ad03-start-at-3-v2-little-champions-group",
        "source": "little-champions-group-coaching.jpg",
        "headline": ["STARTING AT", "AGE 3.", "ON PURPOSE."],
        "sub": "SHORT GAMES. SIMPLE DIRECTIONS. REAL SKILLS.",
        "footer": "LITTLE CHAMPIONS • DRIPPING SPRINGS",
        "accent": YELLOW,
        "focus": (0.50, 0.54),
        "note": "A real Little Champions group gathers around Joao during instruction.",
    },
    {
        "ad": "AD03_START-AT-3_STATIC",
        "version": "V3",
        "slug": "ad03-start-at-3-v3-guided-pair-practice",
        "source": "coach-guided-pair-practice.jpg",
        "headline": ["STARTING AT", "AGE 3.", "ON PURPOSE."],
        "sub": "SHORT GAMES. SIMPLE DIRECTIONS. REAL SKILLS.",
        "footer": "LITTLE CHAMPIONS • DRIPPING SPRINGS",
        "accent": YELLOW,
        "focus": (0.49, 0.57),
        "note": "Joao smiles and guides a pair while other young students watch.",
    },
    {
        "ad": "AD04_PROGRAM-FIT_STATIC",
        "version": "V2",
        "slug": "ad04-program-fit-v2-coach-guidance",
        "source": "coach-close-guidance.jpg",
        "headline": ["WHICH KIDS", "CLASS FITS?"],
        "sub": "GET A RECOMMENDED STARTING POINT.",
        "footer": "LITTLE CHAMPIONS • YOUTH • TEENS",
        "accent": BLUE,
        "focus": (0.54, 0.55),
        "note": "Replaces the formal Joao profile with an approachable coaching moment.",
    },
    {
        "ad": "AD04_PROGRAM-FIT_STATIC",
        "version": "V3",
        "slug": "ad04-program-fit-v3-full-class-lineup",
        "source": "full-kids-class-lineup.jpg",
        "headline": ["WHICH KIDS", "CLASS FITS?"],
        "sub": "GET A RECOMMENDED STARTING POINT.",
        "footer": "LITTLE CHAMPIONS • YOUTH • TEENS",
        "accent": BLUE,
        "focus": (0.50, 0.53),
        "note": "Shows the full range of students and academy environment under the real wall logo.",
    },
]


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size)


def fit_font(draw: ImageDraw.ImageDraw, text: str, max_width: int, path: str, start: int, minimum: int = 22):
    size = start
    while size >= minimum:
        f = font(path, size)
        if draw.textbbox((0, 0), text, font=f)[2] <= max_width:
            return f
        size -= 2
    return font(path, minimum)


def crop(src: Image.Image, size: tuple[int, int], focus: tuple[float, float]) -> Image.Image:
    return ImageOps.fit(src.convert("RGB"), size, Image.Resampling.LANCZOS, centering=focus)


def logo_badge(canvas: Image.Image, x: int, y: int, diameter: int):
    logo = Image.open(ROOT / "site" / "assets" / "joao-crus-bjj-logo.png").convert("RGBA")
    logo.thumbnail((diameter, diameter), Image.Resampling.LANCZOS)
    shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.ellipse((x - 7, y - 7, x + diameter + 7, y + diameter + 7), fill=(16, 16, 16, 220))
    canvas.alpha_composite(shadow)
    canvas.alpha_composite(logo, (x + (diameter - logo.width) // 2, y + (diameter - logo.height) // 2))


def text_lines(draw: ImageDraw.ImageDraw, lines: list[str], x: int, y: int, width: int, start_size: int, step: float):
    for line in lines:
        f = fit_font(draw, line, width, DISPLAY, start_size)
        draw.text((x + 4, y + 5), line, font=f, fill=BLACK)
        draw.text((x, y), line, font=f, fill=WHITE)
        y += int(f.size * step)
    return y


def make_square(v: dict) -> Image.Image:
    size = (1080, 1080)
    src = Image.open(SOURCE_DIR / v["source"])
    base = Image.new("RGBA", size, BLACK)
    photo = crop(src, (1080, 670), v["focus"]).convert("RGBA")
    base.alpha_composite(photo, (0, 0))
    draw = ImageDraw.Draw(base)
    draw.rectangle((0, 0, 18, 1080), fill=v["accent"])
    draw.rectangle((0, 610, 1080, 1080), fill=BLACK)
    draw.rectangle((64, 632, 1016, 638), fill=v["accent"])
    logo_badge(base, 900, 38, 120)
    tag_font = fit_font(draw, "REAL ACADEMY • REAL COACHING", 700, BODY, 26)
    draw.rounded_rectangle((52, 46, 52 + draw.textbbox((0, 0), "REAL ACADEMY • REAL COACHING", font=tag_font)[2] + 34, 98), radius=10, fill=(16, 16, 16, 220))
    draw.text((69, 57), "REAL ACADEMY • REAL COACHING", font=tag_font, fill=WHITE)
    y = text_lines(draw, v["headline"], 66, 655, 930, 104 if len(v["headline"]) <= 2 else 88, 0.86)
    sub_font = fit_font(draw, v["sub"], 930, BODY, 31)
    draw.text((66, y + 20), v["sub"], font=sub_font, fill=YELLOW if v["accent"] == BLUE else WHITE)
    foot_font = fit_font(draw, v["footer"], 930, BODY, 25)
    draw.text((66, 1035 - foot_font.size), v["footer"], font=foot_font, fill=WHITE)
    return base.convert("RGB")


def make_story(v: dict) -> Image.Image:
    size = (1080, 1920)
    src = Image.open(SOURCE_DIR / v["source"])
    base = Image.new("RGBA", size, BLACK)
    photo = crop(src, (1080, 850), v["focus"]).convert("RGBA")
    base.alpha_composite(photo, (0, 390))
    draw = ImageDraw.Draw(base)
    # Essential brand and copy stay outside the upper/lower 250 px Story/Reels UI zones.
    draw.rectangle((0, 250, 1080, 390), fill=BLACK)
    draw.rectangle((0, 1170, 1080, 1920), fill=BLACK)
    draw.rectangle((0, 0, 1080, 18), fill=v["accent"])
    draw.rectangle((64, 1190, 1016, 1197), fill=v["accent"])
    logo_badge(base, 54, 270, 118)
    brand_font = fit_font(draw, "JOAO CRUS BJJ", 760, DISPLAY, 68)
    draw.text((202, 264), "JOAO CRUS BJJ", font=brand_font, fill=WHITE)
    small_font = fit_font(draw, "SKILLS FOR LIFE • EST. 2003", 760, BODY, 26)
    draw.text((204, 330), "SKILLS FOR LIFE • EST. 2003", font=small_font, fill=YELLOW)
    y = text_lines(draw, v["headline"], 66, 1220, 940, 122 if len(v["headline"]) <= 2 else 102, 0.88)
    sub_font = fit_font(draw, v["sub"], 930, BODY, 33)
    draw.text((66, y + 28), v["sub"], font=sub_font, fill=YELLOW if v["accent"] == BLUE else WHITE)
    foot_font = fit_font(draw, v["footer"], 930, BODY, 27)
    draw.text((66, 1575), v["footer"], font=foot_font, fill=WHITE)
    safe_font = fit_font(draw, "FIND THE RIGHT PLACE TO BEGIN", 930, BODY, 27)
    draw.text((66, 1625), "FIND THE RIGHT PLACE TO BEGIN", font=safe_font, fill="#CFCFCF")
    return base.convert("RGB")


def save_contact_sheet(items: list[tuple[str, Path]], output: Path, thumb_size: tuple[int, int], columns: int = 4):
    margin = 28
    label_h = 74
    rows = (len(items) + columns - 1) // columns
    cell_w = thumb_size[0] + margin * 2
    cell_h = thumb_size[1] + label_h + margin * 2
    sheet = Image.new("RGB", (columns * cell_w, rows * cell_h), WHITE)
    draw = ImageDraw.Draw(sheet)
    label_font = font(BODY, 22)
    for idx, (label, path) in enumerate(items):
        row, col = divmod(idx, columns)
        x = col * cell_w + margin
        y = row * cell_h + margin
        im = Image.open(path).convert("RGB")
        im.thumbnail(thumb_size, Image.Resampling.LANCZOS)
        px = x + (thumb_size[0] - im.width) // 2
        py = y + (thumb_size[1] - im.height) // 2
        sheet.paste(im, (px, py))
        draw.multiline_text((x, y + thumb_size[1] + 14), label, font=label_font, fill=BLACK, spacing=4)
        draw.rectangle((x - 2, y - 2, x + thumb_size[0] + 2, y + thumb_size[1] + 2), outline=BLACK, width=3)
    sheet.save(output, quality=90, optimize=True, progressive=True)


def main():
    rows = []
    square_items = []
    story_items = []
    for v in VARIANTS:
        square_path = OUT / f'{v["slug"]}-1080x1080.jpg'
        story_path = OUT / f'{v["slug"]}-1080x1920.jpg'
        make_square(v).save(square_path, quality=92, optimize=True, progressive=True)
        make_story(v).save(story_path, quality=92, optimize=True, progressive=True)
        label = f'{v["ad"].split("_")[0]} • {v["version"]}'
        square_items.append((label, square_path))
        story_items.append((label, story_path))
        rows.append({
            "ad_name": v["ad"],
            "version": v["version"],
            "source_photo": v["source"],
            "square_asset": square_path.name,
            "vertical_asset": story_path.name,
            "creative_note": v["note"],
        })
        print(v["slug"])

    with (OUT / "variation-manifest.csv").open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)

    save_contact_sheet(square_items, OUT / "REVIEW-square-variations.jpg", (300, 300), columns=4)
    save_contact_sheet(story_items, OUT / "REVIEW-story-variations.jpg", (190, 338), columns=4)


if __name__ == "__main__":
    main()
