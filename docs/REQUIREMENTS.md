# Group Travel Expense Calculator — Requirements

## Overview
A client-side web app that lets a group of travelers track shared expenses, record who paid what, log ad-hoc repayments between travelers, and calculate the minimum set of transfers needed to fully settle the group.

## Scope

**In scope:**
- Browser-only, no backend, no login
- Start fresh or load from a local CSV file
- Save state to a local CSV file
- Add/view travelers, expenses, expense splits, additional payments
- Settlement calculation with minimum-transfer algorithm

**Out of scope:**
- Multi-currency conversion
- Cloud storage / sync
- Authentication
- Email or push notifications

---

## Feature 1 — Trip Initialisation (Fresh or CSV)

**User story:** As a group organiser I want to start a new trip plan or load an existing one from a CSV so that I can pick up where I left off.

### Acceptance Criteria
1. The app shall display two options on the landing screen: "New Trip" and "Load from CSV".
2. Selecting "New Trip" shall clear all state and navigate to the traveler-name entry screen.
3. Selecting "Load from CSV" shall open a file-picker restricted to `.csv` files.
4. A valid CSV shall be parsed and all travelers, expenses, splits, and additional payments shall be restored exactly as saved.
5. If the CSV is malformed or missing required columns, the app shall display a descriptive error message and must not load partial data.
6. A "Save to CSV" button shall be available at all times once a trip is active, and must export all current data to a `.csv` file. On browsers that support the File System Access API (Chrome/Edge), the user shall be presented with a save dialog to choose the destination folder and filename before saving. On iOS/Android browsers that support the Web Share API, the OS share sheet shall be shown so the user can save to iCloud Files, Google Drive, OneDrive, or any other app. On other browsers the file must be downloaded automatically to the default downloads folder.

### Test Plan

| Step | Expected Result |
|------|----------------|
| Click "New Trip" | Landing disappears; traveler-name screen shown; all state empty |
| Click "Load from CSV", select valid file | All data restored; user lands on expense summary screen |
| Click "Load from CSV", select corrupt file | Error banner shown; no data loaded; landing screen remains |
| Click "Save to CSV" mid-session on Chrome/Edge | Save dialog opens; user chooses folder and filename; file written to chosen location |
| Click "Save to CSV" mid-session on iOS Safari | OS share sheet appears; user can save to iCloud Files, Google Drive, OneDrive, etc. |
| Click "Save to CSV" mid-session on other browsers | Browser auto-downloads a `.csv` to the default downloads folder |
| Cancel the save dialog or share sheet | Nothing saved; no error shown |
| Reload downloaded CSV via "Load from CSV" | All data restored identically |

---

## Feature 2 — Traveler Setup

**User story:** As a group organiser I want to enter the nicknames of all travelers so that the app knows who to track expenses against.

### Acceptance Criteria
1. The traveler-setup screen shall provide an input field and an "Add Traveler" button.
2. Submitting a non-empty nickname shall add it to the traveler list displayed on screen.
3. The app must not allow duplicate nicknames (case-insensitive).
4. The app must not allow an empty or whitespace-only nickname to be added.
5. Each traveler entry shall show a remove button; removing a traveler must only be permitted before any expenses are entered.
6. The traveler list shall persist for the lifetime of the trip and must be used as the source for all dropdowns and checkboxes throughout the app.
7. A "Done — Add Expenses" button shall appear once at least two travelers are in the list.

### Test Plan

| Step | Expected Result |
|------|----------------|
| Enter "Alice", click "Add" | "Alice" appears in traveler list |
| Enter "alice" again, click "Add" | Error shown: duplicate name; list unchanged |
| Enter "   ", click "Add" | Error shown: blank name; list unchanged |
| Add two travelers, click remove on first | First traveler removed from list |
| Add an expense, then try to remove a traveler | Remove button disabled or hidden; error shown |
| Click "Done — Add Expenses" with 2+ travelers | Navigate to expense entry screen |

---

## Feature 3 — Expense Capture

**User story:** As a traveler I want to log each shared expense with its name, date, amount, payer, and which travelers it applies to so that the app can calculate each person's share.

