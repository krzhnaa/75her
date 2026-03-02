import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { service } from "../services/api";
import { pushToast } from "../components/ToastCenter";
import ComplaintModal from "../components/ComplaintModal";

export default function Deepfake() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!result) return;
    const highRisk =
      Number(result.confidence) >= 75 ||
      String(result.label || "").toLowerCase().includes("deepfake");
    setShowComplaintModal(highRisk);
  }, [result]);

  const selectFile = (nextFile) => {
    setFile(nextFile);
    setError("");
    setResult(null);
  };

  const onAnalyze = async () => {
    if (!file) {
      setError("Please upload an image or video file first.");
      pushToast({
        type: "error",
        title: "Upload Required",
        message: "Select an image or video before running deepfake analysis.",
      });
      return;
    }

    setError("");
    setLoading(true);
    setResult(null);
    pushToast({
      type: "info",
      title: "Analysis Started",
      message: "Deepfake model is processing your upload.",
    });

    try {
      const data = await service.detectDeepfake(file);
      setResult(data);
      pushToast({
        type: "success",
        title: "Analysis Complete",
        message: `${data.label} (${data.confidence}%)`,
      });
    } catch (err) {
      const message = err?.message || "Deepfake analysis failed.";
      setError(message);
      pushToast({
        type: "error",
        title: "Analysis Failed",
        message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container page">
      <section className="panel ai-panel">
        <h2>Deepfake Detection</h2>
        <p className="muted">
          Upload content and get a confidence score with short forensic notes.
        </p>

        <div
          className={`dropzone ${dragActive ? "dropzone-active" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragActive(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            const nextFile = e.dataTransfer.files?.[0] || null;
            if (nextFile) selectFile(nextFile);
          }}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
        >
          <input
            ref={inputRef}
            className="hidden-file-input"
            type="file"
            accept="image/*,video/*"
            onChange={(e) => selectFile(e.target.files?.[0] || null)}
          />
          <p className="dropzone-title">Drop media here or click to browse</p>
          <p className="dropzone-subtitle">Supports images and short videos</p>
        </div>

        <div className="form-row form-row-stack">
          <button className="btn btn-primary btn-lift" onClick={onAnalyze} disabled={loading}>
            {loading ? (
              <span className="btn-loading">
                <span className="spinner" />
                Processing
              </span>
            ) : (
              "Analyze Deepfake"
            )}
          </button>
          {file ? <p className="file-meta">Selected file: {file.name}</p> : null}
        </div>

        {error ? <p className="error-banner">{error}</p> : null}

        {!loading && !result && !error ? (
          <div className="empty-state">
            <p className="empty-title">No report yet</p>
            <p className="muted">Upload content and run analysis to generate the AI forensic summary.</p>
          </div>
        ) : null}

        {loading ? (
          <div className="result-card shimmer-card">
            <div className="skeleton skeleton-line skeleton-title" />
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-bar" />
            <div className="skeleton skeleton-line skeleton-wide" />
          </div>
        ) : null}

        {result && (
          <div className="result-card result-reveal">
            <div className="result-header">
              <h3>Forensic Assessment</h3>
              <span
                className={`status-badge ${
                  result.label?.toLowerCase().includes("deepfake")
                    ? "status-danger"
                    : "status-safe"
                }`}
              >
                {result.label}
              </span>
            </div>

            <p className="metric-label">
              Confidence <strong className="metric-value">{result.confidence}%</strong>
            </p>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${result.confidence}%` }} />
            </div>

            <p>{result.explanation}</p>
            <p className="muted meta-line">Model: {result.model}</p>
          </div>
        )}
      </section>

      <ComplaintModal
        open={showComplaintModal}
        onClose={() => setShowComplaintModal(false)}
        type="deepfake"
        onProceed={() => {
          setShowComplaintModal(false);
          navigate("/complaint?source=deepfake");
        }}
      />
    </main>
  );
}
