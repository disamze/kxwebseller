'use client';

import { Suspense, FormEvent, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { API_URL, getAuthHeaders, getSessionUser, withApiBase } from '@/lib/api';

type Coupon = { code: string; percent: number; active?: boolean };
type PublicSettings = {
  coupons?: Coupon[];
  referralEnabled?: boolean;
  referralDiscountAmount?: number;
  referralMinPurchase?: number;
};

type CheckoutProduct = {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  price: number;
  type?: string;
  classLevel?: string;
  subject?: string;
  studentsCount?: number;
  rating?: number;
  thumbnail?: string;
};

type PublicSettings = {
  coupons?: { code: string; percent: number }[];
  referralEnabled?: boolean;
  referralDiscountAmount?: number;
  referralMinPurchase?: number;
};

function CheckoutContent() {
  const params = useSearchParams();
  const productId = params.get('product') || '';

  const [txn, setTxn] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [product, setProduct] = useState<CheckoutProduct | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [settings, setSettings] = useState<PublicSettings>({});
  const [referralBalance, setReferralBalance] = useState(0);
  const [personalCouponCode, setPersonalCouponCode] = useState('');
  const [personalCouponUsed, setPersonalCouponUsed] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!productId) return;

    fetch(`${API_URL}/products/${productId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setProduct(d || null))
      .catch(() => setProduct(null));

    fetch(`${API_URL}/users/public-settings`)
      .then((r) => r.json())
      .then((d) => setSettings(d || {}))
      .catch(() => setSettings({}));

    if (getSessionUser()) {
      fetch(`${API_URL}/users/me`, { headers: getAuthHeaders() })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          setReferralBalance(Number(d?.referralBalance || 0));
          setPersonalCouponCode(String(d?.personalCouponCode || ''));
          setPersonalCouponUsed(Boolean(d?.personalCouponUsed));
        })
        .catch(() => setReferralBalance(0));
    }
  }, [productId]);

  const amount = Number(product?.price || 0);

  const couponDiscount = useMemo(() => {
    const code = couponCode.trim().toUpperCase();
    if (!code || !amount) return 0;

    const coupon = (settings.coupons || []).find((c) => Boolean(c.active ?? true) && c.code.toUpperCase() === code);
    if (coupon) return Math.floor((amount * coupon.percent) / 100);

    if (personalCouponCode && !personalCouponUsed && code === personalCouponCode.toUpperCase()) {
      return Math.min(200, amount);
    }

    return 0;
  }, [amount, couponCode, settings, personalCouponCode, personalCouponUsed]);

  const referralWalletDiscount = useMemo(() => {
    if (!settings.referralEnabled) return 0;
    if (amount < Number(settings.referralMinPurchase || 900)) return 0;
    const remaining = Math.max(0, amount - couponDiscount);
    return Math.min(referralBalance, Number(settings.referralDiscountAmount || 200), remaining);
  }, [amount, couponDiscount, settings, referralBalance]);

  const referralCodeDiscount = useMemo(() => {
    if (!settings.referralEnabled) return 0;
    if (!referralCode.trim()) return 0;
    if (amount < Number(settings.referralMinPurchase || 900)) return 0;
    const remaining = Math.max(0, amount - couponDiscount - referralWalletDiscount);
    return Math.min(Number(settings.referralDiscountAmount || 200), remaining);
  }, [amount, couponDiscount, referralWalletDiscount, referralCode, settings]);

  const payable = Math.max(0, amount - couponDiscount - referralWalletDiscount - referralCodeDiscount);

  const couponDiscount = useMemo(() => {
    const base = Number(amount || 0);
    const code = couponCode.trim().toUpperCase();
    if (!base) return 0;
    const coupon = (settings.coupons || []).find((c) => c.code.toUpperCase() === code);
    if (coupon) return Math.floor((base * coupon.percent) / 100);
    if (personalCouponCode && !personalCouponUsed && code === personalCouponCode.toUpperCase()) return Math.min(200, base);
    return 0;
  }, [amount, couponCode, settings, personalCouponCode, personalCouponUsed]);

  const referralDiscount = useMemo(() => {
    const base = Number(amount || 0);
    if (!settings.referralEnabled) return 0;
    if (base < Number(settings.referralMinPurchase || 900)) return 0;
    return Math.min(referralBalance, Number(settings.referralDiscountAmount || 200));
  }, [amount, settings, referralBalance]);

  const payable = Math.max(0, Number(amount || 0) - couponDiscount - referralDiscount);

  async function submitPayment(e: FormEvent) {
    e.preventDefault();
    if (!file) return setStatus('Please upload payment screenshot.');
    const session = getSessionUser();
    if (!session) return setStatus('Please login first to submit payment proof.');
    if (!productId) return setStatus('Invalid product. Please re-open checkout from product page.');

    const formData = new FormData();
    formData.append('productId', productId);
    formData.append('transactionId', txn);
    formData.append('couponCode', couponCode.trim().toUpperCase());
    formData.append('referralCode', referralCode.trim().toUpperCase());
    formData.append('paymentScreenshot', file);

    const res = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData
    });

    const data = await res.json();
    if (!res.ok) return setStatus(data.message || 'Submission failed');

    setStatus(`Payment submitted. Status: Pending verification. Final payable recorded: ₹${data.finalAmount ?? payable}`);
    setTxn('');
    setCouponCode('');
    setReferralCode('');
    setFile(null);
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 pb-28 sm:px-6 sm:py-12">
      <h1 className="font-heading text-3xl">Secure Checkout</h1>
      <p className="mt-2 text-sm text-slate-500">Trusted purchase flow • Manual payment verification • Instant unlock after approval</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <section className="rounded-2xl border bg-white p-5 shadow-sm dark:bg-slate-900">
          <h2 className="text-lg font-semibold">Product Summary</h2>
          {product ? (
            <>
              {product.thumbnail ? <img src={withApiBase(product.thumbnail)} alt={product.title} className="mt-4 h-44 w-full rounded-xl object-cover" /> : null}
              <h3 className="mt-4 text-xl font-semibold">{product.title}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{product.description}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {product.type ? <span className="rounded-full bg-blue-100 px-2 py-1 text-blue-800">{product.type.toUpperCase()}</span> : null}
                {product.classLevel ? <span className="rounded-full bg-cyan-100 px-2 py-1 text-cyan-900">{product.classLevel}</span> : null}
                {product.subject ? <span className="rounded-full bg-indigo-100 px-2 py-1 text-indigo-900">{product.subject}</span> : null}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <p className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">Students: <b>{Number(product.studentsCount || 0).toLocaleString()}+</b></p>
                <p className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">Rating: <b>⭐ {Number(product.rating || 4.8).toFixed(1)}</b></p>
              </div>
              <p className="mt-4 text-lg font-semibold">Price: ₹{amount}</p>
            </>
          ) : (
            <p className="mt-4 text-sm text-slate-500">Loading product details...</p>
          )}

          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
            <p>✅ 100% secure payment proof process</p>
            <p>✅ Admin verification before approval</p>
            <p>✅ Support available via Contact Us</p>
          </div>
        </section>

        <form onSubmit={submitPayment} className="rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-900">
          <h2 className="text-lg font-semibold">Payment Details</h2>
          <img src="/Screenshot 2026-03-10 155819.png" alt="UPI QR" className="mx-auto mt-4" />
          <p className="mt-4 text-center text-sm">UPI ID: <b>kxmaterials@upi</b></p>

          <div className="mt-5 space-y-3">
            <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Apply coupon code" className="w-full rounded-xl border p-3" />
            <input value={referralCode} onChange={(e) => setReferralCode(e.target.value)} placeholder="Referral code (extra ₹200 off)" className="w-full rounded-xl border p-3" />

            <div className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800/70">
              <p>Base amount: ₹{amount}</p>
              <p>Coupon discount: -₹{couponDiscount}</p>
              <p>Referral wallet discount: -₹{referralWalletDiscount}</p>
              <p>Referral code discount: -₹{referralCodeDiscount}</p>
              <p className="mt-2 text-base font-semibold">Final payable: ₹{payable}</p>
            </div>

            {personalCouponCode ? (
              <p className="text-xs text-slate-500">Your personal coupon: <b>{personalCouponCode}</b> ({personalCouponUsed ? 'used' : 'available'})</p>
            ) : (
              <p className="text-xs text-slate-500">Your personal ₹200 coupon appears after successful referral purchase.</p>
            )}

            <p className="text-xs text-slate-500">Referral wallet balance: ₹{referralBalance}</p>
            {(settings.coupons || []).length ? (
              <p className="text-xs text-slate-500">Available coupons: {(settings.coupons || []).filter((c) => Boolean(c.active ?? true)).map((c) => `${c.code} (${c.percent}% off)`).join(', ')}</p>
            ) : null}
          </div>

          <input value={txn} onChange={(e) => setTxn(e.target.value)} placeholder="Transaction ID (optional)" className="mt-5 w-full rounded-xl border p-3" />
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="mt-4 w-full" />

          <button className="mt-6 w-full rounded-xl bg-primary py-4 text-base font-semibold text-white">Submit Payment Proof</button>
          {status ? <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">{status}</p> : null}
        </form>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-3xl px-4 py-10">Loading checkout...</main>}>
      <CheckoutContent />
    </Suspense>
  );
}
