import { useState, useEffect, useMemo } from 'react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import Sidebar from '../components/Sidebar';

// ─── Types ────────────────────────────────────────────────────────────────────

type ActiveTab = 'pl' | 'cashflow' | 'summary';
type Periode = 'month' | 'lastmonth' | 'quarter' | 'year' | 'all';

interface Transaction {
  id: string;
  createdAt: string;
  total: number;
  discount?: number;
  pointsDiscount?: number;
  payMethod?: string;
  method?: string;
}

interface ExpenseEntry {
  id: string;
  date: string;
  cat: string;
  amount: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const LS_KEY = 'lunomi_financial';
const TRX_KEY = 'lunomi_transactions';
const EXP_KEY = 'lunomi_expenses';

const GLASS = 'rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm';

const PERIODE_LABELS: Record<Periode, string> = {
  month:     'Bulan Ini',
  lastmonth: 'Bulan Lalu',
  quarter:   '3 Bulan Terakhir',
  year:      'Tahun Ini',
  all:       'Semua Periode',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const rp = (n: number) => 'Rp ' + Math.abs(Math.round(n)).toLocaleString('id-ID');

function getDateRange(periode: Periode): { start: Date | null; end: Date } {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  if (periode === 'month') {
    return { start: new Date(now.getFullYear(), now.getMonth(), 1), end };
  }
  if (periode === 'lastmonth') {
    return {
      start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      end:   new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999),
    };
  }
  if (periode === 'quarter') {
    return { start: new Date(Date.now() - 90 * 86_400_000), end };
  }
  if (periode === 'year') {
    return { start: new Date(now.getFullYear(), 0, 1), end };
  }
  return { start: null, end };
}

// Sub-components ───────────────────────────────────────────────────────────────

function StmtRow({ label, value, cls }: { label: string; value: string; cls?: string }) {
  return (
    <div className="flex justify-between py-2.5">
      <span className="text-sm" style={{ color: 'rgba(255,255,255,.5)' }}>{label}</span>
      <span className={`text-sm font-semibold ${cls ?? 'text-white'}`}>{value}</span>
    </div>
  );
}

function StmtSep() {
  return <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', margin: '6px 0' }} />;
}

function StmtTotal({ label, value, cls }: { label: string; value: string; cls?: string }) {
  return (
    <div
      className="flex justify-between py-3 px-4 my-2 rounded-xl"
      style={{ background: 'rgba(255,255,255,.04)' }}
    >
      <span className="font-bold text-white">{label}</span>
      <span className={`font-bold ${cls ?? 'text-white'}`}>{value}</span>
    </div>
  );
}

function SectionTitle({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <div
      className="text-xs font-bold uppercase tracking-widest mb-3 mt-4"
      style={{ color }}
    >
      {children}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FinancialStatements() {
  const { signOut } = useSupabaseAuth();

  const [activeTab, setActiveTab] = useState<ActiveTab>('pl');
  const [periode,   setPeriode]   = useState<Periode>('month');

  // Persist last-used tab/periode
  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) {
      const { tab, periode: p } = JSON.parse(saved) as { tab?: ActiveTab; periode?: Periode };
      if (tab)  setActiveTab(tab);
      if (p)    setPeriode(p);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify({ tab: activeTab, periode }));
  }, [activeTab, periode]);

  // ─── Data ─────────────────────────────────────────────────────────────────

  const { transactions, expenses } = useMemo(() => {
    const rawTrx: Transaction[] = JSON.parse(localStorage.getItem(TRX_KEY) || '[]');
    const rawExp: ExpenseEntry[] = JSON.parse(localStorage.getItem(EXP_KEY) || '[]');
    const { start, end } = getDateRange(periode);

    const transactions = start
      ? rawTrx.filter(t => { const d = new Date(t.createdAt); return d >= start && d <= end; })
      : rawTrx;

    const expenses = start
      ? rawExp.filter(e => { const d = new Date(e.date); return d >= start && d <= end; })
      : rawExp;

    return { transactions, expenses };
  }, [periode]);

