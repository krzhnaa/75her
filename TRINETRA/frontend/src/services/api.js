import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000",
  timeout: 90000,
});

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

};

const service = {
  async health() {
    try {
      const res = await API.get("/");
      return res.data;
    } catch (_error) {
      return demoApi.health();
    }
  },

  async detectDeepfake(file) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await API.post("/deepfake/detect", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (error) {
        const serverMessage =
          error?.response?.data?.detail ||
          error?.message ||
          "Deepfake request failed";

        throw new Error(serverMessage);
      }
  },

  async analyzeHarassment(text, file) {
    try {
      const formData = new FormData();
      formData.append("text", text || "");
      if (file) formData.append("file", file, file.name);
      const res = await API.post("/harassment/analyze", formData, {
        timeout: 60000,
      });
      return res.data;
    } catch (error) {
      const serverMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        error?.message ||
        "Harassment analysis request failed";
      throw new Error(serverMessage);
    }
  },

  async getSafeRoute(source, destination, options = {}) {
    try {
      const res = await API.post("/safe-route/plan", {
        source,
        destination,
        ...options,
      }, {
        timeout: 60000,
      });
      return res.data;
    } catch (error) {
      const serverMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        error?.message ||
        "Safe route request failed";
      throw new Error(serverMessage);
    }
  },
};

export { service };
export default API;
