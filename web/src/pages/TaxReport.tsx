import { useState, useEffect, useCallback } from 'react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import Sidebar from '../components/Sidebar';

const GLASS = 'rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm';
const INPUT = 'w-full px-3 py-2.5 rounded-xl text-sm bg-white/7 border border-white/15 text-white placeholder:text-white/35 focus:border-indigo-500/70 focus:ring-3 focus:ring-indigo-500/15 outline-none transition';

const NTPD_KEY = 'lunomi_tax_report';

interface NTPDRecord {
  id: string;
  period: string;
  ntpd: string;
  date: string;
  amount: number;
  note: string;
  createdAt: string;
}

interface LunomiConfig {
  tax: number;
  service: number;
}

interface LunomiTransaction {
  id: string;
  total: number;
  createdAt: string;
  items?: { name: string; qty: number; price: number }[];
  payMethod?: string;
  method?: string;
}

const MONTH_NAMES = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

function getPeriodLabel(isoMonth: string): string {
  if (!isoMonth) return '';
  const [y, m] = isoMonth.split('-');
  return MONTH_NAMES[parseInt(m) - 1] + ' ' + y;
}

function fmt(n: number): string {
  return 'Rp ' + Math.round(n).toLocaleString('id-ID');
}

function getTransactions(): LunomiTransaction[] {
  try {
    return JSON.parse(localStorage.getItem('lunomi_transactions') || '[]');
  } catch {
    return [];
  }
}

function getConfig(): LunomiConfig {
  try {
    return JSON.parse(localStorage.getItem('lunomi_config') || '{"tax":10,"service":0}');
  } catch {
    return { tax: 10, service: 0 };
  }
}

