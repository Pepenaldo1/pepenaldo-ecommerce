# Pepenaldo — Full-Stack E-Commerce Platform

A Jumia-style marketplace with Next.js on the frontend, Node.js/Express on the backend,
and PostgreSQL (Supabase-compatible) as the database. Includes auth, an admin dashboard,
product CRUD, cart, checkout, Paystack payments, and email notifications.

```
pepenaldo-ecommerce/
├── backend/     Express API, PostgreSQL access, Paystack + email logic
├── frontend/    Next.js storefront + admin dashboard
└── README.md
```

## Features

- Customer registration/login (JWT-based auth)
- Product catalog with category filtering and search
- Persistent shopping cart (per logged-in user)
- Checkout → Paystack payment → order creation
- Automatic email to admin when an order is placed
- Automatic order confirmation email to the customer
- Admin dashboard: revenue/order stats, product CRUD, order status management
- Responsive design (mobile → desktop) with Tailwind CSS
- Deployable frontend on Vercel; backend on Render/Railway/Fly.io; DB on Supabase

---

## 1. Local setup

### Prerequisites
- Node.js 18+
- A PostgreSQL database (Supabase free tier works well) or local Postgres
- A Paystack account (test mode keys are free) — https://dashboard.paystack.com
- An SMTP account for sending email (Gmail app password, SendGrid, Mailgun, etc.)

### 1.1 Database
1. Create a project on [Supabase](https://supabase.com) (or spin up local Postgres).
2. Open the SQL editor and run `backend/db/schema.sql`. This creates all tables and
   seeds the `tech` / `food` / `fashion` categories plus a placeholder admin account.
3. **Important:** the seeded admin password hash is a placeholder. Generate your own:
   ```bash
   node -e "console.log(require('bcryptjs').hashSync('YourRealPassword', 10))"
   ```
   Then update the `password_hash` column for the `admin@pepenaldo.com` row (or just
   register a normal account through the app and manually set its `role` to `admin`
   in the database).
4. Copy your database connection string (Supabase: Project Settings → Database →
   Connection string → URI).

### 1.2 Backend
```bash
cd backend
cp .env.example .env
# fill in DATABASE_URL, JWT_SECRET, SMTP_*, ADMIN_EMAIL, PAYSTACK_SECRET_KEY
npm install
npm run dev
```
The API runs on `http://localhost:5000` by default. Confirm it's alive at
`http://localhost:5000/health`.

### 1.3 Frontend
```bash
cd frontend
cp .env.local.example .env.local
# set NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm install
npm run dev
```
The storefront runs on `http://localhost:3000`.

### 1.4 Try it out
1. Register an account at `/register`.
2. Log in as your admin account, go to `/admin/products`, and add a few products
   (set `category_id` to `1` = Tech, `2` = Food, `3` = Fashion based on your seed order).
3. As a customer, add products to cart and check out — you'll be redirected to
   Paystack's test payment page (use Paystack's test card numbers).
4. After payment, you'll land on `/checkout/verify`, which confirms the transaction
   and triggers both emails.

---

## 2. Environment variables reference

### Backend (`backend/.env`)
| Variable | Description |
|---|---|
| `PORT` | Port the API listens on (default 5000) |
| `FRONTEND_URL` | Used for CORS and Paystack's callback URL |
| `DATABASE_URL` | PostgreSQL/Supabase connection string |
| `JWT_SECRET` | Long random string used to sign auth tokens |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | SMTP credentials for email |
| `ADMIN_EMAIL` | Where "new order" alerts are sent |
| `PAYSTACK_SECRET_KEY` | From your Paystack dashboard (test or live) |

### Frontend (`frontend/.env.local`)
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the deployed backend, e.g. `https://your-api.onrender.com/api` |

---

## 3. Deployment

### 3.1 Database — Supabase
Already covered above. Just make sure the project you use in production has the
schema applied and is not paused (free-tier Supabase projects pause after inactivity).

### 3.2 Backend — Render (or Railway/Fly.io)
1. Push this repo to GitHub.
2. On [Render](https://render.com): New → Web Service → connect the repo, set
   **Root Directory** to `backend`.
3. Build command: `npm install`. Start command: `npm start`.
4. Add all backend env vars from the table above in Render's dashboard.
5. Once deployed, note the public URL (e.g. `https://pepenaldo-api.onrender.com`).
6. In Paystack's dashboard, set the webhook URL to
   `https://pepenaldo-api.onrender.com/api/orders/webhook`.

### 3.3 Frontend — Vercel
1. On [Vercel](https://vercel.com): New Project → import the same repo, set
   **Root Directory** to `frontend`.
2. Framework preset: Next.js (auto-detected).
3. Add the env var `NEXT_PUBLIC_API_URL=https://pepenaldo-api.onrender.com/api`.
4. Deploy. Vercel gives you a production URL automatically.
5. Go back to your backend's env vars and set `FRONTEND_URL` to that Vercel URL,
   then redeploy the backend so CORS and Paystack callbacks point to the right place.

### 3.4 Post-deploy checklist
- [ ] Schema applied to production database
- [ ] Admin account created with a real password
- [ ] Paystack keys switched from test → live when ready to accept real payments
- [ ] Paystack webhook URL updated to the production backend
- [ ] SMTP credentials verified (send yourself a test order)
- [ ] `FRONTEND_URL` and `NEXT_PUBLIC_API_URL` point at each other's real domains

---

## 4. Notes on architecture decisions

- **Why Express instead of Next.js API routes for the backend:** you asked for a
  separate Node/Express backend, which also makes it easy to deploy the API
  independently of Vercel (Vercel's serverless functions have execution-time limits
  that don't suit long-lived DB pools as cleanly as a persistent Express server).
- **Payment confirmation has two paths:** the frontend calls `/orders/verify/:reference`
  right after the Paystack redirect (fast feedback for the user), and Paystack also
  calls the `/orders/webhook` endpoint independently (reliable even if the user closes
  the tab before the redirect completes). Both paths are idempotent.
- **Order items are snapshotted** (`product_name`, `unit_price` stored directly on
  `order_items`) so historical orders stay accurate even if a product's price or name
  changes later.
- **Stock is decremented at checkout**, not at payment confirmation, to prevent
  overselling while a customer is on the Paystack payment page. If you'd rather only
  decrement stock after confirmed payment, move that logic into `verifyPayment`/
  `paystackWebhook` in `orderController.js`.

---

## 5. What you'll likely want to extend

This is a working scaffold covering every feature you listed, built to be read and
extended rather than a black box. A few things worth adding as you go further:
- Image upload (currently expects an image URL — wire up Cloudinary/S3/Supabase Storage)
- Password reset flow
- Pagination on the product catalog and admin order list
- Order cancellation / refund handling
- Automated tests (none included here)
