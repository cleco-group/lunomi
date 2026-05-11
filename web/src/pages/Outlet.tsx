import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import Sidebar from '../components/Sidebar';

interface Outlet {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  manager: string;
  status: 'online' | 'offline' | 'maintenance';
  openTime: string;
  closeTime: string;
  revenue: number;
  employees: number;
  createdAt: string;
}

const GLASS = 'rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm';
const INPUT = 'w-full px-3 py-2.5 rounded-xl text-sm bg-white/7 border border-white/15 text-white placeholder:text-white/35 focus:border-indigo-500/70 focus:ring-3 focus:ring-indigo-500/15 outline-none transition';

const DEFAULT_OUTLETS: Outlet[] = [
  { id: 'out_1', name: 'Lunomi Sudirman', address: 'Jl. Sudirman No. 123', city: 'Jakarta Pusat', phone: '021-5555-0001', manager: 'Budi Santoso', status: 'online', openTime: '09:00', closeTime: '23:00', revenue: 150000000, employees: 15, createdAt: new Date().toISOString() },
  { id: 'out_2', name: 'Lunomi Senayan', address: 'Jl. Asia Afrika No. 50', city: 'Jakarta Selatan', phone: '021-5555-0002', manager: 'Siti Nurhaliza', status: 'online', openTime: '10:00', closeTime: '22:00', revenue: 120000000, employees: 12, createdAt: new Date().toISOString() },
];

