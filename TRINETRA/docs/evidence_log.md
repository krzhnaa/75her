#75HER Challenge: Evidence Log
Project Name: TRINETRA
Team Name: [Update Team Name]

## Evidence Log Table
| Item / Claim | Purpose in Project | Source Link | Type | License / Attribution | Notes |
|---|---|---|---|---|---|
| React | Frontend app framework | https://react.dev | Code | MIT | Declared in `frontend/package.json` |
| React Router DOM | Route navigation and page structure | https://reactrouter.com | Code | MIT | Declared in `frontend/package.json` |
| Axios | Frontend API requests | https://axios-http.com | Code | MIT | Declared in `frontend/package.json` |
| Leaflet | Interactive map visualization | https://leafletjs.com | Code | BSD-2-Clause | Declared in `frontend/package.json` |
| React Leaflet | React integration for Leaflet | https://react-leaflet.js.org | Code | MIT | Declared in `frontend/package.json` |
| FastAPI | Backend API framework | https://fastapi.tiangolo.com | Code | MIT | Imported in `backend/app/main.py` |
| Requests | External HTTP calls in backend | https://requests.readthedocs.io | Code | Apache-2.0 | Used across backend adapters |
| python-dotenv | Load environment variables | https://pypi.org/project/python-dotenv/ | Code | BSD-3-Clause | Used in AI modules |
| Pillow (PIL) | Image preprocessing for heuristic forensics | https://python-pillow.org | Code | Pillow License | Used in `deepfake_ai.py` |
| OpenRouter Chat API | LLM inference backend | https://openrouter.ai/docs/api-reference | API | Service Terms | Accessed in `goose_ai.py` |
| HF Inference Router | Deepfake model inference endpoint | https://huggingface.co/docs/inference-providers/index | API | Service Terms + model-specific terms | Used in `deepfake_ai.py` |
| HF model: dima806/deepfake_vs_real_image_detection | Deepfake classification | https://huggingface.co/dima806/deepfake_vs_real_image_detection | Model | Verify model-card license before release | Endpoint configured in code |
| OpenRouteService | Geocoding + driving route geometry | https://openrouteservice.org | API | Service Terms | Used in `route_ai.py` |
| OCR.space API | OCR extraction from uploaded screenshots | https://ocr.space/ocrapi | API | Service Terms | Used in `ocr_ai.py` |
| Nominatim Search | Frontend autocomplete for locations | https://nominatim.openstreetmap.org | API/Data | OSM usage policy applies | Used in `locationApi.js` |
| OpenStreetMap + CARTO tiles | Base map and attribution in route map | https://www.openstreetmap.org/copyright | Data/Visual | ODbL + provider attribution | Attribution included in tile layer |

## AI-Generated Content Log
| AI Tool Used | Purpose | What AI Generated | What You Changed | Verification Method |
|---|---|---|---|---|
| goose (OpenRouter model via `goose_chat`) | Harassment analysis reasoning | Structured threat metadata candidates | Added strict JSON contract and parser fallback defaults | Manual endpoint tests with varied toxic and non-toxic inputs |
| goose (OpenRouter model via `goose_chat`) | Safe-route narrative risk overlay | Risk component estimates and avoid-zone suggestions | Stripped markdown fences and enforced JSON parse | Tested route generation and frontend render consistency |
| goose (OpenRouter model via `goose_chat`) | Assistant responses | Emotional/legal-awareness guidance text | Added safety constraints, disclaimer policy, and concise formatting rules | Manual prompt QA for distress and legal-awareness scenarios |
| AI coding assistant (development workflow) | Documentation and UI refinement | Drafted structured docs and UI wording | Human-edited for project-specific accuracy and constraints | Cross-checked against actual code files and routes |

### Required AI Note
For each AI-assisted artifact, the team retained ownership by validating outputs against runtime behavior, adding guardrails, and rejecting unsupported claims.

## Submission Checklist
- [x] 10+ sources/assets/dependencies documented.
- [x] Code dependencies listed with license/terms status.
- [x] AI-assisted outputs include change + verification records.
- [ ] Replace remaining team placeholders before final submission.
