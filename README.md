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
1. User opens product and clicks **Buy Now**.
2. User pays via UPI QR on `/checkout`.
3. User uploads payment screenshot (and optional UTR/transaction id).
4. Backend creates order with status `Pending`.
5. Admin opens `/admin`, reviews screenshot, and clicks **Approve** or **Reject**.
6. On approval, product is added to user's `purchasedProducts`.
7. User opens `/dashboard` and can click **Join Telegram Channel** for unlocked products.

## API highlights
- `GET /api/products`
- `GET /api/products?type=course|ebook|test`
- `POST /api/products` (admin)
- `POST /api/orders` (auth + multipart `paymentScreenshot`)
- `GET /api/orders` (admin)
- `PATCH /api/orders/:id/review` (admin)
- `GET /api/users/materials` (auth, returns only unlocked products)

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

## Render deployment
Use `render.yaml` (Blueprint) to create two services:
1. `kxmaterials-api` from `server/`
2. `kxmaterials-client` from `client/`

After deploy:
- Set frontend `NEXT_PUBLIC_API_URL` to your backend URL + `/api`
- Ensure backend has `MONGO_URI` and `FIREBASE_SERVICE_ACCOUNT_JSON`

## If Render server start fails (`npm run start` exits with code 1)
1. Check Render logs for `Server bootstrap failed:`.
2. Verify `MONGO_URI` is present and valid (Atlas IP allowlist + correct DB user/password).
3. Verify `FIREBASE_SERVICE_ACCOUNT_JSON` is either:
   - full JSON string in one line, or
   - base64-encoded JSON string.
4. Redeploy after saving env vars.

## Important notes
- Uploaded screenshots are stored on server disk at `uploads/` and served via `/uploads/<filename>`.
- For production-scale durability, move uploads to persistent object storage/CDN later.
