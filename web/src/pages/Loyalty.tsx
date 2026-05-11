import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import Sidebar from '../components/Sidebar';

interface LoyaltyLedger {
  customerId: string;
  type: 'earn' | 'redeem';
  pts: number;
  reason: string;
  at: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  points: number;
  totalSpend: number;
  createdAt: string;
}

const GLASS = 'rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm';
const INPUT = 'w-full px-4 py-2.5 rounded-xl text-sm bg-white/7 border border-white/15 text-white placeholder:text-white/35 focus:border-amber-500/70 focus:ring-3 focus:ring-amber-500/15 outline-none transition';

const rp = (n: number) => 'Rp ' + (n || 0).toLocaleString('id-ID');

const tierColors: Record<string, { bg: string; text: string; emoji: string }> = {
  Bronze: { bg: 'rgba(217,119,6,.15)', text: '#fbbf24', emoji: '🥉' },
  Silver: { bg: 'rgba(148,163,184,.15)', text: '#cbd5e1', emoji: '🥈' },
  Gold: { bg: 'rgba(245,158,11,.15)', text: '#fcd34d', emoji: '🥇' },
  Platinum: { bg: 'rgba(139,92,246,.15)', text: '#c4b5fd', emoji: '💎' },
};

const tierThresholds = {
  Bronze: { min: 0, max: 999999 },
  Silver: { min: 1000000, max: 4999999 },
  Gold: { min: 5000000, max: 9999999 },
  Platinum: { min: 10000000, max: Infinity },
};

const nextTierTargets: Record<string, number | null> = {
  Bronze: 1000000,
  Silver: 5000000,
  Gold: 10000000,
  Platinum: null,
};

