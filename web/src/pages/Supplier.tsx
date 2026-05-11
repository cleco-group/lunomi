import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import Sidebar from '../components/Sidebar';

interface Supplier {
  id: string;
  name: string;
  pic: string;
  phone: string;
  category: 'Bahan Pokok' | 'Daging & Ikan' | 'Sayuran' | 'Minuman' | 'Kemasan' | 'Elektronik' | 'Lainnya';
  email: string;
  address: string;
  note: string;
  createdAt: string;
}

const GLASS = 'rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm';
const INPUT = 'w-full px-3 py-2.5 rounded-xl text-sm bg-white/7 border border-white/15 text-white placeholder:text-white/35 focus:border-indigo-500/70 focus:ring-3 focus:ring-indigo-500/15 outline-none transition';

const CATEGORIES = ['Bahan Pokok', 'Daging & Ikan', 'Sayuran', 'Minuman', 'Kemasan', 'Elektronik', 'Lainnya'] as const;

const CAT_COLORS: Record<string, { bg: string; color: string }> = {
  'Bahan Pokok': { bg: 'rgba(99,102,241,.15)', color: '#a5b4fc' },
  'Daging & Ikan': { bg: 'rgba(239,68,68,.15)', color: '#fca5a5' },
  'Sayuran': { bg: 'rgba(34,197,94,.15)', color: '#86efac' },
  'Minuman': { bg: 'rgba(59,130,246,.15)', color: '#93c5fd' },
  'Kemasan': { bg: 'rgba(245,158,11,.15)', color: '#fcd34d' },
  'Elektronik': { bg: 'rgba(139,92,246,.15)', color: '#c4b5fd' },
  'Lainnya': { bg: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.5)' },
};

const DEFAULT_SUPPLIERS: Supplier[] = [
  { id: 'SUP-1', name: 'PT Sumber Makmur', pic: 'Budi Santoso', phone: '0812-3456-7890', category: 'Bahan Pokok', email: 'budi@sumber.co.id', address: 'Jl. Raya Bogor Km 25', note: 'Min order 50kg, pengiriman setiap hari Rabu', createdAt: new Date().toISOString() },
  { id: 'SUP-2', name: 'UD Daging Segar', pic: 'Ibu Siti', phone: '0821-1234-5678', category: 'Daging & Ikan', email: 'dagingsegar@ud.co.id', address: 'Pasar Blok M, Jakarta', note: 'Harga termurah, garansi kesegaran', createdAt: new Date().toISOString() },
];

