import { useState, useEffect, useCallback } from 'react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import Sidebar from '../components/Sidebar';

const GLASS = 'rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm';

type Period = 'today' | 'week' | 'month' | 'year' | 'all';
type Tab = 'ringkasan' | 'transaksi' | 'pengeluaran' | 'laba';

interface LunomiTransaction {
  id: string;
  total: number;
  createdAt: string;
  items?: { name: string; qty: number; price: number }[];
  payMethod?: string;
  method?: string;
}

interface Expense {
  id: string;
  date: string;
  desc: string;
  cat: string;
  amount: number;
  note?: string;
}

function rp(n: number): string {
  return 'Rp ' + Number(n || 0).toLocaleString('id-ID');
}

function getTransactions(): LunomiTransaction[] {
  try { return JSON.parse(localStorage.getItem('lunomi_transactions') || '[]'); } catch { return []; }
}
function getExpenses(): Expense[] {
  try { return JSON.parse(localStorage.getItem('lunomi_expenses') || '[]'); } catch { return []; }
}

function getPeriodCutoff(period: Period): Date | null {
  const now = new Date();
  if (period === 'today') return new Date(now.toISOString().slice(0, 10));
  if (period === 'week')  return new Date(now.getTime() - 7 * 86400000);
  if (period === 'month') return new Date(now.getTime() - 30 * 86400000);
  if (period === 'year')  return new Date(now.getFullYear(), 0, 1);
  return null;
}

const PERIOD_LABELS: Record<Period, string> = {
  today: 'Hari Ini',
  week: '7 Hari',
  month: '30 Hari',
  year: 'Tahun Ini',
  all: 'Semua',
};

const TABS: { id: Tab; label: string }[] = [
  { id: 'ringkasan',  label: 'Ringkasan' },
  { id: 'transaksi',  label: 'Transaksi' },
  { id: 'pengeluaran', label: 'Pengeluaran' },
  { id: 'laba',       label: 'Laba Rugi' },
];

