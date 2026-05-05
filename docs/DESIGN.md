# Group Travel Expense Calculator — Design

## High-Level Overview

A fully client-side single-page application (SPA) with no backend, no authentication, and no cloud storage. All state lives in memory during the session and can be serialised to / deserialised from a local CSV file. The app is structured as a React SPA (Vite build tool) with a single global state object flowing down through components; all calculation logic is pure functions isolated from the UI layer, making them independently testable. The design philosophy is simplicity first: no external database, no login friction, works offline.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                   Browser (Client Only)              │
│                                                     │
│  ┌──────────┐    ┌────────────────────────────────┐ │
│  │ CSV I/O  │◄──►│         App State              │ │
│  │ (import/ │    │  travelers[], expenses[],      │ │
│  │  export) │    │  additionalPayments[]          │ │
│  └──────────┘    └──────────────┬─────────────────┘ │
│                                 │                   │
│         ┌───────────────────────▼──────────────┐   │
│         │            React UI Layer            │   │
│         │                                      │   │
│         │  ┌────────────┐  ┌────────────────┐  │   │
│         │  │  Landing   │  │ TravelerSetup  │  │   │
│         │  │  Screen    │  │   Component    │  │   │
│         │  └────────────┘  └────────────────┘  │   │
│         │  ┌────────────┐  ┌────────────────┐  │   │
│         │  │  Expense   │  │  Payments      │  │   │
│         │  │  Manager   │  │  Manager       │  │   │
│         │  └────────────┘  └────────────────┘  │   │
│         │  ┌────────────────────────────────┐  │   │
│         │  │      Settlement Panel          │  │   │
│         │  └────────────────────────────────┘  │   │
│         └──────────────────────────────────────┘   │
│                                                     │
│         ┌──────────────────────────────────────┐   │
│         │         Calculation Engine           │   │
│         │  computeBalances() · settle()        │   │
│         │  allocateExpense() · roundSplit()     │   │
│         └──────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
          │
          ▼
   Firebase Hosting (static files, CDN)
   GitHub Actions (build + deploy on push to main)
```

---

## Module Design

### `src/state/useTripStore.jsx`
Central state store using React `useReducer`. Holds the single source of truth: `travelers`, `expenses`, `additionalPayments`, `screen`. All mutations go through a reducer with typed action names (`ADD_TRAVELER`, `ADD_EXPENSE`, `EDIT_EXPENSE`, `DELETE_EXPENSE`, `ADD_PAYMENT`, `EDIT_PAYMENT`, `DELETE_PAYMENT`, `LOAD_CSV`, `RESET`, `SET_SCREEN`). No component mutates state directly.

### `src/engine/calculations.js`
Pure functions only — no React imports, no side effects:
- `allocateExpense(amount, travelerIds, allTravelers)` — splits amount across checked travelers; rounding remainder goes to first traveler alphabetically
- `computeBalances(travelers, expenses, payments)` — returns a map of `{ traveler.id → netBalance }` where negative = owes, positive = is owed
- `settle(balanceMap, travelers)` — greedy minimum-transfer algorithm; returns an ordered array of `{ from, to, amount }` transfer objects

### `src/components/LandingScreen.jsx`
Entry point. Renders "New Trip" and "Load from CSV" buttons. Handles file-picker logic and delegates CSV parsing to `src/io/csvParser.js`.

### `src/components/TravelerSetup.jsx`
Form to add/remove traveler nicknames. Enforces duplicate and blank-name validation. Emits to store via dispatch. Shows "Done" button when ≥ 2 travelers exist.

### `src/components/ExpenseManager.jsx`
Expense entry form + expenses table. Computes and displays per-traveler allocated share and running totals inline. Supports add, edit (inline), and delete.

### `src/components/PaymentsManager.jsx`
Additional payments form + payments table. Validates From ≠ To. Supports add, edit, delete.

### `src/components/SettlementPanel.jsx`
Renders the "Settle" button and the settlement result list. Calls `computeBalances` and `settle` on click. Displays "Everyone is settled" or a numbered transfer list.

### `src/components/SaveButton.jsx`
Always-visible "Save to CSV" button in the app header. Calls `src/io/csvExporter.js` to serialise current state and save the file using the best available browser API.

### `src/io/csvParser.js`
Parses an uploaded CSV file using PapaParse. Validates required columns; throws a descriptive error on malformed input. Returns a normalised state object.

### `src/io/csvExporter.js`
Serialises current state to CSV rows using PapaParse. Handles the multi-section format (travelers, expenses, payments) in a single file with section headers. Save strategy: `showSaveFilePicker` (Chrome/Edge — user picks folder and filename), then Web Share API (iOS/Android — OS share sheet for iCloud Files, Google Drive, etc.), then `<a download>` fallback.

---

## Design Considerations

**Why React + Vite?**
The app has significant interdependent state (travelers feed expense dropdowns, expense splits feed balances, balances feed settlement). React's component model and `useReducer` give a clean, predictable update cycle without the complexity of a full state library. Vite gives fast local dev and a minimal production bundle with no config overhead.

**Why no backend?**
The feature set is entirely calculable client-side. Adding a backend would introduce auth, hosting costs, and network latency with no benefit. CSV export/import gives persistence without any server.

**Why PapaParse for CSV?**
Robust edge-case handling (quoted commas, line endings, encoding) that a hand-rolled parser would miss. Lightweight (no transitive deps).

**Why a single global reducer instead of local component state?**
Running totals and balances are derived from the full dataset. Local state per component would require prop-drilling or complex lifting. A single store with pure derivation functions keeps the logic testable and the components thin.

**Why greedy minimum-transfer settlement?**
Optimal (minimum number of transactions) for the typical group size (2–15 people). The algorithm is O(n log n) — fast enough that no memoisation is needed for the target scale.

**Rounding strategy:**
Split amounts rounded to 2 decimal places; remainder allocated to the first traveler alphabetically. This ensures the sum of splits always equals the original expense amount exactly.

---

## Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| UI Framework | React 18 | Component model suits interdependent state |
| Build Tool | Vite | Fast dev server, minimal config, optimised bundle |
| State Management | React useReducer | Sufficient for single-page, no external lib needed |
| CSV I/O | PapaParse | Robust parsing, handles edge cases |
| Styling | Plain CSS files per component | Scoped by naming convention, no runtime cost |
| Hosting | Firebase Hosting | CDN, free tier, existing workflow on this machine |
| CI/CD | GitHub Actions | Automated build + deploy on push to main |

---

## Deployment

- Firebase Hosting serves the static Vite build (`dist/`)
- `.github/workflows/deploy.yml` triggers on push to `main`: runs `npm ci`, `npm run build`, then `FirebaseExtended/action-hosting-deploy@v0`
- `FIREBASE_SERVICE_ACCOUNT` stored as a GitHub Actions secret
- No environment variables required at build time (fully client-side, no API keys)

---

## Constraints & Known Limitations

| Constraint | Detail |
|-----------|--------|
| No persistence across browser sessions | State is lost on page refresh unless user saves to CSV first |
| Single currency (USD) | No multi-currency support; all amounts treated as USD |
| No user accounts | Anyone with the CSV file can load and edit the trip |
| Rounding artefacts | Penny-level rounding allocated to first traveler alphabetically — visible in edge cases |
| CSV format is app-specific | The exported CSV is not compatible with general spreadsheet import without reformatting |
| Max practical traveler count | Algorithm and UI untested above ~20 travelers |