### Acceptance Criteria
1. The expense entry form shall include: Expense Name (text), Expense Date (date picker), Amount (numeric, USD), Paid By (dropdown of travelers), and Applicable To (checkbox list of all travelers).
2. All five fields shall be mandatory; the app must not save an expense with any field empty.
3. Amount must be a positive number greater than zero; the app must reject zero or negative values.
4. At least one traveler must be checked under "Applicable To" before the expense can be saved.
5. On save, the expense shall appear in a running expenses table showing: name, date, amount, payer, applicable travelers, and per-traveler allocated share.
6. The per-traveler share for a given expense shall be calculated as: `amount ÷ number of checked travelers`, rounded to 2 decimal places; any rounding remainder shall be added to the first traveler alphabetically.
7. The expenses table shall maintain a running total column per traveler showing the cumulative share owed across all expenses.
8. The expenses table shall maintain a running total column per traveler showing the cumulative amount paid across all expenses.
9. An expense shall be editable and deletable at any time; editing or deleting must immediately recalculate all totals.

### Test Plan

| Step | Expected Result |
|------|----------------|
| Submit expense with Amount = 0 | Validation error; expense not saved |
| Submit expense with no traveler checked | Validation error; expense not saved |
| Add $90 expense applicable to 4 travelers | Each traveler allocated $22.50 |
| Add $10 expense applicable to 3 travelers | Each allocated $3.33; first traveler alphabetically gets $3.34 |
| Edit expense amount; check running totals | Running totals update immediately |
| Delete an expense; check running totals | Running totals reduce correctly |

---

## Feature 4 — Additional Payments (Ad-hoc Repayments)

**User story:** As a traveler I want to record ad-hoc payments made between travelers outside of expenses so that partial settlements are reflected in the final balance.

### Acceptance Criteria
1. The additional payments section shall provide a form with: From (dropdown of travelers), To (dropdown of travelers), Amount (numeric, USD), and Date (date picker).
2. All four fields shall be mandatory; the app must not save a payment with any field empty.
3. The "From" and "To" dropdowns must not allow the same traveler to be selected for both fields.
4. Amount must be a positive number greater than zero.
5. On save, the payment shall appear in an additional-payments table showing: from, to, amount, date.
6. For the paying traveler ("From"), the recorded payment amount shall reduce their net balance due.
7. For the receiving traveler ("To"), the recorded payment amount shall reduce their net receivable.
8. An additional payment shall be editable and deletable at any time; changes must immediately recalculate all balances.

### Test Plan

| Step | Expected Result |
|------|----------------|
| Select same traveler for From and To | Validation error; payment not saved |
| Submit with Amount = 0 | Validation error; payment not saved |
| Add $50 payment from Alice to Bob | Alice's net due reduced by $50; Bob's net receivable reduced by $50 |
| Delete the payment | Balances revert to previous values |

---

## Feature 5 — Settlement Calculation

**User story:** As a group organiser I want to click "Settle" and see the minimum list of transfers needed to bring everyone's balance to zero so that we can close out the trip cleanly.

### Acceptance Criteria
1. A "Settle" button shall be visible at all times once at least one expense exists.
2. Clicking "Settle" shall compute each traveler's net balance: `total share owed − total paid (expenses) − total additional payments made + total additional payments received`.
3. Travelers with a negative net balance (owe money) shall be classified as "payers"; travelers with a positive net balance (are owed money) shall be classified as "receivers".
4. The settlement algorithm shall resolve all non-zero balances using a greedy minimum-transfer approach:
   - Sort payers ascending by amount owed (lowest first).
   - Sort receivers ascending by amount entitled (lowest first).
   - Take the payer with the lowest due and the receiver with the lowest entitlement.
   - Apply the smaller of the two amounts as a transfer from payer to receiver; record it as "Payer pays Receiver $Amount".
   - Reduce both balances by the transfer amount; remove any party whose balance reaches zero.
   - Repeat until all payer and receiver balances are zero.
5. The result shall be displayed as a numbered list of transfers, each in the format: **"[Payer] pays [Receiver] $X.XX"**.
6. Every traveler with a non-zero balance must appear in at least one transfer in the settlement list.
7. If all net balances are already zero before the algorithm runs, the app shall display "Everyone is settled — no transfers needed." instead of a transfer list.
8. The settlement result must account for all expenses and all additional payments before producing output.
9. All transfer amounts in the settlement list shall be rounded to 2 decimal places.

### Test Plan

| Step | Expected Result |
|------|----------------|
| 3 travelers; $90 expense paid by Alice split equally | Settlement: "Bob pays Alice $30.00" and "Carol pays Alice $30.00" |
| Alice pays Bob $20 additionally before settling | Settlement: "Bob pays Alice $10.00" and "Carol pays Alice $30.00" |
| 5 travelers, mixed expenses and ad-hoc payments | Full numbered transfer list produced; every non-zero balance resolved |
| All balances already zero; click Settle | "Everyone is settled — no transfers needed." shown; no list |
| Sum all transfer amounts in list | Total inflows equal total outflows; net is zero |
