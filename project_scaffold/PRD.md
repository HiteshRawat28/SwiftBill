# Project Requirements Document — SwiftBill

## Overview
SwiftBill is a full-stack billing and inventory management system for small businesses, built to mirror the domain of GST-compliant B2B accounting software (in the vein of BUSY/Zoho Books). It exists primarily as a portfolio project that demonstrates relational schema design, transactional data integrity, and Indian tax-compliance logic — skills directly relevant to interviewing at a company that builds accounting/ERP/GST/billing/inventory software.

## Target Users
- **Small business owners** who need to raise GST-compliant invoices and track stock without full-blown ERP overhead.
- **Accountants/Admin staff** at those businesses who manage day-to-day sales, purchases, and party ledgers.
- (Secondary, for this project's purpose) **Technical interviewers** evaluating schema design, DBMS integrity handling, and domain fluency.

## Core Features (v1 / MVP)
- **Inventory management**: add/edit products, track stock levels, low-stock alerts, categorize by category/unit.
- **GST-compliant invoicing**: generate invoices with CGST/SGST/IGST auto-calculated based on intra-state vs inter-state party location; auto-incrementing invoice numbers; downloadable PDF invoice.
- **Party/ledger management**: manage customers & suppliers, track dues (receivables/payables), running balance per party.
- **Sales & purchase entry**: record transactions that automatically adjust inventory stock levels.
- **Reports dashboard**: sales summary, GST liability report (tax collected vs tax paid), stock valuation report.
- **Role-based access control**: Admin / Accountant / Viewer roles with different permission levels.
- **E-way bill threshold flag**: transactions above ₹50,000 are flagged as legally requiring an e-way bill (informational flag only — no actual e-way bill generation or govt API integration).

## Future Scope (not in v1)
- Multi-company support (one login managing multiple businesses with isolated data).
- Actual e-way bill generation via government API integration.
- GSTR-1/GSTR-3B return filing exports.
- Multi-currency support.
- Barcode scanning for inventory.
- Recurring/subscription invoicing.
- Email/SMS invoice delivery.

## Success Criteria
- A user can create a product, record a sale against it, and see stock decrement automatically.
- A generated invoice correctly splits tax into CGST+SGST (same state) or IGST (different state) based on party address vs business address.
- A party's running balance updates correctly after each sale/purchase and reflects an accurate receivable/payable figure.
- The GST liability report correctly nets tax collected on sales against tax paid on purchases for a given period.
- Role-based access is enforced: a Viewer cannot create/edit records, an Accountant cannot manage users, only Admin has full access.
- Invoices can be exported as a correctly formatted PDF.
- A transaction over ₹50,000 visibly displays an e-way bill requirement flag.

## Out of Scope
- Real tax filing or submission to GST portal.
- Payment gateway integration (payments are recorded manually, not processed).
- Production-grade legal tax accuracy — this is explicitly a learning/portfolio implementation, not certified tax software.
- Mobile app (web-responsive only).
- Offline mode.
