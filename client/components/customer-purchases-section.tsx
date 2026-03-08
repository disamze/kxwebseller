const entries = [
  { name: 'Aarav Sharma', purchase: 'Next.js Mastery Bootcamp (Course)', result: 'Joined Telegram channel instantly after approval.' },
  { name: 'Priya Patel', purchase: 'DSA Interview Ebook', result: 'Completed prep notes in 2 weeks.' },
  { name: 'Rohit Verma', purchase: 'UPSC Test Series 2026', result: 'Improved mock scores consistently.' },
  { name: 'Sneha Iyer', purchase: 'Frontend System Design Course', result: 'Used checklists for interview prep.' }
];

export function CustomerPurchasesSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-16">
      <div className="rounded-2xl border bg-white/80 p-6 shadow-sm dark:bg-slate-900/80">
        <h2 className="font-heading text-2xl">Customer Purchases & Outcomes</h2>
        <p className="mt-2 text-sm text-slate-500">Recent learners and what they purchased on KXMATERIALS.</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {entries.map((entry) => (
            <article key={entry.name} className="rounded-xl border p-4">
              <p className="font-medium">{entry.name}</p>
              <p className="mt-1 text-sm text-primary">Purchased: {entry.purchase}</p>
              <p className="mt-2 text-xs text-slate-500">{entry.result}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
