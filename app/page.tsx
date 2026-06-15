import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Camera, Users, MapPin, Star, ArrowRight } from "lucide-react";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) redirect("/feed");

  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border max-w-5xl mx-auto">
        <span className="font-bold text-xl tracking-tight">foliow</span>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-muted hover:text-foreground transition-colors font-medium">
            Log in
          </Link>
          <Link
            href="/register"
            className="bg-accent hover:bg-accent/90 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Sign up free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 text-accent text-xs font-semibold px-3 py-1.5 rounded-full mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          Built for UK tradespeople
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight mb-6">
          Show your work.<br />
          <span className="text-accent">Build your name.</span>
        </h1>

        <p className="text-muted text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Foliow is the portfolio platform for UK tradespeople. Share your best jobs,
          grow your following, and let your work speak for itself.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-white font-bold px-8 py-3.5 rounded-xl text-base transition-colors"
          >
            Create your portfolio <ArrowRight size={18} />
          </Link>
          <Link
            href="/discover"
            className="inline-flex items-center justify-center gap-2 bg-surface border border-border text-foreground font-semibold px-8 py-3.5 rounded-xl text-base transition-colors"
          >
            Browse talent
          </Link>
        </div>

        <p className="text-muted text-xs mt-5">Free to join · No credit card required</p>
      </section>

      {/* Mock cards */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="bg-surface border border-border rounded-2xl p-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Plumber", color: "bg-blue-500/20 text-blue-400" },
            { label: "Electrician", color: "bg-yellow-500/20 text-yellow-400" },
            { label: "Painter", color: "bg-purple-500/20 text-purple-400" },
            { label: "Carpenter", color: "bg-orange-500/20 text-orange-400" },
          ].map((trade) => (
            <div key={trade.label} className="bg-surface-2 rounded-xl p-4 flex flex-col gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${trade.color}`}>
                {trade.label[0]}
              </div>
              <p className="font-semibold text-sm">{trade.label}</p>
              <div className="flex items-center gap-1">
                <Star size={11} className="text-accent fill-accent" />
                <span className="text-xs text-muted">4.9 · London</span>
              </div>
              <div className="grid grid-cols-3 gap-0.5 mt-1">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="aspect-square rounded bg-border" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-center mb-12">Everything you need to stand out</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              icon: Camera,
              title: "Portfolio grid",
              desc: "Upload photos of your best jobs. Before and after shots. Let your craftsmanship do the talking.",
            },
            {
              icon: Users,
              title: "Build a following",
              desc: "Clients and employers follow you personally, not just a company. Your reputation travels with you.",
            },
            {
              icon: MapPin,
              title: "Local discovery",
              desc: "Get found by homeowners and contractors in your area looking for your specific trade.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-surface border border-border rounded-2xl p-6">
              <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                <Icon size={22} className="text-accent" />
              </div>
              <h3 className="font-bold text-base mb-2">{title}</h3>
              <p className="text-muted text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Social proof */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="bg-accent/5 border border-accent/20 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">Join tradespeople across the UK</h2>
          <p className="text-muted text-sm mb-6 max-w-md mx-auto">
            Plumbers, electricians, carpenters, painters and more, all building their
            professional presence on Foliow.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {["Plumber", "Electrician", "Carpenter", "Tiler", "Roofer", "Gas Engineer", "Painter", "Builder"].map((t) => (
              <span key={t} className="px-3 py-1 bg-surface border border-border rounded-full text-xs font-medium text-muted">
                {t}
              </span>
            ))}
          </div>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-white font-bold px-8 py-3.5 rounded-xl text-base transition-colors"
          >
            Get started for free <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-bold text-lg tracking-tight">foliow</span>
          <p className="text-xs text-muted">2026 Foliow. Built for UK trades.</p>
          <div className="flex gap-4 text-xs text-muted">
            <Link href="/login" className="hover:text-foreground transition-colors">Log in</Link>
            <Link href="/register" className="hover:text-foreground transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>

    </main>
  );
}
