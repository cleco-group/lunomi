import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import Sidebar from '../components/Sidebar';

interface Table {
  id: string;
  cap: number;
  loc: string;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  since: string | null;
  reservedFor: string | null;
}

interface WaitlistItem {
  id: string;
  name: string;
  pax: number;
  phone: string;
  addedAt: string;
}

const GLASS = 'rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm';
const INPUT = 'w-full px-3 py-2 rounded-xl text-sm bg-white/7 border border-white/15 text-white placeholder:text-white/35 focus:border-emerald-500/70 focus:ring-3 focus:ring-emerald-500/15 outline-none transition';

const DEFAULT_TABLES: Table[] = [
  { id: 'T-01', cap: 4, loc: 'Indoor', status: 'available', since: null, reservedFor: null },
  { id: 'T-02', cap: 2, loc: 'Indoor', status: 'available', since: null, reservedFor: null },
  { id: 'T-03', cap: 6, loc: 'Indoor', status: 'available', since: null, reservedFor: null },
  { id: 'T-04', cap: 4, loc: 'Indoor', status: 'available', since: null, reservedFor: null },
  { id: 'T-05', cap: 4, loc: 'Indoor', status: 'available', since: null, reservedFor: null },
  { id: 'T-06', cap: 8, loc: 'Indoor', status: 'available', since: null, reservedFor: null },
  { id: 'T-07', cap: 4, loc: 'Outdoor', status: 'available', since: null, reservedFor: null },
  { id: 'T-08', cap: 4, loc: 'Outdoor', status: 'available', since: null, reservedFor: null },
  { id: 'VIP-01', cap: 10, loc: 'VIP', status: 'available', since: null, reservedFor: null },
  { id: 'VIP-02', cap: 8, loc: 'VIP', status: 'available', since: null, reservedFor: null },
];

const statusColors: Record<string, { bg: string; text: string; icon: string }> = {
  available: { bg: 'rgba(34,197,94,.1)', text: '#4ade80', icon: '✓' },
  occupied: { bg: 'rgba(239,68,68,.12)', text: '#f87171', icon: '●' },
  reserved: { bg: 'rgba(245,158,11,.1)', text: '#fbbf24', icon: '🕐' },
  cleaning: { bg: 'rgba(139,92,246,.1)', text: '#c4b5fd', icon: '🧹' },
};

const statusLabels: Record<string, string> = {
  available: 'Tersedia',
  occupied: 'Terisi',
  reserved: 'Reservasi',
  cleaning: 'Dibersihkan',
};

