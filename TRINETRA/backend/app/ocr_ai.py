import requests
import os

OCR_API_KEY = os.getenv("OCR_API_KEY")  # free key

def extract_text_from_image(image_bytes):
    url = "https://api.ocr.space/parse/image"

    files = {"filename": ("image.png", image_bytes)}

    data = {
        "apikey": OCR_API_KEY,
        "language": "eng",
        "isOverlayRequired": False,
    }

    r = requests.post(url, files=files, data=data)

    result = r.json()

    if result.get("IsErroredOnProcessing"):
        return ""

    parsed = result.get("ParsedResults", [])
    if not parsed:
        return ""

    return parsed[0].get("ParsedText", "")