import { useEffect, useMemo, useRef, useState } from "react";
import { service } from "../services/api";
import { pushToast } from "./ToastCenter";

const AURA_AVATAR_SRC = "/aura-avatar.jpg";

const QUICK_PROMPTS = [
  "I'm feeling anxious right now.",
  "How can I calm down after a stressful event?",
  "I don't feel safe. What should I do first?",
];

const formatTime = (date = new Date()) =>
  date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "ai",
      text:
        "Hi, I'm AURA. I'm here to support you emotionally and help you think through your next safe step.",
      time: formatTime(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);

  const inputRef = useRef(null);
  const endRef = useRef(null);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  const submitMessage = async (rawMessage) => {
    const message = (rawMessage || input).trim();
    if (!message || loading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: "user",
      text: message,
      time: formatTime(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const data = await service.assistantChat(message);
      const aiMsg = {
        id: `ai-${Date.now()}`,
        role: "ai",
        text: data?.reply || "I'm here with you. You can continue sharing.",
        time: formatTime(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      const fallback =
        error?.message ||
        "I couldn't respond right now, but I'm still here with you. Please try again.";
      setMessages((prev) => [
        ...prev,
        { id: `ai-error-${Date.now()}`, role: "ai", text: fallback, time: formatTime() },
      ]);
      pushToast({
        type: "error",
        title: "AURA Temporarily Unavailable",
        message: fallback,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="aura-widget">
      <button
        type="button"
        className={`aura-bubble ${open ? "aura-bubble-open" : ""}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Open AURA support assistant"
      >
        {!avatarFailed ? (
          <img
            src={AURA_AVATAR_SRC}
            alt="AURA avatar"
            className="aura-bubble-avatar"
            onError={() => setAvatarFailed(true)}
          />
        ) : (
          <span className="aura-bubble-icon">A</span>
        )}
      </button>

      {open && (
        <section className="aura-panel" aria-label="AURA support assistant panel">
          <header className="aura-header">
            <div className="aura-header-ident">
              {!avatarFailed ? (
                <img
                  src={AURA_AVATAR_SRC}
                  alt="AURA profile"
                  className="aura-header-avatar"
                  onError={() => setAvatarFailed(true)}
                />
              ) : (
                <span className="aura-header-fallback">A</span>
              )}
              <div className="aura-header-text">
                <p className="aura-title">AURA Support</p>
                <p className="aura-subtitle">Calm, private, judgment-free support</p>
              </div>
            </div>
            <button
              type="button"
              className="aura-close"
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
            >
              x
            </button>
          </header>

          <div className="aura-prompts">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className="aura-chip"
                disabled={loading}
                onClick={() => submitMessage(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="aura-messages">
            {messages.map((message) => (
              <article
                key={message.id}
                className={`aura-message-row ${message.role === "user" ? "aura-user-row" : "aura-ai-row"}`}
              >
                {message.role === "ai" && !avatarFailed ? (
                  <img
                    src={AURA_AVATAR_SRC}
                    alt=""
                    className="aura-msg-avatar"
                    onError={() => setAvatarFailed(true)}
                  />
                ) : null}
                <div className={`aura-message ${message.role === "user" ? "aura-user" : "aura-ai"}`}>
                  <p>{message.text}</p>
                  <span className="aura-time">{message.time}</span>
                </div>
              </article>
            ))}

            {loading ? (
              <article className="aura-message-row aura-ai-row">
                <div className="aura-message aura-ai aura-typing">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </article>
            ) : null}

            <div ref={endRef} />
          </div>

          <footer className="aura-input-wrap">
            <input
              ref={inputRef}
              value={input}
              maxLength={600}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submitMessage();
                }
              }}
              placeholder="Share what you're feeling..."
            />
            <button type="button" className="btn btn-primary btn-lift" disabled={!canSend} onClick={() => submitMessage()}>
              Send
            </button>
          </footer>
        </section>
      )}
    </div>
  );
}
