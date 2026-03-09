# KXMATERIALS

Modern full-stack digital learning marketplace that delivers purchased materials through private Telegram channel links after admin payment verification.

## Stack
- Frontend: Next.js + React + Tailwind + Framer Motion + ShadCN-style components
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Auth: Firebase Email/Google (token verified with firebase-admin)
- Charts: Chart.js
- Payment proof storage: local upload folder (`/uploads`)

## Implemented workflow (end-to-end)
- Dedicated admin login page: `/admin-login`
- Admin credentials (demo): `kxsam@admin` / `collab@kxsam`
1. User opens product and clicks **Buy Now**.
2. User pays via UPI QR on `/checkout`.
3. User uploads payment screenshot (and optional UTR/transaction id).
4. Backend creates order with status `Pending`.
5. Admin opens `/admin`, reviews screenshot, and clicks **Approve** or **Reject**.
6. On approval, product is added to user's `purchasedProducts`.
7. User opens `/dashboard` and can click **Join Telegram Channel** for unlocked products.

## Auth behavior
- Separate admin login route: `/admin-login`
- Admin credentials: `kxsam@admin` / `collab@kxsam`
- User login/signup now uses dedicated pages: `/login` and `/signup`
- If Firebase Admin is configured and a valid Firebase token is sent, API uses Firebase auth.
- If Firebase Admin is not configured yet, API accepts header-based session identity (`x-user-email`, `x-user-name`, `x-user-role`) so the app remains usable.
- Login/signup pages set session data in browser storage for quick user/admin testing.

## API highlights
- `GET /api/products`
- `GET /api/products?type=course|ebook|test`
- `POST /api/products` (admin)
- `POST /api/orders` (auth + multipart `paymentScreenshot`)
- `GET /api/orders` (admin)
- `PATCH /api/orders/:id/review` (admin)
- `GET /api/users/materials` (auth, returns only unlocked products)
- `POST /api/contact` (public, sends contact form message to configured receiver email)

## Run locally
```bash
npm install
npm run dev
```

Frontend: `http://localhost:3000`
Backend: `http://localhost:5000`

## Required env vars
### Client (`client/.env.local`)
- `NEXT_PUBLIC_API_URL=http://localhost:5000/api`
- `NEXT_PUBLIC_FIREBASE_API_KEY=`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID=`
- `NEXT_PUBLIC_FIREBASE_APP_ID=`

### Server (`server/.env`)
- `PORT=5000`
- `MONGO_URI=<mongodb connection string>`
- `FIREBASE_SERVICE_ACCOUNT_JSON=<raw JSON string or base64-encoded JSON string>`
- `RESEND_API_KEY=<resend api key for contact emails>`
- `CONTACT_RECEIVER_EMAIL=disamaze@gmail.com`
- `CONTACT_SENDER_EMAIL=onboarding@resend.dev`

## Render deployment
Use `render.yaml` (Blueprint) to create two services:
1. `kxmaterials-api` from `server/`
2. `kxmaterials-client` from `client/`

After deploy:
- Set frontend `NEXT_PUBLIC_API_URL` to your backend URL + `/api`
- Ensure backend has `MONGO_URI` and `FIREBASE_SERVICE_ACCOUNT_JSON`
- Keep frontend `NEXT_PUBLIC_API_URL` as `https://<your-backend>.onrender.com/api`

## Render start crash fix included
- Server now starts HTTP listener first and retries MongoDB connection in background every 15 seconds.
- This prevents Render from exiting immediately with status `1` when `MONGO_URI` is missing/invalid or Mongo is temporarily unavailable.
- Check logs for: `MongoDB connection failed, retrying in 15s:` and fix your `MONGO_URI` if it appears.

## If Render server start fails (`npm run start` exits with code 1)
1. Check Render logs for `Server bootstrap failed:`.
2. Verify `MONGO_URI` is present and valid (Atlas IP allowlist + correct DB user/password).
3. Verify `FIREBASE_SERVICE_ACCOUNT_JSON` is either:
   - full JSON string in one line, or
   - base64-encoded JSON string.
4. Ensure Firebase JSON includes valid `project_id`, `client_email`, and `private_key` fields.
5. If `private_key` was pasted with escaped newlines (`\n`), keep it as escaped text; server normalizes it automatically.
6. Redeploy after saving env vars.

## Important notes
- Uploaded screenshots are stored on server disk at `uploads/` and served via `/uploads/<filename>`.
- For production-scale durability, move uploads to persistent object storage/CDN later.


## Backend route note
- API is available on `/api/*` (recommended).
- Backward-compatible aliases are also enabled on `/products`, `/orders`, `/users` if `/api` is accidentally omitted.

## Important auth + API notes
- For frontend API calls, use `NEXT_PUBLIC_API_URL` ending with `/api` (example: `https://kxmaterials-api.onrender.com/api`).
- Public product listing works on both `/api/products` and `/products`.
- Admin actions require admin login first so `x-admin-secret` is sent in fallback mode.


## API base check
- Open `https://<your-backend>.onrender.com/api` to confirm API is live (returns endpoint map).
- If you open unknown paths, you will see `{ "message": "Route not found" }` by design.
