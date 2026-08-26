# Build Phases — SwiftBill

## Phase 1: Project Setup & Auth Foundation
**Goal:** Scaffold both client and server, connect to Postgres, and get login/JWT auth working end-to-end.
**Done when:**
- [ ] Vite React app and Express app both run locally, client can hit a server health-check route.
- [ ] Prisma connected to a local PostgreSQL instance, initial migration runs cleanly.
- [ ] `User` model exists with role field (Admin/Accountant/Viewer), password hashed with bcrypt.
- [ ] Login endpoint issues a valid JWT; protected test route rejects requests without a valid token.
- [ ] Basic app shell (dark sidebar layout, login page) renders in the browser.

## Phase 2: Role-Based Access Control
**Goal:** Enforce Admin/Accountant/Viewer permissions across the API before building features on top.
**Done when:**
- [ ] `rbac.middleware.js` implemented and applied to a sample protected route.
- [ ] Each role's permission boundaries documented (e.g. Viewer = read-only, Accountant = create/edit transactions, Admin = full access + user management).
- [ ] Frontend hides/disables UI actions based on the logged-in user's role.
- [ ] Manual test: logging in as each role produces the expected access restrictions.

## Phase 3: Inventory Management
**Goal:** Full CRUD for products with stock tracking and low-stock alerts.
**Done when:**
- [ ] `Product` model (name, SKU, category, unit, price, stock quantity, low-stock threshold) migrated.
- [ ] Add/edit/delete product UI and API working.
- [ ] Product list view shows current stock, flags items below their low-stock threshold.
- [ ] Categories/units are manageable (add new category/unit without a code change).

## Phase 4: Party & Ledger Management
**Goal:** Manage customers/suppliers and track running balances.
**Done when:**
- [ ] `Party` model (name, type customer/supplier, address incl. state, GSTIN, contact info) migrated.
- [ ] Add/edit/delete party UI and API working.
- [ ] Party detail view shows running balance (receivable if customer owes, payable if business owes supplier).
- [ ] Party's state field is captured accurately — this feeds directly into Phase 5's tax logic.

## Phase 5: Sales & Purchase Entry with Stock/Ledger Sync
**Goal:** Record transactions that atomically update stock and party balances.
**Done when:**
- [ ] `Transaction` and `TransactionLineItem` models migrated, linked to Party and Product.
- [ ] Sales entry form: select party + line items → on submit, stock decrements and party balance updates, wrapped in a single Prisma transaction.
- [ ] Purchase entry form: mirrors sales entry but increments stock and updates payable balance.
- [ ] Forcing a failure mid-transaction (e.g. invalid product ID) confirms no partial writes occur (test rollback behavior manually).

## Phase 6: GST-Compliant Invoicing
**Goal:** Generate invoices with correct CGST/SGST/IGST split and downloadable PDF.
**Done when:**
- [ ] `gst.service.js` implemented: compares business state vs party state, returns CGST+SGST (same state) or IGST (different state) breakdown for a given taxable amount and rate.
- [ ] Invoice model auto-generates sequential invoice numbers.
- [ ] Invoice view shows itemized line items, tax breakdown, and total.
- [ ] PDF export via `pdfkit` produces a correctly formatted, downloadable invoice.
- [ ] Unit tests cover the GST calculation service for both intra-state and inter-state cases.

## Phase 7: E-Way Bill Threshold Flag
**Goal:** Flag transactions above ₹50,000 as requiring an e-way bill.
**Done when:**
- [ ] `ewaybill.service.js` implemented: pure function taking transaction total, returns boolean + message.
- [ ] Sales/purchase entry and invoice views display a visible flag/badge when the threshold is crossed.
- [ ] Threshold value is a named constant (not a magic number), documented as India-specific and configurable.

## Phase 8: Reports Dashboard
**Goal:** Build MIS reporting: sales summary, GST liability, stock valuation.
**Done when:**
- [ ] Sales summary report: totals by date range, chart via Recharts.
- [ ] GST liability report: tax collected (from sales) minus tax paid (from purchases) for a selected period.
- [ ] Stock valuation report: current stock quantity × cost price, summed by category and total.
- [ ] Dashboard landing page surfaces key numbers at a glance (total receivables, payables, low-stock count, this month's sales).

## Phase 9: Polish & Deployment
**Goal:** Clean up UX, handle edge cases, and deploy a live demo.
**Done when:**
- [ ] Empty states, loading states, and error toasts implemented across all major views.
- [ ] Responsive layout verified on smaller screens.
- [ ] Backend deployed (Render/Railway) with production Postgres instance and migrations applied.
- [ ] Frontend deployed (Vercel) and pointed at the live backend.
- [ ] README written with setup instructions, feature list, and an explicit note that GST logic is a simplified/learning implementation, not production tax software.
