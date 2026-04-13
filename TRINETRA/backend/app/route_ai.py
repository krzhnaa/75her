import asyncio
import os
import requests

from app.groq_ai import GroqAIError, SAFE_ROUTE_MODEL, groq_json_completion

ORS_KEY = os.getenv("ORS_API_KEY")
ORS_TIMEOUT = 30


# -----------------------------
# Utility functions
# -----------------------------

def _read_provider_message(payload):
    if not isinstance(payload, dict):
        return None

    error = payload.get("error")

    if isinstance(error, dict):
        for key in ("message", "details", "code"):
            value = error.get(key)
            if isinstance(value, str) and value.strip():
                return value.strip()

    elif isinstance(error, str) and error.strip():
        return error.strip()

    message = payload.get("message")
    if isinstance(message, str) and message.strip():
        return message.strip()

    return None


def _ors_json(method, url, **kwargs):
    if not ORS_KEY:
        raise RuntimeError("ORS_API_KEY is not configured")

    try:
        response = requests.request(method, url, timeout=ORS_TIMEOUT, **kwargs)
        response.raise_for_status()

    except requests.RequestException as exc:

        provider_message = None

        if exc.response is not None:
            try:
                provider_message = _read_provider_message(exc.response.json())
            except ValueError:
                provider_message = exc.response.text.strip() or None

        detail = provider_message or str(exc)

        raise RuntimeError(
            f"OpenRouteService request failed: {detail}"
        ) from exc

    try:
        return response.json()
    except ValueError:
        raise RuntimeError("OpenRouteService returned invalid JSON")


def _bounded_score(value):
    try:
        numeric = float(value)
    except:
        numeric = 0.0

    return round(max(0.0, min(10.0, numeric)), 1)


def _risk_level_from_score(score):

    if score >= 7:
        return "HIGH"

    if score >= 4:
        return "MEDIUM"

    return "LOW"


# -----------------------------
# Geocoding
# -----------------------------

def geocode_city(city):

    url = "https://api.openrouteservice.org/geocode/search"

    params = {
        "api_key": ORS_KEY,
        "text": city,
        "size": 1,
        "boundary.country": "IND",   # improve accuracy
    }

    data = _ors_json("GET", url, params=params)

    features = data.get("features") or []

    if not features:
        raise RuntimeError(f"Location not found: {city}")

    coords = features[0]["geometry"]["coordinates"]

    if not coords or len(coords) < 2:
        raise RuntimeError(f"Invalid coordinates for: {city}")

    return coords


# -----------------------------
# Groq AI risk analysis
# -----------------------------

async def _groq_route_risk(source, destination, distance_km, duration_min):

    system_prompt = (
        "You are a women-focused route safety risk analysis AI. "
        "Return only JSON."
    )

    user_prompt = f"""
Analyze route safety.

Route:
{{
"source":"{source}",
"destination":"{destination}",
"distanceKm":{distance_km},
"durationMinutes":{duration_min}
}}

Return JSON:

{{
"riskLevel":"LOW|MEDIUM|HIGH",
"riskScore":number,
"explanation":string
}}
"""

    payload = await groq_json_completion(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        model=SAFE_ROUTE_MODEL,
        max_tokens=200,
        temperature=0.1
    )

    risk_score = _bounded_score(payload.get("riskScore", 5))

    risk_level = payload.get("riskLevel")

    if risk_level not in ["LOW", "MEDIUM", "HIGH"]:
        risk_level = _risk_level_from_score(risk_score)

    explanation = payload.get(
        "explanation",
        "AI route risk analysis completed"
    )

    return {
        "riskLevel": risk_level,
        "riskScore": risk_score,
        "explanation": explanation,
        "analysisSource": "groq"
    }


# -----------------------------
# Fallback risk
# -----------------------------

def _fallback_route_risk(source, destination, distance_km, duration_min):

    risk_score = min(
        9,
        max(2, round((distance_km * 0.2) + (duration_min * 0.04), 1))
    )

    risk_level = _risk_level_from_score(risk_score)

    return {
        "riskLevel": risk_level,
        "riskScore": risk_score,
        "explanation": f"Fallback safety estimate for route from {source} to {destination}",
        "analysisSource": "fallback"
    }


# -----------------------------
# MAIN ROUTE FUNCTION
# -----------------------------

async def plan_safe_route(source, destination):

    # get coordinates
    source_coords, dest_coords = await asyncio.gather(
        asyncio.to_thread(geocode_city, source),
        asyncio.to_thread(geocode_city, destination)
    )

    url = "https://api.openrouteservice.org/v2/directions/driving-car/geojson"

    headers = {
        "Authorization": ORS_KEY,
        "Content-Type": "application/json"
    }

    body = {
        "coordinates": [source_coords, dest_coords],

        # FIX: increase radius so routing doesn't fail
        "radiuses": [2000, 2000],

        "instructions": False,
        "geometry_simplify": False
    }

    data = await asyncio.to_thread(
        _ors_json,
        "POST",
        url,
        json=body,
        headers=headers
    )

    features = data.get("features") or []

    if not features:
        raise RuntimeError("No route found")

    feature = features[0]

    summary = feature["properties"]["summary"]

    geometry = feature["geometry"]["coordinates"]

    distance_km = round(summary["distance"] / 1000, 1)

    duration_min = int(summary["duration"] / 60)

    route_coordinates = [[c[1], c[0]] for c in geometry]

    # AI risk analysis
    try:

        route_risk = await _groq_route_risk(
            source,
            destination,
            distance_km,
            duration_min
        )

    except GroqAIError:

        route_risk = _fallback_route_risk(
            source,
            destination,
            distance_km,
            duration_min
        )

    return {
        "source": source,
        "destination": destination,

        "eta": f"{duration_min} min",

        "distance": f"{distance_km} km",

        "coordinates": route_coordinates,

        "riskLevel": route_risk["riskLevel"],

        "riskScore": route_risk["riskScore"],

        "reasoning": route_risk["explanation"],

        "liveShareUrl": "https://trinetra-demo/live",

        "sosContactsNotified": 3
    }
