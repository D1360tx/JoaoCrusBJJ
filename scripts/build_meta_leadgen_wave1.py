#!/usr/bin/env python3
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "site" / "assets"
OUT = ROOT / "assets" / "meta-leadgen-wave1"
OUT.mkdir(parents=True, exist_ok=True)

BLACK = "#101010"
WHITE = "#FFFDF8"
YELLOW = "#F5C400"
BLUE = "#194FC3"
FONT_DISPLAY = "/mnt/c/Windows/Fonts/impact.ttf"
FONT_BODY = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

CONCEPTS = [
    {
        "slug": "01-tap-means-stop",
        "source": "youth-junior-warriors-training.webp",
        "headline": ["TAP MEANS", "STOP."],
        "sub": "SAFE BOUNDARIES START HERE.",
        "footer": "KIDS BJJ • DRIPPING SPRINGS",
        "position": (0.56, 0.46),
        "accent": YELLOW,
    },
    {
        "slug": "02-confidence-through-practice",
        "source": "campaign-images/kids-gathering.webp",
        "headline": ["CONFIDENCE", "GROWS THROUGH", "PRACTICE."],
        "sub": "NO PERFECT KID REQUIRED.",
        "footer": "JOAO CRUS BJJ • EST. 2003",
        "position": (0.50, 0.48),
        "accent": BLUE,
    },
    {
        "slug": "03-starting-at-age-3",
        "source": "toddler-hero-group.webp",
        "headline": ["STARTING AT", "AGE 3.", "ON PURPOSE."],
        "sub": "SHORT GAMES. SIMPLE DIRECTIONS. REAL SKILLS.",
        "footer": "LITTLE CHAMPIONS • DRIPPING SPRINGS",
        "position": (0.50, 0.40),
        "accent": YELLOW,
    },
    {
        "slug": "04-find-the-right-kids-class",
        "source": "joao-crus-coach-headshot.webp",
        "headline": ["WHICH KIDS", "CLASS FITS?"],
        "sub": "GET A RECOMMENDED STARTING POINT.",
        "footer": "LITTLE CHAMPIONS • YOUTH • TEENS",
        "position": (0.50, 0.48),
        "accent": BLUE,
    },
]


def font(path, size):
    return ImageFont.truetype(path, size)


def fit_text(draw, text, max_width, font_path, start_size, min_size=26):
    size = start_size
    while size >= min_size:
        f = font(font_path, size)
        if draw.textbbox((0, 0), text, font=f)[2] <= max_width:
            return f
        size -= 2
    return font(font_path, min_size)


def cover(im, size, position):
    return ImageOps.fit(im.convert("RGB"), size, Image.Resampling.LANCZOS, centering=position)


def logo_badge(canvas, x, y, diameter):
    logo = Image.open(ASSETS / "joao-crus-bjj-logo.png").convert("RGBA")
    logo.thumbnail((diameter, diameter), Image.Resampling.LANCZOS)
    shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.ellipse((x-5, y-5, x+diameter+5, y+diameter+5), fill=(16,16,16,210))
    canvas.alpha_composite(shadow)
    canvas.alpha_composite(logo, (x + (diameter-logo.width)//2, y + (diameter-logo.height)//2))


def gradient_overlay(size, top_start=0.42):
    w, h = size
    ov = Image.new("RGBA", size, (0,0,0,0))
    draw = ImageDraw.Draw(ov)
    start = int(h * top_start)
    for y in range(start, h):
        t = (y-start) / max(1, h-start)
        a = int(20 + 225 * min(1, t*1.25))
        draw.line((0, y, w, y), fill=(16, 16, 16, a))
    return ov


def make_square(c):
    size = (1080,1080)
    src = Image.open(ASSETS / c["source"])
    base = cover(src, size, c["position"]).convert("RGBA")
    base.alpha_composite(gradient_overlay(size, 0.38))
    d = ImageDraw.Draw(base)
    # The age-3 source already contains the academy mark prominently.
    if c["slug"] != "03-starting-at-age-3":
        logo_badge(base, 52, 48, 118)
    d.rectangle((0, 0, 18, 1080), fill=c["accent"])
    x, y = 70, 560
    for line in c["headline"]:
        f = fit_text(d, line, 940, FONT_DISPLAY, 118)
        d.text((x+4,y+5), line, font=f, fill=BLACK)
        d.text((x,y), line, font=f, fill=WHITE)
        y += int(f.size*0.88)
    d.rectangle((x, y+18, 1000, y+22), fill=c["accent"])
    sf = fit_text(d, c["sub"], 930, FONT_BODY, 34)
    d.text((x,y+42), c["sub"], font=sf, fill=YELLOW if c["accent"]==BLUE else WHITE)
    ff = fit_text(d, c["footer"], 930, FONT_BODY, 27)
    d.text((x,1022-ff.size), c["footer"], font=ff, fill=WHITE)
    return base.convert("RGB")


def make_story(c):
    size = (1080,1920)
    src = Image.open(ASSETS / c["source"])
    base = cover(src, size, c["position"]).convert("RGBA")
    ov = Image.new("RGBA", size, (0,0,0,0))
    od = ImageDraw.Draw(ov)
    # Keep essential text outside the upper/lower 250 px Story/Reels UI zones.
    od.rectangle((0,220,1080,500), fill=(16,16,16,210))
    od.rectangle((0,1040,1080,1920), fill=(16,16,16,232))
    base.alpha_composite(ov)
    d=ImageDraw.Draw(base)
    logo_badge(base, 55, 260, 150)
    d.text((230,292), "JOAO CRUS BJJ", font=fit_text(d,"JOAO CRUS BJJ",760,FONT_DISPLAY,74), fill=WHITE)
    d.text((232,384), "SKILLS FOR LIFE • EST. 2003", font=fit_text(d,"SKILLS FOR LIFE • EST. 2003",750,FONT_BODY,28), fill=YELLOW)
    d.rectangle((0,0,1080,18),fill=c["accent"])
    x,y=70,1090
    for line in c["headline"]:
        f=fit_text(d,line,940,FONT_DISPLAY,126)
        d.text((x+4,y+5),line,font=f,fill=BLACK)
        d.text((x,y),line,font=f,fill=WHITE)
        y += int(f.size*0.90)
    d.rectangle((x,y+20,1010,y+25),fill=c["accent"])
    sf=fit_text(d,c["sub"],930,FONT_BODY,35)
    d.text((x,y+50),c["sub"],font=sf,fill=YELLOW if c["accent"]==BLUE else WHITE)
    ff=fit_text(d,c["footer"],930,FONT_BODY,28)
    d.text((x,1600),c["footer"],font=ff,fill=WHITE)
    return base.convert("RGB")

for c in CONCEPTS:
    sq = make_square(c)
    st = make_story(c)
    sq.save(OUT / f'{c["slug"]}-1080x1080.jpg', quality=92, optimize=True, progressive=True)
    st.save(OUT / f'{c["slug"]}-1080x1920.jpg', quality=92, optimize=True, progressive=True)
    print(c["slug"])
