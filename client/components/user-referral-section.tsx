'use client';

import { useEffect, useMemo, useState } from 'react';
import { API_URL, getAuthHeaders, getSessionUser } from '@/lib/api';

type Me = {
  referralCode?: string;
  referralBalance?: number;
  personalCouponCode?: string;
  personalCouponUsed?: boolean;
};

export function UserReferralSection() {
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    if (!getSessionUser()) return;
    fetch(`${API_URL}/users/me`, { headers: getAuthHeaders() })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setMe(d))
      .catch(() => setMe(null));
  }, []);

  const referralLink = useMemo(() => {
    if (!me?.referralCode) return '';
    if (typeof window === 'undefined') return `/signup?ref=${me.referralCode}`;
    return `${window.location.origin}/signup?ref=${me.referralCode}`;
  }, [me?.referralCode]);

  return (
    <section className="mx-auto max-w-6xl px-6 pb-12">
      <div className="rounded-3xl border bg-white p-6 shadow-sm dark:bg-slate-900">
        <h3 className="font-heading text-2xl">Referral & Rewards</h3>
        {!me ? (
          <p className="mt-2 text-sm text-slate-500">Login to view your referral code and personal discount code.</p>
        ) : (
          <div className="mt-4 space-y-3 text-sm">
            <p><b>Your referral code:</b> {me.referralCode || 'Generating...'}</p>
            <p><b>Your referral wallet:</b> ₹{Number(me.referralBalance || 0)}</p>
            <p><b>Your personal ₹200 discount code:</b> {me.personalCouponCode || 'Will be generated after first successful referral purchase.'}</p>
            <p><b>Code status:</b> {me.personalCouponUsed ? 'Already used' : 'Available'}</p>
            {referralLink ? <p className="break-all"><b>Referral link:</b> {referralLink}</p> : null}
          </div>
        )}
      </div>
    </section>
  );
}
