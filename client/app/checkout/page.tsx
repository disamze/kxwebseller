export default function CheckoutPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-heading text-3xl">Checkout</h1>
      <div className="mt-8 rounded-2xl border p-6 shadow-sm">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=edumarket@upi" alt="UPI QR" className="mx-auto" />
        <p className="mt-5 text-center">UPI ID: <b>edumarket@upi</b></p>
        <ol className="mt-4 list-decimal space-y-2 pl-6 text-sm text-slate-600 dark:text-slate-300">
          <li>Scan QR and complete payment.</li>
          <li>Upload payment screenshot below.</li>
          <li>Order status will be Pending verification until admin approval.</li>
        </ol>
        <input type="file" className="mt-6 w-full rounded-xl border p-3" />
        <button className="mt-4 w-full rounded-xl bg-primary py-3 text-white">Submit Payment Proof</button>
      </div>
    </main>
  );
}
