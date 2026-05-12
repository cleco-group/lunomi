import { useState, useEffect, useCallback } from 'react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import Sidebar from '../components/Sidebar';

const GLASS = 'rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm';
const INPUT = 'w-full px-3 py-2.5 rounded-xl text-sm bg-white/7 border border-white/15 text-white placeholder:text-white/35 focus:border-red-500/70 focus:ring-3 focus:ring-red-500/15 outline-none transition';

const AUDIT_KEY = 'lunomi_audit_log';

type LogCategory = 'all' | 'transaction' | 'customer' | 'loyalty' | 'invoice';

interface AuditEntry {
  id: string;
  action: string;
  detail: string;
  user: string;
  at: string;
}

interface BadgeDef {
  label: string;
  cls: string;
  bg: string;
  color: string;
  border: string;
}

const ACTION_MAP: Record<string, BadgeDef> = {
  transaction:      { label: 'Transaksi',       cls: 'transaction', bg: 'rgba(99,102,241,.15)',  color: '#a5b4fc', border: 'rgba(99,102,241,.3)' },
  customer_add:     { label: 'Tambah Customer', cls: 'customer',    bg: 'rgba(16,185,129,.15)',  color: '#6ee7b7', border: 'rgba(16,185,129,.3)' },
  customer_edit:    { label: 'Edit Customer',   cls: 'customer',    bg: 'rgba(16,185,129,.15)',  color: '#6ee7b7', border: 'rgba(16,185,129,.3)' },
  customer_delete:  { label: 'Hapus Customer',  cls: 'customer',    bg: 'rgba(16,185,129,.15)',  color: '#6ee7b7', border: 'rgba(16,185,129,.3)' },
  loyalty_redeem:   { label: 'Redeem Poin',     cls: 'loyalty',     bg: 'rgba(245,158,11,.15)',  color: '#fcd34d', border: 'rgba(245,158,11,.3)' },
  invoice:          { label: 'Invoice',         cls: 'invoice',     bg: 'rgba(59,130,246,.15)',  color: '#93c5fd', border: 'rgba(59,130,246,.3)' },
  invoice_paid:     { label: 'Invoice Lunas',   cls: 'invoice',     bg: 'rgba(59,130,246,.15)',  color: '#93c5fd', border: 'rgba(59,130,246,.3)' },
};

const FALLBACK_BADGE: BadgeDef = { label: 'Lainnya', cls: 'other', bg: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.5)', border: 'rgba(255,255,255,.12)' };

function getBadge(action: string): BadgeDef {
  if (ACTION_MAP[action]) return ACTION_MAP[action];
  const cat = action.split('_')[0];
  if (cat === 'customer') return { ...FALLBACK_BADGE, label: 'Customer', bg: 'rgba(16,185,129,.15)', color: '#6ee7b7', border: 'rgba(16,185,129,.3)' };
  if (cat === 'loyalty')  return { ...FALLBACK_BADGE, label: 'Loyalty',  bg: 'rgba(245,158,11,.15)', color: '#fcd34d', border: 'rgba(245,158,11,.3)' };
  if (cat === 'invoice')  return { ...FALLBACK_BADGE, label: 'Invoice',  bg: 'rgba(59,130,246,.15)', color: '#93c5fd', border: 'rgba(59,130,246,.3)' };
  return { ...FALLBACK_BADGE, label: action };
}

function isCategory(action: string, cat: LogCategory): boolean {
  if (cat === 'all')         return true;
  if (cat === 'transaction') return action === 'transaction';
  if (cat === 'customer')    return action.startsWith('customer');
  if (cat === 'loyalty')     return action.startsWith('loyalty');
  if (cat === 'invoice')     return action.startsWith('invoice');
  return true;
}

function getActionIcon(action: string): string {
  if (action === 'transaction')     return '💳';
  if (action.startsWith('customer')) return '👥';
  if (action.startsWith('loyalty'))  return '⭐';
  if (action.startsWith('invoice'))  return '🧾';
  if (action.startsWith('schedule')) return '📅';
  if (action.startsWith('tax'))      return '🧾';
  return '📌';
}

function loadLogs(): AuditEntry[] {
  try { return JSON.parse(localStorage.getItem(AUDIT_KEY) || '[]'); } catch { return []; }
}

const CAT_FILTERS: { id: LogCategory; label: string }[] = [
  { id: 'all',         label: 'Semua' },
  { id: 'transaction', label: 'Transaksi' },
  { id: 'customer',    label: 'Customer' },
  { id: 'loyalty',     label: 'Loyalty' },
  { id: 'invoice',     label: 'Invoice' },
];