export default function Outlet() {
  const { signOut } = useSupabaseAuth();
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedOutletId, setSelectedOutletId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    address: string;
    city: string;
    phone: string;
    manager: string;
    status: 'online' | 'offline' | 'maintenance';
    openTime: string;
    closeTime: string;
  }>({
    name: '',
    address: '',
    city: '',
    phone: '',
    manager: '',
    status: 'online',
    openTime: '09:00',
    closeTime: '22:00',
  });

  useEffect(() => {
    const stored = localStorage.getItem('lunomi_outlets');
    setOutlets(stored ? JSON.parse(stored) : DEFAULT_OUTLETS);
  }, []);

  const saveOutlets = (newOutlets: Outlet[]) => {
    localStorage.setItem('lunomi_outlets', JSON.stringify(newOutlets));
    setOutlets(newOutlets);
  };

  const filteredOutlets = () => {
    return outlets.filter(o => {
      const matchSearch = search.toLowerCase() === '' ||
        o.name.toLowerCase().includes(search.toLowerCase()) ||
        (o.address || '').toLowerCase().includes(search.toLowerCase()) ||
        (o.city || '').toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === '' || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', address: '', city: '', phone: '', manager: '', status: 'online', openTime: '09:00', closeTime: '22:00' });
    setShowModal(true);
  };

  const openEditModal = (outlet: Outlet) => {
    setEditingId(outlet.id);
    const newStatus: 'online' | 'offline' | 'maintenance' = outlet.status;
    setFormData({
      name: outlet.name,
      address: outlet.address,
      city: outlet.city,
      phone: outlet.phone,
      manager: outlet.manager,
      status: newStatus,
      openTime: outlet.openTime,
      closeTime: outlet.closeTime,
    });
    setShowModal(true);
  };

  const saveOutlet = () => {
    if (!formData.name.trim() || !formData.address.trim() || !formData.city.trim()) {
      alert('Nama, alamat, dan kota wajib diisi.');
      return;
    }

    const newOutlets = [...outlets];
    if (editingId !== null) {
      const idx = newOutlets.findIndex(o => o.id === editingId);
      if (idx >= 0) {
        newOutlets[idx] = { ...newOutlets[idx], ...formData };
      }
    } else {
      const newOutlet: Outlet = {
        id: 'out_' + Date.now(),
        ...formData,
        revenue: 0,
        employees: 0,
        createdAt: new Date().toISOString(),
      };
      newOutlets.push(newOutlet);
    }

    saveOutlets(newOutlets);
    setShowModal(false);
  };

  const deleteOutlet = (id: string) => {
    const outlet = outlets.find(o => o.id === id);
    if (confirm(`Hapus outlet "${outlet?.name}"?`)) {
      saveOutlets(outlets.filter(o => o.id !== id));
    }
  };

  const openDetail = (id: string) => {
    setSelectedOutletId(id);
    setShowDetail(true);
  };

  const filtered = filteredOutlets();
  const totalOutlets = outlets.length;
  const onlineCount = outlets.filter(o => o.status === 'online').length;
  const offlineCount = outlets.filter(o => o.status === 'offline').length;
  const totalRevenue = outlets.reduce((s, o) => s + (o.revenue || 0), 0);

  const selectedOutlet = outlets.find(o => o.id === selectedOutletId);

  const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
    online: { label: 'Online', color: 'emerald', dot: 'bg-emerald-500' },
    offline: { label: 'Offline', color: 'red', dot: 'bg-red-500' },
    maintenance: { label: 'Maintenance', color: 'yellow', dot: 'bg-yellow-500' },
  };

  const getStatusStyle = (status: string) => {
    const cfg = statusConfig[status] || statusConfig.offline;
    const colorMap = {
      emerald: 'bg-emerald-500/20 text-emerald-400',
      red: 'bg-red-500/20 text-red-400',
      yellow: 'bg-yellow-500/20 text-yellow-400',
    };
    return colorMap[cfg.color as keyof typeof colorMap] || colorMap.red;
  };

  const formatRevenue = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

  return (
    <div className="flex min-h-screen" style={{ background: '#020617', backgroundImage: 'radial-gradient(ellipse 70% 50% at 10% 0%,rgba(99,102,241,.25) 0%,transparent 60%),radial-gradient(ellipse 60% 45% at 90% 100%,rgba(16,185,129,.12) 0%,transparent 60%)' }}>
      <Sidebar onLogout={signOut} />
      <main className="flex-1 min-h-screen" style={{ marginLeft: '256px' }}>
        <header className="sticky top-0 z-40 px-8 py-4 flex items-center justify-between" style={{ background: 'rgba(2,6,23,.7)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
          <div>
            <h1 className="text-xl font-black text-white">Manajemen Outlet</h1>
            <p className="text-xs text-white/40">Kelola semua outlet Lunomi</p>
          </div>
          <button onClick={openAddModal} className="px-4 py-2 rounded-xl text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>
            + Tambah Outlet
          </button>
        </header>

        <div className="p-8 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className={`${GLASS} p-5 rounded-2xl border-l-4 border-indigo-500`}>
              <p className="text-xs font-bold text-white/40 uppercase mb-1">Total Outlet</p>
              <h3 className="text-2xl font-black">{totalOutlets}</h3>
            </div>
            <div className={`${GLASS} p-5 rounded-2xl border-l-4 border-emerald-500`}>
              <p className="text-xs font-bold text-white/40 uppercase mb-1">Online</p>
              <h3 className="text-2xl font-black text-emerald-400">{onlineCount}</h3>
            </div>
            <div className={`${GLASS} p-5 rounded-2xl border-l-4 border-red-500`}>
              <p className="text-xs font-bold text-white/40 uppercase mb-1">Offline</p>
              <h3 className="text-2xl font-black text-red-400">{offlineCount}</h3>
            </div>
            <div className={`${GLASS} p-5 rounded-2xl border-l-4 border-orange-500`}>
              <p className="text-xs font-bold text-white/40 uppercase mb-1">Total Revenue</p>
              <h3 className="text-2xl font-black">{formatRevenue(totalRevenue)}</h3>
            </div>
          </div>

          {/* Filter */}
          <div className={`${GLASS} p-4 flex flex-wrap gap-3 items-center`}>
            <input
              type="text"
              placeholder="Cari outlet..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${INPUT} flex-1 min-w-48`}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={INPUT}
            >
              <option value="">Semua Status</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          {/* Outlet Grid */}
          {filtered.length === 0 ? (
            <div className="py-20 text-center">
              <div className="text-5xl mb-3">🏪</div>
              <div className="text-sm font-semibold text-white/40">Belum ada outlet</div>
              <button onClick={openAddModal} className="text-indigo-400 cursor-pointer text-sm mt-2 hover:text-indigo-300">
                Klik "Tambah Outlet" untuk memulai
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(o => {
                const cfg = statusConfig[o.status] || statusConfig.offline;
                const borderColorMap = { emerald: 'border-emerald-500', red: 'border-red-500', yellow: 'border-yellow-500' };
                const borderColor = borderColorMap[cfg.color as keyof typeof borderColorMap] || borderColorMap.red;

                return (
                  <div key={o.id} className={`${GLASS} p-6 border-l-4 ${borderColor} transition-all hover:bg-white/10 hover:-translate-y-1`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-base leading-tight">{o.name}</h4>
                        <p className="text-xs text-white/50 mt-0.5">{o.city || '-'}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-md ${getStatusStyle(o.status)} text-xs font-bold uppercase flex items-center gap-1 shrink-0`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-white/40 mb-4 line-clamp-2">{o.address || 'Alamat belum diisi'}</p>
                    <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                      <div className={`${GLASS} rounded-xl p-2.5`}>
                        <p className="text-white/40 mb-0.5">Revenue</p>
                        <p className="font-bold">{formatRevenue(o.revenue)}</p>
                      </div>
                      <div className={`${GLASS} rounded-xl p-2.5`}>
                        <p className="text-white/40 mb-0.5">Karyawan</p>
                        <p className="font-bold">{o.employees} org</p>
                      </div>
                      <div className={`${GLASS} rounded-xl p-2.5`}>
                        <p className="text-white/40 mb-0.5">Jam Operasional</p>
                        <p className="font-bold">{o.openTime} – {o.closeTime}</p>
                      </div>
                      <div className={`${GLASS} rounded-xl p-2.5`}>
                        <p className="text-white/40 mb-0.5">Manager</p>
                        <p className="font-bold truncate">{o.manager || '-'}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openDetail(o.id)} className={`${GLASS} flex-1 py-2 rounded-xl text-xs font-semibold hover:bg-white/10 transition`}>
                        Detail
                      </button>
                      <button onClick={() => openEditModal(o)} className={`${GLASS} flex-1 py-2 rounded-xl text-xs font-semibold hover:bg-white/10 transition`}>
                        Edit
                      </button>
                      <button onClick={() => deleteOutlet(o.id)} className={`${GLASS} py-2 px-3 rounded-xl text-xs font-semibold hover:bg-red-500/20 text-red-400 transition`}>
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(8px)' }}>
          <div className={`${GLASS} rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto`}>
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,.08)' }}>
              <h2 className="font-bold text-white">{editingId ? 'Edit Outlet' : 'Tambah Outlet Baru'}</h2>
              <button onClick={() => setShowModal(false)} style={{ color: 'rgba(255,255,255,.4)' }} className="hover:text-white text-xl font-bold">
                ×
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-white/50 mb-1.5 block">Nama Outlet *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={INPUT}
                    placeholder="Outlet Jl. Sudirman"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-white/50 mb-1.5 block">Alamat *</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={2}
                    className={INPUT}
                    placeholder="Alamat lengkap"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/50 mb-1.5 block">Kota *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className={INPUT}
                    placeholder="Jakarta"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/50 mb-1.5 block">No. Telepon</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={INPUT}
                    placeholder="021-XXXX-XXXX"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/50 mb-1.5 block">Manager</label>
                  <input
                    type="text"
                    value={formData.manager}
                    onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                    className={INPUT}
                    placeholder="Nama manager"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/50 mb-1.5 block">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'online' | 'offline' | 'maintenance' })}
                    className={INPUT}
                  >
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/50 mb-1.5 block">Jam Buka</label>
                  <input
                    type="time"
                    value={formData.openTime}
                    onChange={(e) => setFormData({ ...formData, openTime: e.target.value })}
                    className={INPUT}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/50 mb-1.5 block">Jam Tutup</label>
                  <input
                    type="time"
                    value={formData.closeTime}
                    onChange={(e) => setFormData({ ...formData, closeTime: e.target.value })}
                    className={INPUT}
                  />
                </div>
              </div>
            </div>

            <div className="px-6 pb-5 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.7)' }}>
                Batal
              </button>
              <button onClick={saveOutlet} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && selectedOutlet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(8px)' }}>
          <div className={`${GLASS} rounded-2xl w-full max-w-md shadow-2xl overflow-hidden`}>
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,.08)' }}>
              <h3 className="text-lg font-bold">Detail Outlet</h3>
              <button onClick={() => setShowDetail(false)} style={{ color: 'rgba(255,255,255,.4)' }} className="hover:text-white text-xl font-bold">
                ×
              </button>
            </div>
            <div className="px-6 py-5">
              <div className={`${GLASS} rounded-xl p-4 space-y-3`}>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40 text-xs">Nama</span>
                  <span className="font-bold text-right max-w-48">{selectedOutlet.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40 text-xs">Kota</span>
                  <span>{selectedOutlet.city || '-'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40 text-xs">Alamat</span>
                  <span className="text-right max-w-48">{selectedOutlet.address || '-'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40 text-xs">Telepon</span>
                  <span>{selectedOutlet.phone || '-'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40 text-xs">Manager</span>
                  <span>{selectedOutlet.manager || '-'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40 text-xs">Jam Operasional</span>
                  <span>{selectedOutlet.openTime} – {selectedOutlet.closeTime}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40 text-xs">Status</span>
                  <span className={`px-2 py-0.5 rounded-md text-xs font-bold uppercase ${getStatusStyle(selectedOutlet.status)}`}>{statusConfig[selectedOutlet.status]?.label}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
