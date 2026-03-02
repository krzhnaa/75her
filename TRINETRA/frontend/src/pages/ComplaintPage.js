import { useMemo } from "react";
import { useLocation } from "react-router-dom";

export default function ComplaintPage() {
  const { search } = useLocation();

  const source = useMemo(() => {
    const params = new URLSearchParams(search);
    return params.get("source") || "general";
  }, [search]);

  const heading =
    source === "harassment"
      ? "Harassment Complaint Assistance"
      : source === "deepfake"
      ? "Deepfake Misuse Complaint Assistance"
      : "Complaint Assistance";

  return (
    <main className="container page">
      <section className="panel ai-panel complaint-panel">
        <h2>{heading}</h2>
        <p className="muted">
          Use these official channels to file a complaint safely. Keep evidence
          ready: screenshots, links, message logs, and timestamps.
        </p>

        <div className="complaint-grid">
          <article className="complaint-card">
            <h3>National Cyber Crime Portal</h3>
            <p className="muted">
              File online cyber complaints including impersonation, deepfake
              misuse, and threatening digital abuse.
            </p>
            <a
              className="btn btn-primary btn-lift"
              href="https://cybercrime.gov.in/"
              target="_blank"
              rel="noreferrer"
            >
              Open Cyber Crime Portal
            </a>
          </article>

          <article className="complaint-card">
            <h3>Women Safety Helplines</h3>
            <p className="muted">
              Access national and state support resources for legal, emergency,
              and counseling assistance.
            </p>
            <a
              className="btn btn-secondary btn-lift"
              href="https://www.wcd.nic.in/helplines"
              target="_blank"
              rel="noreferrer"
            >
              Open Helpline Directory
            </a>
          </article>
        </div>
      </section>
    </main>
  );
}
