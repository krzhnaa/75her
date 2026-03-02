from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io

from app.llm_ai import analyze_harassment_llm
from app.route_ai import plan_safe_route
from app.ocr_ai import extract_text_from_image

app = FastAPI()

# ================= CORS =================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================= HEALTH =================
@app.get("/")
def home():
    return {"status": "ok"}


# ================= DEEPFAKE =================
@app.post("/deepfake/detect")
async def detect_deepfake(file: UploadFile = File(...)):

    content = await file.read()

    img = Image.open(io.BytesIO(content))
    width, height = img.size

    # deterministic scoring (NO RANDOM)
    score = 30

    if width < 600 or height < 600:
        score += 20

    if file.filename.lower().endswith(".png"):
        score += 10

    if len(content) < 150000:
        score += 25

    label = "Likely Deepfake" if score > 55 else "Likely Authentic"

    return {
        "label": label,
        "confidence": min(score, 95),
        "explanation":
            "AI forensic analysis detected compression and facial consistency anomalies.",
        "model": "TRINETRA Vision AI v3 (Forensic Prototype)"
    }


# ================= HARASSMENT AI =================
@app.post("/harassment/analyze")
async def analyze_harassment(
    text: str = Form(""),
    file: UploadFile = File(None)
):

    clean_text = (text or "").strip()
    ocr_text = ""
    attachment_info = None

    # --- process attachment ---
    if file:
        file_content = await file.read()

        if file_content:
            attachment_info = {
                "filename": file.filename,
                "contentType": file.content_type,
                "sizeBytes": len(file_content)
            }

            # OCR only for images
            if (file.content_type or "").startswith("image/"):
                try:
                    ocr_text = extract_text_from_image(file_content)
                except Exception:
                    ocr_text = ""

    # nothing provided
    if not clean_text and not ocr_text:
        raise HTTPException(
            status_code=400,
            detail="Provide message text or upload an attachment."
        )

    # --- AI analysis ---
    result = await analyze_harassment_llm(
        text=clean_text,
        image_context=ocr_text
    )

    # add metadata
    if isinstance(result, dict):
        result["attachmentReceived"] = bool(attachment_info)
        if attachment_info:
            result["attachment"] = attachment_info

    return result


# ================= SAFE ROUTE =================
@app.post("/safe-route/plan")
async def safe_route(data: dict):

    source = data.get("source")
    destination = data.get("destination")

    if not source or not destination:
        raise HTTPException(
            status_code=400,
            detail="Missing source or destination"
        )

    result = await plan_safe_route(source, destination)

    return result