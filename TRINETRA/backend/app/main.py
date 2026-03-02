from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.deepfake_ai import predict_deepfake
from app.llm_ai import analyze_harassment_llm
from app.route_ai import plan_safe_route
from app.ocr_ai import extract_text_from_image


# =====================================================
# APP INIT
# =====================================================

app = FastAPI(
    title="TRINETRA AI Backend",
    version="1.0.0"
)

# =====================================================
# CORS
# =====================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # change in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================================
# HEALTH
# =====================================================

@app.get("/")
def home():
    return {"status": "ok", "service": "TRINETRA backend running"}


# =====================================================
# DEEPFAKE DETECTION
# =====================================================

@app.post("/deepfake/detect")
async def detect_deepfake(file: UploadFile = File(...)):
    """
    Deepfake detection endpoint.
    Receives image file -> sends bytes to deepfake model.
    """

    if not file:
        raise HTTPException(status_code=400, detail="File not provided")

    try:
        content = await file.read()

        if not content:
            raise HTTPException(status_code=400, detail="Empty file uploaded")

        result = predict_deepfake(content)

        if not isinstance(result, dict):
            raise HTTPException(
                status_code=500,
                detail="Invalid deepfake response format"
            )

        return result

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Deepfake detection failed: {str(e)}"
        )


# =====================================================
# HARASSMENT ANALYSIS
# =====================================================

@app.post("/harassment/analyze")
async def analyze_harassment(
    text: str = Form(""),
    file: UploadFile = File(None)
):
    """
    Harassment analysis using:
    - user text
    - OCR text (if image uploaded)
    """

    clean_text = (text or "").strip()
    ocr_text = ""
    attachment_info = None

    # ---------- attachment handling ----------
    if file:
        try:
            file_content = await file.read()

            if file_content:
                attachment_info = {
                    "filename": file.filename,
                    "contentType": file.content_type,
                    "sizeBytes": len(file_content)
                }

                # OCR only if image
                if (file.content_type or "").startswith("image/"):
                    try:
                        ocr_text = extract_text_from_image(file_content)
                    except Exception:
                        ocr_text = ""

        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Attachment processing failed: {str(e)}"
            )

    # ---------- validation ----------
    if not clean_text and not ocr_text:
        raise HTTPException(
            status_code=400,
            detail="Provide message text or upload an image."
        )

    # ---------- LLM analysis ----------
    try:
        result = await analyze_harassment_llm(
            text=clean_text,
            image_context=ocr_text
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Harassment analysis failed: {str(e)}"
        )

    # ---------- attach metadata ----------
    if isinstance(result, dict):
        result["attachmentReceived"] = bool(attachment_info)
        if attachment_info:
            result["attachment"] = attachment_info

    return result


# =====================================================
# SAFE ROUTE
# =====================================================

@app.post("/safe-route/plan")
async def safe_route(data: dict):
    """
    AI safe-route planner.
    """

    source = (data.get("source") or "").strip()
    destination = (data.get("destination") or "").strip()

    if not source or not destination:
        raise HTTPException(
            status_code=400,
            detail="Missing source or destination"
        )

    try:
        result = await plan_safe_route(source, destination)

        if not isinstance(result, dict):
            raise HTTPException(
                status_code=500,
                detail="Invalid route response"
            )

        return result

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Safe route planning failed: {str(e)}"
        )

# ================= AI ASSISTANT =================

@app.post("/assistant/chat")
async def assistant_chat(data: dict):

    message = (data.get("message") or "").strip()

    if not message:
        raise HTTPException(status_code=400, detail="Message required")

    try:
        from app.assistant_ai import emotional_support_reply
        reply = await emotional_support_reply(message)
        return {"reply": reply}

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Assistant failed: {str(e)}"
        )