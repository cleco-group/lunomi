import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import Sidebar from '../components/Sidebar';

interface DenomSnapshot {
  [denom: string]: number;
}

interface ShiftRecord {
  id: string;
  closedAt: string;
  staff: string;
  outlet: string;
  openingFloat: number;
  totalSales: number;
  cashSales: number;
  nonCashSales: number;
  trxCount: number;
  expectedCash: number;
  physicalCash: number;
  variance: number;
  denomSnapshot: DenomSnapshot;
  notes: string;
}

interface Transaction {
  id: string;
  total?: number;
  payMethod?: string;
  method?: string;
  customerId?: string;
  createdAt?: string;
}

const GLASS = 'rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm';
const INPUT = 'w-full px-3 py-2.5 rounded-xl text-sm bg-white/7 border border-white/15 text-white placeholder:text-white/35 focus:border-indigo-500/70 focus:ring-3 focus:ring-indigo-500/15 outline-none transition';

const DENOMS = [100000, 50000, 20000, 10000, 5000, 2000, 1000, 500, 200, 100];

function rp(n: number | undefined) {
  return 'Rp ' + Number(n || 0).toLocaleString('id-ID');
}

function getTransactions(): Transaction[] {
  try { return JSON.parse(localStorage.getItem('lunomi_transactions') || '[]'); } catch { return []; }
}

function getShifts(): ShiftRecord[] {
  try { return JSON.parse(localStorage.getItem('lunomi_shifts') || '[]'); } catch { return []; }
}

function saveShifts(arr: ShiftRecord[]) {
  localStorage.setItem('lunomi_shifts', JSON.stringify(arr));
}

