# PayMatch
Multi-Tenant Vendor Payment Reconciliation Platform

## Current Status
Implemented foundation with:
- Node.js + Express backend
- React + Tailwind frontend
- MongoDB (Mongoose) integration
- JWT auth (`signup`, `login`, `me`)
- Modular backend architecture (`routes/controller/service/validation`)
- Organization-scoped multi-tenancy using `organizationId`
- Roles and permissions (`Admin`, `Accountant`, `Auditor`)
- Vendor, Invoice, and Payment APIs

## Tech Stack
- Frontend: React, React Router, TailwindCSS, Vite
- Backend: Node.js, Express, Zod, JWT
- Database: MongoDB + Mongoose

## Project Structure
```text
frontend/
backend/
  src/
    config/
    middleware/
    models/
    modules/
      auth/
      health/
      tenant/
      vendor/
      invoice/
      payment/
      bootstrap/
    utils/
```

## Multi-Tenant Rule (Very Important)
All tenant-owned data must be scoped by `organizationId`.

Examples:
```js
Invoice.find({ organizationId: req.organizationId });
Vendor.find({ organizationId: req.organizationId, status: "active" });
```

Guard helpers are in:
- `backend/src/utils/organizationScope.js`

## Roles & Permissions
- `Admin` -> full access
- `Accountant` -> upload/create/update + reconcile flows
- `Auditor` -> read-only (GET endpoints)

## Environment
Create `backend/.env`:

```env
PORT=4000
NODE_ENV=development
JWT_SECRET=change-this-secret
JWT_EXPIRES_IN=2h
MONGODB_URI=mongodb://127.0.0.1:27017/paymatch
```

For MongoDB Atlas:
```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<db>?retryWrites=true&w=majority
```

## Run Locally
From project root:

```bash
npm install
npm run dev
```

If needed:
- backend only: `npm run dev:backend`
- frontend only: `npm run dev:frontend`

## Seed Demo Data
```bash
npm --workspace backend run seed
```
Creates:
- organization: `DEMO`
- admin user: `admin@demo.com / admin123`

## API Overview

### Health
- `GET /api/health`

### Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me` (Bearer token)

### Organization
- `GET /api/tenants/me`

### Vendors
- `GET /api/vendors`
- `GET /api/vendors/:id`
- `POST /api/vendors`
- `PATCH /api/vendors/:id`

### Invoices
- `GET /api/invoices`
- `GET /api/invoices/:id`
- `POST /api/invoices`
- `PATCH /api/invoices/:id`

### Payments
- `GET /api/payments`
- `GET /api/payments/:id`
- `POST /api/payments`
- `PATCH /api/payments/:id`

## API Sample Payloads

### `POST /api/auth/signup`
```json
{
  "organizationName": "Acme Manufacturing",
  "organizationCode": "ACME",
  "adminName": "Jane Doe",
  "email": "jane@acme.com",
  "password": "password123"
}
```

### `POST /api/auth/login`
```json
{
  "tenantCode": "ACME",
  "email": "jane@acme.com",
  "password": "password123"
}
```

### `POST /api/vendors`
```json
{
  "name": "Northline Logistics",
  "vendorCode": "VND-1001",
  "taxId": "TAX-00991",
  "email": "ap@northline.com",
  "phone": "+1-555-123-9876",
  "status": "active"
}
```

### `PATCH /api/vendors/:id`
```json
{
  "email": "finance@northline.com",
  "status": "inactive"
}
```

### `POST /api/invoices`
```json
{
  "vendorId": "665f0aa1b95d5d2d33123456",
  "invoiceNumber": "INV-2026-001",
  "invoiceDate": "2026-03-17T00:00:00.000Z",
  "currency": "USD",
  "amount": 4850.5,
  "status": "new"
}
```

### `PATCH /api/invoices/:id`
```json
{
  "amount": 4900.75,
  "status": "partial"
}
```

### `POST /api/payments`
```json
{
  "paymentRef": "PAY-2026-7781",
  "paymentDate": "2026-03-17T00:00:00.000Z",
  "currency": "USD",
  "amount": 4850.5,
  "vendorId": "665f0aa1b95d5d2d33123456",
  "invoiceNumber": "INV-2026-001",
  "status": "new"
}
```

### `PATCH /api/payments/:id`
```json
{
  "status": "reconciled"
}
```

## Auth Notes
- Login is organization-aware using `tenantCode` + email + password.
- JWT includes `organizationId`.
- Middleware resolves organization context from token/header.

## Frontend
- Auth flows: signup/login/protected dashboard
- Branded auth UI with responsive desktop/mobile layouts
- React Router v7 future flags enabled to remove upgrade warnings
