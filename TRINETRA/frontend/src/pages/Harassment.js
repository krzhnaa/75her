import { useState } from "react";
import { service } from "../services/api";
import { pushToast } from "../components/ToastCenter";

export default function Harassment() {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const onAnalyze = async () => {
    if (!text.trim() && !file) {
      setError("Provide message text or upload a screenshot first.");
      pushToast({
        type: "error",
        title: "Input Required",
        message: "Add text or an attachment before analyzing.",
      });
      return;
    }

    setError("");
    setLoading(true);
    setResult(null);
    pushToast({
      type: "info",
      title: "Threat Scan Running",
      message: "TRINETRA AI is evaluating toxicity and escalation risk.",
    });

    try {
      const data = await service.analyzeHarassment(text.trim(), file);
      setResult(data);
      pushToast({
        type: "success",
        title: "Analysis Ready",
        message: `Threat level: ${data.threatLevel}`,
      });
    } catch (err) {
      const message = err?.message || "Analysis failed. Please retry.";
      setError(message);
      pushToast({
        type: "error",
        title: "Harassment Analysis Failed",
        message,
      });
    } finally {
      setLoading(false);
    }
  };

  const levelClass =
    result?.threatLevel === "HIGH"
      ? "status-danger"
      : result?.threatLevel === "MEDIUM"
      ? "status-warn"
      : "status-safe";

  return (
    <main className="container page">
      <section className="panel ai-panel">
        <h2>Harassment Severity Analyzer</h2>
        <p className="muted">
          NLP-based scoring for toxicity, threats, sexual content, and escalation
          risk.
        </p>

        <textarea
          rows="7"
          placeholder="Paste chat/email/comment text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="form-row">
          <input
            type="file"
            accept="image/*,.txt,.pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <button className="btn btn-primary btn-lift" onClick={onAnalyze} disabled={loading}>
            {loading ? (
              <span className="btn-loading">
                <span className="spinner" />
                Scanning
              </span>
            ) : (
              "Analyze Threat"
            )}
          </button>
        </div>

        {file ? <p className="file-meta">Attachment: {file.name}</p> : null}
        {error ? <p className="error-banner">{error}</p> : null}

        {!loading && !result && !error ? (
          <div className="empty-state">
            <p className="empty-title">Awaiting analysis</p>
            <p className="muted">Paste a message or upload evidence to generate a threat intelligence report.</p>
          </div>
        ) : null}

        {loading ? (
          <div className="result-card shimmer-card">
            <div className="skeleton skeleton-line skeleton-title" />
            <div className="skeleton skeleton-bar" />
            <div className="skeleton skeleton-line skeleton-wide" />
            <div className="skeleton skeleton-line" />
          </div>
        ) : null}

        {result && (
          <div className="result-card result-reveal">
            <div className="result-header">
              <h3>Threat Intelligence Report</h3>
              <span className={`status-badge ${levelClass}`}>
                {result.threatLevel}
              </span>
            </div>

            <div className="metric-grid">
              <article className="metric-card">
                <p className="metric-label">Severity Score</p>
                <p className="metric-value">{result.severityScore}/10</p>
                <div className="progress-track">
                  <div
                    className="progress-fill progress-danger"
                    style={{ width: `${Math.max(0, Math.min(100, result.severityScore * 10))}%` }}
                  />
                </div>
              </article>
              <article className="metric-card">
                <p className="metric-label">Category</p>
                <p className="metric-value">{result.category}</p>
              </article>
              <article className="metric-card">
                <p className="metric-label">Escalation Risk</p>
                <p className="metric-value">{result.escalationRisk}</p>
              </article>
            </div>

            {result.attachmentReceived && result.attachment && (
              <p className="muted meta-line">
                Attachment processed: {result.attachment.filename} (
                {result.attachment.contentType || "unknown"}, {result.attachment.sizeBytes} bytes)
              </p>
            )}

            <h4 className="section-title">Signal Indicators</h4>
            <div className="signal-grid">
              {result.indicators?.map((metric) => (
                <article key={metric.name} className="signal-card">
                  <p className="metric-label">{metric.name}</p>
                  <p className="metric-value">{metric.score}/10</p>
                </article>
              ))}
            </div>

            <h4 className="section-title">Recommended Actions</h4>
            <ul className="action-list">
              {result.recommendedActions?.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ul>

            {result.reasoning ? <p className="muted meta-line">Summary: {result.reasoning}</p> : null}
          </div>
        )}
      </section>
    </main>
  );
}
