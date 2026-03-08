# EduMarket Neo

Modern full-stack digital learning marketplace that delivers purchased materials through private Telegram channel links after admin payment verification.

## Stack
- Frontend: Next.js + React + Tailwind + Framer Motion + ShadCN-style components
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Auth: Firebase Email/Google (token verified with firebase-admin)
- Uploads: Cloudinary
- Analytics: Chart.js

## Project Structure
- `client/` - Next.js app (homepage, explore, product, checkout, user dashboard, admin dashboard)
- `server/` - Express API (products, orders, users, analytics)

## Core Flow
1. User explores products and clicks **Buy Now**.
2. Login modal appears for Email/Google auth.
3. Checkout shows UPI QR + payment instructions.
4. User uploads screenshot -> order status `Pending`.
5. Admin reviews in dashboard (`Approved` or `Rejected`).
6. Approved orders unlock Telegram invite links in **Material Organiser Neo**.

## APIs
- `GET /api/products`
- `GET /api/products?type=course|ebook|test`
- `POST /api/products` (admin)
- `POST /api/orders` (auth + screenshot)
- `PATCH /api/orders/:id/review` (admin)
- `GET /api/users/materials` (auth, only purchased content)
- `GET /api/users/analytics` (admin)

## Run locally
```bash
npm install
npm run dev
```

Frontend: `http://localhost:3000`
Backend: `http://localhost:5000`

## Deploy on Render
You can deploy both apps with **Blueprint** (`render.yaml`) or manually.

### Option A: Blueprint (recommended)
1. Push this repo to GitHub.
2. In Render dashboard: **New +** → **Blueprint**.
3. Select this repository.
4. Render will read `render.yaml` and create 2 web services:
   - `edumarket-neo-api` (Express backend)
   - `edumarket-neo-client` (Next.js frontend)
5. Fill required environment variables in Render before deploy:
   - Backend vars: `MONGO_URI`, `CLOUDINARY_*`, `FIREBASE_SERVICE_ACCOUNT_JSON`
   - Frontend vars: `NEXT_PUBLIC_API_URL` (set to your backend Render URL + `/api`), `NEXT_PUBLIC_FIREBASE_*`
6. Redeploy both services.

### Option B: Manual setup
Create two separate **Web Services**:

#### 1) Backend service
- Root directory: `server`
- Build command: `npm install`
- Start command: `npm run start`
- Health check path: `/api/health`
- Add env vars from `server/.env.example`

#### 2) Frontend service
- Root directory: `client`
- Build command: `npm install && npm run build`
- Start command: `npm run start`
- Add env vars from `client/.env.local.example`
- Set `NEXT_PUBLIC_API_URL=https://<your-backend-service>.onrender.com/api`

### Production checklist
- Use MongoDB Atlas for `MONGO_URI`.
- Use a Cloudinary production account.
- Add Firebase Web app credentials in frontend service.
- Add Firebase service account JSON in backend service (`FIREBASE_SERVICE_ACCOUNT_JSON`).
- Create at least one admin user by updating `role` to `admin` in MongoDB.
