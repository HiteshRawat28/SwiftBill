# Rules — SwiftBill

## Libraries & Tools
**Use:**
- React 18+, Vite for build tooling
- Zustand for state management (not Redux — keep state layer lightweight)
- Recharts for all charts/graphs
- Express 4.x for backend routing
- Prisma ORM for all database access (no raw SQL except for complex reporting aggregations where Prisma's query builder is awkward — and even then, prefer `$queryRaw` with parameterized inputs only)
- PostgreSQL as the only database
- `pdfkit` for invoice PDF generation
- `jsonwebtoken` + `bcrypt` for auth
- `zod` for request payload validation on the backend

**Avoid:**
- MongoDB or any NoSQL store — financial/relational data needs ACID guarantees this project is explicitly demonstrating.
- Redux/Redux Toolkit — unnecessary boilerplate for this app's state needs.
- Puppeteer for PDF generation — too heavy for structured invoice documents; reserve for a future phase only if pdfkit proves insufficient for layout needs.
- Any library requiring a paid API key or external paid service (this is a portfolio project — keep it fully self-hostable and free to run).
- Storing tax logic or role permissions as hardcoded conditionals scattered across route files — centralize in services/middleware (see Architecture.md).

## Error Handling
- All API errors return a consistent JSON shape: `{ error: { message, code } }`.
- Validation errors (via zod) return 400 with field-level detail.
- Auth failures return 401 (no/invalid token) or 403 (valid token, insufficient role).
- Any multi-table write (sales/purchase entry) that fails partway must roll back fully via Prisma `$transaction` — never leave stock or ledger in a partial state.
- Frontend surfaces errors via a toast/notification component — never a raw `alert()` or unhandled console error visible to the user.
- Log server errors with enough context (route, user ID, payload summary) to debug without needing to reproduce — but never log full request bodies containing sensitive data (passwords, tokens).

## Coding Standards
- Backend: camelCase for variables/functions, PascalCase for Prisma models, kebab-case for route paths (e.g. `/api/sales-entry`).
- Frontend: component files PascalCase (`InvoiceForm.jsx`), hooks/utils camelCase.
- Every service function in `server/src/services/` should be pure where possible (input → output, no hidden side effects) to keep GST and stock logic unit-testable.
- Money values: store as integers (paise, not rupees) in the database to avoid floating-point rounding errors; convert to rupees only for display.
- Dates: store in UTC, format for display on the client using the business's locale.
- Comment *why*, not *what* — especially on GST calculation logic and threshold checks, since the tax rules are the non-obvious part.

## AI Assistant Boundaries
- Should always:
  - Ask before adding a new dependency not already listed in "Use" above.
  - Wrap any multi-table financial write in a Prisma transaction.
  - Write the GST calculation and e-way bill threshold check as isolated, testable service functions — never inline in a controller.
  - Flag explicitly when a "GST compliance" feature is a simplification (e.g., a single flat tax rate assumption) rather than letting it look production-accurate.
  - Update Memory.md after completing each phase.
- Should never:
  - Modify `prisma/schema.prisma` without flagging the change and explaining the migration impact.
  - Silently change the tax calculation logic without a comment explaining the reasoning.
  - Remove or weaken role-based access checks to "make a feature work faster."
  - Claim or imply in code comments/UI copy that this system is certified or production-grade tax software.
