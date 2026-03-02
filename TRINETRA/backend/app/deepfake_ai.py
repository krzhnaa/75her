import os
import requests
from PIL import Image
import io
from dotenv import load_dotenv

load_dotenv()

HF_TOKEN = os.getenv("HF_TOKEN")

MODEL_URL = (
    "https://router.huggingface.co/"
    "hf-inference/models/dima806/deepfake_vs_real_image_detection"
)

HEADERS = {
    "Authorization": f"Bearer {HF_TOKEN}",
    "Content-Type": "application/octet-stream",
}


# =====================================================
# FORENSIC SIGNALS (LIGHT CALIBRATION)
# =====================================================

def basic_image_forensics(image_bytes):

    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    w, h = img.size

    score = 0

    if w < 600 or h < 600:
        score += 0.12

    ratio = w / h
    if ratio > 2 or ratio < 0.5:
        score += 0.08

    if len(image_bytes) < 120000:
        score += 0.15

    return min(score, 0.35)


# =====================================================
# MAIN PREDICTION
# =====================================================

def predict_deepfake(image_bytes):

    response = requests.post(
        MODEL_URL,
        headers=HEADERS,
        data=image_bytes,
        timeout=90
    )

    print("HF STATUS:", response.status_code)

    if response.status_code != 200:
        raise Exception(response.text)

    result = response.json()

    if not isinstance(result, list):
        raise Exception("Unexpected HF response format")

    fake_score = 0
    real_score = 0

    for r in result:
        label = r.get("label", "").lower()

        if "fake" in label:
            fake_score = r.get("score", 0)

        if "real" in label:
            real_score = r.get("score", 0)

    forensic = basic_image_forensics(image_bytes)

    # weighted blend (MODEL 80% + FORENSIC 20%)
    final_fake_prob = (fake_score * 0.8) + (forensic * 0.2)

    confidence = round(final_fake_prob * 100, 2)

    is_fake = confidence >= 55

    explanation = (
        "AI artifacts + forensic signals detected."
        if is_fake
        else "Image appears consistent with natural photography."
    )

    return {
        "label": "Likely Deepfake" if is_fake else "Likely Authentic",
        "confidence": confidence,
        "explanation": explanation,
        "model": "TRINETRA Multi-Signal Deepfake AI",
        "raw": result,
    }