const elapsedSince = (iso: string) => {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  return mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}j ${mins % 60}m`;
};

export default function Tables() {
  const { signOut } = useSupabaseAuth();
  const [tables, setTables] = useState<Table[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showTableModal, setShowTableModal] = useState(false);
  const [showAddTable, setShowAddTable] = useState(false);
  const [showAddWait, setShowAddWait] = useState(false);
  const [reserveName, setReserveName] = useState('');
  const [formData, setFormData] = useState({ tNum: '', tCap: '4', tLoc: '' });
  const [waitFormData, setWaitFormData] = useState({ wName: '', wPax: '2', wPhone: '' });

  useEffect(() => {
    const stored = localStorage.getItem('lunomi_tables');
    const storedWait = localStorage.getItem('lunomi_waitlist');
    setTables(stored ? JSON.parse(stored) : DEFAULT_TABLES);
    setWaitlist(storedWait ? JSON.parse(storedWait) : []);
  }, []);

  const saveTables = (newTables: Table[]) => {
    localStorage.setItem('lunomi_tables', JSON.stringify(newTables));
    setTables(newTables);
  };

  const saveWaitlist = (newWaitlist: WaitlistItem[]) => {
    localStorage.setItem('lunomi_waitlist', JSON.stringify(newWaitlist));
    setWaitlist(newWaitlist);
  };

  const getStats = () => {
    return {
      total: tables.length,
      available: tables.filter(t => t.status === 'available').length,
      occupied: tables.filter(t => t.status === 'occupied').length,
      reserved: tables.filter(t => t.status === 'reserved').length,
    };
  };

  const openTableModal = (table: Table) => {
    setSelectedTable(table);
    setReserveName('');
    setShowTableModal(true);
  };

  const setStatus = (tableId: string, newStatus: Table['status']) => {
    const newTables = tables.map(t => {
      if (t.id === tableId) {
        return {
          ...t,
          status: newStatus,
          since: newStatus === 'occupied' ? new Date().toISOString() : null,
          reservedFor: newStatus === 'reserved' ? reserveName : null,
        };
      }
      return t;
    });
    saveTables(newTables);
    setShowTableModal(false);
  };

  const deleteTable = (tableId: string) => {
    if (confirm(`Hapus meja ${tableId}?`)) {
      saveTables(tables.filter(t => t.id !== tableId));
      setShowTableModal(false);
    }
  };

  const addTable = () => {
    const num = formData.tNum.trim().toUpperCase();
    if (!num) {
      alert('Nomor meja harus diisi');
      return;
    }
    if (tables.find(t => t.id === num)) {
      alert('Nomor meja sudah ada');
      return;
    }

    const newTables = [
      ...tables,
      {
        id: num,
        cap: parseInt(formData.tCap) || 4,
        loc: formData.tLoc.trim(),
        status: 'available' as const,
        since: null,
        reservedFor: null,
      },
    ];
    saveTables(newTables);
    setShowAddTable(false);
    setFormData({ tNum: '', tCap: '4', tLoc: '' });
  };

  const addToWaitlist = () => {
    const name = waitFormData.wName.trim();
    if (!name) {
      alert('Nama harus diisi');
      return;
    }

    const newWaitlist = [
      ...waitlist,
      {
        id: 'W-' + Date.now(),
        name,
        pax: parseInt(waitFormData.wPax) || 2,
        phone: waitFormData.wPhone.trim(),
        addedAt: new Date().toISOString(),
      },
    ];
    saveWaitlist(newWaitlist);
    setShowAddWait(false);
    setWaitFormData({ wName: '', wPax: '2', wPhone: '' });
  };

  const callWaitlist = (id: string) => {
    const item = waitlist.find(x => x.id === id);
    if (!item) return;

    if (item.phone) {
      const msg = `Halo *${item.name}*! Meja Anda sudah siap. Silakan masuk 🙏`;
      window.open(`https://wa.me/${item.phone.replace(/^0/, '62')}?text=${encodeURIComponent(msg)}`, '_blank');
    } else {
      alert(`Panggil: ${item.name} (${item.pax} orang)`);
    }

    saveWaitlist(waitlist.filter(x => x.id !== id));
  };

  const removeWaitlist = (id: string) => {
    if (confirm('Hapus dari daftar tunggu?')) {
      saveWaitlist(waitlist.filter(x => x.id !== id));
    }
  };

  const stats = getStats();

  return (
    <div className="flex min-h-screen" style={{ background: '#020617', backgroundImage: 'radial-gradient(ellipse 70% 50% at 10% 0%,rgba(34,197,94,.15) 0%,transparent 60%),radial-gradient(ellipse 60% 45% at 90% 100%,rgba(99,102,241,.1) 0%,transparent 60%)' }}>
      <Sidebar onLogout={signOut} />
      <main className="flex-1 min-h-screen lg:ml-64">
        <header className="sticky top-0 z-40 pl-14 pr-6 lg:px-8 py-4 flex items-center justify-between" style={{ background: 'rgba(2,6,23,.7)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
          <div>
            <h1 className="text-xl font-black text-white">Manajemen Meja</h1>
            <p className="text-xs text-white/40">Kelola status meja dan daftar tunggu</p>
          </div>
          <button onClick={() => setShowAddTable(true)} className="px-4 py-2 rounded-xl text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg,#059669,#047857)' }}>
            + Tambah Meja
          </button>
        </header>

        <div className="p-8 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Meja', val: stats.total, color: 'rgba(255,255,255,.8)' },
              { label: 'Tersedia', val: stats.available, color: '#4ade80' },
              { label: 'Terisi', val: stats.occupied, color: '#f87171' },
              { label: 'Reservasi', val: stats.reserved, color: '#fbbf24' },
            ].map(s => (
              <div key={s.label} className={`${GLASS} p-4`}>
                <p className="text-xs text-white/40 mb-1">{s.label}</p>
                <p className="text-2xl font-black" style={{ color: s.color }}>{s.val}</p>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-xs font-bold text-white/50">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>Tersedia
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>Terisi
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>Reservasi
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-500"></span>Dibersihkan
            </div>
          </div>

          {/* Table Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {tables.map(t => {
              const color = statusColors[t.status];
              return (
                <button
                  key={t.id}
                  onClick={() => openTableModal(t)}
                  className="rounded-2xl cursor-pointer transition-all text-center p-4 hover:scale-105"
                  style={{ background: color.bg, border: `1px solid ${color.text}40`, color: color.text }}
                >
                  <div className="text-xl mb-0.5">{color.icon}</div>
                  <div className="font-black text-sm">{t.id}</div>
                  <div className="text-[9px] font-bold opacity-60">{t.cap} Kursi</div>
                  {t.loc && <div className="text-[8px] opacity-40">{t.loc}</div>}
                  {t.status === 'occupied' && t.since && (
                    <p className="text-[9px] mt-0.5 opacity-60">{elapsedSince(t.since)}</p>
                  )}
                  {t.status === 'reserved' && t.reservedFor && (
                    <p className="text-[9px] mt-0.5 opacity-70 truncate">{t.reservedFor}</p>
                  )}
                </button>
              );
            })}
          </div>

          {/* Waitlist */}
          <div className={GLASS}>
            <div className="p-4 border-b border-white/5 flex justify-between items-center">
              <h3 className="font-bold text-sm">Daftar Tunggu (Waitlist)</h3>
              <button
                onClick={() => {
                  setWaitFormData({ wName: '', wPax: '2', wPhone: '' });
                  setShowAddWait(true);
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold"
                style={{ background: 'rgba(99,102,241,.2)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,.3)' }}
              >
                + Tambah
              </button>
            </div>
            {waitlist.length === 0 ? (
              <p className="py-8 text-center text-white/25 text-sm">Tidak ada antrian</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-[10px] font-bold uppercase text-white/30 bg-white/5">
                      <th className="px-4 py-3">No.</th>
                      <th className="px-4 py-3">Nama</th>
                      <th className="px-4 py-3 text-center">Tamu</th>
                      <th className="px-4 py-3">Tunggu</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {waitlist.map((w, i) => (
                      <tr key={w.id} className="hover:bg-white/5 transition">
                        <td className="px-4 py-3 font-black text-indigo-400">#{String(i + 1).padStart(2, '0')}</td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-sm">{w.name}</div>
                          {w.phone && <div className="text-xs text-white/35">{w.phone}</div>}
                        </td>
                        <td className="px-4 py-3 text-center font-bold">{w.pax}</td>
                        <td className="px-4 py-3 text-white/40">{elapsedSince(w.addedAt)}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => callWaitlist(w.id)}
                              className="px-2 py-1 rounded-lg text-[10px] font-bold"
                              style={{ background: 'rgba(34,197,94,.15)', color: '#6ee7b7', border: '1px solid rgba(34,197,94,.25)' }}
                            >
                              Panggil
                            </button>
                            <button
                              onClick={() => removeWaitlist(w.id)}
                              className="px-2 py-1 rounded-lg text-[10px] font-bold"
                              style={{ background: 'rgba(239,68,68,.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,.2)' }}
                            >
                              ✕
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Table Action Modal */}
      {showTableModal && selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(8px)' }}>
          <div className="rounded-2xl p-6 w-full max-w-sm shadow-2xl" style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,.1)' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">Meja {selectedTable.id} — {statusLabels[selectedTable.status]}</h3>
              <button onClick={() => setShowTableModal(false)} className="text-white/40 hover:text-white text-xl">✕</button>
            </div>

            <p className="text-xs text-white/40 mb-3">{selectedTable.cap} Kursi • {selectedTable.loc || 'Indoor'}</p>

            <div className="space-y-2.5">
              {selectedTable.status === 'available' && (
                <>
                  <button
                    onClick={() => setStatus(selectedTable.id, 'occupied')}
                    className="w-full py-2.5 rounded-xl text-sm font-bold mb-2"
                    style={{ background: 'rgba(239,68,68,.2)', color: '#f87171', border: '1px solid rgba(239,68,68,.3)' }}
                  >
                    🍽️ Duduki (Dine In)
                  </button>
                  <input
                    type="text"
                    placeholder="Nama reservasi"
                    value={reserveName}
                    onChange={(e) => setReserveName(e.target.value)}
                    className={INPUT}
                  />
                  <button
                    onClick={() => setStatus(selectedTable.id, 'reserved')}
                    className="w-full py-2.5 rounded-xl text-sm font-bold"
                    style={{ background: 'rgba(245,158,11,.2)', color: '#fbbf24', border: '1px solid rgba(245,158,11,.3)' }}
                  >
                    🕐 Reservasi
                  </button>
                </>
              )}

              {selectedTable.status === 'occupied' && (
                <>
                  {selectedTable.since && (
                    <p className="text-xs text-white/40">Terisi sejak: {elapsedSince(selectedTable.since)} lalu</p>
                  )}
                  <button
                    onClick={() => setStatus(selectedTable.id, 'cleaning')}
                    className="w-full py-2.5 rounded-xl text-sm font-bold mb-2"
                    style={{ background: 'rgba(139,92,246,.2)', color: '#c4b5fd', border: '1px solid rgba(139,92,246,.3)' }}
                  >
                    🧹 Selesai — Bersihkan
                  </button>
                  <button
                    onClick={() => setStatus(selectedTable.id, 'available')}
                    className="w-full py-2.5 rounded-xl text-sm font-bold"
                    style={{ background: 'rgba(34,197,94,.15)', color: '#6ee7b7', border: '1px solid rgba(34,197,94,.25)' }}
                  >
                    ✓ Langsung Tersedia
                  </button>
                </>
              )}

              {selectedTable.status === 'reserved' && (
                <>
                  {selectedTable.reservedFor && (
                    <p className="text-xs text-amber-300">Untuk: {selectedTable.reservedFor}</p>
                  )}
                  <button
                    onClick={() => setStatus(selectedTable.id, 'occupied')}
                    className="w-full py-2.5 rounded-xl text-sm font-bold mb-2"
                    style={{ background: 'rgba(239,68,68,.2)', color: '#f87171', border: '1px solid rgba(239,68,68,.3)' }}
                  >
                    🍽️ Check In
                  </button>
                  <button
                    onClick={() => setStatus(selectedTable.id, 'available')}
                    className="w-full py-2.5 rounded-xl text-sm font-bold"
                    style={{ background: 'rgba(255,255,255,.07)', color: 'rgba(255,255,255,.5)', border: '1px solid rgba(255,255,255,.1)' }}
                  >
                    ✕ Batalkan Reservasi
                  </button>
                </>
              )}

              {selectedTable.status === 'cleaning' && (
                <button
                  onClick={() => setStatus(selectedTable.id, 'available')}
                  className="w-full py-2.5 rounded-xl text-sm font-bold"
                  style={{ background: 'rgba(34,197,94,.2)', color: '#6ee7b7', border: '1px solid rgba(34,197,94,.3)' }}
                >
                  ✓ Selesai Dibersihkan
                </button>
              )}

              <button
                onClick={() => deleteTable(selectedTable.id)}
                className="w-full py-2 rounded-xl text-xs font-semibold mt-4"
                style={{ background: 'rgba(239,68,68,.06)', color: 'rgba(239,68,68,.45)', border: '1px solid rgba(239,68,68,.12)' }}
              >
                Hapus Meja Ini
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Table Modal */}
      {showAddTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(8px)' }}>
          <div className="rounded-2xl p-6 w-full max-w-sm shadow-2xl" style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,.1)' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">Tambah Meja</h3>
              <button onClick={() => setShowAddTable(false)} className="text-white/40 hover:text-white text-xl">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-white/40 mb-1 block">Nomor Meja *</label>
                <input
                  type="text"
                  value={formData.tNum}
                  onChange={(e) => setFormData({ ...formData, tNum: e.target.value })}
                  className={INPUT}
                  placeholder="Contoh: T-07, VIP-01"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-white/40 mb-1 block">Kapasitas (Kursi)</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={formData.tCap}
                  onChange={(e) => setFormData({ ...formData, tCap: e.target.value })}
                  className={INPUT}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-white/40 mb-1 block">Lokasi</label>
                <input
                  type="text"
                  value={formData.tLoc}
                  onChange={(e) => setFormData({ ...formData, tLoc: e.target.value })}
                  className={INPUT}
                  placeholder="Indoor, Outdoor, VIP…"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAddTable(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.6)' }}>
                Batal
              </button>
              <button
                onClick={addTable}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#059669,#047857)' }}
              >
                Tambah
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Waitlist Add Modal */}
      {showAddWait && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(8px)' }}>
          <div className="rounded-2xl p-6 w-full max-w-sm shadow-2xl" style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,.1)' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">Tambah ke Waitlist</h3>
              <button onClick={() => setShowAddWait(false)} className="text-white/40 hover:text-white text-xl">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-white/40 mb-1 block">Nama *</label>
                <input
                  type="text"
                  value={waitFormData.wName}
                  onChange={(e) => setWaitFormData({ ...waitFormData, wName: e.target.value })}
                  className={INPUT}
                  placeholder="Nama pelanggan"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-white/40 mb-1 block">Jumlah Orang</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={waitFormData.wPax}
                  onChange={(e) => setWaitFormData({ ...waitFormData, wPax: e.target.value })}
                  className={INPUT}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-white/40 mb-1 block">No. HP</label>
                <input
                  type="tel"
                  value={waitFormData.wPhone}
                  onChange={(e) => setWaitFormData({ ...waitFormData, wPhone: e.target.value })}
                  className={INPUT}
                  placeholder="08xxxxxxxxxx"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAddWait(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.6)' }}>
                Batal
              </button>
              <button
                onClick={addToWaitlist}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}
              >
                Tambah
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
