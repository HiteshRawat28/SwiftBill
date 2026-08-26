# SwiftBill

SwiftBill is a comprehensive, open-source Billing and Inventory Management System (ERP) designed for Indian businesses. 

It features Role-Based Access Control (RBAC), full Inventory tracking with low-stock alerts, Party ledger management (Customers/Suppliers), automated GST-compliant invoicing, E-Way bill threshold warnings, and a live reporting dashboard.

> [!WARNING]
> **Disclaimer on Tax Logic:** The GST calculation logic implemented in this repository is designed for educational/learning purposes. While it computes CGST, SGST, and IGST based on intra-state vs inter-state comparisons, it is **NOT** certified production tax software. You should consult a tax professional before using it in a real-world business scenario.

## Features
- 🔐 **Secure RBAC Authentication:** JWT-based login with distinct roles: Admin, Accountant, Viewer.
- 📦 **Inventory Management:** Full CRUD operations for Products, Units, and Categories with visual low-stock alerts.
- 👥 **Party Ledger:** Manage Customers and Suppliers. Keeps real-time track of Accounts Receivable and Accounts Payable.
- 🧾 **Atomic Transactions:** Sales and Purchases automatically adjust inventory stock and party ledgers inside bulletproof atomic database transactions.
- 🇮🇳 **GST Invoicing:** Automatically calculates CGST/SGST vs IGST depending on the state of the business vs the customer.
- 📄 **PDF Export:** Generate and download professional PDF invoices via `pdfkit`.
- 🚚 **E-Way Bill Alerts:** Proactively flags transactions that exceed the ₹50,000 threshold.
- 📊 **Business Intelligence Dashboard:** Real-time KPI cards and interactive charts powered by `recharts`.

## Tech Stack
- **Frontend:** React (Vite), Vanilla CSS, Zustand (State Management), React Router, Recharts, Lucide-React.
- **Backend:** Node.js, Express, Prisma ORM, PostgreSQL, JWT Auth, PDFKit.

## Local Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v15+)

### 1. Database Setup
Ensure PostgreSQL is running on your machine and create a database (e.g., `swiftbill`).

### 2. Backend Setup
1. Navigate to the `server` directory: `cd server`
2. Install dependencies: `npm install`
3. Create a `.env` file in the `server` folder with the following variables:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/swiftbill?schema=public"
   JWT_SECRET="your_super_secret_jwt_key_here"
   ```
4. Run Prisma migrations to scaffold the database: `npx prisma db push --accept-data-loss`
5. Run the seed script to create initial lookups (Categories/Units) and the Admin account: `node src/scripts/seed.js`
   - *Default Admin Credentials:* `admin@swiftbill.com` / `admin123`
6. Start the backend development server: `npm run dev`

### 3. Frontend Setup
1. Open a new terminal and navigate to the `client` directory: `cd client`
2. Install dependencies: `npm install`
3. Create a `.env` file in the `client` folder with the following variable:
   ```env
   VITE_API_URL="http://localhost:5000/api"
   ```
4. Start the Vite development server: `npm run dev`

### 4. Access the Application
Open your browser and navigate to `http://localhost:5173`. 
Log in using the seeded Admin credentials to explore all features.

## Deployment Notes
- **Backend (Render / Railway):** Ensure your hosting provider provisions a managed PostgreSQL database. Set the `DATABASE_URL` and `JWT_SECRET` environment variables. The build command should include `npx prisma generate` and `npx prisma db push`. The start command is `node src/server.js` (or `node src/app.js`).
- **Frontend (Vercel / Netlify):** Build command is `npm run build`. Publish directory is `dist`. Ensure the `VITE_API_URL` environment variable is set to your deployed backend URL.

## License
MIT
