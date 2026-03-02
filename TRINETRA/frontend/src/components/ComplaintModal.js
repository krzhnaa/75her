import { useEffect } from "react";

export default function ComplaintModal({ open, onClose, type, onProceed }) {
  useEffect(() => {
    if (!open) return undefined;

    const onEsc = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onEsc);

    return () => {
      window.removeEventListener("keydown", onEsc);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return undefined;
    const timer = window.setTimeout(() => {
      onClose();
    }, 8000);
    return () => window.clearTimeout(timer);
  }, [open, onClose]);

  if (!open) return null;

  const title =
    type === "harassment"
      ? "High risk detected in harassment scan."
      : "High deepfake risk detected.";

  const message =
    "You can file an official complaint now with guided support.";

  return (
    <div className="complaint-topbar" role="alert" aria-live="polite">
      <div className="complaint-topbar-content">
        <p className="complaint-topbar-title">{title}</p>
        <p className="complaint-topbar-text">{message}</p>
      </div>
      <div className="complaint-topbar-actions">
        <button className="btn btn-primary btn-lift" onClick={onProceed}>
          File Complaint
        </button>
      </div>
    </div>
  );
}
