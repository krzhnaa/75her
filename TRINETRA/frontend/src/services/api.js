import axios from "axios";

const LOCAL_API_BASE_URL = "http://127.0.0.1:8000";
const CONFIGURED_API_BASE_URL = (process.env.REACT_APP_API_BASE_URL || "").trim();

const isLocalBrowser = () => {
  if (typeof window === "undefined") return false;
  return ["localhost", "127.0.0.1"].includes(window.location.hostname);
};

const getApiBaseUrls = () => {
  const candidates = [];

  if (CONFIGURED_API_BASE_URL) {
    candidates.push(CONFIGURED_API_BASE_URL);
  }

  if (!CONFIGURED_API_BASE_URL) {
    candidates.push(LOCAL_API_BASE_URL);
  }

  if (isLocalBrowser() && !candidates.includes(LOCAL_API_BASE_URL)) {
    candidates.push(LOCAL_API_BASE_URL);
  }

  return [...new Set(candidates)];
};

const API_BASE_URLS = getApiBaseUrls();

const createClient = (baseURL) =>
  axios.create({
    baseURL,
    timeout: 90000,
  });

const apiClients = API_BASE_URLS.map((baseURL) => ({
  baseURL,
  client: createClient(baseURL),
}));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const scoreText = (text) => {
  const lower = text.toLowerCase();
  let score = 1.8;
  if (/(kill|rape|acid|murder|abduct|die)/.test(lower)) score += 4.2;
  if (/(nude|sexual|body|touch|harass)/.test(lower)) score += 2.0;
  if (/(again|daily|every day|repeatedly|spam)/.test(lower)) score += 1.2;
  return Math.min(9.9, Number(score.toFixed(1)));
};

const toThreatLabel = (score) => {
  if (score >= 7.5) return "HIGH";
  if (score >= 4.5) return "MEDIUM";
  return "LOW";
};

const getErrorMessage = (error, fallbackMessage) =>
  error?.response?.data?.detail ||
  error?.response?.data?.error ||
  error?.message ||
  fallbackMessage;

const shouldRetryWithFallback = (error, baseURL) => {
  if (baseURL === LOCAL_API_BASE_URL) return false;
  if (!API_BASE_URLS.includes(LOCAL_API_BASE_URL)) return false;

  const status = error?.response?.status;
  const message = getErrorMessage(error, "").toLowerCase();

  if (!status) return true;
  if (status >= 500) return true;
  if (message.includes("'choices'")) return true;
  if (message.includes("network error")) return true;
  if (message.includes("failed to fetch")) return true;

  return false;
};

const requestWithFallback = async (requestFactory, fallbackMessage) => {
  let lastError = null;

  for (const { client, baseURL } of apiClients) {
    try {
      const response = await requestFactory(client);
      return response.data;
    } catch (error) {
      lastError = error;
      if (!shouldRetryWithFallback(error, baseURL)) {
        break;
      }
    }
  }

  throw new Error(getErrorMessage(lastError, fallbackMessage));
};

const demoApi = {
  async health() {
    await sleep(200);
    return { status: "ok", platform: "TRINETRA demo mode" };
  },

  async detectDeepfake(file) {
    await sleep(1300);
    const filename = (file?.name || "uploaded-media").toLowerCase();
    const suspicious = /(ai|deepfake|synthetic|face-swap|swap)/.test(filename);
    const confidence = suspicious ? 88 : 41;
    return {
      label: suspicious ? "Likely Deepfake" : "Likely Authentic",
      confidence,
      explanation: suspicious
        ? "Frame-level inconsistencies detected in facial boundary regions."
        : "No strong manipulation markers in sampled keyframes.",
      model: "Demo Vision Forensics v0.1",
    };
  },

  async analyzeHarassment(payload) {
    await sleep(900);
    const inputText = payload?.text || "";
    const severityScore = scoreText(inputText);
    const threatLevel = toThreatLabel(severityScore);
    return {
      threatLevel,
      severityScore,
      category:
        severityScore >= 7.5
          ? "Criminal Intimidation + Sexual Harassment"
          : severityScore >= 4.5
            ? "Abusive / Threatening Language"
            : "Mild Toxicity / Monitoring Needed",
      escalationRisk:
        severityScore >= 7.5
          ? "Severe"
          : severityScore >= 4.5
            ? "Moderate"
            : "Low",
      indicators: [
        { name: "Toxicity", score: Math.min(10, severityScore + 0.6) },
        { name: "Threat Intent", score: Math.max(0, severityScore - 0.3) },
        { name: "Sexual Content", score: Math.max(0, severityScore - 1.1) },
        { name: "Repetition Pattern", score: Math.max(0, severityScore - 1.7) },
      ],
      recommendedActions: [
        "Preserve chat logs and screenshots as evidence.",
        "Trigger SOS and notify trusted contacts if immediate danger exists.",
        "Escalate to legal/authority channels for high-severity cases.",
      ],
    };
  },

  async assistantChat() {
    await sleep(700);
    return {
      reply:
        "I hear you. You are not alone, and your feelings are valid. If you want, tell me what happened step by step and we can think of a calm next action together.",
      source: "demo",
      mode: "support",
    };
  },
};

const service = {
  async health() {
    try {
      return await requestWithFallback(
        (client) => client.get("/"),
        "Health request failed"
      );
    } catch (_error) {
      return demoApi.health();
    }
  },

  async detectDeepfake(file) {
    const formData = new FormData();
    formData.append("file", file);

    return requestWithFallback(
      (client) =>
        client.post("/deepfake/detect", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        }),
      "Deepfake request failed"
    );
  },

  async analyzeHarassment(text, file) {
    const formData = new FormData();
    formData.append("text", text || "");
    if (file) formData.append("file", file, file.name);

    return requestWithFallback(
      (client) =>
        client.post("/harassment/analyze", formData, {
          timeout: 60000,
        }),
      "Harassment analysis request failed"
    );
  },

  async getSafeRoute(source, destination, options = {}) {
    return requestWithFallback(
      (client) =>
        client.post(
          "/safe-route/plan",
          {
            source,
            destination,
            ...options,
          },
          {
            timeout: 60000,
          }
        ),
      "Safe route request failed"
    );
  },

  async assistantChat(message) {
    return requestWithFallback(
      (client) =>
        client.post(
          "/assistant/chat",
          { message },
          { timeout: 60000 }
        ),
      "Assistant request failed"
    );
  },
};

const API = apiClients[0]?.client || createClient(LOCAL_API_BASE_URL);

export { API_BASE_URLS, service };
export default API;
