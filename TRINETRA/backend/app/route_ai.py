import os
import requests
from app.goose_ai import goose_chat

ORS_KEY = os.getenv("ORS_API_KEY")


# ---------- helper: city -> coordinates ----------
def geocode_city(city):

    url = f"https://api.openrouteservice.org/geocode/search"

    params = {
        "api_key": ORS_KEY,
        "text": city,
        "size": 1
    }

    r = requests.get(url, params=params)
    data = r.json()

    coords = data["features"][0]["geometry"]["coordinates"]

    return coords


# ---------- MAIN ROUTE FUNCTION ----------
async def plan_safe_route(source, destination):

    source_coords = geocode_city(source)
    dest_coords = geocode_city(destination)

    url = "https://api.openrouteservice.org/v2/directions/driving-car/geojson"

    headers = {
        "Authorization": ORS_KEY,
        "Content-Type": "application/json"
    }

    body = {
        "coordinates": [
            source_coords,
            dest_coords
        ],
        "instructions": False,
        "geometry_simplify": False
    }

    r = requests.post(url, json=body, headers=headers)
    data = r.json()

    feature = data["features"][0]
    summary = feature["properties"]["summary"]
    route_geometry = feature["geometry"]["coordinates"]
    # ORS returns [lon, lat]; Leaflet expects [lat, lon].
    route_coordinates = [[coord[1], coord[0]] for coord in route_geometry]

    distance_km = round(summary["distance"] / 1000, 1)
    duration_min = int(summary["duration"] / 60)

    # ---------- AI SAFETY REASONING ----------
    prompt = f"""
You are a women's safety navigation AI.

Route:
From {source} to {destination}
Distance: {distance_km} km
Duration: {duration_min} minutes

Estimate:
- overall risk score (0-10)
- lighting quality
- crowd level
- incident density

Return STRICT JSON ONLY:

{{
 "overallRiskScore": number,
 "lightingScore": number,
 "crowdScore": number,
 "incidentDensityScore": number,
 "avoidZones": ["...","..."],
 "reasoning": "short explanation"
}}
"""

    ai = goose_chat(prompt)

    import json
    ai = ai.replace("```json","").replace("```","").strip()
    ai_data = json.loads(ai)

    return {
        "source": source,
        "destination": destination,
        "eta": f"{duration_min} min",
        "distance": f"{distance_km} km",
        "coordinates": route_coordinates,
        "safestPath": [source, "Main Route", destination],
        "liveShareUrl": "https://trinetra-demo/live",
        "sosContactsNotified": 3,
        **ai_data
    }
