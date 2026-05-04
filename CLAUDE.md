# Group Travel Expense Calculator — Project Context

## What This Is
A browser-only React SPA for tracking shared travel expenses among a group. No backend, no login. State persists via CSV export/import. Users add travelers, log expenses with per-traveler splits, record ad-hoc repayments, and calculate the minimum transfers to settle the group.

## GitHub Repo
https://github.com/shuvajyotibardhan-crco/group-travel-expense-calculator

## Tech Stack
- React 18 + Vite
- PapaParse (CSV I/O)
- Plain CSS per component
- Firebase Hosting + GitHub Actions CI/CD

## Architecture
- `src/state/useTripStore.jsx` — single global useReducer store; all state flows through here
- `src/engine/calculations.js` — pure functions: allocateExpense, computeBalances, settle
- `src/io/csvParser.js` + `csvExporter.js` — CSV import/export via PapaParse
- `src/components/` — one file per screen/panel
- `src/constants.js` — all magic values

## Key Rules / Gotchas
- All Acceptance Criteria must use "shall" or "must" only — no other modal verbs
- No firebase deploy from CLI on this machine — always use GitHub Actions
- Never ask user to run git commands manually — Claude runs them
- After every git push, watch the Actions run to completion with `gh run watch`
- Rounding: amounts split to 2dp; penny remainder goes to first traveler alphabetically
- ZERO_THRESHOLD = 0.01 used in settle() to absorb floating-point dust

## Global Rules Reference
See `/Users/shuvajyotibardhan/Projects/.claude_rules.md` for:
- Token Savings Rules (no full-file rewrites; diff only; check progress.md first)
- Documentation Rules (update REQUIREMENTS, DESIGN, SPECS, TASKS in same commit as code)
- AC Language Rule (shall / must only — no exceptions)
- Feature Delivery Workflow (Stages 1–6, each requiring approval)
- Global Deployment Verification Rule (watch gh run after every push)

## Deployment
- Firebase Hosting (static Vite build)
- GitHub Actions deploy on push to main
- FIREBASE_SERVICE_ACCOUNT stored as GitHub Actions secret
- No .env variables needed (fully client-side)

## Current Status (2026-05-04)
All features implemented. Firebase project not yet created. Next step: T17 — Firebase setup and first deploy.
