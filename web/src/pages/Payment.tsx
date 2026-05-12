import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import Sidebar from '../components/Sidebar';

interface PaymentConfig {
  enabled: Record<string, boolean>;
  qrisMerchantId: string;
  qrisName: string;
  bankAccount: string;
  updatedAt?: string;
}

interface Transaction {
  id: string;
  paymentMethod?: string;
  total?: number;
  createdAt?: string;
}

const GLASS = 'rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm';
const INPUT = 'w-full px-3 py-2.5 rounded-xl text-sm bg-white/7 border border-white/15 text-white placeholder:text-white/35 focus:border-indigo-500/70 focus:ring-3 focus:ring-indigo-500/15 outline-none transition';

const PAY_KEY = 'lunomi_payment_methods';

const CASH_METHODS = [
  { id: 'cash', label: 'Tunai', color: '#4ade80' },
  { id: 'debit', label: 'Kartu Debit', color: '#93c5fd' },
  { id: 'credit', label: 'Kartu Kredit', color: '#c4b5fd' },
];

const QRIS_METHODS = [
  { id: 'qris', label: 'QRIS', color: '#a5b4fc' },
  { id: 'transfer', label: 'Transfer Bank', color: '#93c5fd' },
];

const WALLET_METHODS = [
  { id: 'gopay', label: 'GoPay', color: '#4ade80' },
  { id: 'ovo', label: 'OVO', color: '#c4b5fd' },
  { id: 'dana', label: 'DANA', color: '#93c5fd' },
  { id: 'shopeepay', label: 'ShopeePay', color: '#fdba74' },
  { id: 'linkaja', label: 'LinkAja', color: '#fca5a5' },
];

const METHOD_BADGE: Record<string, { bg: string; color: string }> = {
  qris: { bg: 'rgba(99,102,241,.2)', color: '#a5b4fc' },
  transfer: { bg: 'rgba(59,130,246,.2)', color: '#93c5fd' },
  gopay: { bg: 'rgba(34,197,94,.2)', color: '#4ade80' },
  ovo: { bg: 'rgba(139,92,246,.2)', color: '#c4b5fd' },
  dana: { bg: 'rgba(59,130,246,.2)', color: '#93c5fd' },
  shopeepay: { bg: 'rgba(249,115,22,.2)', color: '#fdba74' },
  linkaja: { bg: 'rgba(239,68,68,.2)', color: '#fca5a5' },
  debit: { bg: 'rgba(59,130,246,.2)', color: '#93c5fd' },
  credit: { bg: 'rgba(139,92,246,.2)', color: '#c4b5fd' },
};

const LOG_FILTER_OPTIONS = ['qris', 'transfer', 'gopay', 'ovo', 'dana', 'shopeepay'];

const DEFAULT_CONFIG: PaymentConfig = {
  enabled: { cash: true },
  qrisMerchantId: '',
  qrisName: '',
  bankAccount: '',
};

function Toggle({ id, checked, onChange }: { id: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={(e) => { e.stopPropagation(); onChange(!checked); }}
      className="relative inline-flex flex-shrink-0 w-11 h-6 rounded-full transition-colors focus:outline-none"
      style={{ background: checked ? '#6366f1' : 'rgba(255,255,255,.15)' }}
      aria-label={id}
    >
      <span
        className="inline-block w-[18px] h-[18px] rounded-full bg-white shadow transition-transform mt-[3px]"
        style={{ transform: checked ? 'translateX(23px)' : 'translateX(3px)' }}
      />
    </button>
  );
}

