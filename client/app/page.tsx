import { ProductCard } from '@/components/product-card';
import { getProducts } from '@/lib/products';
import { ContactUsSection } from '@/components/contact-us-section';
import { OfferBanner } from '@/components/offer-banner';
import { OffersShowcase } from '@/components/offers-showcase';
import { UserReferralSection } from '@/components/user-referral-section';

const faqs = [
  { q: 'How do I access my course after payment?', a: 'After admin approval, your dashboard unlocks Telegram access links instantly.' },
  { q: 'How long is validity?', a: 'Most products include long-term validity; course-specific validity is shown on product cards.' },
  { q: 'Do you offer refund?', a: 'Because content is digital, refunds are handled only for duplicate/failed transactions after verification.' },
  { q: 'Can I buy more than one course together?', a: 'Yes. You can place multiple orders and all approved products appear in your dashboard separately.' },
  { q: 'Is mentor support available after purchase?', a: 'Yes, support is available through our guided channels and update groups for enrolled students.' },
  { q: 'Will I get updates if content changes?', a: 'Absolutely. Whenever batches or materials are updated, you receive revised access/resources as applicable.' },
  { q: 'Do these courses help both Boards and competitive exams?', a: 'Yes, many plans are designed with a hybrid strategy for concept clarity plus exam scoring techniques.' }
];

const testimonials = [
  {
    name: 'Aditya Singh',
    score: '96% Boards',
    text: 'I switched to KXMATERIALS 3 months before exams. The revision maps and practice tests gave me confidence and clarity.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80'
  },
  {
    name: 'Aman Verma',
    score: 'AIR 422',
    text: 'Mentor support and fast doubt solutions were game-changing. Every lecture felt practical and focused on scoring marks.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80'
  },
  {
    name: 'Sneha Patel',
    score: '95 in Physics',
    text: 'My favorite part was the PYQ strategy framework. I was able to target important topics and improve quickly.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80'
  }
];

