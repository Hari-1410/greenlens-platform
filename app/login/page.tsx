"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password");
      return;
    }

    // Fetch session to determine role
    const session = await fetch("/api/user").then(r => r.json());
    if (session?.role === "CORPORATE") {
      router.push("/corporate");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(circle at 50% 30%, rgba(34,197,94,0.05) 0%, transparent 60%)" }} />

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-3xl">🌿</span>
            <span className="font-display font-bold text-xl text-brand-300">GreenLens</span>
          </Link>
          <h1 className="font-display text-2xl font-bold text-brand-100">Welcome back</h1>
          <p className="text-brand-600 text-sm mt-1">Sign in to your account</p>
        </div>

        <div className="glow-card rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
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
                placeholder="••••••••"
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
              {loading ? "Signing in…" : "Sign In →"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-brand-700 text-sm">
              Don't have an account?{" "}
              <Link href="/register" className="text-brand-400 hover:text-brand-300 transition-colors font-medium">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
