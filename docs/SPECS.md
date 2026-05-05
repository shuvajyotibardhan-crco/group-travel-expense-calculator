# Group Travel Expense Calculator — Specs

## Data Models

### `Traveler`
```js
{
  id: string,        // UUID v4, generated on add
  nickname: string,  // display name, unique (case-insensitive)
}
```

### `Expense`
```js
{
  id: string,          // UUID v4
  name: string,        // free text, e.g. "Hotel night 1"
  date: string,        // ISO 8601 date "YYYY-MM-DD"
  amount: number,      // positive float, USD, 2 decimal places
  paidById: string,    // Traveler.id of the payer
  applicableTo: string[], // array of Traveler.id — travelers sharing this expense
}
```

### `ExpenseSplit` (derived, never stored)
```js
{
  expenseId: string,
  travelerId: string,
  share: number,       // allocated share in USD, 2 decimal places
}
```
Computed on the fly by `allocateExpense()`; not persisted.

### `AdditionalPayment`
```js
{
  id: string,      // UUID v4
  fromId: string,  // Traveler.id — who paid
  toId: string,    // Traveler.id — who received
  amount: number,  // positive float, USD, 2 decimal places
  date: string,    // ISO 8601 date "YYYY-MM-DD"
}
```

### `Balance` (derived, never stored)
```js
{
  travelerId: string,
  net: number,  // negative = owes money, positive = is owed money, 0 = settled
}
```

### `Transfer` (derived, never stored)
```js
{
  from: string,   // Traveler.nickname
  to: string,     // Traveler.nickname
  amount: number, // positive float, USD, 2 decimal places
}
```

### `TripState` (root store shape)
```js
{
  screen: 'landing' | 'travelerSetup' | 'main',
  travelers: Traveler[],
  expenses: Expense[],
  additionalPayments: AdditionalPayment[],
}
```

---

## Storage Schema — CSV Format

The exported CSV uses **section headers** to separate entity types in a single file. PapaParse reads the file as raw text; the parser splits on section markers before delegating each block to PapaParse row parsing.

### Section 1 — Travelers
```
[TRAVELERS]
id,nickname
uuid-1,Alice
uuid-2,Bob
```

### Section 2 — Expenses
```
[EXPENSES]
id,name,date,amount,paidById,applicableTo
uuid-3,Hotel,2025-06-01,300.00,uuid-1,"uuid-1,uuid-2"
```
`applicableTo` is a double-quoted comma-separated list of Traveler IDs.

### Section 3 — Additional Payments
```
[PAYMENTS]
id,fromId,toId,amount,date
uuid-5,uuid-2,uuid-1,50.00,2025-06-02
```

### File naming convention
`trip-export-YYYY-MM-DD.csv` — date is the export date, generated at download time.

---

## API Endpoints

This app has no external API calls. All logic runs client-side. No network requests are made during normal operation.

---

## Algorithms

### `allocateExpense(amount, applicableTravelerIds, allTravelers)`
```
1. n ← length of applicableTravelerIds
2. totalCents ← round(amount * 100)
3. baseCents ← floor(totalCents / n)
4. remainder ← totalCents - baseCents * n
5. Sort applicableTravelerIds alphabetically by nickname
6. For each travelerId at index i:
     share ← (baseCents + (1 if i < remainder else 0)) / 100
7. Return map of { travelerId → share }
```

### `computeBalances(travelers, expenses, additionalPayments)`
```
1. Init balanceMap: { travelerId → 0 } for all travelers
2. For each expense e:
     splits ← allocateExpense(e.amount, e.applicableTo, travelers)
     For each travelerId in splits:
       balanceMap[travelerId] -= splits[travelerId]   // share owed
     balanceMap[e.paidById] += e.amount               // amount paid
3. For each additionalPayment p:
     balanceMap[p.fromId] += p.amount   // payer's due reduced
     balanceMap[p.toId]   -= p.amount   // receiver's entitlement reduced
4. Return balanceMap (negative = owes, positive = is owed)
```

### `settle(balanceMap, travelers)`
```
1. payers    ← entries where net < -ZERO_THRESHOLD, sorted ascending by net (most negative last)
2. receivers ← entries where net > ZERO_THRESHOLD, sorted ascending by net (lowest first)
3. transfers ← []
4. While payers is not empty AND receivers is not empty:
     p ← payers[0]
     r ← receivers[0]
     transferAmount ← min(abs(p.net), r.net)
     transfers.push({ from: nickname(p), to: nickname(r), amount: round2(transferAmount) })
     p.net += transferAmount
     r.net -= transferAmount
     If abs(p.net) < ZERO_THRESHOLD: remove p from payers
     If r.net < ZERO_THRESHOLD: remove r from receivers
5. Return transfers
```
Threshold of 0.01 handles floating-point dust so balances cleanly reach zero.

### CSV Parse Flow
```
1. Read file as UTF-8 text
2. Split on section markers: [TRAVELERS], [EXPENSES], [PAYMENTS]
3. For each section: pass block to PapaParse with header:true
4. Validate required columns exist — throw descriptive error if not
5. Validate each row: IDs non-empty, amounts numeric > 0, dates valid ISO
6. Reconstruct TripState; if any error: abort and return error message
```

