import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { service } from "../services/api";

export default function Home() {
  const [status, setStatus] = useState("Checking backend...");

  useEffect(() => {
    let mounted = true;
    service.health().then((res) => {
      if (!mounted) return;
      const label = res?.status || "ok";
      setStatus(`API status: ${label}`);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="container page">
      <section className="hero hero-upgraded">
        <div className="hero-content">
          <p className="eyebrow">Women Safety Intelligence</p>
          <h1>TRINETRA Unified AI Safety Platform</h1>
          <p className="hero-subtitle">
            A hackathon prototype combining deepfake detection, safer navigation,
            and AI-powered harassment severity scoring in one unified web app.
          </p>
          <div className="hero-actions">
            <Link to="/deepfake" className="btn btn-primary btn-lift">
              Start Deepfake Check
            </Link>
            <Link to="/safe-route" className="btn btn-secondary btn-lift">
              Plan Safe Route
            </Link>
          </div>
          <p className="status-pill">{status}</p>
        </div>
        <div className="hero-sidepanel">
          <p className="metric-label">Active Modules</p>
          <div className="hero-metrics">
            <article>
              <p className="metric-value">3</p>
              <p className="muted">AI Engines</p>
            </article>
            <article>
              <p className="metric-value">Realtime</p>
              <p className="muted">Threat Signals</p>
            </article>
            <article>
              <p className="metric-value">API Ready</p>
              <p className="muted">Production Paths</p>
            </article>
          </div>
        </div>
      </section>

      <section className="feature-grid">
        <article className="feature-card">
          <h3>Deepfake Detection</h3>
          <p>
            Upload image/video clips to get manipulation probability and forensic
            explanation.
          </p>
          <Link to="/deepfake" className="text-link">
            Open feature
          </Link>
        </article>

        <article className="feature-card">
          <h3>Safe Route Navigator</h3>
          <p>
            Route planning based on risk signals like incident density,
            crowd-footfall, and lighting quality.
          </p>
          <Link to="/safe-route" className="text-link">
            Open feature
          </Link>
        </article>

        <article className="feature-card">
          <h3>NLP Harassment Scorer</h3>
          <p>
            Analyze chats, comments, or messages to classify threat severity and
            escalation risk.
          </p>
          <Link to="/harassment" className="text-link">
            Open feature
          </Link>
        </article>
      </section>

      <section className="panel compliance-panel">
        <h3>#75HER AI/ML Track Readiness</h3>
        <p className="muted">
          This prototype is wired for backend AI endpoints and includes demo
          fallback mode so you can present today and connect goose-powered models
          next.
        </p>
        <p className="muted">
          Suggested backend env: <code>GOOSE_API_KEY</code>,{" "}
          <code>GOOSE_MODEL=claude-sonnet-4.6</code>
        </p>
      </section>
    </main>
  );
}
