from pathlib import Path
import qrcode
from qrcode.constants import ERROR_CORRECT_H
from qrcode.image.svg import SvgPathImage

TARGET = (
    "https://joaocrusbjj.com/found-the-flyer/"
    "?utm_source=car_flyer&utm_medium=offline&utm_campaign=found_the_flyer"
    "&utm_content=general_v1"
)
OUT = Path(__file__).resolve().parents[1] / "site" / "assets" / "found-the-flyer"
OUT.mkdir(parents=True, exist_ok=True)

qr = qrcode.QRCode(
    version=None,
    error_correction=ERROR_CORRECT_H,
    box_size=16,
    border=4,
)
qr.add_data(TARGET)
qr.make(fit=True)

png = qr.make_image(fill_color="#101010", back_color="#ffffff")
png.save(OUT / "found-the-flyer-qr.png")

svg = qr.make_image(image_factory=SvgPathImage)
svg.save(OUT / "found-the-flyer-qr.svg")

(OUT / "qr-destination.txt").write_text(TARGET + "\n", encoding="utf-8")
print(TARGET)
print(OUT / "found-the-flyer-qr.png")
