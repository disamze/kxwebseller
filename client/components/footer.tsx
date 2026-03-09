export function Footer() {
  return (
    <footer className="relative mt-20 overflow-hidden border-t bg-slate-950 px-6 py-14 text-slate-200">
      <div className="absolute inset-0 -z-10 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, #22d3ee 0, transparent 35%), radial-gradient(circle at 80% 0%, #6366f1 0, transparent 30%), radial-gradient(circle at 60% 80%, #d946ef 0, transparent 40%)' }} />
      <div className="mx-auto grid w-full max-w-6xl gap-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-heading text-2xl font-bold text-white">KXMATERIALS</p>
          <p className="mt-3 max-w-md text-sm text-slate-300">India's modern exam-prep platform helping students learn faster, score better and build confidence with curated courses, test series and mentoring.</p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-white">Company</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            <li><a href="#" className="hover:text-white">About Us</a></li>
            <li><a href="/explore" className="hover:text-white">Courses</a></li>
            <li><a href="#contact" className="hover:text-white">Contact</a></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-white">Legal</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white">Terms of Service</a></li>
            <li><a href="#" className="hover:text-white">Refund Policy</a></li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-10 flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 border-t border-white/15 pt-5 text-xs text-slate-400">
        <p>© {new Date().getFullYear()} KXMATERIALS. All rights reserved.</p>
        <p>Built for ambitious learners • Trusted by thousands of students</p>
      </div>
    </footer>
  );
}
