# Architecture — SwiftBill

## App Flow
1. User logs in → JWT issued, encodes user ID + role (Admin/Accountant/Viewer).
2. Client (React) stores JWT, attaches it as a Bearer token on every API request.
3. Express middleware validates JWT and checks role permissions before hitting route handlers.
4. Sales/purchase entry → Prisma transaction: (a) create transaction record, (b) create line items, (c) adjust product stock, (d) update party running balance — all wrapped in a single DB transaction so a failure rolls back cleanly (no partial stock/ledger updates).
5. Invoice generation → transaction data + party state address vs business state address → determines CGST/SGST vs IGST split → rendered to PDF via backend PDF library → served as downloadable file.
6. Reports dashboard → aggregate queries (sales totals, tax collected/paid, stock valuation) computed server-side, returned as JSON, rendered as charts client-side.

## Tech Stack
| Layer | Choice | Why |
|---|---|---|
| Frontend | React.js + Vite | Fast dev server, matches existing stack/resume experience |
| State Management | Zustand | Lightweight, less boilerplate than Redux; financial UI state (cart/invoice draft, active party) doesn't need Redux's ceremony |
| Charts | Recharts | Simple declarative charts for the reports dashboard |
| Backend | Node.js + Express | Matches existing stack; simple, well-understood REST layer |
| ORM | Prisma | Type-safe queries, migrations, and — critically — clean transaction API for multi-table financial writes |
| Database | PostgreSQL | Financial data (stock, ledgers, invoices) needs ACID guarantees and relational integrity; NoSQL would push referential integrity into application code, which is the wrong tradeoff here |
| Auth | JWT + role-based middleware | Stateless auth, simple to reason about, reused pattern from prior project (AssetFlow) |
| PDF Generation | pdfkit | Lightweight, no headless-browser overhead like Puppeteer; sufficient for structured invoice layouts |
| Hosting/Deploy | Render/Railway (backend + Postgres), Vercel (frontend) | Free-tier friendly for a portfolio project, minimal ops overhead |

## Folder Structure
```
swiftbill/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── inventory/
│   │   │   ├── invoicing/
│   │   │   ├── parties/
│   │   │   ├── reports/
│   │   │   └── common/          # buttons, tables, modals, layout shell
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Inventory.jsx
│   │   │   ├── Invoices.jsx
│   │   │   ├── Parties.jsx
│   │   │   ├── SalesEntry.jsx
│   │   │   ├── PurchaseEntry.jsx
│   │   │   ├── Reports.jsx
│   │   │   └── Login.jsx
│   │   ├── store/               # Zustand stores (auth, cart/invoice draft, UI state)
│   │   ├── api/                 # axios/fetch wrapper + endpoint functions
│   │   ├── utils/                # GST calc helpers, formatters
│   │   └── App.jsx
│   └── vite.config.js
├── server/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── product.routes.js
│   │   │   ├── party.routes.js
│   │   │   ├── invoice.routes.js
│   │   │   ├── transaction.routes.js
│   │   │   └── report.routes.js
│   │   ├── controllers/
│   │   ├── services/
│   │   │   ├── gst.service.js       # CGST/SGST/IGST calculation logic
│   │   │   ├── stock.service.js     # stock adjustment logic
│   │   │   ├── ledger.service.js    # party balance calculation
│   │   │   ├── pdf.service.js       # invoice PDF generation
│   │   │   └── ewaybill.service.js  # ₹50,000 threshold check
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js   # JWT verification
│   │   │   └── rbac.middleware.js   # role permission checks
│   │   └── app.js
│   └── prisma/
│       ├── schema.prisma
│       └── migrations/
├── PRD.md
├── Architecture.md
├── Rules.md
├── Phases.md
├── Design.md
└── Memory.md
```

## Key Architectural Decisions
- **PostgreSQL over MongoDB**: financial records (stock counts, ledger balances, tax totals) require strict consistency across related writes — a sale must atomically decrement stock AND update a party balance AND record the transaction. Postgres transactions + foreign key constraints enforce this at the DB level; MongoDB would require manually simulating this integrity in application code.
- **Prisma transactions for multi-table writes**: any operation touching more than one table (sale entry, purchase entry) uses `prisma.$transaction()` so partial failures can't leave stock/ledger data inconsistent.
- **GST calculation as a pure service function**: `gst.service.js` takes (business state, party state, taxable amount, tax rate) and returns a CGST/SGST/IGST breakdown — kept as a pure, testable function separate from route handlers.
- **Role checks as middleware, not scattered in controllers**: `rbac.middleware.js` centralizes permission checks per route, so adding a new role or changing permissions doesn't require touching every controller.
- **E-way bill check as a service, not hardcoded in the transaction flow**: kept isolated in `ewaybill.service.js` so the ₹50,000 threshold (or future state-specific rules) can change without touching transaction logic.