export default function Supplier() {
  const { signOut } = useSupabaseAuth();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<{
    name: string;
    pic: string;
    phone: string;
    category: 'Bahan Pokok' | 'Daging & Ikan' | 'Sayuran' | 'Minuman' | 'Kemasan' | 'Elektronik' | 'Lainnya';
    email: string;
    address: string;
    note: string;
  }>({
    name: '',
    pic: '',
    phone: '',
    category: 'Bahan Pokok',
    email: '',
    address: '',
    note: '',
  });

  useEffect(() => {
    const stored = localStorage.getItem('lunomi_suppliers');
    setSuppliers(stored ? JSON.parse(stored) : DEFAULT_SUPPLIERS);
  }, []);

  const saveSuppliers = (newSuppliers: Supplier[]) => {
    localStorage.setItem('lunomi_suppliers', JSON.stringify(newSuppliers));
    setSuppliers(newSuppliers);
  };

  const rp = (n: number) => 'Rp ' + (n || 0).toLocaleString('id-ID');

  const filteredSuppliers = () => {
    return suppliers.filter(s => {
      const matchCategory = categoryFilter === 'all' || s.category === categoryFilter;
      const q = search.toLowerCase();
      const matchSearch = !q ||
        s.name.toLowerCase().includes(q) ||
        (s.pic || '').toLowerCase().includes(q) ||
        (s.phone || '').includes(q);
      return matchCategory && matchSearch;
    });
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', pic: '', phone: '', category: 'Bahan Pokok', email: '', address: '', note: '' });
    setError('');
    setShowModal(true);
  };

  const openEditModal = (supplier: Supplier) => {
    setEditingId(supplier.id);
    setFormData({
      name: supplier.name,
      pic: supplier.pic,
      phone: supplier.phone,
      category: supplier.category,
      email: supplier.email,
      address: supplier.address,
      note: supplier.note,
    });
    setError('');
    setShowModal(true);
  };

  const saveSupplier = () => {
    if (!formData.name.trim()) {
      setError('Nama supplier harus diisi.');
      return;
    }
    if (!formData.phone.trim()) {
      setError('No. telepon harus diisi.');
      return;
    }
    setError('');

    const newSuppliers = [...suppliers];
    if (editingId !== null) {
      const idx = newSuppliers.findIndex(s => s.id === editingId);
      if (idx >= 0) {
        newSuppliers[idx] = { ...newSuppliers[idx], ...formData };
      }
    } else {
      const newSupplier: Supplier = {
        id: 'SUP-' + Date.now(),
        ...formData,
        createdAt: new Date().toISOString(),
      };
      newSuppliers.unshift(newSupplier);
    }

    saveSuppliers(newSuppliers);
    setShowModal(false);
  };

  const deleteSupplier = (id: string) => {
    const supplier = suppliers.find(s => s.id === id);
    if (!supplier) return;
    if (confirm(`Hapus supplier "${supplier.name}"?`)) {
      saveSuppliers(suppliers.filter(s => s.id !== id));
    }
  };

  const filtered = filteredSuppliers();
  const totalSuppliers = suppliers.length;
  const totalPOs = 0;
  const totalValue = 0;
  const activeCats = new Set(suppliers.map(s => s.category)).size;

  const getInitials = (name: string) => name.split(' ').slice(0, 2).map(w => w[0] || '').join('').toUpperCase();

  return (
    <div className="flex min-h-screen" style={{ background: '#020617', backgroundImage: 'radial-gradient(ellipse 70% 50% at 10% 0%,rgba(99,102,241,.25) 0%,transparent 60%),radial-gradient(ellipse 60% 45% at 90% 100%,rgba(16,185,129,.12) 0%,transparent 60%)' }}>
      <Sidebar onLogout={signOut} />
      <main className="flex-1 min-h-screen lg:ml-64">
        <header className="sticky top-0 z-40 px-8 py-4 flex items-center justify-between" style={{ background: 'rgba(2,6,23,.7)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
          <div>
            <h1 className="text-xl font-black text-white">Manajemen Supplier</h1>
            <p className="text-xs text-white/40">Kelola semua supplier bahan baku</p>
          </div>
          <button onClick={openAddModal} className="px-4 py-2 rounded-xl text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>
            + Tambah Supplier
          </button>
        </header>

        <div className="p-8 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className={`${GLASS} p-4 rounded-2xl`}>
              <div className="text-xs mb-1" style={{ color: 'rgba(255,255,255,.4)' }}>Total Supplier</div>
              <div className="text-2xl font-black text-white">{totalSuppliers}</div>
            </div>
            <div className={`${GLASS} p-4 rounded-2xl`}>
              <div className="text-xs mb-1 text-indigo-400">Total PO</div>
              <div className="text-2xl font-black text-indigo-400">{totalPOs}</div>
            </div>
            <div className={`${GLASS} p-4 rounded-2xl`}>
              <div className="text-xs mb-1 text-amber-400">Nilai Pembelian</div>
              <div className="text-lg font-black text-amber-400">{rp(totalValue)}</div>
            </div>
            <div className={`${GLASS} p-4 rounded-2xl`}>
              <div className="text-xs mb-1 text-green-400">Kategori Aktif</div>
              <div className="text-2xl font-black text-green-400">{activeCats}</div>
            </div>
          </div>

          {/* Search + Filter */}
          <div className={`${GLASS} p-4 flex flex-wrap gap-3 items-center`}>
            <input
              type="text"
              placeholder="🔍 Cari nama, PIC, telepon..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${INPUT} flex-1 min-w-48`}
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={INPUT}
            >
              <option value="all">Semua Kategori</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Supplier List */}
          <div className={`${GLASS} rounded-2xl overflow-hidden`}>
            {filtered.length === 0 ? (
              <div className="py-16 text-center">
                <div className="text-5xl mb-3">🏭</div>
                <div className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,.4)' }}>Belum ada supplier</div>
                <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,.25)' }}>Tambahkan supplier bahan baku outlet Anda</div>
              </div>
            ) : (
              <div>
                {filtered.map(s => {
                  const cc = CAT_COLORS[s.category] || CAT_COLORS['Lainnya'];
                  const initials = getInitials(s.name);
                  return (
                    <div key={s.id} className="px-5 py-4 flex items-center gap-4 border-b border-white/5 hover:bg-white/5 transition" style={{ borderBottomColor: 'rgba(255,255,255,.05)' }}>
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black" style={{ background: cc.bg, color: cc.color }}>
                        {initials || 'S'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-white text-sm">{s.name}</span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: cc.bg, color: cc.color }}>
                            {s.category}
                          </span>
                        </div>
                        <div className="text-xs mt-0.5 flex gap-3 flex-wrap" style={{ color: 'rgba(255,255,255,.35)' }}>
                          {s.pic && <span>👤 {s.pic}</span>}
                          {s.phone && <span>📞 {s.phone}</span>}
                        </div>
                        {s.note && <div className="text-xs mt-0.5 italic" style={{ color: 'rgba(255,255,255,.25)' }}>{s.note}</div>}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {s.phone && (
                          <button className="text-xs px-3 py-1.5 rounded-lg font-semibold" style={{ background: 'rgba(34,197,94,.1)', color: '#4ade80' }}>
                            WA
                          </button>
                        )}
                        <button onClick={() => openEditModal(s)} className="text-xs px-3 py-1.5 rounded-lg font-semibold" style={{ background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.6)' }}>
                          Edit
                        </button>
                        <button onClick={() => deleteSupplier(s.id)} className="text-xs px-3 py-1.5 rounded-lg font-semibold" style={{ background: 'rgba(239,68,68,.1)', color: '#f87171' }}>
                          Hapus
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(8px)' }}>
          <div className={`${GLASS} rounded-2xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto`}>
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,.08)' }}>
              <h2 className="font-bold text-white">{editingId ? 'Edit Supplier' : 'Tambah Supplier'}</h2>
              <button onClick={() => setShowModal(false)} style={{ color: 'rgba(255,255,255,.4)' }} className="hover:text-white text-xl font-bold">
                ×
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-white/50 mb-1.5 block">Nama Perusahaan / Supplier *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={INPUT}
                  placeholder="PT Sumber Makmur"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-white/50 mb-1.5 block">PIC / Nama Kontak</label>
                  <input
                    type="text"
                    value={formData.pic}
                    onChange={(e) => setFormData({ ...formData, pic: e.target.value })}
                    className={INPUT}
                    placeholder="Bpk. Budi"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/50 mb-1.5 block">No. Telepon *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={INPUT}
                    placeholder="0812..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-white/50 mb-1.5 block">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      const val = e.target.value as 'Bahan Pokok' | 'Daging & Ikan' | 'Sayuran' | 'Minuman' | 'Kemasan' | 'Elektronik' | 'Lainnya';
                      setFormData({ ...formData, category: val });
                    }}
                    className={INPUT}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/50 mb-1.5 block">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={INPUT}
                    placeholder="email@..."
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-white/50 mb-1.5 block">Alamat</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                  className={INPUT}
                  placeholder="Alamat lengkap..."
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-white/50 mb-1.5 block">Catatan</label>
                <input
                  type="text"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className={INPUT}
                  placeholder="Min. order, jadwal pengiriman, dll..."
                />
              </div>

              {error && (
                <div className="px-3 py-2 rounded-xl text-xs" style={{ background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.3)', color: '#fca5a5' }}>
                  {error}
                </div>
              )}
            </div>

            <div className="px-6 pb-5 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.7)' }}>
                Batal
              </button>
              <button onClick={saveSupplier} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
