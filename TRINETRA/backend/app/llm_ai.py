import re

from app.groq_ai import HARASSMENT_MODEL, GroqAIError, groq_json_completion


def _bounded_score(value):
    try:
        numeric = float(value)
    except (TypeError, ValueError):
        numeric = 0.0
    return round(max(0.0, min(10.0, numeric)), 1)


def _clean_text(value, default):
    if isinstance(value, str):
        value = value.strip()
        if value:
            return value
    return default


def _normalize_list(values):
    if not isinstance(values, list):
        return []

    cleaned = []
    for item in values:
        if isinstance(item, str):
            text = item.strip()
            if text:
                cleaned.append(text)
    return cleaned


def _normalize_indicators(values, severity_score):
    if not isinstance(values, list):
        values = []

    normalized = []
    for item in values:
        if not isinstance(item, dict):
            continue
        name = _clean_text(item.get("name"), "")
        if not name:
            continue
        normalized.append({
            "name": name,
            "score": _bounded_score(item.get("score")),
        })

    if normalized:
        return normalized[:5]

    return [
        {"name": "Threat Intent", "score": _bounded_score(severity_score + 0.8)},
        {"name": "Manipulation", "score": _bounded_score(severity_score - 0.6)},
        {"name": "Abuse Language", "score": _bounded_score(severity_score - 0.3)},
    ]


def _level_from_score(score):
    if score >= 7.5:
        return "HIGH"
    if score >= 4.5:
        return "MEDIUM"
    return "LOW"


def _normalize_harassment_payload(payload):
    if not isinstance(payload, dict):
        payload = {}

    severity_score = _bounded_score(payload.get("severityScore", 5))
    threat_level = str(payload.get("threatLevel", "")).upper()
    if threat_level not in {"LOW", "MEDIUM", "HIGH"}:
        threat_level = _level_from_score(severity_score)

    psychology_summary = _clean_text(
        payload.get("psychologySummary"),
        "AI analysis completed."
    )

    normalized = {
        "threatLevel": threat_level,
        "severityScore": severity_score,
        "category": _clean_text(payload.get("category"), "AI Behavioral Analysis"),
        "escalationRisk": _clean_text(payload.get("escalationRisk"), threat_level.title()),
        "indicators": _normalize_indicators(payload.get("indicators"), severity_score),
        "psychologySummary": psychology_summary,
        "recommendedActions": _normalize_list(payload.get("recommendedActions")),
        "reasoning": psychology_summary,
        "analysisSource": "groq",
    }

    if not normalized["recommendedActions"]:
        normalized["recommendedActions"] = [
            "Preserve screenshots, timestamps, and sender details.",
            "Reduce direct engagement if the conversation is escalating.",
            "Contact trusted support or authorities if there is immediate danger.",
        ]

    return normalized


def _fallback_harassment_analysis(text="", image_context="", reason=""):
    combined = " ".join(part for part in (text, image_context) if part).lower()

    threat_hits = len(re.findall(r"\b(kill|murder|acid|rape|abduct|die|hurt|attack)\b", combined))
    coercion_hits = len(re.findall(r"\b(force|obey|send|come now|or else|leak|blackmail|control)\b", combined))
    sexual_hits = len(re.findall(r"\b(nude|sex|touch|body|kiss|sleep with me|harass)\b", combined))
    repetition_hits = len(re.findall(r"\b(again|daily|every day|constantly|spam|repeatedly)\b", combined))

    severity = 1.8 + (threat_hits * 2.8) + (coercion_hits * 1.6) + (sexual_hits * 1.4) + (repetition_hits * 0.8)
    if re.search(r"\b(kill|murder|acid|rape|abduct)\b", combined):
        severity = max(severity, 7.8)

    severity_score = _bounded_score(severity)
    threat_level = _level_from_score(severity_score)

    escalation_risk = {
        "LOW": "Low",
        "MEDIUM": "Moderate",
        "HIGH": "Severe",
    }[threat_level]

    category = {
        "LOW": "Concerning Language",
        "MEDIUM": "Abusive / Coercive Language",
        "HIGH": "Threats / Sexual Harassment",
    }[threat_level]

    summary = "Fallback analysis was used because the Groq response was unavailable."
    if reason:
        summary = f"{summary} {reason}"

    return {
        "threatLevel": threat_level,
        "severityScore": severity_score,
        "category": category,
        "escalationRisk": escalation_risk,
        "indicators": [
            {"name": "Threat Intent", "score": _bounded_score(2.0 + (threat_hits * 2.5))},
            {"name": "Manipulation", "score": _bounded_score(1.5 + (coercion_hits * 2.4))},
            {"name": "Abuse Language", "score": _bounded_score(1.2 + (sexual_hits * 1.8) + (repetition_hits * 1.1))},
        ],
        "psychologySummary": summary,
        "recommendedActions": [
            "Preserve screenshots, timestamps, and sender details.",
            "Avoid replying if the conversation is escalating.",
            "Contact trusted support or authorities if there is immediate danger.",
        ],
        "reasoning": summary,
        "analysisSource": "fallback",
    }


async def analyze_harassment_llm(text="", image_context=""):
    """
    Harassment and safety analysis powered by Groq.
    """

    message_text = (text or "").strip() or "(no user text provided)"
    image_details = (image_context or "").strip() or "No attachment provided."

    system_prompt = (
        "You are an advanced harassment and safety risk analysis AI. "
        "Return only valid JSON that matches the requested schema."
    )

    user_prompt = f"""
Analyze the following evidence like a human safety expert.

Conversation text:
{message_text}

Attachment / OCR context:
{image_details}

Detect:
- direct threats
- emotional manipulation
- coercion or pressure
- power imbalance
- sexual harassment
- intimidation patterns
- repeat aggression

Return JSON only with this structure:
{{
  "threatLevel": "LOW | MEDIUM | HIGH",
  "severityScore": number,
  "category": string,
  "escalationRisk": string,
  "indicators": [{{"name": string, "score": number}}],
  "psychologySummary": string,
  "recommendedActions": [string]
}}
"""

    try:
        payload = await groq_json_completion(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            model=HARASSMENT_MODEL,
            max_tokens=500,
            temperature=0.1,
        )
        return _normalize_harassment_payload(payload)
    except GroqAIError as exc:
        return _fallback_harassment_analysis(
            text=message_text,
            image_context=image_details,
            reason=str(exc),
        )
