"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") === "CORPORATE" ? "CORPORATE" : "USER";

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: defaultRole as "USER" | "CORPORATE",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Registration failed");
      setLoading(false);
      return;
    }

    const signInRes = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    });

    setLoading(false);

    if (signInRes?.error) {
      setError("Account created but login failed. Please sign in manually.");
      router.push("/login");
      return;
    }

    router.push(form.role === "CORPORATE" ? "/corporate" : "/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(circle at 50% 30%, rgba(34,197,94,0.05) 0%, transparent 60%)" }} />

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-3xl">🌿</span>
            <span className="font-display font-bold text-xl text-brand-300">GreenLens</span>
          </Link>
          <h1 className="font-display text-2xl font-bold text-brand-100">Create your account</h1>
          <p className="text-brand-600 text-sm mt-1">Start earning Green Tokens today</p>
        </div>

        <div className="glow-card rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-brand-400 text-xs font-mono uppercase tracking-widest mb-2">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(["USER", "CORPORATE"] as const).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm({ ...form, role: r })}
                    className={`py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border ${
                      form.role === r
                        ? "bg-brand-500/20 border-brand-500 text-brand-300"
                        : "bg-transparent border-brand-900 text-brand-700 hover:border-brand-700"
                    }`}
                  >
                    {r === "USER" ? "👤 Individual" : "🏢 Corporate"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-brand-400 text-xs font-mono uppercase tracking-widest mb-2">
                {form.role === "CORPORATE" ? "Company Name" : "Full Name"}
              </label>
              <input
                type="text"
                className="gl-input"
                placeholder={form.role === "CORPORATE" ? "Acme Corp" : "Jane Doe"}
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-brand-400 text-xs font-mono uppercase tracking-widest mb-2">
                Email
              </label>
              <input
                type="email"
                className="gl-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-brand-400 text-xs font-mono uppercase tracking-widest mb-2">
                Password
              </label>
              <input
                type="password"
                className="gl-input"
                placeholder="Min. 8 characters"
                minLength={8}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-800/50 text-red-400 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <button type="submit" className="gl-btn-primary w-full py-3" disabled={loading}>
              {loading ? "Creating account…" : "Create Account →"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-brand-700 text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-brand-400 hover:text-brand-300 transition-colors font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