export default function Audit() {
  const { signOut } = useSupabaseAuth();
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<LogCategory>('all');
  const [showCount, setShowCount] = useState(50);
  const [toast, setToast] = useState('');

  useEffect(() => { setLogs(loadLogs()); }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }, []);

  const handleClearLog = () => {
    if (!logs.length) { showToast('Log sudah kosong'); return; }
    if (!confirm(`Hapus ${logs.length} log aktivitas? Tindakan ini tidak bisa dibatalkan.`)) return;
    localStorage.setItem(AUDIT_KEY, '[]');
    setLogs([]);
    showToast('Audit log berhasil dibersihkan');
  };

  const filtered = logs.filter(l => {
    const matchCat = isCategory(l.action, category);
    const q = search.toLowerCase();
    const matchQ = !q || (l.detail || '').toLowerCase().includes(q) || (l.user || '').toLowerCase().includes(q) || (l.action || '').toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  const sliced = filtered.slice(0, showCount);

  const statTotal = logs.length;
  const statTrx = logs.filter(l => l.action === 'transaction').length;
  const statCust = logs.filter(l => l.action.startsWith('customer')).length;
  const statLoyalty = logs.filter(l => l.action.startsWith('loyalty')).length;

  return (
    <div className="flex min-h-screen" style={{ background: '#020617', backgroundImage: 'radial-gradient(ellipse 70% 50% at 10% 0%,rgba(99,102,241,.25) 0%,transparent 60%),radial-gradient(ellipse 60% 45% at 90% 100%,rgba(16,185,129,.12) 0%,transparent 60%)' }}>
      <Sidebar onLogout={signOut} />
      <main className="flex-1 min-h-screen lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-40 pl-14 pr-6 lg:px-8 py-4 flex items-center justify-between" style={{ background: 'rgba(2,6,23,.7)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
          <div>
            <h1 className="text-xl font-black text-white">Audit Trail</h1>
            <p className="text-xs text-white/40">Riwayat aktivitas dan perubahan sistem</p>
          </div>
          <button
            onClick={handleClearLog}
            className="px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer hover:opacity-80 transition"
            style={{ background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.25)', color: '#fca5a5' }}
          >
            Hapus Semua Log
          </button>
        </header>

        <div className="p-8 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className={`${GLASS} p-4 text-center`}>
              <div className="text-xs mb-1 text-white/40">Total Log</div>
              <div className="text-2xl font-extrabold text-white">{statTotal}</div>
            </div>
            <div className={`${GLASS} p-4 text-center`}>
              <div className="text-xs mb-1 text-indigo-400">Transaksi</div>
              <div className="text-2xl font-extrabold text-indigo-400">{statTrx}</div>
            </div>
            <div className={`${GLASS} p-4 text-center`}>
              <div className="text-xs mb-1 text-green-400">Customer</div>
              <div className="text-2xl font-extrabold text-green-400">{statCust}</div>
            </div>
            <div className={`${GLASS} p-4 text-center`}>
              <div className="text-xs mb-1 text-amber-400">Loyalty</div>
              <div className="text-2xl font-extrabold text-amber-400">{statLoyalty}</div>
            </div>
          </div>

          {/* Filter */}
          <div className={`${GLASS} p-4 flex flex-wrap gap-3 items-center`}>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari aktivitas, user, detail..."
              className={`${INPUT} flex-1 min-w-44`}
            />
            <div className="flex gap-2 flex-wrap">
              {CAT_FILTERS.map(f => (
                <button
                  key={f.id}
                  onClick={() => { setCategory(f.id); setShowCount(50); }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition ${
                    category === f.id
                      ? 'text-red-300'
                      : 'text-white/50 hover:text-white/80'
                  }`}
                  style={
                    category === f.id
                      ? { background: 'rgba(239,68,68,.15)', border: '1px solid rgba(239,68,68,.4)' }
                      : { background: 'transparent', border: '1px solid rgba(255,255,255,.15)' }
                  }
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Log List */}
          <div className={`${GLASS} overflow-hidden`}>
            {filtered.length === 0 ? (
              <div className="py-20 text-center">
                <div className="text-5xl mb-3">📋</div>
                <div className="text-sm font-semibold text-white/40">Log masih kosong</div>
                <div className="text-xs mt-1 text-white/25">Aktivitas sistem akan muncul di sini secara otomatis</div>
              </div>
            ) : (
              <>
                {sliced.map(l => {
                  const b = getBadge(l.action);
                  const dt = new Date(l.at);
                  const timeStr = dt.toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' });
                  return (
                    <div key={l.id} className="px-5 py-3.5 flex items-start gap-4" style={{ borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                      <div className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-sm mt-0.5" style={{ background: 'rgba(255,255,255,.06)' }}>
                        {getActionIcon(l.action)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold" style={{ background: b.bg, color: b.color, border: `1px solid ${b.border}` }}>
                            {b.label}
                          </span>
                          <span className="text-sm text-white font-medium truncate">{l.detail || '—'}</span>
                        </div>
                        <div className="text-xs mt-1 flex gap-3 text-white/35">
                          <span>User: {l.user || 'System'}</span>
                          <span>{timeStr}</span>
                          <span className="font-mono text-white/20">{l.id}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {filtered.length > showCount && (
                  <div className="text-center py-4">
                    <button
                      onClick={() => setShowCount(c => c + 50)}
                      className="text-xs px-4 py-2 rounded-xl font-semibold cursor-pointer hover:opacity-80 transition"
                      style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.6)' }}
                    >
                      Tampilkan lebih banyak
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 px-5 py-3 rounded-2xl text-sm font-semibold z-50 pointer-events-none"
          style={{ background: 'rgba(34,197,94,.15)', border: '1px solid rgba(34,197,94,.3)', color: '#4ade80' }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
