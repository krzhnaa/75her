# TRINETRA Project Documentation 

This file is the top-level summary for judges. Detailed logs are separated in `/docs` as requested.

## Documentation Structure
- `docs/project_documentation.md` 
- `docs/decision_log.md`
- `docs/risk_log.md`
- `docs/evidence_log.md`
- `docs/ai_trace_log.md`

## 1) 4-Line Problem Frame 
- **User:** Women and vulnerable users facing online abuse, suspected deepfakes, unsafe travel routes, and distress after digital harm.
- **Problem:** Safety actions are fragmented; users need one platform that turns raw evidence into clear next actions quickly.
- **Constraints:** Hackathon timeline, API rate limits/latency, model output uncertainty, legal-sensitivity, and mobile-first usability needs.
- **Success Test:** User completes one end-to-end safety flow in under 3 minutes and receives actionable guidance plus escalation links.

## 2) 3-Line Pitch 
- **Headline:** TRINETRA unifies deepfake checks, harassment intelligence, safe routing, and AI-guided support in one safety workspace.
- **Subhead:** We reduce response delay by converting fragmented evidence into structured risk output and practical next steps.
- **CTA:** Run one real scenario now and move from panic to informed action in minutes.

## 3) Solution Snapshot
- Frontend: React app with dedicated pages for each workflow and safety-oriented UX.
- Backend: FastAPI endpoints for deepfake, harassment, route planning, and assistant chat.
- AI Stack: OpenRouter (goose integration), Hugging Face inference, OCR.space, OpenRouteService.
- Escalation Design: High-risk outcomes route users toward complaint assistance paths.

## 4) Where to Find Full Judge Artifacts
- **Decision Log:** [`docs/decision_log.md`](decision_log.md)
- **Risk Log:** [`docs/risk_log.md`](risk_log.md)
- **Evidence Log:** [`docs/evidence_log.md`](evidence_log.md)
- **AI Trace Log:** [`docs/ai_trace_log.md`](ai_trace_log.md)

## 5) Submission Readiness Notes
- Logs are now separated and template-aligned.
- Team/member placeholders remain intentionally editable for final submission.
- Demo links can be finalized in `README.md` and `demo_video_link.txt`.
