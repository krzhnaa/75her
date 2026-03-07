#75HER Challenge: AI Trace Log
Project Name: TRINETRA
Team Name: Sherr

## Purpose and Principles
This log documents how AI tools were used to accelerate delivery while preserving human ownership of decisions, verification, and final implementation.

## AI Trace Entries

### Trace 1: Code Generation (Harassment JSON Contract)
- Tool: goose via OpenRouter (`goose_chat`)
- Prompt: Generate structured harassment analysis output with threat level, severity score, indicators, and actions.
- AI Response: Returned draft threat-analysis schema and narrative.
- What We Kept: Core output fields (`threatLevel`, `severityScore`, `indicators`, `recommendedActions`).
- What We Changed: Enforced JSON-only behavior, removed markdown wrappers, and added parse fallback defaults.
- Verification: Manually tested malformed and valid cases; frontend remained stable on parse failures.

### Trace 2: Code Generation (Safe Route Risk Layer)
- Tool: goose via OpenRouter (`goose_chat`)
- Prompt: Produce route-risk estimates (lighting, crowd, incident density, overall score) as JSON.
- AI Response: Returned risk fields and reasoning text.
- What We Kept: Risk schema and reasoning concept.
- What We Changed: Added strict JSON parsing path and merged with deterministic route geometry from ORS.
- Verification: Ran multiple route queries and validated map and metric rendering.

### Trace 3: Safety Content (Assistant Policy Prompting)
- Tool: goose via OpenRouter (`goose_chat`)
- Prompt: Generate supportive, legal-awareness assistant behavior with non-judgmental and crisis-safe constraints.
- AI Response: Long-form supportive responses.
- What We Kept: Empathy-first style and practical next-step framing.
- What We Changed: Added legal-disclaimer requirements, uncertainty rules, and concise word-range/output formatting.
- Verification: Scenario prompts tested for distress, legal-awareness, and readability.

### Trace 4: Documentation Structuring
- Tool: AI coding/documentation assistant
- Prompt: Convert implementation evidence into #75HER required artifacts (problem frame, logs, pitch).
- AI Response: Draft documentation structure.
- What We Kept: Section architecture and checklist formatting.
- What We Changed: Replaced generic text with code-grounded evidence and project-specific risks.
- Verification: Cross-checked claims against files in `backend/app` and `frontend/src`.

### Trace 5: UX Readability Refinement
- Tool: AI coding assistant
- Prompt: Improve assistant text readability with bold and line-separated points.
- AI Response: Suggested rendering strategy.
- What We Kept: Structured line renderer pattern.
- What We Changed: Added explicit message formatting logic aligned with existing CSS theme.
- Verification: Manual UI checks with multiline and bullet-form responses.

## Usage Rules and Ethics
### Green Zone
- AI for ideation, scaffolding, and risk brainstorming.
- AI for code drafts followed by strict human validation.

### Yellow Zone
- Factual/legal language required human constraints and disclaimers.
- Third-party integration suggestions accepted only after code-level verification.

### Red Zone
- No unverifiable claims accepted as final.
- No private end-user data uploaded to AI tools during development.

## Submission Checklist
- [x] 3+ trace entries documented.
- [x] Each entry includes kept vs changed decisions.
- [x] Every entry includes verification method.
- [x] Trace connects to evidence/risk documentation.