### CSV Export Flow
```
1. Serialise travelers[] → CSV block with [TRAVELERS] header
2. Serialise expenses[] → CSV block with [EXPENSES] header
   (applicableTo array → comma-joined string)
3. Serialise additionalPayments[] → CSV block with [PAYMENTS] header
4. Concatenate all blocks with newline separators
5. Build Blob (text/csv) and default filename "trip-export-YYYY-MM-DD.csv"
6. Save strategy (tried in order):
   a. If window.showSaveFilePicker exists: open OS save dialog with suggestedName
      and accept filter ".csv"; write via FileSystemWritableFileStream; return.
      If user cancels (AbortError): return silently.
   b. Else if navigator.canShare({ files }) is true: call navigator.share({ files })
      to show OS share sheet (iOS/Android); return.
      If user cancels (AbortError): return silently.
   c. Else: create <a download> element, click it, revoke object URL (fallback).
```

---

## Configuration

All values are hardcoded constants in `src/constants.js`:

| Constant | Value | Purpose |
|----------|-------|---------|
| `ROUNDING_PRECISION` | `2` | Decimal places for all money values |
| `ZERO_THRESHOLD` | `0.01` | Floating-point dust threshold in settle() |
| `CSV_SECTION_TRAVELERS` | `[TRAVELERS]` | CSV section marker |
| `CSV_SECTION_EXPENSES` | `[EXPENSES]` | CSV section marker |
| `CSV_SECTION_PAYMENTS` | `[PAYMENTS]` | CSV section marker |
| `CSV_FILENAME_PREFIX` | `trip-export-` | Prefix for downloaded file |

---

## File Inventory

```
Group Travel Expense Calculator/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── LandingScreen.jsx      # New Trip / Load CSV entry point
│   │   ├── LandingScreen.css
│   │   ├── TravelerSetup.jsx      # Add/remove travelers
│   │   ├── TravelerSetup.css
│   │   ├── ExpenseManager.jsx     # Expense form + table + running totals
│   │   ├── ExpenseManager.css
│   │   ├── PaymentsManager.jsx    # Additional payments form + table
│   │   ├── PaymentsManager.css
│   │   ├── SettlementPanel.jsx    # Settle button + transfer list output
│   │   ├── SettlementPanel.css
│   │   ├── SaveButton.jsx         # Always-visible CSV export button
│   │   └── SaveButton.css
│   ├── engine/
│   │   └── calculations.js        # Pure fns: allocateExpense, computeBalances, settle
│   ├── io/
│   │   ├── csvParser.js           # PapaParse-based import + validation
│   │   └── csvExporter.js         # State → CSV download
│   ├── state/
│   │   └── useTripStore.jsx       # useReducer store + action types
│   ├── constants.js               # App-wide constants
│   ├── App.jsx                    # Root component, screen routing
│   ├── App.css                    # Root layout styles
│   ├── main.jsx                   # Vite entry point
│   └── index.css                  # Global reset/base styles
├── docs/
│   ├── PLAN.md
│   ├── REQUIREMENTS.md
│   ├── DESIGN.md
│   ├── SPECS.md
│   └── TASKS.md
├── .github/
│   └── workflows/
│       └── deploy.yml             # Build + Firebase Hosting deploy on push to main (project: travel-expense-calculato-e6c72)
├── .gitignore
├── .env.example                   # Placeholder (no env vars needed)
├── .firebaserc                    # Firebase project alias (default: travel-expense-calculato-e6c72)
├── firebase.json                  # Firebase Hosting config (public: dist/, SPA rewrite)
├── CLAUDE.md                      # Project context for future sessions
├── progress.md                    # Current task tracker
├── index.html                     # Vite HTML entry
├── vite.config.js
└── package.json
```

---

## Browser Compatibility

| Feature Used | Minimum Browser |
|-------------|----------------|
| React 18 | Chrome 64+, Firefox 67+, Safari 12+, Edge 79+ |
| `crypto.randomUUID()` | Chrome 92+, Firefox 95+, Safari 15.4+ |
| File input / `<input type="file">` | All modern browsers |
| `URL.createObjectURL()` (CSV download fallback) | Chrome 23+, Firefox 19+, Safari 7+ |
| `showSaveFilePicker()` (folder+filename picker) | Chrome 86+, Edge 86+ only |
| Web Share API with files (`navigator.share`) | iOS Safari 15+, Chrome for Android 89+ |
| CSS Grid / Flexbox | All modern browsers |
| ES2020 (optional chaining, nullish coalescing) | Chrome 80+, Firefox 74+, Safari 13.1+ |

**Minimum supported:** Chrome 92+, Firefox 95+, Safari 15.4+. No IE support.

---

## Security Notes

| Area | Decision |
|------|---------|
| No data leaves the browser | All computation client-side; no network calls |
| CSV import | Input validated before any state mutation; malformed files are rejected entirely |
| No `eval` or dynamic code execution | PapaParse uses safe string parsing only |
| No secrets or credentials | App requires no API keys; `.env.example` is a placeholder only |
| XSS | React's JSX escapes all rendered values by default; no `dangerouslySetInnerHTML` used |