  const financials = useMemo(() => {
    const grossRevenue = transactions.reduce((s, t) => s + (t.total || 0), 0);
    const discount     = transactions.reduce((s, t) => s + (t.discount || t.pointsDiscount || 0), 0);
    const netRevenue   = grossRevenue;

    // Payment method breakdown
    const payMap: Record<string, number> = {};
    transactions.forEach(t => {
      const m = t.payMethod || t.method || 'Lainnya';
      payMap[m] = (payMap[m] || 0) + (t.total || 0);
    });

    const cashRevenue = Object.entries(payMap)
      .filter(([k]) => k.toLowerCase().includes('tunai') || k.toLowerCase().includes('cash'))
      .reduce((s, [, v]) => s + v, 0);
    const nonCashRevenue = netRevenue - cashRevenue;

    const totalExpense = expenses.reduce((s, e) => s + (e.amount || 0), 0);
    const profit  = netRevenue - totalExpense;
    const margin  = netRevenue ? Math.round((profit / netRevenue) * 100) : 0;

    // Expenses by category
    const catMap: Record<string, number> = {};
    expenses.forEach(e => { catMap[e.cat] = (catMap[e.cat] || 0) + e.amount; });

    return { grossRevenue, discount, netRevenue, cashRevenue, nonCashRevenue, totalExpense, profit, margin, catMap, payMap };
  }, [transactions, expenses]);

  const { grossRevenue, discount, netRevenue, cashRevenue, nonCashRevenue, totalExpense, profit, margin, catMap, payMap } = financials;

  const profitPositive = profit >= 0;
  const profitBoxStyle = {
    background: profitPositive ? 'rgba(16,185,129,.08)' : 'rgba(239,68,68,.08)',
    border:     `1px solid ${profitPositive ? 'rgba(16,185,129,.2)' : 'rgba(239,68,68,.2)'}`,
    borderRadius: '1rem',
    padding: '1.25rem',
    marginTop: '1.5rem',
  };

  const sortedCats  = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
  const sortedPays  = Object.entries(payMap).sort((a, b) => b[1] - a[1]);
  const maxCat = sortedCats[0]?.[1] || 1;
  const maxPay = sortedPays[0]?.[1] || 1;

  // Periode label string
  const { start, end } = getDateRange(periode);
  const fmtDate = (d: Date) => d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  const periodeDisplay = PERIODE_LABELS[periode] +
    (start ? ` (${fmtDate(start)} — ${fmtDate(end)})` : '');

  const TABS: Array<{ key: ActiveTab; label: string }> = [
    { key: 'pl',       label: '📈 Laba Rugi' },
    { key: 'cashflow', label: '💧 Arus Kas' },
    { key: 'summary',  label: '📋 Ringkasan' },
  ];

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      className="flex min-h-screen"
      style={{
        background: '#020617',
        backgroundImage:
          'radial-gradient(ellipse 70% 50% at 10% 0%,rgba(99,102,241,.25) 0%,transparent 60%),' +
          'radial-gradient(ellipse 60% 45% at 90% 100%,rgba(16,185,129,.12) 0%,transparent 60%)',
      }}
    >
      <Sidebar onLogout={signOut} />

      <main className="flex-1 min-h-screen" style={{ marginLeft: '256px' }}>
        {/* Sticky header */}
        <header
          className="sticky top-0 z-40 px-8 py-4 flex items-center justify-between"
          style={{
            background: 'rgba(2,6,23,.7)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,.08)',
          }}
        >
          <div>
            <h1 className="text-xl font-black text-white">Laporan Keuangan Formal</h1>
            <p className="text-xs text-white/40">Laba rugi, arus kas, dan ringkasan keuangan</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={periode}
              onChange={e => setPeriode(e.target.value as Periode)}
              className="text-xs px-3 py-2 rounded-xl"
              style={{
                background: 'rgba(255,255,255,.07)',
                border: '1px solid rgba(255,255,255,.12)',
                color: 'rgba(255,255,255,.8)',
                outline: 'none',
              }}
            >
              <option value="month">Bulan Ini</option>
              <option value="lastmonth">Bulan Lalu</option>
              <option value="quarter">3 Bulan</option>
              <option value="year">Tahun Ini</option>
              <option value="all">Semua</option>
            </select>
            <button
              onClick={() => window.print()}
              className="px-3 py-2 rounded-xl text-xs font-semibold"
              style={{
                background: 'rgba(255,255,255,.07)',
                border: '1px solid rgba(255,255,255,.12)',
                color: 'rgba(255,255,255,.6)',
              }}
            >
              🖨️ Print
            </button>
          </div>
        </header>

