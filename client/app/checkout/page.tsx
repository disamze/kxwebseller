'use client';

import { Suspense, FormEvent, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { API_URL, getAuthHeaders, getSessionUser } from '@/lib/api';

function CheckoutContent() {
  const params = useSearchParams();
  const product = params.get('product') || '';
  const [txn, setTxn] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState('');

  async function submitPayment(e: FormEvent) {
    e.preventDefault();
    if (!file) return setStatus('Please upload payment screenshot.');
    const session = getSessionUser();
    if (!session) return setStatus('Please login first to submit payment proof.');

    const formData = new FormData();
    formData.append('productId', product);
    formData.append('transactionId', txn);
    formData.append('paymentScreenshot', file);

    const res = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData
    });

    const data = await res.json();
    if (!res.ok) return setStatus(data.message || 'Submission failed');
    setStatus('Payment submitted. Status: Pending verification.');
    setTxn('');
    setFile(null);
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-heading text-3xl">Checkout</h1>
      <form onSubmit={submitPayment} className="mt-8 rounded-2xl border p-6 shadow-sm">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=kxmaterials@upi" alt="UPI QR" className="mx-auto" />
        <p className="mt-5 text-center">UPI ID: <b>kxmaterials@upi</b></p>
        <ol className="mt-4 list-decimal space-y-2 pl-6 text-sm text-slate-600 dark:text-slate-300">
          <li>Scan QR and complete payment.</li>
          <li>Upload payment screenshot and add transaction ID.</li>
          <li>Order status will be Pending verification until admin approval.</li>
        </ol>
        <input value={txn} onChange={(e) => setTxn(e.target.value)} type="text" placeholder="Transaction ID / UTR (optional)" className="mt-6 w-full rounded-xl border p-3" />
        <input onChange={(e) => setFile(e.target.files?.[0] || null)} type="file" accept="image/*" className="mt-3 w-full rounded-xl border p-3" />
        <button className="mt-4 w-full rounded-xl bg-primary py-3 text-white">Submit Payment Proof</button>
        {status ? <p className="mt-3 text-sm">{status}</p> : null}
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
