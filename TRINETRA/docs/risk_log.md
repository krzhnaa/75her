#75HER Challenge: Risk Log
Project Name: TRINETRA
Team Name: [Update Team Name]

## Purpose
Track issues identified during development, fixes applied, and evidence of resolution.

## Risk Log Table
| Area | Issue Description | Severity | Fix Applied | Evidence/Link | Status |
|---|---|---|---|---|---|
| Reliability | LLM returned non-JSON or markdown-wrapped JSON, breaking parser. | Major | Added strict JSON prompting, markdown-fence cleanup, and safe fallback payloads. | `backend/app/llm_ai.py` parse fallback; `backend/app/route_ai.py` JSON cleanup | Fixed |
| Mapping | Route API returns `[lon,lat]` but Leaflet expects `[lat,lon]`, causing incorrect plotting. | Major | Added explicit coordinate transform before frontend response. | `backend/app/route_ai.py` coordinate conversion comment + logic | Fixed |
| Safety UX | Assistant responses were too long and hard to scan in distress use cases. | Minor | Enforced short response policy plus structured headings and bullets with UI formatting renderer. | `backend/app/assistant_ai.py`, `frontend/src/pages/AIAssistantPage.js` | Fixed |
| Legal Safety | Users could interpret assistant output as formal legal advice. | Major | Added legal-awareness constraints, disclaimer requirement, and uncertainty policy in prompt. | `backend/app/assistant_ai.py` legal-awareness rules | Fixed |
| Security | CORS allows all origins (`*`) in backend. | Minor | Documented production hardening action to restrict allowed origins. | `backend/app/main.py` CORS config | Open |
| Input Validation | Deepfake route accepts file input but lacks strong MIME/size enforcement server-side. | Minor | Documented future guardrail: MIME and size checks with clear errors. | `backend/app/main.py` deepfake endpoint | Open |

## Self-Red-Team Checklist
### Privacy and Security
- [x] No API keys hardcoded in repository code paths.
- [x] No production PII datasets committed.

### Accuracy and Sources
- [x] Core external services documented in Evidence Log.
- [x] AI-generated claims framed as guidance, not guaranteed facts.

### Legal and IP
- [x] Third-party dependencies inventoried with license/terms status.
- [ ] Confirm media asset provenance for any externally sourced assets.

### Accessibility
- [x] Core interactive controls use semantic buttons/inputs.
- [ ] Perform explicit WCAG contrast and keyboard-only pass before submission lock.

### Operational
- [x] Frontend and backend run independently in local dev mode.
