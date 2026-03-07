import { useEffect, useMemo, useRef, useState } from "react";
import { service } from "../services/api";
import { pushToast } from "../components/ToastCenter";

const AURA_AVATAR_SRC = "/aura-avatar.jpg";

const QUICK_PROMPTS = [
  "I feel anxious and unsafe. Help me calm down first, then guide me.",
  "Explain key women protection laws in India in simple language.",
  "Teach me how to collect digital evidence for harassment safely.",
  "Ask me questions and create a step-by-step action plan.",
];

const formatTime = (date = new Date()) =>
  date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const renderInlineBold = (text) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) {
      return <strong key={`b-${index}`}>{part.slice(2, -2)}</strong>;
    }
    return <span key={`t-${index}`}>{part}</span>;
  });
};

const renderFormattedMessage = (text) => {
  const lines = String(text || "").split(/\r?\n/);

  return lines.map((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) {
      return <div key={`br-${index}`} className="aura-line-break" />;
    }

    const bulletMatch = trimmed.match(/^[-*]\s+(.*)$/);
    if (bulletMatch) {
      return (
        <div key={`bl-${index}`} className="aura-line-bullet">
          <span className="aura-line-bullet-mark">*</span>
          <span>{renderInlineBold(bulletMatch[1])}</span>
        </div>
      );
    }

    return (
      <div key={`ln-${index}`} className="aura-line-text">
        {renderInlineBold(trimmed)}
      </div>
    );
  });
};

export default function AIAssistantPage() {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "ai",
      text:
        "I am AURA Advanced. I can support emotional wellbeing, explain women-focused legal protections, answer questions, and teach practical safety steps.",
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
    inputRef.current?.focus();
  }, []);

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
        text:
          data?.reply ||
          "I am here with you. Share details and I will help with emotional support, legal awareness, and next steps.",
        time: formatTime(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      const fallback =
        error?.message ||
        "I could not respond right now. Please try again in a moment.";
      setMessages((prev) => [
        ...prev,
        { id: `ai-error-${Date.now()}`, role: "ai", text: fallback, time: formatTime() },
      ]);
      pushToast({
        type: "error",
        title: "AURA Unavailable",
        message: fallback,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <section className="container">
        <article className="assistant-hero-compact">
          <span className="assistant-hero-badge">AURA ADVANCED</span>
          <p className="assistant-hero-line">
            Emotional support, legal awareness, and guided learning in one private conversation.
          </p>
        </article>

        <section className="assistant-layout">
          <aside className="assistant-side">
            <article className="assistant-side-card">
              <h3>Modes</h3>
              <ul className="action-list">
                <li>Emotional grounding and calm response</li>
                <li>Women laws explanation with practical context</li>
                <li>Question-answer mode for clarity</li>
                <li>Step-by-step learning and action planning</li>
              </ul>
            </article>
            <article className="assistant-side-card">
              <h3>Suggested prompts</h3>
              <div className="assistant-chip-list">
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
            </article>
          </aside>

          <article className="assistant-chat-card">
            <header className="aura-header assistant-page-header">
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
                  <p className="aura-title">AURA Advanced Assistant</p>
                  <p className="aura-subtitle">Private support, legal awareness, guided learning</p>
                </div>
              </div>
            </header>

            <div className="assistant-messages aura-messages">
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
                    <div className="aura-message-text">{renderFormattedMessage(message.text)}</div>
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

            <footer className="aura-input-wrap assistant-input-wrap">
              <input
                ref={inputRef}
                value={input}
                maxLength={1200}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submitMessage();
                  }
                }}
                placeholder="Type your feelings, question, or what you want to learn..."
              />
              <button
                type="button"
                className="btn btn-primary btn-lift"
                disabled={!canSend}
                onClick={() => submitMessage()}
              >
                Send
              </button>
            </footer>
          </article>
        </section>
      </section>
    </main>
  );
}
