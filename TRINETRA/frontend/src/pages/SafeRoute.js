import { useState } from "react";
import { service } from "../services/api";
import RouteMap from "../components/RouteMap";
import { searchLocations } from "../services/locationApi";
import { pushToast } from "../components/ToastCenter";

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
      pushToast({
        type: "error",
        title: "Missing Locations",
        message: "Add source and destination to generate a safe route.",
      });
      return;
    }

    setLoading(true);
    setError("");
    setRoute(null);
    pushToast({
      type: "info",
      title: "Route Analysis Started",
      message: "Gathering route, safety signals, and risk metrics.",
    });

    try {
      const data = await service.getSafeRoute(
        source.trim(),
        destination.trim(),
        { userPreference: "safety-first" }
      );

      setRoute(data);
      pushToast({
        type: "success",
        title: "Safest Route Ready",
        message: `${data.eta} | ${data.distance}`,
      });
    } catch (err) {
      const message = err?.message || "Could not fetch route.";
      setError(message);
      pushToast({
        type: "error",
        title: "Route Request Failed",
        message,
      });
    } finally {
      setLoading(false);
    }
  };

  const getRiskStatusClass = (score) => {
    if (score >= 7) return "status-danger";
    if (score >= 4) return "status-warn";
    return "status-safe";
  };

  return (
    <main className="container page">
      <section className="panel ai-panel">
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
          className="btn btn-primary btn-lift"
          onClick={onFindRoute}
          disabled={loading}
        >
          {loading ? (
            <span className="btn-loading">
              <span className="spinner" />
              Analyzing Route
            </span>
          ) : (
            "Find Safest Route"
          )}
        </button>

        {error ? <p className="error-banner">{error}</p> : null}

        {!loading && !route && !error ? (
          <div className="empty-state">
            <p className="empty-title">Route intelligence unavailable</p>
            <p className="muted">Enter two locations to generate a safety-first route and live map preview.</p>
          </div>
        ) : null}

        {loading ? (
          <div className="result-card shimmer-card">
            <div className="skeleton skeleton-line skeleton-title" />
            <div className="skeleton skeleton-line skeleton-wide" />
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-map" />
          </div>
        ) : null}

        {route && (
          <div className="result-card result-reveal">
            <div className="result-header">
              <h3>Safest Path Found</h3>
              <span className={`status-badge ${getRiskStatusClass(route.overallRiskScore)}`}>
                Risk {route.overallRiskScore}/10
              </span>
            </div>

            <p className="route-label">
              Route: <strong>{route.source}</strong> to <strong>{route.destination}</strong>
            </p>

            <div className="metric-grid">
              <article className="metric-card">
                <p className="metric-label">ETA</p>
                <p className="metric-value">{route.eta}</p>
              </article>
              <article className="metric-card">
                <p className="metric-label">Distance</p>
                <p className="metric-value">{route.distance}</p>
              </article>
              <article className="metric-card">
                <p className="metric-label">SOS Ready</p>
                <p className="metric-value">{route.sosContactsNotified}</p>
              </article>
            </div>

            <p>Path: {route.safestPath?.join(" -> ")}</p>
            <p>Avoid Zones: {route.avoidZones?.join(", ")}</p>

            <p>
              Lighting: {route.lightingScore} | Crowd: {route.crowdScore} | Incident Density:{" "}
              {route.incidentDensityScore}
            </p>

            <p className="muted">AI Reasoning: {route.reasoning}</p>

            <p className="muted">Live Share URL: {route.liveShareUrl}</p>
            <div className="map-section">
              <RouteMap route={route} />
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