export default function TaxReport() {
  const { signOut } = useSupabaseAuth();

  const [ntpdRecords, setNtpdRecords] = useState<NTPDRecord[]>([]);
  const [transactions, setTransactions] = useState<LunomiTransaction[]>([]);
  const [config, setConfig] = useState<LunomiConfig>({ tax: 10, service: 0 });
  const [filterMonth, setFilterMonth] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ period: '', ntpd: '', date: '', amount: '', note: '' });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const nowMonth = new Date().toISOString().slice(0, 7);
    setFilterMonth(nowMonth);
    setConfig(getConfig());
    setTransactions(getTransactions());
    const stored = localStorage.getItem(NTPD_KEY);
    setNtpdRecords(stored ? JSON.parse(stored) : []);
  }, []);

  const saveNtpd = useCallback((records: NTPDRecord[]) => {
    localStorage.setItem(NTPD_KEY, JSON.stringify(records));
    setNtpdRecords(records);
  }, []);

  const taxPct = parseFloat(String(config.tax)) || 10;
  const svcPct = parseFloat(String(config.service)) || 0;
  const divisor = 1 + (taxPct + svcPct) / 100;

  const filteredTrx = filterMonth
    ? transactions.filter(t => t.createdAt && t.createdAt.slice(0, 7) === filterMonth)
    : transactions;

  const filteredNTPD = filterMonth
    ? ntpdRecords.filter(n => n.period === filterMonth)
    : ntpdRecords;

  let totalTax = 0, totalSvc = 0, totalNet = 0;
  const trxRows = filteredTrx.map(t => {
    const gross = (t.total || 0) / divisor;
    const tax = gross * (taxPct / 100);
    const svc = gross * (svcPct / 100);
    totalNet += gross;
    totalTax += tax;
    totalSvc += svc;
    return { t, gross, tax, svc };
  });

  const totalSetoran = filteredNTPD.reduce((s, n) => s + (n.amount || 0), 0);

  const openModal = () => {
    const today = new Date().toISOString().slice(0, 10);
    setForm({ period: today.slice(0, 7), ntpd: '', date: today, amount: '', note: '' });
    setFormError('');
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.period || !form.ntpd.trim()) {
      setFormError('Periode dan nomor NTPD wajib diisi.');
      return;
    }
    const record: NTPDRecord = {
      id: 'ntpd_' + Date.now(),
      period: form.period,
      ntpd: form.ntpd.trim(),
      date: form.date,
      amount: parseFloat(form.amount) || 0,
      note: form.note.trim(),
      createdAt: new Date().toISOString(),
    };
    saveNtpd([...ntpdRecords, record]);
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Hapus catatan NTPD ini?')) return;
    saveNtpd(ntpdRecords.filter(r => r.id !== id));
  };

  const sortedNTPD = [...filteredNTPD].sort((a, b) => b.period.localeCompare(a.period));

  return (
    <div className="flex min-h-screen" style={{ background: '#020617', backgroundImage: 'radial-gradient(ellipse 70% 50% at 10% 0%,rgba(99,102,241,.25) 0%,transparent 60%),radial-gradient(ellipse 60% 45% at 90% 100%,rgba(16,185,129,.12) 0%,transparent 60%)' }}>
      <Sidebar onLogout={signOut} />
      <main className="flex-1 min-h-screen lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-40 pl-14 pr-6 lg:px-8 py-4 flex items-center justify-between" style={{ background: 'rgba(2,6,23,.7)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
          <div>
            <h1 className="text-xl font-black text-white">Pelaporan Pajak PB1</h1>
            <p className="text-xs text-white/40">Kepatuhan pajak restoran untuk pelaporan daerah (Bapenda)</p>
          </div>
          <button onClick={openModal} className="px-4 py-2 rounded-xl text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}>
            + Upload NTPD Baru
          </button>
        </header>

        <div className="p-8 space-y-6">
          {/* Period Filter */}
          <div className={`${GLASS} p-4 flex flex-wrap gap-3 items-center`}>
            <span className="text-sm font-semibold text-white/60">Filter Periode:</span>
            <input
              type="month"
              value={filterMonth}
              onChange={e => setFilterMonth(e.target.value)}
              className="px-4 py-2 rounded-xl text-sm bg-white/7 border border-white/15 text-white outline-none focus:border-orange-500/50 transition"
            />
            <button
              onClick={() => setFilterMonth('')}
              className="px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer"
              style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.7)' }}
            >
              Semua Periode
            </button>
            <span className="text-xs text-white/40 ml-auto">
              {filterMonth
                ? `Menampilkan: ${getPeriodLabel(filterMonth)} (${filteredTrx.length} transaksi)`
                : `Semua periode — ${transactions.length} transaksi`}
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`${GLASS} p-5`} style={{ borderLeft: '3px solid #f97316' }}>
              <p className="text-[10px] font-bold text-white/40 uppercase mb-1">Total PPN Terkumpul</p>
              <h3 className="text-2xl font-extrabold text-white">{fmt(totalTax)}</h3>
              <p className="text-xs text-white/40 mt-1">Rate: {taxPct}%</p>
            </div>
            <div className={`${GLASS} p-5`} style={{ borderLeft: '3px solid #3b82f6' }}>
              <p className="text-[10px] font-bold text-white/40 uppercase mb-1">Total Service Charge</p>
              <h3 className="text-2xl font-extrabold text-white">{fmt(totalSvc)}</h3>
              <p className="text-xs text-white/40 mt-1">Rate: {svcPct}%</p>
            </div>
            <div className={`${GLASS} p-5`} style={{ borderLeft: '3px solid #a855f7' }}>
              <p className="text-[10px] font-bold text-white/40 uppercase mb-1">Omzet Neto</p>
              <h3 className="text-2xl font-extrabold text-white">{fmt(totalNet)}</h3>
              <p className="text-xs text-white/40 mt-1">Sebelum pajak</p>
            </div>
            <div className={`${GLASS} p-5`} style={{ borderLeft: '3px solid #10b981' }}>
              <p className="text-[10px] font-bold text-white/40 uppercase mb-1">Total Transaksi</p>
              <h3 className="text-2xl font-extrabold text-white">{filteredTrx.length.toLocaleString('id-ID')}</h3>
              <p className="text-xs text-white/40 mt-1">{filteredNTPD.length} catatan &middot; {fmt(totalSetoran)}</p>
            </div>
          </div>

          {/* NTPD Table */}
          <div className={`${GLASS} overflow-hidden`}>
            <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}>
              <h4 className="font-bold text-white">Riwayat Setoran Pajak (NTPD)</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,.04)' }}>
                    {['Periode','No. Transaksi (NTPD)','Tanggal Setor','Jumlah Setoran','Keterangan','Status',''].map((h, i) => (
                      <th key={i} className={`px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-white/40 ${i === 3 || i === 6 ? 'text-right' : i === 5 ? 'text-center' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedNTPD.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-sm" style={{ color: 'rgba(255,255,255,.3)' }}>
                        Belum ada catatan setoran NTPD
                      </td>
                    </tr>
                  ) : (
                    sortedNTPD.map(n => (
                      <tr key={n.id} className="cursor-default" style={{ borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                        <td className="px-5 py-3.5 text-sm font-bold text-white">{getPeriodLabel(n.period)}</td>
                        <td className="px-5 py-3.5 text-sm font-mono text-white/60">{n.ntpd}</td>
                        <td className="px-5 py-3.5 text-sm text-white/60">{n.date || '—'}</td>
                        <td className="px-5 py-3.5 text-right text-sm font-bold text-white">{fmt(n.amount || 0)}</td>
                        <td className="px-5 py-3.5 text-sm text-white/50">{n.note || '—'}</td>
                        <td className="px-5 py-3.5 text-center">
                          <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase" style={{ background: 'rgba(16,185,129,.15)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,.3)' }}>Selesai</span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button onClick={() => handleDelete(n.id)} className="text-xs px-2 py-1 rounded-lg font-semibold cursor-pointer hover:opacity-80 transition" style={{ background: 'rgba(239,68,68,.1)', color: '#f87171' }}>
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Transaction Detail */}
          <div className={`${GLASS} overflow-hidden`}>
            <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}>
              <h4 className="font-bold text-white">Detail Transaksi Pajak</h4>
              <p className="text-xs text-white/40 mt-1">Rincian perhitungan pajak per transaksi</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,.04)' }}>
                    {['Tanggal','No. Transaksi','Omzet Neto','PPN','Serv. Charge','Total'].map((h, i) => (
                      <th key={i} className={`px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-white/40 ${i >= 2 ? 'text-right' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {trxRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-sm" style={{ color: 'rgba(255,255,255,.3)' }}>
                        Tidak ada transaksi pada periode ini
                      </td>
                    </tr>
                  ) : (
                    <>
                      {trxRows.slice(0, 100).map(({ t, gross, tax, svc }) => (
                        <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                          <td className="px-5 py-3 text-sm text-white/60">{t.createdAt ? t.createdAt.slice(0, 10) : '—'}</td>
                          <td className="px-5 py-3 text-xs font-mono text-white/50">{t.id || '—'}</td>
                          <td className="px-5 py-3 text-right text-sm text-white">{fmt(gross)}</td>
                          <td className="px-5 py-3 text-right text-sm font-semibold" style={{ color: '#fb923c' }}>{fmt(tax)}</td>
                          <td className="px-5 py-3 text-right text-sm font-semibold" style={{ color: '#60a5fa' }}>{fmt(svc)}</td>
                          <td className="px-5 py-3 text-right text-sm font-bold text-white">{fmt(t.total || 0)}</td>
                        </tr>
                      ))}
                      {trxRows.length > 100 && (
                        <tr>
                          <td colSpan={6} className="px-6 py-3 text-center text-xs text-white/30">
                            ... dan {trxRows.length - 100} transaksi lainnya
                          </td>
                        </tr>
                      )}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* NTPD Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(8px)' }}>
          <div className={`${GLASS} w-full max-w-md shadow-2xl`}>
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,.08)' }}>
              <h3 className="font-bold text-white">Tambah Catatan NTPD</h3>
              <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white text-xl font-bold cursor-pointer transition">×</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/40 mb-1.5">Periode Pajak</label>
                <input type="month" value={form.period} onChange={e => setForm({ ...form, period: e.target.value })} className={INPUT} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/40 mb-1.5">Nomor NTPD</label>
                <input type="text" value={form.ntpd} onChange={e => setForm({ ...form, ntpd: e.target.value })} placeholder="cth. NTPD-9928310023" maxLength={30} className={INPUT} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/40 mb-1.5">Tanggal Setor</label>
                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className={INPUT} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/40 mb-1.5">Jumlah Setoran (Rp)</label>
                <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0" min="0" className={INPUT} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/40 mb-1.5">Keterangan</label>
                <input type="text" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="Opsional" className={INPUT} />
              </div>
              {formError && (
                <div className="px-3 py-2 rounded-xl text-xs" style={{ background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.3)', color: '#fca5a5' }}>{formError}</div>
              )}
            </div>
            <div className="px-6 pb-5 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold cursor-pointer" style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.7)' }}>Batal</button>
              <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer" style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}>Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