export default function Shift() {
  const { signOut } = useSupabaseAuth();
  const [activeTab, setActiveTab] = useState<'close' | 'history'>('close');
  const [denomCounts, setDenomCounts] = useState<Record<number, number>>(() =>
    Object.fromEntries(DENOMS.map(d => [d, 0]))
  );
  const [openingFloat, setOpeningFloat] = useState(500000);
  const [shiftNotes, setShiftNotes] = useState('');
  const [staffName, setStaffName] = useState('');
  const [shifts, setShifts] = useState<ShiftRecord[]>([]);
  const [toast, setToast] = useState('');
  const [toastErr, setToastErr] = useState(false);

  // KPI state
  const today = new Date().toISOString().slice(0, 10);
  const todayTrxs = getTransactions().filter(t => t.createdAt && t.createdAt.slice(0, 10) === today);
  let kpiTotal = 0, kpiCash = 0, kpiNonCash = 0;
  todayTrxs.forEach(t => {
    kpiTotal += (t.total || 0);
    const m = (t.payMethod || t.method || '').toLowerCase();
    if (m === 'tunai' || m === 'cash') kpiCash += (t.total || 0);
    else kpiNonCash += (t.total || 0);
  });
  const cashSysTotal = kpiCash;
  const uniqCust = new Set(todayTrxs.filter(t => t.customerId).map(t => t.customerId)).size;

  useEffect(() => {
    setShifts(getShifts());
  }, []);

  // Derived denomination totals
  const physTotal = DENOMS.reduce((sum, d) => sum + (denomCounts[d] || 0) * d, 0);
  const expected = cashSysTotal + openingFloat;
  const variance = physTotal - expected;

  const adjustDenom = (denom: number, delta: number) => {
    setDenomCounts(prev => ({ ...prev, [denom]: Math.max(0, (prev[denom] || 0) + delta) }));
  };

  const showToastMsg = (msg: string, isErr = false) => {
    setToast(msg);
    setToastErr(isErr);
    setTimeout(() => setToast(''), 3000);
  };

  const closeShift = () => {
    const staff = staffName.trim() || 'Kasir';
    const denomSnapshot: DenomSnapshot = {};
    DENOMS.forEach(d => { const qty = denomCounts[d] || 0; if (qty > 0) denomSnapshot[String(d)] = qty; });

    const record: ShiftRecord = {
      id: 'SHIFT-' + Date.now(),
      closedAt: new Date().toISOString(),
      staff,
      outlet: '—',
      openingFloat,
      totalSales: kpiTotal,
      cashSales: kpiCash,
      nonCashSales: kpiNonCash,
      trxCount: todayTrxs.length,
      expectedCash: expected,
      physicalCash: physTotal,
      variance,
      denomSnapshot,
      notes: shiftNotes.trim(),
    };

    const updated = [record, ...shifts];
    saveShifts(updated);
    setShifts(updated);

    // Reset
    setDenomCounts(Object.fromEntries(DENOMS.map(d => [d, 0])));
    setShiftNotes('');
    setStaffName('');
    showToastMsg('Shift berhasil ditutup!');
  };

  const varianceColor = variance === 0 ? '#4ade80' : variance < 0 ? '#fca5a5' : '#fcd34d';
  const varianceBg = variance === 0 ? 'rgba(16,185,129,.1)' : variance < 0 ? 'rgba(239,68,68,.1)' : 'rgba(245,158,11,.1)';
  const varianceLabel = variance === 0
    ? 'Rp 0 — Cocok!'
    : variance < 0
      ? '−' + rp(Math.abs(variance)) + ' (kurang)'
      : '+' + rp(variance) + ' (lebih)';

  return (
    <div className="flex min-h-screen" style={{ background: '#020617', backgroundImage: 'radial-gradient(ellipse 70% 50% at 10% 0%,rgba(99,102,241,.2) 0%,transparent 60%),radial-gradient(ellipse 60% 45% at 90% 100%,rgba(16,185,129,.15) 0%,transparent 60%)' }}>
      <Sidebar onLogout={signOut} />
      <main className="flex-1 min-h-screen lg:ml-64">
        <header className="sticky top-0 z-40 px-8 py-4 flex items-center justify-between" style={{ background: 'rgba(2,6,23,.7)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
          <div>
            <h1 className="text-xl font-black text-white">Tutup Shift</h1>
            <p className="text-xs text-white/40">Rekonsiliasi kas dan tutup shift kasir</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('close')}
              className="px-4 py-1.5 rounded-full text-xs font-semibold transition"
              style={{
                background: activeTab === 'close' ? 'rgba(99,102,241,.25)' : 'transparent',
                border: activeTab === 'close' ? '1px solid rgba(99,102,241,.5)' : '1px solid rgba(255,255,255,.12)',
                color: activeTab === 'close' ? 'white' : 'rgba(255,255,255,.5)',
              }}
            >
              Tutup Shift
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className="px-4 py-1.5 rounded-full text-xs font-semibold transition"
              style={{
                background: activeTab === 'history' ? 'rgba(99,102,241,.25)' : 'transparent',
                border: activeTab === 'history' ? '1px solid rgba(99,102,241,.5)' : '1px solid rgba(255,255,255,.12)',
                color: activeTab === 'history' ? 'white' : 'rgba(255,255,255,.5)',
              }}
            >
              Riwayat
            </button>
          </div>
        </header>

        <div className="p-8">
          {/* TAB: Close Shift */}
          {activeTab === 'close' && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className={`${GLASS} p-4`}>
                  <div className="text-xs mb-1 text-white/40">Total Penjualan</div>
                  <div className="text-lg font-extrabold text-white">{rp(kpiTotal)}</div>
                  <div className="text-xs mt-0.5 text-white/30">{todayTrxs.length} transaksi</div>
                </div>
                <div className={`${GLASS} p-4`}>
                  <div className="text-xs mb-1 text-white/40">Tunai (Sistem)</div>
                  <div className="text-lg font-extrabold text-green-400">{rp(kpiCash)}</div>
                </div>
                <div className={`${GLASS} p-4`}>
                  <div className="text-xs mb-1 text-white/40">Non-Tunai</div>
                  <div className="text-lg font-extrabold text-indigo-400">{rp(kpiNonCash)}</div>
                </div>
                <div className={`${GLASS} p-4`}>
                  <div className="text-xs mb-1 text-white/40">Customer Dilayani</div>
                  <div className="text-lg font-extrabold text-amber-400">{uniqCust}</div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Denomination Counter */}
                <div className={`${GLASS} p-5`}>
                  <div className="font-bold text-white mb-4">Hitung Uang Fisik</div>

                  {/* Opening Float */}
                  <div className="flex items-center justify-between mb-4 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,.08)' }}>
                    <span className="text-sm font-semibold text-white/60">Modal Awal (Opening Float)</span>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-white/40">Rp</span>
                      <input
                        type="number"
                        value={openingFloat}
                        onChange={(e) => setOpeningFloat(parseFloat(e.target.value) || 0)}
                        className="pl-8 pr-2 py-1.5 rounded-lg text-sm font-bold w-32 text-right outline-none"
                        style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)', color: 'white' }}
                      />
                    </div>
                  </div>

                  {/* Denom rows */}
                  <div className="space-y-0">
                    {DENOMS.map(d => {
                      const qty = denomCounts[d] || 0;
                      const sub = qty * d;
                      return (
                        <div key={d} className="py-2.5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                          <span className="text-sm font-semibold text-white w-24">{rp(d)}</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => adjustDenom(d, -1)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-lg font-bold"
                              style={{ background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.6)' }}
                            >
                              −
                            </button>
                            <input
                              type="number"
                              value={qty}
                              min={0}
                              onChange={(e) => setDenomCounts(prev => ({ ...prev, [d]: Math.max(0, parseInt(e.target.value) || 0) }))}
                              className="text-center font-bold rounded-lg outline-none"
                              style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.1)', color: 'white', width: '64px', padding: '.35rem .5rem' }}
                            />
                            <button
                              onClick={() => adjustDenom(d, 1)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-lg font-bold"
                              style={{ background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.6)' }}
                            >
                              +
                            </button>
                          </div>
                          <span className="text-sm font-bold text-indigo-300 w-28 text-right">{rp(sub)}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 pt-4 flex justify-between items-center" style={{ borderTop: '1px solid rgba(255,255,255,.08)' }}>
                    <span className="text-sm font-bold text-white/50">Total Fisik</span>
                    <span className="text-lg font-extrabold text-white">{rp(physTotal)}</span>
                  </div>
                </div>

                {/* Right: Reconciliation + Notes + Staff + Button */}
                <div className="space-y-4">
                  {/* Variance Box */}
                  <div className={`${GLASS} p-5`}>
                    <div className="font-bold text-white mb-4">Rekonsiliasi</div>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/50">Tunai Sistem</span>
                        <span className="font-bold text-white">{rp(cashSysTotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">Modal Awal</span>
                        <span className="font-bold text-white">{rp(openingFloat)}</span>
                      </div>
                      <div className="flex justify-between pt-3" style={{ borderTop: '1px solid rgba(255,255,255,.08)' }}>
                        <span className="text-white/50">Ekspektasi di Laci</span>
                        <span className="font-bold text-indigo-300">{rp(expected)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">Uang Fisik Terhitung</span>
                        <span className="font-bold text-white">{rp(physTotal)}</span>
                      </div>
                    </div>
                    <div className="mt-4 p-3 rounded-xl text-center" style={{ background: varianceBg }}>
                      <div className="text-xs mb-1 text-white/40">Selisih (Variance)</div>
                      <div className="text-2xl font-extrabold" style={{ color: varianceColor }}>{varianceLabel}</div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className={`${GLASS} p-5`}>
                    <div className="font-bold text-white mb-3">Catatan</div>
                    <textarea
                      value={shiftNotes}
                      onChange={(e) => setShiftNotes(e.target.value)}
                      rows={3}
                      className={INPUT}
                      placeholder="Alasan selisih, kejadian khusus, dll..."
                    />
                  </div>

                  {/* Staff */}
                  <div className={`${GLASS} p-5`}>
                    <div className="font-bold text-white mb-3">Kasir / Staff</div>
                    <input
                      type="text"
                      value={staffName}
                      onChange={(e) => setStaffName(e.target.value)}
                      className={INPUT}
                      placeholder="Nama kasir yang bertugas..."
                    />
                  </div>

                  {/* Close Button */}
                  <button
                    onClick={closeShift}
                    className="w-full py-4 rounded-2xl font-bold text-white transition"
                    style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', boxShadow: '0 8px 24px rgba(99,102,241,.3)' }}
                  >
                    Tutup Shift Sekarang
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: History */}
          {activeTab === 'history' && (
            <div className={`${GLASS} overflow-hidden`}>
              <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,.07)' }}>
                <div className="font-bold text-white">Riwayat Shift</div>
                <span className="text-xs text-white/40">{shifts.length} shift</span>
              </div>
              {shifts.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="text-4xl mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 mx-auto mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div className="text-sm font-semibold text-white/40">Belum ada shift yang ditutup</div>
                </div>
              ) : (
                <div>
                  {shifts.map(s => {
                    const dt = new Date(s.closedAt).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                    const diffColor = s.variance === 0 ? '#4ade80' : s.variance < 0 ? '#fca5a5' : '#fcd34d';
                    const diffLabel = s.variance === 0 ? 'Cocok' : s.variance > 0 ? '+' + rp(s.variance) : rp(s.variance);
                    return (
                      <div key={s.id} className="px-5 py-4 flex items-center gap-4" style={{ borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,.12)' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-white">{s.staff}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,.07)', color: 'rgba(255,255,255,.4)' }}>{s.outlet}</span>
                          </div>
                          <div className="text-xs mt-0.5 flex gap-3 flex-wrap text-white/35">
                            <span>{dt}</span>
                            <span>{s.trxCount} trx</span>
                            <span>Penjualan: {rp(s.totalSales)}</span>
                          </div>
                          {s.notes && <div className="text-xs mt-0.5 italic text-white/25">{s.notes}</div>}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-sm font-extrabold" style={{ color: diffColor }}>{diffLabel}</div>
                          <div className="text-xs mt-0.5 text-white/35">variance</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 px-5 py-3 rounded-xl text-sm font-semibold shadow-xl flex items-center gap-2 z-50"
          style={{
            background: toastErr ? 'rgba(239,68,68,.85)' : 'rgba(34,197,94,.85)',
            backdropFilter: 'blur(8px)',
            border: toastErr ? '1px solid rgba(239,68,68,.4)' : '1px solid rgba(34,197,94,.4)',
            color: 'white',
          }}
        >
          {!toastErr && (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {toast}
        </div>
      )}
    </div>
  );
}
