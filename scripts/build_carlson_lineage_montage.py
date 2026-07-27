#!/usr/bin/env python3
"""Build the Carlson Gracie / Joao Crus archival website montage.

The source clips are public archival uploads on Joao Crus's YouTube channel.
This script downloads review copies when missing, renders branded title cards,
normalizes every segment to 1280x720/30fps/AAC, and concatenates a 52-second
concept cut. Confirm source ownership and historical wording before production.
"""
from __future__ import annotations

import subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
CACHE = Path("/tmp/joao-carlson")
WORK = Path("/tmp/joao-carlson-montage-build")
OUT_DIR = ROOT / "site" / "assets" / "video"
OUT = OUT_DIR / "carlson-gracie-joao-crus-archive.mp4"
POSTER = OUT_DIR / "carlson-gracie-joao-crus-poster.webp"
LOGO = ROOT / "site" / "assets" / "joao-crus-bjj-logo.png"
FONT_DISPLAY = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_BODY = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
WIDTH, HEIGHT, FPS = 1280, 720, 30
BLACK, CREAM, YELLOW, BLUE = "#101010", "#fffdf8", "#f5c400", "#194fc3"

CLIPS = [
    # id, start, duration, editorial caption
    ("TpEbd2ZBVqw", 0, 8, "DRIPPING SPRINGS  /  DECEMBER 2005"),
    ("n4YTn93nhIs", 0, 8, "PRESSURE-TESTED TECHNIQUE"),
    ("a_CGyEyYuko", 0, 9, "TAUGHT DIRECTLY  /  PRACTICED HONESTLY"),
    ("mT31S-7XfhA", 8, 9, "TRADITION THAT EVOLVES"),
    ("3Pwwh-iRB9Y", 0, 8, "THE STANDARD CONTINUES"),
]


def run(*args: str) -> None:
    subprocess.run(args, check=True)


def fit(draw: ImageDraw.ImageDraw, text: str, max_width: int, start: int, font_path: str) -> ImageFont.FreeTypeFont:
    size = start
    while size > 20:
        font = ImageFont.truetype(font_path, size)
        if draw.textbbox((0, 0), text, font=font)[2] <= max_width:
            return font
        size -= 2
    return ImageFont.truetype(font_path, size)


def card(path: Path, headline: str, subhead: str, eyebrow: str) -> None:
    im = Image.new("RGB", (WIDTH, HEIGHT), CREAM)
    d = ImageDraw.Draw(im)
    d.rectangle((0, 0, WIDTH, 22), fill=BLACK)
    d.rectangle((0, HEIGHT - 22, WIDTH, HEIGHT), fill=YELLOW)
    d.rectangle((72, 82, 84, 638), fill=BLUE)
    logo = Image.open(LOGO).convert("RGBA").resize((150, 150), Image.Resampling.LANCZOS)
    im.paste(logo, (1018, 78), logo)
    eyebrow_font = ImageFont.truetype(FONT_BODY, 26)
    d.text((120, 105), eyebrow, font=eyebrow_font, fill=BLUE)
    head_font = fit(d, headline, 980, 88, FONT_DISPLAY)
    d.text((120, 212), headline, font=head_font, fill=BLACK, stroke_width=1)
    sub_font = fit(d, subhead, 1000, 36, FONT_BODY)
    d.text((122, 366), subhead, font=sub_font, fill=BLACK)
    d.rectangle((120, 482, 760, 548), fill=YELLOW, outline=BLACK, width=4)
    label = "ORIGINAL SEMINAR FOOTAGE  /  CONCEPT CUT"
    label_font = fit(d, label, 590, 23, FONT_BODY)
    d.text((148, 500), label, font=label_font, fill=BLACK)
    im.save(path, quality=95)


def download(video_id: str) -> Path:
    CACHE.mkdir(parents=True, exist_ok=True)
    target = CACHE / f"{video_id}.mp4"
    if not target.exists():
        run(
            "yt-dlp", "--no-update", "-f", "worst[ext=mp4]/worst",
            "-o", str(target), f"https://youtu.be/{video_id}"
        )
    return target


def render_card_video(image: Path, duration: float, target: Path) -> None:
    run(
        "ffmpeg", "-y", "-v", "error", "-loop", "1", "-i", str(image),
        "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo", "-t", str(duration),
        "-vf", f"fps={FPS},format=yuv420p", "-c:v", "libx264", "-preset", "medium",
        "-crf", "20", "-c:a", "aac", "-b:a", "128k", "-shortest", str(target)
    )


