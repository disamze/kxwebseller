'use client';

import { FormEvent, useState } from 'react';
import { API_URL } from '@/lib/api';

export function ContactUsSection() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [sending, setSending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus('Please fill all fields.');
      return;
    }

    setSending(true);
    setStatus('Sending your message...');

    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });

      const data = await res.json();
      if (!res.ok) {
        setStatus(data?.message || 'Failed to send message.');
        return;
      }

      setStatus('Message sent successfully. We will contact you soon.');
      setName('');
      setEmail('');
      setMessage('');
    } catch {
      setStatus('Unable to reach server right now. Please try again.');
    } finally {
      setSending(false);
    }
  }

  return (
    <section id="contact" className="mx-auto max-w-6xl px-6 pb-16">
      <div className="grid gap-8 rounded-3xl border bg-white p-8 shadow-sm dark:bg-slate-900 md:grid-cols-2">
        <div>
          <h3 className="font-heading text-3xl">Contact Us</h3>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Need help selecting the right batch? Our counselors and mentors are ready to help you choose a smart plan based on your target exam and timeline.</p>
          <div className="mt-5 space-y-2 text-sm">
            <p><strong>Email:</strong> support@kxmaterials.com</p>
            <p><strong>WhatsApp:</strong> +91 90000 00000</p>
            <p><strong>Hours:</strong> 9:00 AM - 10:00 PM (IST)</p>
          </div>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border px-4 py-3" placeholder="Your name" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border px-4 py-3" placeholder="Your email" type="email" />
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="min-h-[120px] w-full rounded-xl border px-4 py-3" placeholder="How can we help?" />
          <button disabled={sending} type="submit" className="w-full rounded-xl bg-primary px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">{sending ? 'Sending...' : 'Send Message'}</button>
          {status ? <p className="text-xs text-slate-500">{status}</p> : null}
        </form>
      </div>
    </section>
  );
}
