# Design — SwiftBill

## Visual Tone
Modern minimal, dark-sidebar-first layout. Clean data-dense screens (this is a financial tool — clarity and scanability beat decoration), with a single confident accent color used sparingly for primary actions, key numbers, and status flags (e.g. low-stock, e-way bill required).

## Color Palette
| Role | Color | Hex |
|---|---|---|
| Primary (accent) | Indigo | #6366F1 |
| Sidebar background | Near-black slate | #111827 |
| Sidebar text | Cool gray | #9CA3AF |
| Sidebar text (active) | White | #F9FAFB |
| Main background | Off-white | #F8FAFC |
| Card/surface background | White | #FFFFFF |
| Primary text | Slate 900 | #0F172A |
| Secondary text | Slate 500 | #64748B |
| Border/divider | Slate 200 | #E2E8F0 |
| Success (paid/in-stock) | Emerald | #10B981 |
| Warning (low-stock/e-way bill flag) | Amber | #F59E0B |
| Error (overdue/negative balance) | Rose | #EF4444 |

## Typography
- Heading font: Inter (600/700 weight)
- Body font: Inter (400/500 weight)
- Scale: base 14px for data-dense tables, 16px for form/body text; headings at 1.25x (h3), 1.5x (h2), 2x (h1)
- Numbers (currency, quantities) use tabular figures (`font-variant-numeric: tabular-nums`) so columns align in tables

## Spacing & Theme Conventions
- 8px base grid for all spacing/padding decisions
- Border-radius: 8px for cards/inputs, 6px for buttons/badges — consistent, not overly rounded (keeps the enterprise-tool feel)
- Cards use a subtle 1px border (Slate 200) rather than heavy shadows; reserve shadow for modals/dropdowns only
- Sidebar fixed width ~240px, collapsible to icon-only on smaller viewports
- Status badges (low-stock, e-way bill required, overdue) use a light tint background of their color (e.g. Amber at 10% opacity) with the full-strength color for text/icon — keeps flags visible without being alarming
- Tables: zebra-free, rely on row hover state (light gray) and clear column alignment (right-align numbers/currency, left-align text)
