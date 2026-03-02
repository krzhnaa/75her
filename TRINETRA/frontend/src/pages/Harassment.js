import { useState } from "react";
import { service } from "../services/api";

export default function Harassment() {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const onAnalyze = async () => {
    if (!text.trim() && !file) {
      setError("Provide message text or upload a screenshot first.");
      return;
    }

    setError("");
    setLoading(true);
    setResult(null);

    try {
      const data = await service.analyzeHarassment(text.trim(), file);
      setResult(data);
    } catch (err) {
      setError(err?.message || "Analysis failed. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container page">
      <section className="panel">
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
          <button className="btn btn-primary" onClick={onAnalyze} disabled={loading}>
            {loading ? "Scoring..." : "Analyze Threat"}
          </button>
        </div>

        {file && <p className="muted">Attachment: {file.name}</p>}
        {error && <p className="error">{error}</p>}

        {result && (
          <div className="result-card">
            <h3>
            Threat Level:{" "}
            <span
                style={{
                background:
                    result.threatLevel === "HIGH"
                    ? "#ffdddd"
                    : result.threatLevel === "MEDIUM"
                    ? "#fff3cd"
                    : "#ddffdd",
                padding: "4px 10px",
                borderRadius: "8px",
                fontWeight: "bold",
                }}
            >
                {result.threatLevel}
            </span>
            </h3>
            <p>
              Severity Score: <strong>{result.severityScore}/10</strong>
            </p>
            <p>Category: {result.category}</p>
            <p>Escalation Risk: {result.escalationRisk}</p>
            {result.attachmentReceived && result.attachment && (
              <p className="muted">
                Attachment processed: {result.attachment.filename} (
                {result.attachment.contentType || "unknown"}, {result.attachment.sizeBytes} bytes)
              </p>
            )}
            <p className="muted">
              Signals:{" "}
              {result.indicators
                ?.map((metric) => `${metric.name} ${metric.score}/10`)
                .join(" | ")}
            </p>
            <p>Recommended Actions:</p>
            <ul>
              {result.recommendedActions?.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </main>
  );
}
