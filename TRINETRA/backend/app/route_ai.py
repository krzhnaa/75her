import asyncio
import os

import requests

from app.groq_ai import GroqAIError, SAFE_ROUTE_MODEL, groq_json_completion

ORS_KEY = os.getenv("ORS_API_KEY")
ORS_TIMEOUT = 30


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
        raise RuntimeError(f"OpenRouteService request failed: {detail}") from exc

    try:
        return response.json()
    except ValueError as exc:
        raise RuntimeError("OpenRouteService returned invalid JSON") from exc


def _bounded_score(value):
    try:
        numeric = float(value)
    except (TypeError, ValueError):
        numeric = 0.0
    return round(max(0.0, min(10.0, numeric)), 1)


def _risk_level_from_score(score):
    if score >= 7.0:
        return "HIGH"
    if score >= 4.0:
        return "MEDIUM"
    return "LOW"


def _derive_avoid_zones(distance_km, duration_min, risk_level):
    avoid_zones = []
    if risk_level == "HIGH":
        avoid_zones.append("Poorly lit stretches")
    if duration_min >= 40:
        avoid_zones.append("Long isolated segments")
    if distance_km >= 12:
        avoid_zones.append("Sparse monitoring junctions")
    if not avoid_zones:
        avoid_zones.append("Unverified shortcuts")
    return avoid_zones


def _normalize_route_risk(payload):
    if not isinstance(payload, dict):
        payload = {}

    risk_score = _bounded_score(payload.get("riskScore", 5))
    risk_level = str(payload.get("riskLevel", "")).upper()
    if risk_level not in {"LOW", "MEDIUM", "HIGH"}:
        risk_level = _risk_level_from_score(risk_score)

    explanation = payload.get("explanation")
    if not isinstance(explanation, str) or not explanation.strip():
        explanation = "AI route risk analysis completed."

    return {
        "riskLevel": risk_level,
        "riskScore": risk_score,
        "explanation": explanation.strip(),
        "analysisSource": "groq",
    }


def _fallback_route_risk(source, destination, distance_km, duration_min, reason=""):
    risk_score = min(9.4, max(2.2, round((distance_km * 0.18) + (duration_min * 0.04), 1)))
    risk_level = _risk_level_from_score(risk_score)

    explanation = (
        f"Fallback safety estimate for travel from {source} to {destination} "
        f"based on route length and duration."
    )
    if reason:
        explanation = f"{explanation} Groq unavailable: {reason}"

    return {
        "riskLevel": risk_level,
        "riskScore": risk_score,
        "explanation": explanation,
        "analysisSource": "fallback",
    }


def _route_metrics_from_risk(risk_score, distance_km, duration_min, risk_level):
    lighting_score = _bounded_score(max(1.5, 8.5 - (risk_score * 0.65)))
    crowd_score = _bounded_score(max(1.5, 7.8 - (distance_km * 0.05)))
    incident_density_score = _bounded_score(min(9.5, risk_score + 0.6))

    return {
        "overallRiskScore": risk_score,
        "lightingScore": lighting_score,
        "crowdScore": crowd_score,
        "incidentDensityScore": incident_density_score,
        "avoidZones": _derive_avoid_zones(distance_km, duration_min, risk_level),
        "reasoning": (
            f"{risk_level} route risk based on estimated safety conditions, "
            f"distance, and travel time."
        ),
    }


def geocode_city(city):
    url = "https://api.openrouteservice.org/geocode/search"
    params = {
        "api_key": ORS_KEY,
        "text": city,
        "size": 1,
    }

    data = _ors_json("GET", url, params=params)
    features = data.get("features") or []
    if not features:
        raise RuntimeError(f"Location not found: {city}")

    geometry = features[0].get("geometry") or {}
    coords = geometry.get("coordinates")
    if not isinstance(coords, list) or len(coords) < 2:
        raise RuntimeError(f"Geocoding returned invalid coordinates for: {city}")

    return coords


async def _groq_route_risk(source, destination, distance_km, duration_min):
    system_prompt = (
        "You are a women-focused route safety risk analysis AI. "
        "Return only valid JSON with riskLevel, riskScore, and explanation."
    )

    user_prompt = f"""
Analyze this travel route and estimate overall safety risk.

Route data:
{{
  "source": "{source}",
  "destination": "{destination}",
  "distanceKm": {distance_km},
  "durationMinutes": {duration_min}
}}

Return JSON only in this exact shape:
{{
  "riskLevel": "LOW | MEDIUM | HIGH",
  "riskScore": number,
  "explanation": string
}}
"""

    payload = await groq_json_completion(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        model=SAFE_ROUTE_MODEL,
        max_tokens=220,
        temperature=0.1,
    )
    return _normalize_route_risk(payload)


async def plan_safe_route(source, destination):
    source_coords, dest_coords = await asyncio.gather(
        asyncio.to_thread(geocode_city, source),
        asyncio.to_thread(geocode_city, destination),
    )

    url = "https://api.openrouteservice.org/v2/directions/driving-car/geojson"
    headers = {
        "Authorization": ORS_KEY,
        "Content-Type": "application/json",
    }
    body = {
        "coordinates": [source_coords, dest_coords],
        "instructions": False,
        "geometry_simplify": False,
    }

    data = await asyncio.to_thread(_ors_json, "POST", url, json=body, headers=headers)

    features = data.get("features") or []
    if not features:
        raise RuntimeError("No route was returned for the selected locations")

    feature = features[0]
    properties = feature.get("properties") or {}
    summary = properties.get("summary") or {}
    geometry = feature.get("geometry") or {}
    route_geometry = geometry.get("coordinates") or []

    if not route_geometry:
        raise RuntimeError("Route geometry is missing from the provider response")
    if "distance" not in summary or "duration" not in summary:
        raise RuntimeError("Route summary is missing distance or duration")

    route_coordinates = [[coord[1], coord[0]] for coord in route_geometry]
    distance_km = round(summary["distance"] / 1000, 1)
    duration_min = int(summary["duration"] / 60)

    try:
        route_risk = await _groq_route_risk(source, destination, distance_km, duration_min)
    except GroqAIError as exc:
        route_risk = _fallback_route_risk(
            source=source,
            destination=destination,
            distance_km=distance_km,
            duration_min=duration_min,
            reason=str(exc),
        )

    derived_metrics = _route_metrics_from_risk(
        risk_score=route_risk["riskScore"],
        distance_km=distance_km,
        duration_min=duration_min,
        risk_level=route_risk["riskLevel"],
    )
    derived_metrics["reasoning"] = route_risk["explanation"]

    return {
        "source": source,
        "destination": destination,
        "eta": f"{duration_min} min",
        "distance": f"{distance_km} km",
        "coordinates": route_coordinates,
        "safestPath": [source, "Main Route", destination],
        "liveShareUrl": "https://trinetra-demo/live",
        "sosContactsNotified": 3,
        **route_risk,
        **derived_metrics,
    }