export default function Loyalty() {
  const { signOut } = useSupabaseAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [ledger, setLedger] = useState<LoyaltyLedger[]>([]);
  const [currentTab, setCurrentTab] = useState<'leaderboard' | 'ledger'>('leaderboard');
  const [searchLB, setSearchLB] = useState('');
  const [searchLedger, setSearchLedger] = useState('');
  const [showRedeem, setShowRedeem] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [searchRedeem, setSearchRedeem] = useState('');
  const [redeemPoints, setRedeemPoints] = useState('');
  const [redeemReason, setRedeemReason] = useState('');
  const [suggestions, setSuggestions] = useState<Customer[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const storedCustomers = localStorage.getItem('lunomi_customers');
    const storedLedger = localStorage.getItem('lunomi_loyalty_ledger');
    setCustomers(storedCustomers ? JSON.parse(storedCustomers) : []);
    setLedger(storedLedger ? JSON.parse(storedLedger) : []);
  }, []);

  const getStats = () => {
    const earned = ledger.filter(l => l.type === 'earn').reduce((s, l) => s + l.pts, 0);
    const redeemed = Math.abs(ledger.filter(l => l.type === 'redeem').reduce((s, l) => s + l.pts, 0));
    return {
      totalPoints: earned - redeemed,
      redeemed,
      members: customers.length,
    };
  };

  const filteredLeaderboard = () => {
    let filtered = customers;
    if (searchLB) {
      const q = searchLB.toLowerCase();
      filtered = filtered.filter(c => (c.name || '').toLowerCase().includes(q));
    }
    return filtered.sort((a, b) => (b.points || 0) - (a.points || 0));
  };

  const filteredLedger = () => {
    let filtered = ledger;
    if (searchLedger) {
      const q = searchLedger.toLowerCase();
      filtered = filtered.filter(l => {
        const c = customers.find(x => x.id === l.customerId);
        return c && (c.name || '').toLowerCase().includes(q);
      });
    }
    return filtered.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 100);
  };

  const searchRedeemCustomers = (query: string) => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    const q = query.toLowerCase();
    const matches = customers
      .filter(c => (c.name || '').toLowerCase().includes(q) || (c.phone || '').includes(q))
      .slice(0, 5);
    setSuggestions(matches);
  };

  const selectRedeemCustomer = (customer: Customer) => {
    setSelectedCustomerId(customer.id);
    setSearchRedeem(customer.name);
    setSuggestions([]);
  };

  const doRedeem = () => {
    if (!selectedCustomerId) {
      setError('Pilih customer terlebih dahulu.');
      return;
    }
    const pts = parseInt(redeemPoints);
    if (!pts || pts < 1) {
      setError('Jumlah poin tidak valid.');
      return;
    }

    const customer = customers.find(c => c.id === selectedCustomerId);
    if (!customer || (customer.points || 0) < pts) {
      setError('Poin tidak mencukupi.');
      return;
    }

    const newLedger = [
      ...ledger,
      {
        customerId: selectedCustomerId,
        type: 'redeem' as const,
        pts: -pts,
        reason: redeemReason || 'Redeem poin',
        at: new Date().toISOString(),
      },
    ];

    // Update customer points
    const updatedCustomers = customers.map(c =>
      c.id === selectedCustomerId
        ? { ...c, points: (c.points || 0) - pts }
        : c
    );

    localStorage.setItem('lunomi_customers', JSON.stringify(updatedCustomers));
    localStorage.setItem('lunomi_loyalty_ledger', JSON.stringify(newLedger));
    setCustomers(updatedCustomers);
    setLedger(newLedger);

    setShowRedeem(false);
    setSelectedCustomerId(null);
    setSearchRedeem('');
    setRedeemPoints('');
    setRedeemReason('');
  };

  const openRedeem = () => {
    setSelectedCustomerId(null);
    setSearchRedeem('');
    setRedeemPoints('');
    setRedeemReason('');
    setError('');
    setSuggestions([]);
    setShowRedeem(true);
  };

  const selectedCustomer = selectedCustomerId ? customers.find(c => c.id === selectedCustomerId) : null;
  const stats = getStats();
  const lbData = filteredLeaderboard();
  const ledgerData = filteredLedger();

  return (
    <div className="flex min-h-screen" style={{ background: '#020617', backgroundImage: 'radial-gradient(ellipse 70% 50% at 10% 0%,rgba(245,158,11,.2) 0%,transparent 60%),radial-gradient(ellipse 60% 45% at 90% 100%,rgba(139,92,246,.2) 0%,transparent 60%)' }}>
      <Sidebar onLogout={signOut} />
      <main className="flex-1 min-h-screen" style={{ marginLeft: '256px' }}>
        <header className="sticky top-0 z-40 px-8 py-4 flex items-center justify-between" style={{ background: 'rgba(2,6,23,.7)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
          <div>
            <h1 className="text-xl font-black text-white">Loyalty Program</h1>
            <p className="text-xs text-white/40">Kelola poin loyalitas & reward member</p>
          </div>
          <button onClick={openRedeem} className="px-4 py-2 rounded-xl text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
            🎁 Redeem Poin
          </button>
        </header>

        <div className="p-8 space-y-6">
          {/* Tier Info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { tier: 'Bronze', icon: '🥉', spend: '0 – Rp 999K', ratio: '1 poin / Rp 10K' },
              { tier: 'Silver', icon: '🥈', spend: 'Rp 1Jt – 4.9Jt', ratio: '1.5 poin / Rp 10K' },
              { tier: 'Gold', icon: '🥇', spend: 'Rp 5Jt – 9.9Jt', ratio: '2 poin / Rp 10K' },
              { tier: 'Platinum', icon: '💎', spend: 'Rp 10Jt+', ratio: '3 poin / Rp 10K' },
            ].map(t => (
              <div key={t.tier} className={`${GLASS} p-4`}>
                <div className="text-2xl mb-1">{t.icon}</div>
                <div className="font-bold" style={{ color: tierColors[t.tier].text }}>{t.tier}</div>
                <div className="text-xs mt-1 text-white/40">{t.spend}</div>
                <div className="text-xs mt-1" style={{ color: tierColors[t.tier].text }}>{t.ratio}</div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className={`${GLASS} p-4 text-center`}>
              <div className="text-xs text-white/40 mb-1">Total Poin Beredar</div>
              <div className="text-2xl font-black text-amber-400">{stats.totalPoints.toLocaleString()}</div>
            </div>
            <div className={`${GLASS} p-4 text-center`}>
              <div className="text-xs text-white/40 mb-1">Poin Diredeem</div>
              <div className="text-2xl font-black text-red-400">{stats.redeemed.toLocaleString()}</div>
            </div>
            <div className={`${GLASS} p-4 text-center`}>
              <div className="text-xs text-white/40 mb-1">Member Aktif</div>
              <div className="text-2xl font-black text-green-400">{stats.members}</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {(['leaderboard', 'ledger'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setCurrentTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all border ${
                  currentTab === tab
                    ? 'bg-amber-500/25 border-amber-500/60 text-white'
                    : 'border-white/10 text-white/40 hover:border-white/25'
                }`}
              >
                {tab === 'leaderboard' ? '🏆 Leaderboard' : '📋 Riwayat Poin'}
              </button>
            ))}
          </div>

          {/* Leaderboard */}
          {currentTab === 'leaderboard' && (
            <div className="space-y-4">
              <div className={GLASS + ' p-3'}>
                <input
                  type="text"
                  placeholder="🔍 Cari nama customer..."
                  value={searchLB}
                  onChange={(e) => setSearchLB(e.target.value)}
                  className={INPUT}
                />
              </div>
              <div className={GLASS + ' overflow-hidden'}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,.08)' }}>
                        <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/40">#</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/40">Customer</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/40 hidden sm:table-cell">Tier</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/40">Poin</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/40 hidden md:table-cell">Total Belanja</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/40">Progress Tier</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lbData.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-white/30">Belum ada data customer.</td>
                        </tr>
                      ) : (
                        lbData.map((c, i) => {
                          const spend = c.totalSpend || 0;
                          const nextTarget = nextTierTargets[c.tier];
                          const prevTarget = tierThresholds[c.tier]?.min || 0;
                          const pct = nextTarget ? Math.min(100, Math.round(((spend - prevTarget) / (nextTarget - prevTarget)) * 100)) : 100;
                          const medalColor = i === 0 ? '#fcd34d' : i === 1 ? '#cbd5e1' : i === 2 ? '#fbbf24' : 'rgba(255,255,255,.4)';

                          return (
                            <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }} className="hover:bg-white/5 transition">
                              <td className="px-4 py-3.5 font-bold text-sm" style={{ color: medalColor }}>
                                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '#' + (i + 1)}
                              </td>
                              <td className="px-4 py-3.5">
                                <div className="font-semibold text-white">{c.name}</div>
                                <div className="text-xs mt-0.5 text-white/35">{c.phone}</div>
                              </td>
                              <td className="px-4 py-3.5 hidden sm:table-cell">
                                <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: tierColors[c.tier].bg, color: tierColors[c.tier].text }}>
                                  {tierColors[c.tier].emoji} {c.tier}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 text-right font-bold text-amber-400">{(c.points || 0).toLocaleString()}</td>
                              <td className="px-4 py-3.5 text-right text-white hidden md:table-cell">{rp(spend)}</td>
                              <td className="px-4 py-3.5">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 h-1.5 rounded-full bg-white/8">
                                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: tierColors[c.tier].text }} />
                                  </div>
                                  <span className="text-xs text-white/40">{pct}%</span>
                                </div>
                                {nextTarget ? (
                                  <div className="text-xs mt-0.5 text-white/25">next: {rp(nextTarget)}</div>
                                ) : (
                                  <div className="text-xs mt-0.5 text-purple-400">Max tier ✓</div>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Ledger */}
          {currentTab === 'ledger' && (
            <div className="space-y-4">
              <div className={GLASS + ' p-3'}>
                <input
                  type="text"
                  placeholder="🔍 Cari nama customer..."
                  value={searchLedger}
                  onChange={(e) => setSearchLedger(e.target.value)}
                  className={INPUT}
                />
              </div>
              <div className={GLASS + ' overflow-hidden'}>
                {ledgerData.length === 0 ? (
                  <div className="py-12 text-center text-white/30">Belum ada riwayat poin.</div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {ledgerData.map((l, i) => {
                      const c = customers.find(x => x.id === l.customerId);
                      return (
                        <div key={i} className="px-5 py-3.5 flex justify-between items-center hover:bg-white/3 transition">
                          <div>
                            <div className="font-semibold text-white text-sm">{c?.name || 'Unknown'}</div>
                            <div className="text-xs mt-0.5 text-white/40">{l.reason || '—'} · {new Date(l.at).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                          </div>
                          <div className={`font-bold text-base ${l.type === 'earn' ? 'text-green-400' : 'text-red-400'}`}>
                            {l.type === 'earn' ? '+' : ''}
                            {l.pts} poin
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Redeem Modal */}
      {showRedeem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(4px)' }}>
          <div className={GLASS + ' rounded-2xl p-6 w-full max-w-md shadow-2xl'}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-white">🎁 Redeem Poin</h2>
              <button onClick={() => setShowRedeem(false)} className="text-white/40 hover:text-white text-xl">×</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-white/50 mb-1 block">Cari Customer</label>
                <input
                  type="text"
                  value={searchRedeem}
                  onChange={(e) => {
                    setSearchRedeem(e.target.value);
                    searchRedeemCustomers(e.target.value);
                  }}
                  className={INPUT}
                  placeholder="Nama atau nomor HP"
                />
                {suggestions.length > 0 && (
                  <div className="mt-1 rounded-xl overflow-hidden" style={{ background: 'rgba(15,23,42,.95)', border: '1px solid rgba(255,255,255,.12)' }}>
                    {suggestions.map(c => (
                      <div
                        key={c.id}
                        onClick={() => selectRedeemCustomer(c)}
                        className="px-4 py-3 cursor-pointer text-sm hover:bg-white/5 transition flex justify-between items-center"
                        style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}
                      >
                        <span className="font-semibold text-white">{c.name}</span>
                        <span className="text-xs text-amber-400">{(c.points || 0).toLocaleString()} poin</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedCustomer && (
                <div className={GLASS + ' p-4'}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white" style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
                      {selectedCustomer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">{selectedCustomer.name}</div>
                      <div className="text-xs text-amber-400">{(selectedCustomer.points || 0).toLocaleString()} poin tersedia</div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-white/50 mb-1 block">Jumlah Poin Diredeem</label>
                <input
                  type="number"
                  min="1"
                  value={redeemPoints}
                  onChange={(e) => setRedeemPoints(e.target.value)}
                  className={INPUT}
                  placeholder="Contoh: 100"
                />
                <div className="text-xs mt-1 text-white/35">100 poin = diskon Rp 10.000</div>
              </div>

              <div>
                <label className="text-xs font-semibold text-white/50 mb-1 block">Keterangan</label>
                <input
                  type="text"
                  value={redeemReason}
                  onChange={(e) => setRedeemReason(e.target.value)}
                  className={INPUT}
                  placeholder="Diskon ulang tahun, promo, dll."
                />
              </div>
            </div>

            {error && (
              <div className="mt-3 px-3 py-2 rounded-xl text-xs" style={{ background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.3)', color: '#fca5a5' }}>
                {error}
              </div>
            )}

            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowRedeem(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.7)' }}>
                Batal
              </button>
              <button onClick={doRedeem} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
                Redeem
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
