#75HER Project: TRINETRA
One-line Value Proposition: Women and vulnerable users get AI-guided safety decisions in under 3 minutes with only a browser and API keys.

## Problem Statement
Who: Women and vulnerable users facing online abuse, suspected deepfakes, unsafe travel routes, and emotional distress after digital harm.
Problem: Safety actions are fragmented across multiple tools and portals, causing delay during high-stress moments.
Impact: Delayed response increases risk, weakens evidence quality, and reduces confidence in legal/escalation actions.

## Solution Overview
What we built: TRINETRA is a unified AI safety platform that combines deepfake detection, harassment threat analysis, safe-route risk scoring, and a guided assistant for emotional support and legal-awareness Q&A. It reduces decision friction by converting raw inputs into structured, actionable output.

Key Features:
- Deepfake Detection: Checks uploaded media with model output + forensic calibration to estimate authenticity risk.
- Harassment AI: Scores abusive text/screenshot context with threat indicators and recommended actions.
- Safe Route Intelligence: Computes route geometry and overlays AI risk dimensions (lighting, crowd, incident density).
- AURA Assistant: Provides calm support, legal-awareness guidance, and stepwise action planning.

## Quick Start & Demo Path
### Installation (1 Command)
Requirements: Node 18+, Python 3.9+, backend API keys (`OPENROUTER_API_KEY`, `HF_TOKEN`, `ORS_API_KEY`, `OCR_API_KEY`).

```bash
git clone <https://github.com/krzhnaa/75her.git> && cd TRINETRA && (cd backend && pip install fastapi uvicorn requests pillow python-dotenv python-multipart) && (cd ../frontend && npm install)
```

Run (two terminals):
```bash
# Terminal 1
cd backend && uvicorn app.main:app --reload --port 8000

# Terminal 2
cd frontend && npm start
```

Access: Open `http://localhost:3000` in your browser.

### 60-Second Demo Path
1. Open Deepfake Detection, upload a suspicious image -> receive authenticity label and confidence.
2. Open Harassment AI, paste abusive text or upload screenshot -> get threat level + actionable recommendations.
3. Open Safe Route or AURA Assistant -> receive route risk signals or guided legal-awareness support.

Demo Video: See `demo_video_link.txt` | Live Demo: [Insert Link]

## Technical Architecture
Components:
- Frontend: React + React Router + Leaflet map UI for safety workflows and visualization.
- Backend: FastAPI service exposing inference and safety endpoints.
- Database: None in current hackathon build (stateless API workflow).
- AI Integration: OpenRouter LLM calls (`goose_chat`) + Hugging Face deepfake inference + OCR.space OCR + OpenRouteService routing.

## goose Integration (AI/ML Track)
Model: OpenRouter model via `OPENROUTER_MODEL` (default in code: `anthropic/claude-3.5-sonnet`).
Implementation: goose powers harassment reasoning, safe-route risk explanation, and AURA assistant policy-driven responses.
Impact: Converts unstructured user evidence into structured decisions quickly without manual rule-authoring for every case.

## Project Logs & Documentation
| Log Type | Purpose | Link to Documentation |
|---|---|---|
| Decision Log | Technical choices and tradeoffs. | [`docs/decision_log.md`](docs/decision_log.md) |
| Risk Log | Issues identified and fixed. | [`docs/risk_log.md`](docs/risk_log.md) |
| Evidence Log | Sources, assets, and attributions. | [`docs/evidence_log.md`](docs/evidence_log.md) |
| AI Trace Log | AI usage with human verification. | [`docs/ai_trace_log.md`](docs/ai_trace_log.md) |
| Project Summary | Full narrative and judge-oriented framing. | [`docs/project_documentation.md`](docs/project_documentation.md) |

## Testing & Known Issues
Test Results: Manual end-to-end scenario testing completed across all 4 modules; automated unit/integration tests are not yet wired.
Known Issue: Safe-route risk dimensions are LLM-estimated and not yet calibrated against a production incident dataset.
Next Step: Add persistent case history + automated backend contract tests + stronger model output validation.

## Team & Acknowledgments
Team Name: [Update Team Name]

| Name | Role | GitHub | LinkedIn |
|---|---|---|---|
| [Member 1] | [Role] | [@username] | [Profile Link] |
| [Member 2] | [Role] | [@username] | [Profile Link] |
| [Member 3] | [Role] | [@username] | [Profile Link] |

Special thanks to: CreateHER Fest, mentors, and goose/Block.

## License & Attributions
Project License: [Select License: MIT / Apache-2.0 / etc.]

- React: MIT | https://react.dev
- FastAPI: MIT | https://fastapi.tiangolo.com
- Leaflet: BSD-2-Clause | https://leafletjs.com
- OpenStreetMap Data: ODbL | https://www.openstreetmap.org/copyright

Built for #75HER Challenge | CreateHER Fest 2026.
