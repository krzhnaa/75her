import { useState } from "react";
import { service } from "../services/api";

export default function Deepfake() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const onAnalyze = async () => {
    if (!file) {
      setError("Please upload an image or video file first.");
      return;
    }

    setError("");
    setLoading(true);
    setResult(null);

    try {
      const data = await service.detectDeepfake(file);
      setResult(data);
    } catch (_err) {
      setError("Unable to analyze right now. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container page">
      <section className="panel">
        <h2>Deepfake Detection</h2>
        <p className="muted">
          Upload content and get a confidence score with short forensic notes.
        </p>

        <div className="form-row">
          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <button className="btn btn-primary" onClick={onAnalyze} disabled={loading}>
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>

        {file && <p className="muted">Selected file: {file.name}</p>}
        {error && <p className="error">{error}</p>}

        {result && (
          <div className="result-card">
            <h3>{result.label}</h3>
            <p>
              Confidence: <strong>{result.confidence}%</strong>
            </p>
            <div
            style={{
                width: "100%",
                height: "10px",
                background: "#eee",
                borderRadius: "8px",
                marginTop: "8px",
            }}
            >
            <div
                style={{
                width: `${result.confidence}%`,
                height: "100%",
                background: "#cf2f2f",
                borderRadius: "8px",
                }}
            />
            </div>
            <p>{result.explanation}</p>
            <p className="muted">Model: {result.model}</p>
          </div>
        )}
      </section>
    </main>
  );
}
