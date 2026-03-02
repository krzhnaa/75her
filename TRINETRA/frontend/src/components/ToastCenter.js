import { useEffect, useState } from "react";

const TOAST_EVENT = "trinetra:toast";

export function pushToast({ type = "info", title = "Notice", message = "" }) {
  window.dispatchEvent(
    new CustomEvent(TOAST_EVENT, {
      detail: { type, title, message },
    })
  );
}

export default function ToastCenter() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const onToast = (event) => {
      const detail = event?.detail || {};
      const id = `${Date.now()}-${Math.random()}`;
      const toast = {
        id,
        type: detail.type || "info",
        title: detail.title || "Notice",
        message: detail.message || "",
      };

      setToasts((prev) => [...prev, toast]);

      window.setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== id));
      }, 3600);
    };

    window.addEventListener(TOAST_EVENT, onToast);
    return () => window.removeEventListener(TOAST_EVENT, onToast);
  }, []);

  return (
    <div className="toast-center" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <p className="toast-title">{toast.title}</p>
          {toast.message ? <p className="toast-message">{toast.message}</p> : null}
        </div>
      ))}
    </div>
  );
}
