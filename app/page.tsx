import Link from "next/link";

const CERTS = [
  "Climate Pledge Friendly", "USDA Organic", "FSC Certified",
  "Fair Trade", "ENERGY STAR", "B Corp", "OEKO-TEX", "Rainforest Alliance",
];

const STEPS = [
  { num: "01", title: "Install Extension", desc: "Add GreenCart to Chrome in seconds. It runs silently in the background." },
  { num: "02", title: "Shop on Amazon", desc: "Browse normally. Green badges appear on Climate Pledge Friendly products." },
  { num: "03", title: "Earn Green Tokens", desc: "Every eco-purchase earns tokens based on the product's sustainability score." },
  { num: "04", title: "Track & Redeem", desc: "Watch your wallet grow. Tokens convert to real monetary value." },
];

const FEATURES = [
  { icon: "🌿", title: "Live Sustainability Scores", desc: "Real-time detection of 30+ eco-certifications directly from Amazon's Climate Pledge Friendly program." },
  { icon: "⚡", title: "Token Economy", desc: "Score 80-100 earns 20 tokens. Score 60-79 earns 12. Every green choice pays off." },
  { icon: "📊", title: "Impact Dashboard", desc: "Visualize your carbon footprint reduction, spending trends, and green streaks." },
  { icon: "🏢", title: "Corporate ESG Analytics", desc: "Anonymized aggregate data for businesses tracking sustainability KPIs." },
];

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      {/* Background grid */}
      <div className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 20%, rgba(34,197,94,0.06) 0%, transparent 50%),
                            radial-gradient(circle at 80% 80%, rgba(34,197,94,0.04) 0%, transparent 50%)`,
        }}
      />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-brand-900/50 bg-surface-900/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌿</span>
            <span className="font-display font-bold text-lg text-brand-300 tracking-tight">GreenLens</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-brand-600 font-medium">
            <a href="#how" className="hover:text-brand-300 transition-colors">How it works</a>
            <a href="#features" className="hover:text-brand-300 transition-colors">Features</a>
            <a href="#corporate" className="hover:text-brand-300 transition-colors">Corporate</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="gl-btn-secondary text-sm py-2 px-4">Sign in</Link>
            <Link href="/register" className="gl-btn-primary text-sm py-2 px-4">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Cert marquee pill */}
          <div className="inline-flex items-center gap-2 bg-brand-900/30 border border-brand-800/50 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 bg-brand-400 rounded-full animate-pulse-slow" />
            <span className="text-brand-400 text-xs font-mono font-medium tracking-widest uppercase">
              30+ Eco-Certifications Detected
            </span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-6">
            <span className="text-brand-100">Shop green.</span>
            <br />
            <span className="text-brand-400">Earn rewards.</span>
            <br />
            <span className="text-brand-700">Save the planet.</span>
          </h1>

          <p className="text-brand-500 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-body">
            GreenLens detects eco-certified products on Amazon in real time, 
            rewards you with Green Tokens for sustainable choices, and turns your 
            shopping habits into measurable climate impact.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/register" className="gl-btn-primary text-base py-4 px-8">
              Start Earning Tokens →
            </Link>
            <a href="#how" className="gl-btn-secondary text-base py-4 px-8">
              See How It Works
            </a>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {[
              { val: "₹0.10", label: "per token earned" },
              { val: "30+", label: "certifications tracked" },
              { val: "100%", label: "data privacy" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="font-display font-bold text-2xl text-brand-300">{s.val}</div>
                <div className="text-brand-700 text-xs mt-1 font-mono">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cert scroll */}
      <div className="border-y border-brand-900/40 py-4 overflow-hidden bg-surface-800/30">
        <div className="flex gap-8 animate-none" style={{ width: "max-content" }}>
          {[...CERTS, ...CERTS].map((c, i) => (
            <span key={i} className="text-brand-700 text-sm font-mono whitespace-nowrap flex items-center gap-2">
              <span className="text-brand-500">✦</span> {c}
            </span>
          ))}
        </div>
      </div>

      {/* How it works */}
      <section id="how" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-brand-500 text-sm font-mono tracking-widest uppercase mb-3">The Process</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-brand-100">How GreenLens Works</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {STEPS.map(step => (
              <div key={step.num} className="glow-card rounded-2xl p-6 relative overflow-hidden">
                <div className="text-5xl font-display font-black text-brand-900/60 absolute top-4 right-6 select-none">
                  {step.num}
                </div>
                <div className="relative">
                  <h3 className="font-display font-bold text-xl text-brand-200 mb-2">{step.title}</h3>
                  <p className="text-brand-600 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Token Economy */}
      <section className="py-16 px-6 bg-surface-800/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-brand-500 text-sm font-mono tracking-widest uppercase mb-3">Token Economy</p>
            <h2 className="font-display text-4xl font-bold text-brand-100">Earn More for Better Choices</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { range: "Score 80–100", tokens: 20, color: "brand-400", example: "20 tokens = ₹2.00" },
              { range: "Score 60–79", tokens: 12, color: "brand-500", example: "12 tokens = ₹1.20" },
              { range: "Score 40–59", tokens: 5, color: "brand-700", example: "5 tokens = ₹0.50" },
            ].map(tier => (
              <div key={tier.range} className="glow-card rounded-2xl p-6 text-center">
                <div className={`font-display text-4xl font-black text-${tier.color} mb-2`}>
                  {tier.tokens}
                </div>
                <div className="text-brand-300 font-semibold text-sm mb-1">tokens</div>
                <div className="text-brand-600 text-xs font-mono mb-3">{tier.range}</div>
                <div className="text-brand-500 text-xs border border-brand-800 rounded-full px-3 py-1 inline-block">
                  {tier.example}
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-brand-700 text-xs font-mono mt-6">
            1 Green Token = ₹0.10 · Tokens accumulate in your wallet and can be redeemed
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-brand-500 text-sm font-mono tracking-widest uppercase mb-3">Features</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-brand-100">Everything You Need</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="glow-card rounded-2xl p-6 flex gap-5">
                <div className="text-3xl shrink-0">{f.icon}</div>
                <div>
                  <h3 className="font-display font-bold text-lg text-brand-200 mb-2">{f.title}</h3>
                  <p className="text-brand-600 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Corporate */}
      <section id="corporate" className="py-24 px-6 bg-surface-800/20">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-brand-500 text-sm font-mono tracking-widest uppercase mb-3">For Business</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-brand-100 mb-6">
            ESG Analytics Dashboard
          </h2>
          <p className="text-brand-500 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Access anonymized aggregate data on sustainable shopping trends across 
            thousands of users. Generate PDF ESG reports for investors and regulators.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 mb-10">
            {[
              { label: "Total Green Shoppers", icon: "👥" },
              { label: "Carbon Reduction (kg CO₂)", icon: "🌍" },
              { label: "Category Analytics", icon: "📊" },
            ].map(m => (
              <div key={m.label} className="glow-card rounded-xl p-5 text-center">
                <div className="text-2xl mb-2">{m.icon}</div>
                <div className="text-brand-400 text-sm font-medium">{m.label}</div>
              </div>
            ))}
          </div>
          <Link href="/register?role=CORPORATE" className="gl-btn-primary py-4 px-8 inline-block">
            Get Corporate Access →
          </Link>
        </div>
      </section>

      {/* Download CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="glow-card rounded-3xl p-10 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(circle at 50% 0%, rgba(34,197,94,0.1) 0%, transparent 70%)" }} />
            <div className="relative">
              <div className="text-5xl mb-4">🌿</div>
              <h2 className="font-display text-3xl font-bold text-brand-100 mb-4">
                Start Your Green Journey
              </h2>
              <p className="text-brand-500 mb-8 text-sm leading-relaxed">
                Create your free account, install the extension, and start earning 
                tokens on your very next Amazon purchase.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/register" className="gl-btn-primary py-3 px-8">
                  Create Free Account
                </Link>
                <Link href="/login" className="gl-btn-secondary py-3 px-8">
                  Sign In
                </Link>
              </div>
              <p className="text-brand-800 text-xs mt-6 font-mono">
                No credit card required · Free forever for individuals
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-brand-900/40 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌿</span>
            <span className="font-display font-bold text-brand-700">GreenLens</span>
          </div>
          <p className="text-brand-800 text-xs font-mono">
            © {new Date().getFullYear()} GreenLens Platform. Making every purchase count.
          </p>
          <div className="flex gap-6 text-xs text-brand-700 font-mono">
            <a href="#" className="hover:text-brand-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-brand-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-brand-400 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
