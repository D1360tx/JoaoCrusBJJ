from pathlib import Path
import qrcode
from qrcode.constants import ERROR_CORRECT_H
from qrcode.image.svg import SvgPathImage

TARGET = (
    "https://joaocrusbjj.com/practice-under-pressure/"
    "?utm_source=car_flyer&utm_medium=offline&utm_campaign=found_the_flyer"
    "&utm_content=postcard_v3"
)
OUT = Path(__file__).resolve().parents[1] / "site" / "assets" / "practice-under-pressure-postcard-v3"
OUT.mkdir(parents=True, exist_ok=True)
qr = qrcode.QRCode(version=None,error_correction=ERROR_CORRECT_H,box_size=16,border=4)
qr.add_data(TARGET); qr.make(fit=True)
png_path=OUT/"practice-under-pressure-postcard-v3-qr.png"
svg_path=OUT/"practice-under-pressure-postcard-v3-qr.svg"
with png_path.open("wb") as stream: qr.make_image(fill_color="#101010",back_color="#ffffff").save(stream)
with svg_path.open("wb") as stream: qr.make_image(image_factory=SvgPathImage).save(stream)
(OUT/"qr-destination.txt").write_text(TARGET+"\n",encoding="utf-8")
print(TARGET)