export default async function HomePage() {
  const products = await getProducts();

  return (
    <main className="overflow-hidden pb-20 md:pb-0">
      <OfferBanner />
      <section className="relative min-h-[82vh] px-6 pb-24 pt-28">
        <div className="absolute inset-0 -z-20 bg-slate-950" />
        <div className="hero-orb hero-orb-cyan" />
        <div className="hero-orb hero-orb-indigo" />
        <div className="hero-orb hero-orb-pink" />
        <div className="absolute inset-0 -z-10 opacity-75" style={{
          backgroundImage: 'linear-gradient(120deg, rgba(56,189,248,0.2), rgba(129,140,248,0.2), rgba(244,114,182,0.2)), url(https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1800&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }} />
        <div className="animate-drift absolute left-4 top-10 z-10 rounded-2xl border border-cyan-200/60 bg-cyan-50/90 px-4 py-3 text-xs font-semibold text-cyan-900 shadow-lg backdrop-blur-lg sm:left-10 sm:top-16">
          ⚡ Personal mentor guidance
        </div>
        <div className="animate-drift-reverse absolute right-4 top-20 z-10 rounded-2xl border border-indigo-200/60 bg-indigo-50/90 px-4 py-3 text-xs font-semibold text-indigo-900 shadow-lg backdrop-blur-lg sm:right-10 sm:top-28">
          ✅ Verified payment support
        </div>
        <div className="mx-auto grid w-full max-w-7xl items-center gap-14 lg:grid-cols-2">
          <div className="animate-fade-up text-center text-white lg:text-left">
            <p className="inline-block rounded-full border border-cyan-200/70 bg-cyan-50/90 px-4 py-1 text-xs font-semibold tracking-[0.18em] text-cyan-900">TRUSTED BY 12,000+ LEARNERS</p>
            <h1 className="mt-5 font-heading text-4xl font-bold leading-tight sm:text-6xl">A Premium Learning Experience That Looks as Serious as Your Dreams.</h1>
            <p className="mx-auto mt-5 max-w-2xl text-base text-slate-100/90 sm:text-lg lg:mx-0">KXMATERIALS combines strategic mentorship, modern tech and exam-focused learning assets to help students win in Boards and competitive exams.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start">
              <a href="/explore" className="rounded-xl bg-white px-7 py-3 font-semibold text-slate-900 transition hover:scale-105">Explore Courses</a>
              <a href="#preview" className="rounded-xl border border-white/70 px-7 py-3 font-semibold text-white transition hover:bg-white/15">Watch Demo</a>
            </div>
          </div>

          <div className="animate-float">
            <div className="glass rounded-3xl border border-slate-200/60 bg-white/85 p-5 text-slate-900 shadow-2xl dark:border-slate-700 dark:bg-slate-900/75 dark:text-white">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ['98%+', 'Student satisfaction'],
                  ['4.8★', 'Average rating'],
                  ['500+', 'Video lectures'],
                  ['24/7', 'Telegram support']
                ].map(([value, label]) => (
                  <div key={label} className="rounded-2xl border border-slate-200/80 bg-white/85 p-4 dark:border-white/30 dark:bg-white/10">
                    <p className="text-3xl font-bold">{value}</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-200">{label}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-200">Fast onboarding • Reliable payment verification • Instant dashboard access after approval</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto -mt-10 grid max-w-6xl grid-cols-2 gap-4 px-6 pb-14 text-center md:grid-cols-4">
        <div className="rounded-2xl border bg-white p-4 shadow-sm dark:bg-slate-900"><p className="text-2xl font-bold">12,000+</p><p className="text-xs text-slate-500">Students</p></div>
        <div className="rounded-2xl border bg-white p-4 shadow-sm dark:bg-slate-900"><p className="text-2xl font-bold">500+</p><p className="text-xs text-slate-500">Video Lectures</p></div>
        <div className="rounded-2xl border bg-white p-4 shadow-sm dark:bg-slate-900"><p className="text-2xl font-bold">95%</p><p className="text-xs text-slate-500">Success Rate</p></div>
        <div className="rounded-2xl border bg-white p-4 shadow-sm dark:bg-slate-900"><p className="text-2xl font-bold">4.8★</p><p className="text-xs text-slate-500">Average Rating</p></div>
      </section>


      <section className="mx-auto max-w-6xl px-6 pb-12">
        <div className="grid gap-4 md:grid-cols-3">
          <a href="/explore?priceType=free" className="rounded-2xl border bg-gradient-to-br from-cyan-100 to-sky-200 p-5 shadow-sm transition hover:-translate-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-800">FREE RESOURCES</p>
            <h4 className="mt-2 font-heading text-xl">Start with Zero-Cost Materials</h4>
            <p className="mt-2 text-sm text-slate-700">Get free notes, starters and demo kits to begin instantly.</p>
          </a>
          <a href="/explore?type=course" className="rounded-2xl border bg-gradient-to-br from-indigo-100 to-violet-200 p-5 shadow-sm transition hover:-translate-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-800">MOST POPULAR</p>
            <h4 className="mt-2 font-heading text-xl">Top-Rated Exam Batches</h4>
            <p className="mt-2 text-sm text-slate-700">Structured classes, PYQ strategy and full revision support.</p>
          </a>
          <a href="/checkout" className="rounded-2xl border bg-gradient-to-br from-amber-100 to-orange-200 p-5 shadow-sm transition hover:-translate-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-800">LIMITED PERIOD</p>
            <h4 className="mt-2 font-heading text-xl">Apply Coupons Before Checkout</h4>
            <p className="mt-2 text-sm text-slate-700">Use active coupon and referral discounts for maximum savings.</p>
          </a>
        </div>
      </section>

      <section className="marquee-wrap border-y bg-white/60 py-3 text-sm font-semibold text-slate-700 dark:bg-slate-900/40 dark:text-slate-200">
        <div className="marquee-track">
          {[
            'Premium study plans',
            'Daily live support',
            'High-scoring strategy sheets',
            'Structured revision roadmaps',
            'Trusted by toppers',
            'Premium study plans',
            'Daily live support',
            'High-scoring strategy sheets',
            'Structured revision roadmaps',
            'Trusted by toppers'
          ].map((item, i) => (
            <span key={`${item}-${i}`} className="mx-6 inline-flex items-center gap-2">✨ {item}</span>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-4">
        <h2 className="font-heading text-3xl">Top Courses</h2>
      </section>
      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-14 md:grid-cols-3">
        {products.map((p) => <ProductCard key={p._id || p.id} {...p} />)}
      </section>

      <section id="preview" className="mx-auto max-w-6xl px-6 pb-16">
        <div className="rounded-3xl border bg-white p-6 shadow-sm dark:bg-slate-900 md:p-8">
          <h3 className="font-heading text-3xl">Immersive Preview & Learning Environment</h3>
          <p className="mt-2 text-sm text-slate-500">Experience our teaching style before buying. Dive into concept-first classes, memory tricks and score-maximizing frameworks.</p>
          <div className="mt-6 aspect-video overflow-hidden rounded-2xl border">
            <iframe
              className="h-full w-full"
              src="https://www.youtube.com/embed/kUMe1FH4CHE"
              title="KXMATERIALS demo"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <h3 className="font-heading text-3xl">Trusted Student Testimonials</h3>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {testimonials.map((item) => (
            <article key={item.name} className="animate-fade-up rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <img src={item.avatar} alt={item.name} className="h-12 w-12 rounded-full object-cover" />
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-xs text-primary">{item.score}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-700 dark:text-slate-300">“{item.text}”</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="rounded-3xl border bg-gradient-to-r from-cyan-500/15 via-indigo-500/15 to-fuchsia-500/15 p-8">
          <h3 className="font-heading text-3xl">Live Reviews Snapshot</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {[
              ['Google Reviews', '4.9/5', '1,100+ verified reviews'],
              ['Community Trust', '98%', 'Students recommend to friends'],
              ['Support Rating', '4.8/5', 'Fast response on Telegram']
            ].map(([title, value, desc]) => (
              <div key={title} className="rounded-2xl border bg-white/80 p-5 dark:bg-slate-900/60">
                <p className="text-xs uppercase tracking-widest text-slate-500">{title}</p>
                <p className="mt-2 text-3xl font-bold">{value}</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <OffersShowcase />
      <UserReferralSection />
      <ContactUsSection />

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <h3 className="font-heading text-2xl">Frequently Asked Questions</h3>
        <div className="mt-4 space-y-3">
          {faqs.map((item) => (
            <details key={item.q} className="rounded-xl border bg-white p-4 dark:bg-slate-900">
              <summary className="cursor-pointer font-medium">{item.q}</summary>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
