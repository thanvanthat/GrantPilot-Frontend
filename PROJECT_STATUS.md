# GrantPilot — Project Status (Phases 1–6)

**GrantPilot** — AI-assisted Government Opportunity Intelligence & Qualification platform for Indian startups.
Frontend-only prototype with deterministic mock logic. No backend, no SNS Workbench, no LLM/RAG, no localStorage.

## Run it

```bash
cd "Grandpilot AI"
npm install
npm run dev
```

- **Local URL:** http://localhost:3000/
- **Login:** any email + password (mock auth) — e.g. `founder@aeroview.in` / anything.
- State is in-memory only, so a full page refresh signs you out and resets seed data. Navigate via the sidebar rather than reloading.
- Production build: `npm run build` (output in `dist/`).

## Tech stack

React 18 · Vite 5 · React Router 6 · Tailwind CSS · shadcn-style UI components · React Context for state.
Language is **JavaScript (.jsx)** — types are provided as JSDoc `@typedef`s in `src/types/index.js` (there is no TypeScript toolchain in this project).

## The connected workflow

```
Company Profile + Documents + Opportunity
        -> Qualification (score, eligibility, gaps, risks, PURSUE/REVIEW/SKIP)
        -> Proposal (drafted from the qualification, section guidance, readiness)
        -> Compliance Workspace (requirement checklist, documents, risks, readiness gate)
        -> Ready for Internal Review  OR  Needs Attention
```

Everything shares one context, keyed by `opportunityId`; no page keeps a duplicate copy of the data.

## What each phase delivered

- **Phase 1 — Foundation & design.** Vite/React/Tailwind scaffold, government-portal design system (saffron + navy, tricolour strip), navy sidebar + gov header shell, login/register, router, sample data (10 opportunities across sectors), SNS Workbench API stub.
- **Phase 2 — All pages, mock data.** Dashboard, Company Profile (validation + save), Documents (drag-drop upload), Opportunities (search/filter/sort), Opportunity Detail, Proposal Builder, Compliance — all working with mock state.
- **Phase 3 — Connected data layer.** Single `GrantPilotContext`, `services/snsWorkbench.js` abstraction (mock now, SNS later), opportunity status (New/Reviewing/Pursuing/Skipped), document lifecycle, dashboard counters derived from context.
- **Phase 4 — Qualification workspace.** Deterministic `qualificationEngine.js` (weighted score, eligibility, capability match, gaps, risks, evidence, recommendation, confidence), explainable UI with "Why this recommendation?", profile- and document-dependent results.
- **Phase 5 — Proposal workspace.** Qualification-aware drafting (cites matched capabilities, folds in gaps), per-section writing guidance, readiness with blockers, word count, regenerate-all, export.
- **Phase 6 — Compliance workspace.** `complianceEngine.js` consuming qualification + proposal + documents: requirement checklist (grouped, filter, search), document verification, risk register, reviewer state + notes, transparent readiness gate, blockers, next actions, printable/exportable report. Integrated into dashboard, opportunity detail and proposal pages.

## Key source files

```
src/
  utils/qualificationEngine.js     deterministic qualification scoring
  utils/complianceEngine.js        deterministic compliance readiness
  services/snsWorkbench.js         AI service abstraction (mock -> SNS later)
  context/AppContext.jsx           single shared application state
  data/                            opportunities, profile, documents, proposal sections
  types/index.js                   JSDoc type layer
  pages/                           Dashboard, Profile, Documents, Opportunities,
                                   OpportunityDetail, Proposals, Compliance, Auth
  components/{common,layout,opportunities,proposals,compliance}/
```

## Responsible-AI framing

GrantPilot presents **decision support**, not official determinations. The UI uses
"AI-assisted qualification / compliance readiness" and "Ready for Internal Review",
never "government approved", "guaranteed compliant", or "ready for submission".
Final submission is completed through the authorized government/procurement process
after responsible-team approval.

## Not yet implemented (later phases)

SNS Workbench connection, real LLM/RAG/embeddings/vector DB, PDF/OCR extraction,
government API integration, authentication backend, database persistence,
pipeline/reporting layer.
