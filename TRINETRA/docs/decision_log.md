#75HER Challenge: Decision Log
Project Name: TRINETRA
Team Name: [Update Team Name]

## Purpose
Document key technical choices, why they were made, and tradeoffs accepted.

## Decision Log
| Category | Decision -> Why | Tradeoff |
|---|---|---|
| Tech Stack | React + FastAPI -> fast iteration speed and clear frontend/backend split under hackathon constraints. | No SSR; limited SEO and no backend-rendered pages. |
| AI Integration | OpenRouter gateway in `goose_ai.py` -> one integration point for multiple LLM tasks. | External dependency and potential rate-limit/latency variability. |
| Deepfake Pipeline | HF model + lightweight forensic heuristic blend -> better robustness than pure model score. | Heuristics are simplistic and may bias confidence in edge cases. |
| Harassment Analysis | Enforced structured JSON output from LLM -> reliable frontend rendering and clear risk cards. | Prompt complexity increased; still requires parse guardrails. |
| Resilience | Added parsing fallback defaults in harassment pipeline -> prevents UI break on malformed model output. | Fallback may reduce analytical depth when model output fails. |
| Routing Architecture | OpenRouteService for route geometry + LLM safety overlay -> deterministic pathing with contextual risk scoring. | Risk overlay not yet calibrated on verified incident datasets. |
| UX Scope | Dedicated `/assistant` page instead of floating popup -> better readability and serious-use interaction. | Adds one more navigation step from homepage. |
| Product Scope | Included complaint escalation flow (`/complaint`) in high-risk outcomes -> closes loop from analysis to action. | Escalation guidance is static, not jurisdiction-personalized yet. |
| Data Layer | Stateless prototype (no DB) -> simpler deploy and reduced privacy surface in hackathon phase. | No case history, trend analytics, or longitudinal personalization. |
| Privacy Posture | API keys loaded from environment variables -> avoids hardcoded secrets in repository code. | Requires disciplined deployment secret management and `.env.example`. |

## Submission Checklist
- [x] At least 5 decisions documented.
- [x] Every decision includes a clear tradeoff.
- [x] Decisions reflect implementation choices visible in code.
- [x] Organized by category.
