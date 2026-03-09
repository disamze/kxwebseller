'use client';

import { Suspense, FormEvent, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { API_URL, getAuthHeaders, getSessionUser } from '@/lib/api';

type PublicSettings = {
  coupons?: { code: string; percent: number }[];
  referralEnabled?: boolean;
  referralDiscountAmount?: number;
  referralMinPurchase?: number;
};

function CheckoutContent() {
  const params = useSearchParams();
  const product = params.get('product') || '';
  const [txn, setTxn] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [settings, setSettings] = useState<PublicSettings>({});
  const [referralBalance, setReferralBalance] = useState(0);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!product) return;
    fetch(`${API_URL}/products/${product}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setAmount(Number(d?.price || 0)))
      .catch(() => setAmount(null));

    fetch(`${API_URL}/users/public-settings`)
      .then((r) => r.json())
      .then((d) => setSettings(d || {}))
      .catch(() => setSettings({}));

    if (getSessionUser()) {
      fetch(`${API_URL}/users/me`, { headers: getAuthHeaders() })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => setReferralBalance(Number(d?.referralBalance || 0)))
        .catch(() => setReferralBalance(0));
    }
  }, [product]);

  const couponDiscount = useMemo(() => {
    const base = Number(amount || 0);
    const code = couponCode.trim().toUpperCase();
    const coupon = (settings.coupons || []).find((c) => c.code.toUpperCase() === code);
    if (!coupon || !base) return 0;
    return Math.floor((base * coupon.percent) / 100);
  }, [amount, couponCode, settings]);

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

    const formData = new FormData();
    formData.append('productId', product);
    formData.append('transactionId', txn);
    formData.append('amount', String(Number(amount || 0)));
    formData.append('couponCode', couponCode.trim().toUpperCase());
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
    setFile(null);
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 pb-28 sm:px-6 sm:py-16">
      <h1 className="font-heading text-3xl">Checkout</h1>
      <form onSubmit={submitPayment} className="mt-8 rounded-2xl border p-6 shadow-sm">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=kxmaterials@upi" alt="UPI QR" className="mx-auto" />
        <p className="mt-5 text-center">UPI ID: <b>kxmaterials@upi</b></p>
        {amount !== null ? <p className="mt-2 text-center text-sm">Base amount: ₹{amount}</p> : null}

        <div className="mt-5 grid gap-3">
          <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Coupon code" className="rounded-xl border p-3" />
          {!!couponDiscount ? <p className="text-xs text-green-600">Coupon discount: -₹{couponDiscount}</p> : null}
          {!!referralDiscount ? <p className="text-xs text-green-600">Referral discount: -₹{referralDiscount}</p> : <p className="text-xs text-slate-500">Referral wallet: ₹{referralBalance}</p>}
          <p className="text-sm font-semibold">Payable now: ₹{payable}</p>
          {(settings.coupons || []).length ? <p className="text-xs text-slate-500">Available coupons: {(settings.coupons || []).map((c) => `${c.code} (${c.percent}% off)`).join(', ')}</p> : null}
        </div>

        <input value={txn} onChange={(e) => setTxn(e.target.value)} placeholder="Transaction ID (optional)" className="mt-5 w-full rounded-xl border p-3" />
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="mt-4 w-full" />
        <button className="mt-6 w-full rounded-xl bg-primary py-4 text-base font-semibold text-white">Submit Payment Proof</button>
        {status ? <p className="mt-4 text-sm text-slate-500">{status}</p> : null}
      </form>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-3xl px-6 py-16">Loading checkout...</main>}>
      <CheckoutContent />
    </Suspense>
  );
}
