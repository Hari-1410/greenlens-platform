# 🌿 GreenLens Platform

Full-stack sustainability fintech ecosystem powering the GreenCart browser extension.

---

## Architecture Overview

```
GreenLens/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Landing page
│   ├── login/page.tsx            # Login
│   ├── register/page.tsx         # Registration (USER | CORPORATE)
│   ├── dashboard/page.tsx        # User dashboard (SSR)
│   ├── corporate/page.tsx        # Corporate ESG dashboard (SSR)
│   └── api/
│       ├── auth/
│       │   ├── register/         # POST /api/auth/register
│       │   └── [...nextauth]/    # NextAuth handlers
│       ├── user/                 # GET /api/user
│       ├── purchase/             # POST /api/purchase, GET /api/purchases
│       ├── wallet/               # GET /api/wallet
│       ├── transactions/         # GET /api/transactions
│       └── esg-report/           # GET /api/esg-report (corporate only)
├── components/
│   ├── dashboard/DashboardClient.tsx
│   └── corporate/CorporateClient.tsx
├── lib/
│   ├── prisma.ts                 # Prisma client singleton
│   └── tokens.ts                 # Token calculation utilities
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── seed.ts                   # Demo data seeder
├── auth.ts                       # NextAuth v5 config
├── middleware.ts                  # Route protection
└── extension-popup-addition/     # ONLY extension change allowed
    └── popup.html                # Adds "Open Dashboard" button
```

---

## Quick Start

### 1. Clone and install

```bash
git clone <repo>
cd greenlens
npm install
```

### 2. Set up environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/greenlens"
AUTH_SECRET="your-secret-here"  # Generate: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Set up database

```bash
# Push schema to PostgreSQL
npm run db:push

# Generate Prisma client
npm run db:generate

# Seed with demo data
npm run db:seed
```

### 4. Run

```bash
npm run dev
```

Visit: http://localhost:3000

---

## Demo Accounts

After seeding:

| Account | Email | Password | Role |
|---------|-------|----------|------|
| Individual | demo@greenlens.app | password123 | USER |
| Corporate | corp@greenlens.app | password123 | CORPORATE |

---

## Extension Integration

### The ONLY change to the extension

Add to `popup/popup.html` (inside `<body>` before `</body>`):

```html
<div style="padding: 0 12px 12px;">
  <a href="https://yourdomain.com/dashboard" target="_blank" rel="noopener noreferrer" class="gc-dashboard-btn">
    Open Dashboard
  </a>
</div>
```

Add to `popup/popup.css`:

```css
.gc-dashboard-btn {
  display: flex; align-items: center; justify-content: center;
  width: 100%; background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #fff; font-size: 13px; font-weight: 600;
  border: none; border-radius: 8px; padding: 10px 16px;
  cursor: pointer; text-decoration: none; margin-top: 8px;
}
```

### Extension → API

When a purchase is confirmed, call:

```javascript
POST https://yourdomain.com/api/purchase
Content-Type: application/json

{
  "userId": "<user-id>",
  "productName": "Organic Tea",
  "price": 299,
  "sustainabilityScore": 92,
  "tokensEarned": 20,
  "externalId": "<asin>-<timestamp>"
}
```

Response:

```json
{
  "success": true,
  "tokensEarned": 20,
  "moneyValue": 2.0,
  "purchase": { ... }
}
```

---

## Token Economy

| Sustainability Score | Tokens Earned | Rupee Value |
|---------------------|---------------|-------------|
| 80 – 100            | 20 tokens     | ₹2.00       |
| 60 – 79             | 12 tokens     | ₹1.20       |
| 40 – 59             | 5 tokens      | ₹0.50       |
| < 40                | 0 tokens      | ₹0.00       |

**Conversion Rate:** 1 Green Token = ₹0.10

---

## API Reference

### POST /api/auth/register
Create account.
```json
{ "name": "Jane", "email": "jane@example.com", "password": "secret123", "role": "USER" }
```

### POST /api/auth/login (via NextAuth)
```json
{ "email": "jane@example.com", "password": "secret123" }
```

### GET /api/user
Returns authenticated user info (role, name, email).

### POST /api/purchase
Record eco purchase, credit tokens, update wallet.

### GET /api/wallet
Returns token balance and ₹ equivalent.

### GET /api/transactions
Returns transaction history.

### GET /api/purchases
Returns purchase history.

### GET /api/esg-report
*Corporate only.* Returns aggregated anonymized ESG metrics.

---

## Deployment

### Vercel

```bash
vercel
```

Set environment variables in Vercel dashboard.

### Render

1. Create a new Web Service
2. Build command: `npm run build`
3. Start command: `npm start`
4. Add environment variables

### Database (Production)

Use [Supabase](https://supabase.com) or [Neon](https://neon.tech) for managed PostgreSQL.

```env
DATABASE_URL="postgresql://user:pass@host:5432/greenlens?sslmode=require"
```

---

## Security

- Passwords hashed with bcrypt (cost factor 12)
- JWT sessions via NextAuth v5
- Role-based middleware (USER vs CORPORATE)
- Corporate routes restricted to corporate role
- Duplicate purchase prevention via `externalId` unique constraint
- Input validation with Zod on all API routes
- Corporate dashboard shows only anonymized aggregate data

---

## ESG Report PDF

The corporate dashboard generates a dark-themed PDF including:
- Company name and timestamp
- Total green shoppers, purchases, tokens distributed
- Carbon reduction estimate (kg CO₂)
- Category breakdown table
- Privacy disclaimer

Powered by [jsPDF](https://github.com/parallax/jsPDF) + jspdf-autotable.