export default function Payment() {
  const { signOut } = useSupabaseAuth();
  const [cfg, setCfg] = useState<PaymentConfig>(DEFAULT_CONFIG);
  const [logFilter, setLogFilter] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem(PAY_KEY);
    if (stored) {
      try { setCfg(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, []);

  const rp = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

  const getTransactions = (): Transaction[] => {
    try { return JSON.parse(localStorage.getItem('lunomi_transactions') || '[]'); } catch { return []; }
  };

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const allTrxs = getTransactions().filter(t => (t.createdAt || '') >= monthStart);

  let digital = 0, qrisCount = 0, transferTotal = 0, walletTotal = 0;
  allTrxs.forEach(t => {
    const pm = (t.paymentMethod || '').toLowerCase();
    const amt = t.total || 0;
    if (pm === 'qris') { digital += amt; qrisCount++; }
    else if (pm === 'transfer') { digital += amt; transferTotal += amt; }
    else if (['gopay', 'ovo', 'dana', 'shopeepay', 'linkaja'].includes(pm)) { digital += amt; walletTotal += amt; }
  });

  const digitalMethods = ['qris', 'transfer', 'gopay', 'ovo', 'dana', 'shopeepay', 'linkaja', 'debit', 'credit'];
  const logTrxs = allTrxs
    .filter(t => digitalMethods.includes((t.paymentMethod || '').toLowerCase()))
    .filter(t => !logFilter || (t.paymentMethod || '').toLowerCase() === logFilter)
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

  const toggleMethod = (id: string, on: boolean) => {
    const newCfg = { ...cfg, enabled: { ...cfg.enabled, [id]: on } };
    setCfg(newCfg);
  };

  const saveConfig = () => {
    const updated: PaymentConfig = { ...cfg, updatedAt: new Date().toISOString() };
    localStorage.setItem(PAY_KEY, JSON.stringify(updated));
    setCfg(updated);
    setToast('Konfigurasi pembayaran disimpan!');
    setTimeout(() => setToast(''), 2500);
  };

  const showQRISConfig = cfg.enabled?.qris || cfg.enabled?.transfer;

  const renderMethodGroup = (methods: { id: string; label: string; color: string }[]) =>
    methods.map(m => (
      <div
        key={m.id}
        className="rounded-xl px-4 py-3 flex items-center justify-between transition"
        style={{
          background: cfg.enabled?.[m.id] ? 'rgba(99,102,241,.07)' : 'rgba(255,255,255,.04)',
          border: cfg.enabled?.[m.id] ? '1px solid rgba(99,102,241,.4)' : '1px solid rgba(255,255,255,.08)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: m.color }} />
          <span className="text-sm font-semibold text-white">{m.label}</span>
        </div>
        <Toggle id={m.id} checked={!!cfg.enabled?.[m.id]} onChange={(on) => toggleMethod(m.id, on)} />
      </div>
    ));

  return (
    <div className="flex min-h-screen" style={{ background: '#020617', backgroundImage: 'radial-gradient(ellipse 70% 50% at 10% 0%,rgba(99,102,241,.2) 0%,transparent 60%),radial-gradient(ellipse 60% 45% at 90% 100%,rgba(16,185,129,.12) 0%,transparent 60%)' }}>
      <Sidebar onLogout={signOut} />
      <main className="flex-1 min-h-screen lg:ml-64">
        <header className="sticky top-0 z-40 pl-14 pr-6 lg:px-8 py-4 flex items-center justify-between" style={{ background: 'rgba(2,6,23,.7)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
          <div>
            <h1 className="text-xl font-black text-white">Payment Gateway</h1>
            <p className="text-xs text-white/40">Konfigurasi metode pembayaran dan monitor transaksi digital</p>
          </div>
        </header>

        <div className="p-8 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderLeft: '4px solid #6366f1' }}>
              <p className="text-[10px] font-bold text-white/40 uppercase mb-1">Total Digital</p>
              <h3 className="text-2xl font-extrabold text-white">{rp(digital)}</h3>
              <p className="text-xs text-white/30 mt-1">Bulan ini</p>
            </div>
            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderLeft: '4px solid #10b981' }}>
              <p className="text-[10px] font-bold text-white/40 uppercase mb-1">Transaksi QRIS</p>
              <h3 className="text-2xl font-extrabold text-white">{qrisCount}</h3>
              <p className="text-xs text-white/30 mt-1">Bulan ini</p>
            </div>
            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderLeft: '4px solid #3b82f6' }}>
              <p className="text-[10px] font-bold text-white/40 uppercase mb-1">Transfer Bank</p>
              <h3 className="text-2xl font-extrabold text-white">{rp(transferTotal)}</h3>
              <p className="text-xs text-white/30 mt-1">Bulan ini</p>
            </div>
            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderLeft: '4px solid #f97316' }}>
              <p className="text-[10px] font-bold text-white/40 uppercase mb-1">E-Wallet</p>
              <h3 className="text-2xl font-extrabold text-white">{rp(walletTotal)}</h3>
              <p className="text-xs text-white/30 mt-1">Bulan ini</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Payment Methods Config */}
            <div className="space-y-5">
              {/* Tunai */}
              <div className={`${GLASS} p-5`}>
                <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3">Tunai</h3>
                <div className="space-y-2">{renderMethodGroup(CASH_METHODS)}</div>
              </div>

              {/* QRIS & Transfer */}
              <div className={`${GLASS} p-5`}>
                <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3">QRIS & Transfer</h3>
                <div className="space-y-2">{renderMethodGroup(QRIS_METHODS)}</div>
                {showQRISConfig && (
                  <div className="mt-4 pt-4 space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,.08)' }}>
                    <div>
                      <label className="text-xs font-semibold text-white/50 mb-1.5 block">Merchant ID QRIS</label>
                      <input
                        type="text"
                        value={cfg.qrisMerchantId}
                        onChange={(e) => setCfg({ ...cfg, qrisMerchantId: e.target.value })}
                        className={INPUT}
                        placeholder="ID dari Midtrans/iPaymu"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-white/50 mb-1.5 block">Nama Tampil di QRIS</label>
                      <input
                        type="text"
                        value={cfg.qrisName}
                        onChange={(e) => setCfg({ ...cfg, qrisName: e.target.value })}
                        className={INPUT}
                        placeholder="Lunomi Restoran"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-white/50 mb-1.5 block">No. Rekening (Transfer)</label>
                      <input
                        type="text"
                        value={cfg.bankAccount}
                        onChange={(e) => setCfg({ ...cfg, bankAccount: e.target.value })}
                        className={INPUT}
                        placeholder="BCA 1234567890 a/n Outlet"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* E-Wallet */}
              <div className={`${GLASS} p-5`}>
                <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3">E-Wallet</h3>
                <div className="space-y-2">{renderMethodGroup(WALLET_METHODS)}</div>
              </div>

              <button
                onClick={saveConfig}
                className="w-full py-3 rounded-xl text-sm font-bold text-white transition"
                style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', boxShadow: '0 4px 20px rgba(99,102,241,.25)' }}
              >
                Simpan Konfigurasi
              </button>
            </div>

            {/* Right: Transaction Log */}
            <div className={`${GLASS} overflow-hidden self-start`}>
              <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,.07)' }}>
                <h3 className="font-bold text-white text-sm">Log Pembayaran Digital</h3>
                <select
                  value={logFilter}
                  onChange={(e) => setLogFilter(e.target.value)}
                  className="text-xs px-3 py-1.5 rounded-xl outline-none"
                  style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)', color: 'white' }}
                >
                  <option value="">Semua metode</option>
                  {LOG_FILTER_OPTIONS.map(o => (
                    <option key={o} value={o}>{o.toUpperCase()}</option>
                  ))}
                </select>
              </div>
              <div className="divide-y divide-white/5 max-h-[520px] overflow-y-auto text-sm">
                {logTrxs.length === 0 ? (
                  <div className="px-5 py-12 text-center text-white/30">
                    <div className="text-3xl mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mx-auto mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    Belum ada transaksi digital
                  </div>
                ) : (
                  logTrxs.slice(0, 50).map(t => {
                    const pm = (t.paymentMethod || 'lainnya').toLowerCase();
                    const badge = METHOD_BADGE[pm] || { bg: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.5)' };
                    const dt = t.createdAt
                      ? new Date(t.createdAt).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                      : '-';
                    return (
                      <div key={t.id} className="px-5 py-3 flex justify-between items-center gap-3 hover:bg-white/5 transition">
                        <div className="min-w-0">
                          <p className="font-semibold truncate text-xs text-white">{t.id || 'TRX'}</p>
                          <p className="text-white/40 text-[10px]">{dt}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span
                            className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase block mb-0.5"
                            style={{ background: badge.bg, color: badge.color }}
                          >
                            {pm}
                          </span>
                          <p className="font-bold text-xs text-white">Rp {Math.round(t.total || 0).toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 px-5 py-3 rounded-xl text-white text-sm font-semibold shadow-xl flex items-center gap-2 z-50"
          style={{ background: 'rgba(34,197,94,.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(34,197,94,.4)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {toast}
        </div>
      )}
    </div>
  );
}