        <div className="p-8 max-w-4xl space-y-6">
          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border whitespace-nowrap transition"
                style={
                  activeTab === t.key
                    ? { background: 'rgba(99,102,241,.2)', color: 'white', borderColor: 'rgba(99,102,241,.4)' }
                    : { background: 'transparent', color: 'rgba(255,255,255,.5)', borderColor: 'transparent' }
                }
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Periode label */}
          <div className="text-xs" style={{ color: 'rgba(255,255,255,.35)' }}>
            {periodeDisplay}
          </div>

          {/* ── TAB: Laba Rugi ──────────────────────────────────────── */}
          {activeTab === 'pl' && (
            <div className={`${GLASS} p-6`}>
              <div
                className="flex justify-between items-center mb-6"
                style={{ borderBottom: '1px solid rgba(255,255,255,.08)', paddingBottom: '1rem' }}
              >
                <div>
                  <div className="font-extrabold text-white text-lg">Laporan Laba Rugi</div>
                  <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,.4)' }}>
                    {PERIODE_LABELS[periode]}
                  </div>
                </div>
              </div>

              {/* Pendapatan */}
              <SectionTitle color="rgba(99,102,241,.8)">PENDAPATAN</SectionTitle>
              <StmtRow label="Penjualan Bruto" value={rp(grossRevenue)} />
              {discount > 0 && (
                <StmtRow label="Diskon / Redeem" value={`-${rp(discount)}`} cls="text-red-400" />
              )}
              <StmtSep />
              <StmtTotal label="Pendapatan Bersih" value={rp(netRevenue)} />

              {/* Beban */}
              <SectionTitle color="rgba(239,68,68,.7)">BEBAN OPERASIONAL</SectionTitle>
              {sortedCats.length === 0 ? (
                <StmtRow label="Belum ada catatan beban" value="Rp 0" cls="text-white/30" />
              ) : sortedCats.map(([cat, amt]) => (
                <StmtRow key={cat} label={cat} value={`(${rp(amt)})`} cls="text-red-400" />
              ))}
              <StmtSep />
              <StmtTotal label="Total Beban" value={rp(totalExpense)} cls="text-red-400" />

              {/* Profit box */}
              <div style={profitBoxStyle}>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm font-bold text-white">
                      {profitPositive ? 'Laba Bersih' : 'Rugi Bersih'}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,.4)' }}>
                      Profit Margin: {margin}%
                    </div>
                  </div>
                  <div
                    className="text-2xl font-extrabold"
                    style={{ color: profitPositive ? '#4ade80' : '#f87171' }}
                  >
                    {profit < 0 ? '-' : ''}{rp(profit)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: Arus Kas ────────────────────────────────────────── */}
          {activeTab === 'cashflow' && (
            <div className={`${GLASS} p-6`}>
              <div
                className="font-extrabold text-white text-lg mb-6"
                style={{ borderBottom: '1px solid rgba(255,255,255,.08)', paddingBottom: '1rem' }}
              >
                Laporan Arus Kas
              </div>

              {/* Arus masuk */}
              <SectionTitle color="rgba(99,102,241,.8)">ARUS MASUK (KAS OPERASIONAL)</SectionTitle>
              <StmtRow label="Penerimaan Tunai"     value={rp(cashRevenue)}    />
              <StmtRow label="Penerimaan Non-Tunai" value={rp(nonCashRevenue)} />
              <StmtTotal label="Total Arus Masuk" value={rp(netRevenue)} cls="text-emerald-400" />

              {/* Arus keluar */}
              <SectionTitle color="rgba(239,68,68,.7)">ARUS KELUAR (BEBAN)</SectionTitle>
              {sortedCats.length === 0 ? (
                <StmtRow label="Belum ada pengeluaran" value="Rp 0" cls="text-white/30" />
              ) : sortedCats.map(([cat, amt]) => (
                <StmtRow key={cat} label={cat} value={`(${rp(amt)})`} cls="text-red-400" />
              ))}
              <StmtTotal label="Total Arus Keluar" value={rp(totalExpense)} cls="text-red-400" />

              {/* Net box */}
              {(() => {
                const cfNet = netRevenue - totalExpense;
                const pos   = cfNet >= 0;
                return (
                  <div
                    className="mt-4 p-5 rounded-2xl flex justify-between items-center"
                    style={{
                      background: pos ? 'rgba(16,185,129,.08)' : 'rgba(239,68,68,.08)',
                      border:     `1px solid ${pos ? 'rgba(16,185,129,.2)' : 'rgba(239,68,68,.2)'}`,
                    }}
                  >
                    <div className="text-sm font-bold text-white">Arus Kas Bersih</div>
                    <div
                      className="text-2xl font-extrabold"
                      style={{ color: pos ? '#4ade80' : '#f87171' }}
                    >
                      {cfNet < 0 ? '-' : ''}{rp(cfNet)}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ── TAB: Ringkasan ───────────────────────────────────────── */}
          {activeTab === 'summary' && (
            <div className="space-y-6">
              {/* KPI cards */}
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { label: 'Total Pendapatan', value: rp(netRevenue),   color: 'text-white' },
                  { label: 'Total Pengeluaran', value: rp(totalExpense), color: 'text-red-400' },
                  {
                    label: 'Laba Bersih',
                    value: (profit < 0 ? '-' : '') + rp(profit),
                    color: profitPositive ? 'text-emerald-400' : 'text-red-400',
                  },
                  {
                    label: 'Profit Margin',
                    value: margin + '%',
                    color: margin >= 0 ? 'text-emerald-400' : 'text-red-400',
                  },
                ].map(k => (
                  <div key={k.label} className={`${GLASS} p-5`}>
                    <div className="text-xs mb-1" style={{ color: 'rgba(255,255,255,.4)' }}>{k.label}</div>
                    <div className={`text-xl font-extrabold ${k.color}`}>{k.value}</div>
                  </div>
                ))}
              </div>

              {/* Expense by category */}
              <div className={`${GLASS} p-5`}>
                <div className="font-bold text-white mb-4">Beban per Kategori</div>
                {sortedCats.length === 0 ? (
                  <div className="text-center py-4 text-sm" style={{ color: 'rgba(255,255,255,.3)' }}>
                    Belum ada data pengeluaran
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sortedCats.map(([cat, amt]) => (
                      <div key={cat} className="flex items-center gap-3 text-sm">
                        <span className="w-28 shrink-0" style={{ color: 'rgba(255,255,255,.6)' }}>{cat}</span>
                        <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,.08)' }}>
                          <div
                            className="h-1.5 rounded-full"
                            style={{
                              width: `${Math.round((amt / maxCat) * 100)}%`,
                              background: 'linear-gradient(90deg,#ef4444,#dc2626)',
                            }}
                          />
                        </div>
                        <span className="font-bold text-red-400 w-28 text-right shrink-0">{rp(amt)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Payment method distribution */}
              <div className={`${GLASS} p-5`}>
                <div className="font-bold text-white mb-4">Distribusi Metode Pembayaran</div>
                {sortedPays.length === 0 ? (
                  <div className="text-center py-4 text-sm" style={{ color: 'rgba(255,255,255,.3)' }}>
                    Belum ada data transaksi
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sortedPays.map(([method, amt]) => (
                      <div key={method} className="flex items-center gap-3 text-sm">
                        <span className="w-28 shrink-0" style={{ color: 'rgba(255,255,255,.6)' }}>{method}</span>
                        <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,.08)' }}>
                          <div
                            className="h-1.5 rounded-full"
                            style={{
                              width: `${Math.round((amt / maxPay) * 100)}%`,
                              background: 'linear-gradient(90deg,#6366f1,#4f46e5)',
                            }}
                          />
                        </div>
                        <span className="font-bold text-white w-28 text-right shrink-0">{rp(amt)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
