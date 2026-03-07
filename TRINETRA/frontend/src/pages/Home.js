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
      <section className="hero home-hero-clean">
        <p className="eyebrow">TRINETRA Safety Hub</p>
        <h1>Safer decisions in minutes</h1>
        <p className="hero-subtitle">
          Use AI tools for deepfake checks, harassment analysis, safer routes, and guided assistant support.
        </p>
        <div className="home-status-row">
          <p className="status-pill">{status}</p>
          <span className="home-kpi-pill">4 core tools</span>
          <span className="home-kpi-pill">fast response</span>
          <span className="home-kpi-pill">privacy-first UX</span>
        </div>
      </section>

      <section className="home-action-grid">
        <article className="home-action-card">
          <h3>Deepfake Detection</h3>
          <p>Upload media and get manipulation probability with confidence.</p>
          <Link to="/deepfake" className="btn btn-primary btn-lift home-action-btn">
            Open
          </Link>
        </article>

        <article className="home-action-card">
          <h3>Harassment AI</h3>
          <p>Classify harmful text severity and get immediate recommended actions.</p>
          <Link to="/harassment" className="btn btn-primary btn-lift home-action-btn">
            Open
          </Link>
        </article>

        <article className="home-action-card">
          <h3>Safe Route</h3>
          <p>Plan routes with risk cues like lighting, crowd, and incident density.</p>
          <Link to="/safe-route" className="btn btn-primary btn-lift home-action-btn">
            Open
          </Link>
        </article>

        <article className="home-action-card">
          <h3>AURA Assistant</h3>
          <p>Get emotional support, legal awareness, and step-by-step guidance.</p>
          <Link to="/assistant" className="btn btn-primary btn-lift home-action-btn">
            Open
          </Link>
        </article>
      </section>

      <section className="panel home-flow-panel">
        <h3>How to use TRINETRA</h3>
        <div className="home-flow-grid">
          <article>
            <p className="home-flow-step">Step 1</p>
            <p className="muted">Start with the tool matching your immediate concern.</p>
          </article>
          <article>
            <p className="home-flow-step">Step 2</p>
            <p className="muted">Review the risk output and evidence hints.</p>
          </article>
          <article>
            <p className="home-flow-step">Step 3</p>
            <p className="muted">Use AURA Assistant for next actions and legal-awareness Q&A.</p>
          </article>
        </div>
      </section>

      <section className="panel home-trust-panel">
        <h3>Designed for clarity</h3>
        <div className="home-trust-grid">
          <p className="muted">Single-screen actions</p>
          <p className="muted">Readable risk output</p>
          <p className="muted">Action-focused guidance</p>
          <p className="muted">Mobile-friendly layout</p>
        </div>
      </section>
    </main>
  );
}
