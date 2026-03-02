import { useState } from "react";
import { service } from "../services/api";
import RouteMap from "../components/RouteMap";
import { searchLocations } from "../services/locationApi";

export default function SafeRoute() {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [route, setRoute] = useState(null);
  const [sourceSuggestions, setSourceSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);

  const onFindRoute = async () => {
    if (!source.trim() || !destination.trim()) {
      setError("Enter both source and destination.");
      return;
    }

    setLoading(true);
    setError("");
    setRoute(null);

    try {
      const data = await service.getSafeRoute(
        source.trim(),
        destination.trim(),
        { userPreference: "safety-first" }
      );

      setRoute(data);
    } catch (err) {
      setError(err?.message || "Could not fetch route.");
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score) => {
    if (score >= 7) return "#c62828";
    if (score >= 4) return "#ef6c00";
    return "#2e7d32";
  };

  return (
    <main className="container page">
      <section className="panel">
        <h2>Safe Route Navigation</h2>
        <p className="muted">
          AI-powered route safety analysis using real travel data.
        </p>

        <div className="form-grid">
          <div className="autocomplete">
              <input
                placeholder="Source"
                value={source}
                onChange={async (e) => {
                  const val = e.target.value;
                  setSource(val);
                  const results = await searchLocations(val);
                  setSourceSuggestions(results);
                }}
              />

              {sourceSuggestions.length > 0 && (
                <div className="dropdown">
                  {sourceSuggestions.map((loc, i) => (
                    <div
                      key={i}
                      className="dropdown-item"
                      onClick={() => {
                        setSource(loc.name);
                        setSourceSuggestions([]);
                      }}
                    >
                      {loc.name}
                    </div>
                  ))}
                </div>
              )}
          </div>
          <div className="autocomplete">
            <input
              placeholder="Destination"
              value={destination}
              onChange={async (e) => {
                const val = e.target.value;
                setDestination(val);
                const results = await searchLocations(val);
                setDestSuggestions(results);
              }}
            />

            {destSuggestions.length > 0 && (
              <div className="dropdown">
                {destSuggestions.map((loc, i) => (
                  <div
                    key={i}
                    className="dropdown-item"
                    onClick={() => {
                      setDestination(loc.name);
                      setDestSuggestions([]);
                    }}
                  >
                    {loc.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={onFindRoute}
          disabled={loading}
        >
          {loading ? "Analyzing Route..." : "Find Safest Route"}
        </button>

        {error && <p className="error">{error}</p>}

        {route && (
          <div className="result-card">
            <h3>Safest Path Found</h3>

            <p>
              Route: <strong>{route.source}</strong> →{" "}
              <strong>{route.destination}</strong>
            </p>

            <p>
              Distance: <strong>{route.distance}</strong>
            </p>

            <p>
              ETA: <strong>{route.eta}</strong>
            </p>

            <p>
              Risk Score:
              <strong
                style={{
                  color: getRiskColor(route.overallRiskScore),
                  marginLeft: "8px",
                }}
              >
                {route.overallRiskScore}/10
              </strong>
            </p>

            <p>Path: {route.safestPath?.join(" → ")}</p>
            <p>Avoid Zones: {route.avoidZones?.join(", ")}</p>

            <p>
              Lighting: {route.lightingScore} | Crowd:{" "}
              {route.crowdScore} | Incident Density:{" "}
              {route.incidentDensityScore}
            </p>

            <p className="muted">
              AI Reasoning: {route.reasoning}
            </p>

            <p className="muted">
              Live Share URL: {route.liveShareUrl}
            </p>

            <p className="muted">
              SOS-ready contacts: {route.sosContactsNotified}
            </p>
            <div className="map-section">
              <RouteMap route={route} />
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