def caption_overlay(caption: str, target: Path) -> None:
    im = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((190, 620, 1090, 688), radius=0, fill=(16, 16, 16, 235))
    d.rectangle((190, 620, 202, 688), fill=YELLOW)
    font = fit(d, caption, 820, 27, FONT_BODY)
    box = d.textbbox((0, 0), caption, font=font)
    d.text(((WIDTH - (box[2] - box[0])) / 2, 639), caption, font=font, fill=CREAM)
    im.save(target)


def render_clip(source: Path, start: int, duration: int, caption: str, target: Path) -> None:
    overlay = WORK / f"{target.stem}-overlay.png"
    caption_overlay(caption, overlay)
    vf = (
        "[0:v]scale=960:720:flags=lanczos,"
        "eq=contrast=1.05:saturation=0.82:brightness=-0.015,"
        "unsharp=5:5:0.35:5:5:0.0,"
        f"pad={WIDTH}:{HEIGHT}:160:0:color={BLACK},"
        "drawbox=x=156:y=0:w=968:h=720:color=#f5c400:t=4[base];"
        "[base][1:v]overlay=0:0,format=yuv420p[v]"
    )
    af = "highpass=f=80,lowpass=f=11000,dynaudnorm=f=150:g=9,volume=0.82"
    run(
        "ffmpeg", "-y", "-v", "error", "-ss", str(start), "-t", str(duration),
        "-i", str(source), "-loop", "1", "-i", str(overlay),
        "-filter_complex", vf, "-map", "[v]", "-map", "0:a?", "-af", af,
        "-t", str(duration), "-r", str(FPS), "-c:v", "libx264", "-preset", "medium",
        "-crf", "20", "-pix_fmt", "yuv420p", "-c:a", "aac", "-ar", "48000",
        "-ac", "2", "-b:a", "128k", str(target)
    )


def poster(source: Path) -> None:
    raw = WORK / "poster-raw.png"
    run("ffmpeg", "-y", "-v", "error", "-ss", "2", "-i", str(source), "-frames:v", "1", str(raw))
    frame = Image.open(raw).convert("RGB").resize((960, 720), Image.Resampling.LANCZOS)
    im = Image.new("RGB", (WIDTH, HEIGHT), BLACK)
    im.paste(frame, (160, 0))
    d = ImageDraw.Draw(im)
    d.rectangle((156, 0, 1124, 720), outline=YELLOW, width=5)
    d.rectangle((190, 500, 1088, 674), fill=(16, 16, 16))
    eyebrow = ImageFont.truetype(FONT_BODY, 24)
    title = fit(d, "A LIVING LINEAGE", 840, 58, FONT_DISPLAY)
    d.text((225, 525), "CARLSON GRACIE  /  JOAO CRUS", font=eyebrow, fill=YELLOW)
    d.text((225, 566), "A LIVING LINEAGE", font=title, fill=CREAM)
    im.save(POSTER, "WEBP", quality=86, method=6)


def main() -> None:
    WORK.mkdir(parents=True, exist_ok=True)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    title = WORK / "title.png"
    end = WORK / "end.png"
    card(title, "A LIVING LINEAGE", "CARLSON GRACIE AT JOAO CRUS BJJ", "DRIPPING SPRINGS  /  DECEMBER 2005")
    card(end, "FROM CARLSON'S MAT TO OURS", "PRESSURE  /  CONTROL  /  RESPONSIBILITY", "JOAO CRUS BJJ  /  EST. 2003")
    parts: list[Path] = []
    intro = WORK / "00-intro.mp4"
    render_card_video(title, 4.5, intro)
    parts.append(intro)
    for index, (video_id, start, duration, caption) in enumerate(CLIPS, start=1):
        source = download(video_id)
        target = WORK / f"{index:02d}-{video_id}.mp4"
        render_clip(source, start, duration, caption, target)
        parts.append(target)
    outro = WORK / "99-outro.mp4"
    render_card_video(end, 5.5, outro)
    parts.append(outro)
    concat = WORK / "concat.txt"
    concat.write_text("\n".join(f"file '{part}'" for part in parts) + "\n")
    temp = WORK / "joined.mp4"
    run("ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", str(concat), "-c", "copy", str(temp))
    run("ffmpeg", "-y", "-v", "error", "-i", str(temp), "-c", "copy", "-movflags", "+faststart", str(OUT))
    poster(download(CLIPS[0][0]))
    print(OUT)
    print(POSTER)


if __name__ == "__main__":
    main()
