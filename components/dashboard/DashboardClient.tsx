"use client";
import { useState } from "react";
import { signOut } from "next-auth/react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import Link from "next/link";

interface DashboardClientProps {
  user: { name: string; email: string };
  wallet: { tokenBalance: number; moneyEquivalent: number };
  purchases: any[];
  transactions: any[];
  carbonSaved: number;
  streakDays: number;
  monthlyData: { month: string; tokens: number; carbon: number }[];
}

const BADGES = [
  { id: "first", icon: "🌱", name: "First Purchase", desc: "Made your first green purchase", threshold: 1 },
  { id: "tenner", icon: "🌿", name: "Green Tenner", desc: "Earned 10+ tokens", threshold: 10 },
  { id: "century", icon: "🌳", name: "Token Century", desc: "Earned 100+ tokens", threshold: 100 },
  { id: "streaker", icon: "🔥", name: "Green Streak", desc: "7+ day streak", threshold: 7 },
];

export function DashboardClient({
  user, wallet, purchases, transactions, carbonSaved, streakDays, monthlyData,
}: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "purchases" | "transactions">("overview");

  const earnedBadges = BADGES.filter(b => {
    if (b.id === "first") return purchases.length >= b.threshold;
    if (b.id === "tenner") return wallet.tokenBalance >= b.threshold;
    if (b.id === "century") return wallet.tokenBalance >= b.threshold;
    if (b.id === "streaker") return streakDays >= b.threshold;
    return false;
  });

  return (
    <div className="min-h-screen bg-surface-900">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-full w-60 border-r border-brand-900/40 bg-surface-800/50 backdrop-blur-xl flex flex-col z-40">
        <div className="p-6 border-b border-brand-900/40">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🌿</span>
            <span className="font-display font-bold text-brand-300">GreenLens</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: "overview", label: "Overview", icon: "◎" },
            { id: "purchases", label: "Purchases", icon: "◈" },
            { id: "transactions", label: "Transactions", icon: "◆" },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === item.id
                  ? "bg-brand-500/15 text-brand-300 border border-brand-500/30"
                  : "text-brand-700 hover:text-brand-400 hover:bg-brand-900/30"
              }`}
            >
              <span className="font-mono text-xs">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-brand-900/40">
          <div className="mb-3 px-3">
            <p className="text-brand-300 text-sm font-medium truncate">{user.name}</p>
            <p className="text-brand-700 text-xs font-mono truncate">{user.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full text-left px-3 py-2 text-brand-700 text-xs hover:text-red-400 transition-colors font-mono"
          >
            → Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-60 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-brand-100">
            Hey, {user.name.split(" ")[0]} 👋
          </h1>
          <p className="text-brand-600 text-sm mt-1 font-mono">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        {/* Extension Banner */}
        <div className="glow-card rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔌</span>
            <div>
              <p className="text-brand-200 text-sm font-medium">Install the GreenCart Extension</p>
              <p className="text-brand-600 text-xs font-mono">Start earning tokens on every Amazon purchase</p>
            </div>
          </div>
          <a
            href="https://chrome.google.com/webstore"
            target="_blank"
            rel="noopener noreferrer"
            className="gl-btn-primary text-xs py-2 px-4 whitespace-nowrap"
          >
            Download Extension
          </a>
        </div>

        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="glow-card rounded-2xl p-6">
                <p className="text-brand-600 text-xs font-mono uppercase tracking-widest mb-3">Token Balance</p>
                <p className="font-display text-4xl font-black text-brand-300">{wallet.tokenBalance}</p>
                <p className="text-brand-600 text-xs mt-1">Green Tokens</p>
              </div>
              <div className="glow-card rounded-2xl p-6">
                <p className="text-brand-600 text-xs font-mono uppercase tracking-widest mb-3">₹ Equivalent</p>
                <p className="font-display text-4xl font-black text-brand-400">
                  ₹{wallet.moneyEquivalent.toFixed(2)}
                </p>
                <p className="text-brand-600 text-xs mt-1">@ ₹0.10 per token</p>
              </div>
              <div className="glow-card rounded-2xl p-6">
                <p className="text-brand-600 text-xs font-mono uppercase tracking-widest mb-3">Carbon Saved</p>
                <p className="font-display text-4xl font-black text-brand-500">
                  {carbonSaved.toFixed(2)}
                </p>
                <p className="text-brand-600 text-xs mt-1">kg CO₂ equivalent</p>
              </div>
            </div>

            {/* Streak & Badges */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glow-card rounded-2xl p-6">
                <p className="text-brand-600 text-xs font-mono uppercase tracking-widest mb-4">Green Streak</p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{streakDays >= 7 ? "🔥" : "🌱"}</span>
                  <div>
                    <p className="font-display text-2xl font-bold text-brand-200">{streakDays} days</p>
                    <div className="flex gap-1 mt-2">
                      {Array.from({ length: 7 }, (_, i) => (
                        <div key={i} className={`h-1.5 w-6 rounded-full ${i < Math.min(streakDays, 7) ? "bg-brand-400" : "bg-brand-900"}`} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="glow-card rounded-2xl p-6">
                <p className="text-brand-600 text-xs font-mono uppercase tracking-widest mb-4">Badges</p>
                <div className="flex gap-3 flex-wrap">
                  {BADGES.map(b => (
                    <div
                      key={b.id}
                      title={`${b.name}: ${b.desc}`}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${
                        earnedBadges.includes(b)
                          ? "bg-brand-500/20 border border-brand-500/40"
                          : "bg-surface-600 border border-brand-900/50 opacity-30 grayscale"
                      }`}
                    >
                      {b.icon}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glow-card rounded-2xl p-6">
                <p className="text-brand-400 text-sm font-medium mb-4">Monthly Tokens Earned</p>
                {monthlyData.some(m => m.tokens > 0) ? (
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip
                        contentStyle={{ background: "#0f1e17", border: "1px solid #166534", borderRadius: 8, fontSize: 12 }}
                        labelStyle={{ color: "#86efac" }}
                      />
                      <Bar dataKey="tokens" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-40 flex items-center justify-center text-brand-700 text-sm font-mono">
                    No data yet · start shopping!
                  </div>
                )}
              </div>

              <div className="glow-card rounded-2xl p-6">
                <p className="text-brand-400 text-sm font-medium mb-4">Carbon Reduction (kg CO₂)</p>
                {monthlyData.some(m => m.carbon > 0) ? (
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip
                        contentStyle={{ background: "#0f1e17", border: "1px solid #166534", borderRadius: 8, fontSize: 12 }}
                        labelStyle={{ color: "#86efac" }}
                      />
                      <Line type="monotone" dataKey="carbon" stroke="#4ade80" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-40 flex items-center justify-center text-brand-700 text-sm font-mono">
                    No data yet
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "purchases" && (
          <div className="glow-card rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-brand-900/40">
              <h2 className="font-display font-bold text-brand-200">Purchase History</h2>
              <p className="text-brand-600 text-xs font-mono mt-1">{purchases.length} total purchases</p>
            </div>
            {purchases.length === 0 ? (
              <div className="p-12 text-center text-brand-700 font-mono text-sm">
                No purchases yet · Install the extension and start shopping!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-brand-900/40">
                      {["Product", "Price", "Eco Score", "Tokens", "Date"].map(h => (
                        <th key={h} className="text-left px-6 py-3 text-brand-600 text-xs font-mono uppercase tracking-widest">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.map(p => (
                      <tr key={p.id} className="border-b border-brand-900/20 hover:bg-brand-900/10 transition-colors">
                        <td className="px-6 py-4 text-brand-200 text-sm max-w-xs truncate">{p.productName}</td>
                        <td className="px-6 py-4 text-brand-400 text-sm font-mono">₹{p.price}</td>
                        <td className="px-6 py-4">
                          <span className={`gl-badge text-xs ${
                            p.sustainabilityScore >= 80 ? "bg-brand-500/20 text-brand-300 border border-brand-500/30" :
                            p.sustainabilityScore >= 60 ? "bg-brand-700/20 text-brand-500 border border-brand-700/30" :
                            "bg-surface-600 text-brand-700 border border-brand-900/30"
                          }`}>
                            {p.sustainabilityScore}/100
                          </span>
                        </td>
                        <td className="px-6 py-4 text-brand-400 font-mono text-sm">+{p.tokensEarned}</td>
                        <td className="px-6 py-4 text-brand-700 text-xs font-mono">
                          {new Date(p.purchaseDate).toLocaleDateString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "transactions" && (
          <div className="glow-card rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-brand-900/40">
              <h2 className="font-display font-bold text-brand-200">Transaction History</h2>
            </div>
            {transactions.length === 0 ? (
              <div className="p-12 text-center text-brand-700 font-mono text-sm">
                No transactions yet
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-brand-900/40">
                      {["Type", "Description", "Tokens", "Value", "Date"].map(h => (
                        <th key={h} className="text-left px-6 py-3 text-brand-600 text-xs font-mono uppercase tracking-widest">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(t => (
                      <tr key={t.id} className="border-b border-brand-900/20 hover:bg-brand-900/10 transition-colors">
                        <td className="px-6 py-4">
                          <span className={`gl-badge text-xs ${
                            t.type === "EARN" ? "bg-brand-500/20 text-brand-300 border border-brand-500/30" :
                            t.type === "BONUS" ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30" :
                            "bg-red-500/20 text-red-300 border border-red-500/30"
                          }`}>
                            {t.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-brand-300 text-sm">{t.description}</td>
                        <td className="px-6 py-4 text-brand-400 font-mono text-sm">
                          {t.type === "REDEEM" ? "-" : "+"}{t.tokens}
                        </td>
                        <td className="px-6 py-4 text-brand-400 font-mono text-sm">₹{t.moneyValue.toFixed(2)}</td>
                        <td className="px-6 py-4 text-brand-700 text-xs font-mono">
                          {new Date(t.timestamp).toLocaleDateString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