export default function Keuangan() {
  const { signOut } = useSupabaseAuth();
  const [period, setPeriod] = useState<Period>('month');
  const [activeTab, setActiveTab] = useState<Tab>('ringkasan');
  const [trxs, setTrxs] = useState<LunomiTransaction[]>([]);
  const [exps, setExps] = useState<Expense[]>([]);

  const refreshData = useCallback((p: Period) => {
    const cutoff = getPeriodCutoff(p);
    const allTrx = getTransactions();
    const allExp = getExpenses();
    setTrxs(cutoff ? allTrx.filter(t => new Date(t.createdAt) >= cutoff) : allTrx);
    setExps(cutoff ? allExp.filter(e => new Date(e.date) >= cutoff) : allExp);
  }, []);

  useEffect(() => { refreshData(period); }, [period, refreshData]);

  const revenue = trxs.reduce((s, t) => s + (t.total || 0), 0);
  const totalExp = exps.reduce((s, e) => s + (e.amount || 0), 0);
  const profit = revenue - totalExp;
  const margin = revenue ? Math.round((profit / revenue) * 100) : 0;
  const avg = trxs.length ? Math.round(revenue / trxs.length) : 0;

  const payMap: Record<string, number> = {};
  trxs.forEach(t => { const m = t.payMethod || t.method || 'Lainnya'; payMap[m] = (payMap[m] || 0) + (t.total || 0); });
  const maxPay = Math.max(...Object.values(payMap), 1);
  const topPayEntry = Object.entries(payMap).sort((a, b) => b[1] - a[1])[0];

  const prodMap: Record<string, { qty: number; rev: number }> = {};
  trxs.forEach(t => (t.items || []).forEach(it => {
    if (!prodMap[it.name]) prodMap[it.name] = { qty: 0, rev: 0 };
    prodMap[it.name].qty += (it.qty || 1);
    prodMap[it.name].rev += (it.price || 0) * (it.qty || 1);
  }));
  const top5 = Object.entries(prodMap).sort((a, b) => b[1].qty - a[1].qty).slice(0, 5);

  const catMap: Record<string, number> = {};
  exps.forEach(e => { catMap[e.cat] = (catMap[e.cat] || 0) + (e.amount || 0); });

  const sortedTrx = [...trxs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 100);
  const sortedExp = [...exps].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="flex min-h-screen" style={{ background: '#020617', backgroundImage: 'radial-gradient(ellipse 70% 50% at 10% 0%,rgba(99,102,241,.25) 0%,transparent 60%),radial-gradient(ellipse 60% 45% at 90% 100%,rgba(16,185,129,.12) 0%,transparent 60%)' }}>
      <Sidebar onLogout={signOut} />
      <main className="flex-1 min-h-screen" style={{ marginLeft: '256px' }}>
        {/* Header */}
        <header className="sticky top-0 z-40 px-8 py-4 flex items-center justify-between" style={{ background: 'rgba(2,6,23,.7)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
          <div>
            <h1 className="text-xl font-black text-white">Laporan Keuangan</h1>
            <p className="text-xs text-white/40">Ringkasan pendapatan, pengeluaran, dan laba rugi</p>
          </div>
          <select
            value={period}
            onChange={e => setPeriod(e.target.value as Period)}
            className="px-3 py-2 rounded-xl text-xs bg-white/7 border border-white/15 text-white outline-none focus:border-indigo-500/70 transition cursor-pointer"
          >
            {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
              <option key={p} value={p}>{PERIOD_LABELS[p]}</option>
            ))}
          </select>
        </header>

        <div className="p-8 space-y-6">
          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition ${
                  activeTab === tab.id
                    ? 'bg-indigo-500/20 text-white border border-indigo-500/40'
                    : 'text-white/50 hover:text-white/80 border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB: Ringkasan */}
          {activeTab === 'ringkasan' && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`${GLASS} p-4`} style={{ borderLeft: '3px solid #3b82f6' }}>
                  <div className="text-xs mb-1 text-white/45">Total Pendapatan</div>
                  <div className="text-xl font-extrabold text-white">{rp(revenue)}</div>
                  <div className="text-xs mt-1" style={{ color: 'rgba(59,130,246,.8)' }}>{trxs.length} transaksi</div>
                </div>
                <div className={`${GLASS} p-4`} style={{ borderLeft: '3px solid #ef4444' }}>
                  <div className="text-xs mb-1 text-white/45">Total Pengeluaran</div>
                  <div className="text-xl font-extrabold text-white">{rp(totalExp)}</div>
                  <div className="text-xs mt-1" style={{ color: 'rgba(239,68,68,.8)' }}>{exps.length} catatan</div>
                </div>
                <div className={`${GLASS} p-4`} style={{ borderLeft: '3px solid #22c55e' }}>
                  <div className="text-xs mb-1 text-white/45">Laba Bersih</div>
                  <div className="text-xl font-extrabold" style={{ color: profit >= 0 ? '#4ade80' : '#f87171' }}>
                    {profit < 0 ? '-' : ''}{rp(Math.abs(profit))}
                  </div>
                  <div className="text-xs mt-1" style={{ color: 'rgba(34,197,94,.8)' }}>Margin {margin}%</div>
                </div>
                <div className={`${GLASS} p-4`} style={{ borderLeft: '3px solid #f59e0b' }}>
                  <div className="text-xs mb-1 text-white/45">Avg / Transaksi</div>
                  <div className="text-xl font-extrabold text-white">{rp(avg)}</div>
                  <div className="text-xs mt-1" style={{ color: 'rgba(245,158,11,.8)' }}>{topPayEntry ? topPayEntry[0] : '—'}</div>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-4">
                <div className={`${GLASS} p-5`}>
                  <h3 className="font-bold text-sm mb-4 text-white">Metode Pembayaran</h3>
                  {Object.keys(payMap).length === 0 ? (
                    <div className="text-sm text-center py-4 text-white/30">Belum ada data</div>
                  ) : (
                    <div className="space-y-3">
                      {Object.entries(payMap).sort((a, b) => b[1] - a[1]).map(([m, v]) => (
                        <div key={m} className="flex items-center gap-3">
                          <div className="text-sm w-28 text-white/60 truncate">{m}</div>
                          <div className="flex-1 h-2 rounded-full" style={{ background: 'rgba(255,255,255,.1)' }}>
                            <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${Math.round((v / maxPay) * 100)}%` }} />
                          </div>
                          <div className="text-sm font-bold w-24 text-right text-white">{rp(v)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className={`${GLASS} p-5`}>
                  <h3 className="font-bold text-sm mb-4 text-white">Top 5 Produk</h3>
                  {top5.length === 0 ? (
                    <div className="text-sm text-center py-4 text-white/30">Belum ada data</div>
                  ) : (
                    <div className="space-y-2.5">
                      {top5.map(([name, d], i) => (
                        <div key={name} className="flex items-center gap-3">
                          <span className="w-5 text-xs font-bold text-white/30">{i + 1}</span>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-white truncate">{name}</div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-sm font-bold text-white">{rp(d.rev)}</div>
                            <div className="text-xs text-white/35">{d.qty} unit</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* TAB: Transaksi */}
          {activeTab === 'transaksi' && (
            <div className={`${GLASS} overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,.1)' }}>
                      {['Waktu','ID','Metode','Item','Jumlah'].map((h, i) => (
                        <th key={i} className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white/40 ${i === 4 ? 'text-right' : 'text-left'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedTrx.length === 0 ? (
                      <tr><td colSpan={5} className="text-center px-5 py-10 text-sm text-white/30">Belum ada transaksi</td></tr>
                    ) : (
                      sortedTrx.map(t => {
                        const dt = new Date(t.createdAt).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
                        const itemCount = (t.items || []).reduce((s, i) => s + (i.qty || 1), 0);
                        return (
                          <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                            <td className="px-5 py-3 text-white/50">{dt}</td>
                            <td className="px-4 py-3 font-mono text-xs text-white">{t.id || '—'}</td>
                            <td className="px-4 py-3 text-white/70">{t.payMethod || t.method || '—'}</td>
                            <td className="px-4 py-3 text-white/50">{itemCount} item</td>
                            <td className="px-4 py-3 text-right font-bold text-white">{rp(t.total)}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: Pengeluaran */}
          {activeTab === 'pengeluaran' && (
            <div className={`${GLASS} overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,.1)' }}>
                      {['Tanggal','Keterangan','Kategori','Jumlah'].map((h, i) => (
                        <th key={i} className={`px-5 py-3 text-xs font-semibold uppercase text-white/40 ${i === 3 ? 'text-right' : 'text-left'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedExp.length === 0 ? (
                      <tr><td colSpan={4} className="text-center px-5 py-10 text-sm text-white/30">Belum ada pengeluaran</td></tr>
                    ) : (
                      sortedExp.map(e => (
                        <tr key={e.id} style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                          <td className="px-5 py-3 text-white/50">{e.date}</td>
                          <td className="px-4 py-3 font-semibold text-white">{e.desc}</td>
                          <td className="px-4 py-3">
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: 'rgba(239,68,68,.1)', color: '#f87171' }}>{e.cat}</span>
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-red-400">-{rp(e.amount)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: Laba Rugi */}
          {activeTab === 'laba' && (
            <div className={`${GLASS} p-6`}>
              <h3 className="font-bold text-white mb-5">Laporan Laba Rugi</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 font-semibold" style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                  <span className="text-white">Pendapatan Penjualan</span>
                  <span className="text-white">{rp(revenue)}</span>
                </div>
                {Object.entries(catMap).length === 0 ? (
                  <div className="flex justify-between py-2" style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                    <span className="text-white/40">Belum ada pengeluaran tercatat</span>
                    <span className="text-white">Rp 0</span>
                  </div>
                ) : (
                  Object.entries(catMap).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => (
                    <div key={cat} className="flex justify-between py-2" style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                      <span style={{ color: 'rgba(239,68,68,.8)' }}>{cat}</span>
                      <span className="text-red-400">- {rp(amt)}</span>
                    </div>
                  ))
                )}
                <div className="flex justify-between py-3 mt-2 rounded-xl px-3" style={{ background: profit >= 0 ? 'rgba(34,197,94,.1)' : 'rgba(239,68,68,.1)', border: `1px solid ${profit >= 0 ? 'rgba(34,197,94,.2)' : 'rgba(239,68,68,.2)'}` }}>
                  <span className="font-extrabold text-white">{profit >= 0 ? 'LABA BERSIH' : 'RUGI BERSIH'}</span>
                  <span className="font-extrabold" style={{ color: profit >= 0 ? '#4ade80' : '#f87171' }}>
                    {profit < 0 ? '- ' : ''}{rp(Math.abs(profit))}
                    <span className="text-xs font-semibold ml-1">({margin}%)</span>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
