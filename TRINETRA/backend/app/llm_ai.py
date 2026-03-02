import json
from app.goose_ai import goose_chat


async def analyze_harassment_llm(text="", image_context=""):
    """
    Advanced harassment analysis using Goose LLM.
    Supports:
    - text messages
    - OCR extracted image context
    """

    # ================= CLEAN INPUT =================
    message_text = (text or "").strip()
    if not message_text:
        message_text = "(no user text provided)"

    image_details = (image_context or "").strip()
    if not image_details:
        image_details = "No attachment provided."

    # ================= PROMPT =================
    # IMPORTANT:
    # Double {{ }} are required because this is an f-string.
    prompt = f"""
You are an advanced harassment and safety risk analysis AI.

Your task:
Analyze the conversation like a HUMAN safety expert.

Conversation text:
{message_text}

Attachment / OCR context:
{image_details}

Detect:

1. Direct threats
2. Emotional manipulation
3. Coercion or pressure
4. Power imbalance
5. Sexual harassment
6. Intimidation patterns
7. Repeat aggression

Return STRICT JSON ONLY.

Expected format:

{{
  "threatLevel": "LOW|MEDIUM|HIGH",
  "severityScore": 0-10,
  "category": "...",
  "escalationRisk": "...",
  "indicators": [
    {{"name":"Threat Intent","score":0-10}},
    {{"name":"Manipulation","score":0-10}},
    {{"name":"Abuse Language","score":0-10}}
  ],
  "psychologySummary": "...",
  "recommendedActions": ["...", "..."]
}}

Rules:
- If OCR text contains abusive messages, treat them as real conversation.
- Use human judgement (not keyword matching).
- NEVER return markdown.
- Output ONLY valid JSON.
"""

    # ================= CALL LLM =================
    raw = goose_chat(prompt)

    if not raw:
        raw = ""

    # ================= CLEAN OUTPUT =================
    raw = raw.replace("```json", "").replace("```", "").strip()

    # ================= PARSE RESULT =================
    try:
        parsed = json.loads(raw)

        # safety defaults (prevents frontend crash)
        parsed.setdefault("threatLevel", "MEDIUM")
        parsed.setdefault("severityScore", 5)
        parsed.setdefault("category", "AI Behavioral Analysis")
        parsed.setdefault("escalationRisk", "Moderate")
        parsed.setdefault("indicators", [])
        parsed.setdefault("recommendedActions", [])

        return parsed

    except Exception:
        # ================= SAFE FALLBACK =================
        return {
            "threatLevel": "MEDIUM",
            "severityScore": 5,
            "category": "AI Parsing Fallback",
            "escalationRisk": "Moderate",
            "indicators": [],
            "psychologySummary": "Model response could not be parsed safely.",
            "recommendedActions": [
                "Review message manually",
                "Check OCR text quality"
            ],
            "rawModelOutput": raw
        }