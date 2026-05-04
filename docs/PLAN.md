# Group Travel Expense Calculator — Plan

## What We're Building
A browser-only React SPA that lets a group track shared travel expenses, record ad-hoc repayments, and auto-calculate the minimum set of transfers to fully settle the group. No backend, no login, CSV for persistence.

## Tech Stack
- React 18 + Vite
- PapaParse (CSV I/O)
- Plain CSS (no CSS framework)
- Firebase Hosting + GitHub Actions (CI/CD)

## Key Constraints
- Fully client-side — no server, no auth
- USD only
- State lost on page refresh unless saved to CSV
- Minimum supported browsers: Chrome 92+, Firefox 95+, Safari 15.4+

## Approval Gate Workflow
Every feature goes through: REQUIREMENTS → DESIGN → SPECS → TASKS (each approved before next). No code before Stage 4 is approved.

## Delivery Stages

| Stage | Status |
|-------|--------|
| Stage 1 — REQUIREMENTS | ✅ Approved |
| Stage 2 — DESIGN | ✅ Approved |
| Stage 3 — SPECS | ✅ Approved |
| Stage 4 — TASKS | ✅ Approved |
| Stage 5 — PLAN + progress.md | ✅ In progress |
| Stage 6 — Implementation | ✅ Complete (T01–T15) |
| T16 — Docs commit | ✅ In progress |
| T17 — Firebase setup + first deploy | ⬜ Pending |

## Features Delivered
- F1: Trip initialisation (New Trip / Load CSV)
- F2: Traveler setup
- F3: Expense capture with per-traveler splits and running totals
- F4: Additional payments (ad-hoc repayments)
- F5: Settlement calculation (greedy minimum-transfer algorithm)

## Immediate Next Actions
1. Commit all current files to new project-level git repo
2. Push to GitHub (new repo: group-travel-expense-calculator)
3. Create Firebase project and set up deploy.yml + GitHub Actions secret
4. Push to main → watch deploy → verify live URL
