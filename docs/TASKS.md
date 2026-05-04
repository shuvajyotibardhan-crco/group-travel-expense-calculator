# Group Travel Expense Calculator — Tasks

Tasks are listed in dependency order. Each task = one atomic commit. No task begins until its dependencies are complete.

---

### T01 — Project scaffold ✅
- Created package.json, vite.config.js, index.html, .gitignore, .env.example
- **Commit:** `chore: initialise Vite + React project scaffold`

### T02 — Git + GitHub setup ✅
- git init inside project dir, create GitHub repo, push to main
- **Commit:** `chore: initialise git repo and push to GitHub`

### T03 — Firebase Hosting setup (pending)
- Create Firebase project, add firebase.json and .firebaserc
- Create .github/workflows/deploy.yml
- Add FIREBASE_SERVICE_ACCOUNT GitHub Actions secret
- **Commit:** `chore: add Firebase Hosting config and GitHub Actions deploy workflow`

### T04 — Constants ✅
- Created src/constants.js
- **Commit:** `feat: add app-wide constants`

### T05 — Calculation engine ✅
- Created src/engine/calculations.js (allocateExpense, computeBalances, settle)
- **Commit:** `feat: add calculation engine`

### T06 — State store ✅
- Created src/state/useTripStore.jsx with useReducer, TripProvider, useTripStore
- **Commit:** `feat: add global trip state store`

### T07 — CSV parser ✅
- Created src/io/csvParser.js
- **Commit:** `feat: add CSV import parser`

### T08 — CSV exporter ✅
- Created src/io/csvExporter.js
- **Commit:** `feat: add CSV export`

### T09 — LandingScreen ✅
- Created src/components/LandingScreen.jsx + LandingScreen.css
- **Commit:** `feat: add LandingScreen`

### T10 — TravelerSetup ✅
- Created src/components/TravelerSetup.jsx + TravelerSetup.css
- **Commit:** `feat: add TravelerSetup`

### T11 — ExpenseManager ✅
- Created src/components/ExpenseManager.jsx + ExpenseManager.css
- **Commit:** `feat: add ExpenseManager`

### T12 — PaymentsManager ✅
- Created src/components/PaymentsManager.jsx + PaymentsManager.css
- **Commit:** `feat: add PaymentsManager`

### T13 — SettlementPanel ✅
- Created src/components/SettlementPanel.jsx + SettlementPanel.css
- **Commit:** `feat: add SettlementPanel`

### T14 — SaveButton ✅
- Created src/components/SaveButton.jsx + SaveButton.css
- **Commit:** `feat: add SaveButton`

### T15 — App routing + layout wiring ✅
- Updated src/App.jsx to manage screen state and compose all components
- Added src/App.css and src/index.css
- **Commit:** `feat: wire up App routing and main layout`

### T16 — CLAUDE.md + progress.md + all docs ✅
- Created CLAUDE.md, progress.md, docs/REQUIREMENTS.md, docs/DESIGN.md, docs/SPECS.md, docs/TASKS.md, docs/PLAN.md
- **Commit:** `docs: add CLAUDE.md, progress.md, and full docs suite`

### T17 — Firebase setup + first deploy (next)
- Create Firebase project in Firebase Console
- Set FIREBASE_SERVICE_ACCOUNT secret
- Add deploy.yml workflow
- Push to main; watch GitHub Actions run

---

## Dependency Order

```
T01 → T02 → T03
T01 → T04 → T05 → T06
T06 → T07 → T08
T06 → T09
T06 → T10
T06, T05 → T11
T06 → T12
T05, T06 → T13
T06, T08 → T14
T09–T14 → T15 → T16 → T17
```
