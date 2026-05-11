import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import Sidebar from '../components/Sidebar';
import toast from 'react-hot-toast';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  stock: number;
  minStock: number;
  price: number;
  updatedAt: string;
}

const CATS = ['Bahan Makanan', 'Minuman', 'Bumbu', 'Packaging', 'Lainnya'];
const UNITS = ['kg', 'gram', 'liter', 'ml', 'pcs', 'botol', 'karton'];

const GLASS = 'rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm';
const INPUT = 'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white text-sm placeholder-white/30 focus:border-indigo-500/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all';

function getStatus(stock: number, min: number) {
  if (stock === 0) return 'empty';
  if (stock <= min) return 'alert';
  if (stock <= min * 1.5) return 'warning';
  return 'ok';
}

const STATUS_STYLE: Record<string, string> = {
  ok: 'bg-green-500/15 text-green-400 border border-green-500/30',
  warning: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  alert: 'bg-red-500/15 text-red-400 border border-red-500/30',
  empty: 'bg-red-900/30 text-red-300 border border-red-500/50',
};

const STATUS_LABEL: Record<string, string> = { ok: 'OK', warning: 'Warning', alert: 'Kritis', empty: 'Habis' };

const DEMO_ITEMS: InventoryItem[] = [
  { id: '1', name: 'Beras Premium', category: 'Bahan Makanan', unit: 'kg', stock: 50, minStock: 20, price: 12000, updatedAt: new Date().toISOString() },
  { id: '2', name: 'Minyak Goreng', category: 'Bahan Makanan', unit: 'liter', stock: 8, minStock: 10, price: 18000, updatedAt: new Date().toISOString() },
  { id: '3', name: 'Kecap Manis', category: 'Bumbu', unit: 'botol', stock: 12, minStock: 6, price: 15000, updatedAt: new Date().toISOString() },
  { id: '4', name: 'Ayam Segar', category: 'Bahan Makanan', unit: 'kg', stock: 5, minStock: 10, price: 35000, updatedAt: new Date().toISOString() },
  { id: '5', name: 'Es Batu', category: 'Minuman', unit: 'kg', stock: 0, minStock: 5, price: 5000, updatedAt: new Date().toISOString() },
  { id: '6', name: 'Gula Pasir', category: 'Bumbu', unit: 'kg', stock: 25, minStock: 10, price: 14000, updatedAt: new Date().toISOString() },
];

const EMPTY_FORM: Omit<InventoryItem, 'id' | 'updatedAt'> = {
  name: '', category: 'Bahan Makanan', unit: 'kg', stock: 0, minStock: 5, price: 0
};

export default function Inventory() {
  const { signOut } = useSupabaseAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCat, setFilterCat] = useState('all');
  const [modal, setModal] = useState<'add' | 'edit' | 'adjust' | null>(null);
  const [selected, setSelected] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [adjustQty, setAdjustQty] = useState(0);
  const [adjustType, setAdjustType] = useState<'in' | 'out'>('in');

  useEffect(() => {
    const stored = localStorage.getItem('lunomi_inventory');
    setItems(stored ? JSON.parse(stored) : DEMO_ITEMS);
  }, []);

  const save = (updated: InventoryItem[]) => {
    setItems(updated);
    localStorage.setItem('lunomi_inventory', JSON.stringify(updated));
  };

  const filtered = items.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || getStatus(i.stock, i.minStock) === filterStatus;
    const matchCat = filterCat === 'all' || i.category === filterCat;
    return matchSearch && matchStatus && matchCat;
  });

  const stats = {
    total: items.length,
    ok: items.filter(i => getStatus(i.stock, i.minStock) === 'ok').length,
    warning: items.filter(i => getStatus(i.stock, i.minStock) === 'warning').length,
    alert: items.filter(i => ['alert', 'empty'].includes(getStatus(i.stock, i.minStock))).length,
  };

  const openAdd = () => { setForm(EMPTY_FORM); setModal('add'); };
  const openEdit = (item: InventoryItem) => { setSelected(item); setForm({ name: item.name, category: item.category, unit: item.unit, stock: item.stock, minStock: item.minStock, price: item.price }); setModal('edit'); };
  const openAdjust = (item: InventoryItem) => { setSelected(item); setAdjustQty(0); setAdjustType('in'); setModal('adjust'); };

  const handleAdd = () => {
    if (!form.name.trim()) { toast.error('Nama item harus diisi'); return; }
    const item: InventoryItem = { ...form, id: Date.now().toString(), updatedAt: new Date().toISOString() };
    save([...items, item]);
    setModal(null);
    toast.success('Item berhasil ditambahkan');
  };

  const handleEdit = () => {
    if (!selected || !form.name.trim()) { toast.error('Nama item harus diisi'); return; }
    save(items.map(i => i.id === selected.id ? { ...selected, ...form, updatedAt: new Date().toISOString() } : i));
    setModal(null);
    toast.success('Item berhasil diperbarui');
  };

  const handleAdjust = () => {
    if (!selected) return;
    const delta = adjustType === 'in' ? adjustQty : -adjustQty;
    const newStock = Math.max(0, selected.stock + delta);
    save(items.map(i => i.id === selected.id ? { ...i, stock: newStock, updatedAt: new Date().toISOString() } : i));
    setModal(null);
    toast.success(`Stok diperbarui: ${newStock} ${selected.unit}`);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Hapus item ini?')) return;
    save(items.filter(i => i.id !== id));
    toast.success('Item dihapus');
  };

  const rp = (n: number) => 'Rp ' + n.toLocaleString('id-ID');

  return (
    <div className="flex min-h-screen" style={{ background: '#020617', backgroundImage: 'radial-gradient(ellipse 70% 50% at 10% 0%,rgba(99,102,241,.25) 0%,transparent 60%),radial-gradient(ellipse 60% 45% at 90% 100%,rgba(59,130,246,.2) 0%,transparent 60%)' }}>
      <Sidebar onLogout={signOut} />
      <main className="flex-1 min-h-screen" style={{ marginLeft: '256px' }}>
        {/* Header */}
        <header className="sticky top-0 z-40 px-8 py-4 flex items-center justify-between" style={{ background: 'rgba(2,6,23,.7)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
          <div>
            <h1 className="text-xl font-black text-white">Inventory & Stok</h1>
            <p className="text-xs text-white/40">Kelola stok bahan baku dan produk</p>
          </div>
          <button onClick={openAdd} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer transition-all hover:-translate-y-0.5" style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>
            + Tambah Item
          </button>
        </header>

        <div className="p-8 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Item', value: stats.total, color: 'text-white' },
              { label: 'Stok OK', value: stats.ok, color: 'text-green-400' },
              { label: 'Warning', value: stats.warning, color: 'text-amber-400' },
              { label: 'Kritis/Habis', value: stats.alert, color: 'text-red-400' },
            ].map(s => (
              <div key={s.label} className={`${GLASS} p-5`}>
                <p className="text-xs text-white/40 mb-1">{s.label}</p>
                <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className={`${GLASS} p-4 flex flex-wrap gap-3 items-center`}>
            <input type="text" placeholder="Cari nama item..." value={search} onChange={e => setSearch(e.target.value)}
              className="flex-1 min-w-48 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-indigo-500/50" />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white text-sm focus:outline-none [&>option]:bg-slate-900">
              <option value="all">Semua Status</option>
              <option value="ok">OK</option>
              <option value="warning">Warning</option>
              <option value="alert">Kritis</option>
              <option value="empty">Habis</option>
            </select>
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white text-sm focus:outline-none [&>option]:bg-slate-900">
              <option value="all">Semua Kategori</option>
              {CATS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Table */}
          <div className={`${GLASS} overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,.08)' }}>
                    {['Nama Item', 'Kategori', 'Stok', 'Min. Stok', 'Satuan', 'Harga/Unit', 'Status', 'Aksi'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/40">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={8} className="px-5 py-12 text-center text-white/30">Tidak ada item ditemukan</td></tr>
                  ) : filtered.map(item => {
                    const st = getStatus(item.stock, item.minStock);
                    return (
                      <tr key={item.id} className="transition-colors hover:bg-white/3" style={{ borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                        <td className="px-5 py-3.5 font-semibold text-white">{item.name}</td>
                        <td className="px-5 py-3.5 text-white/60">{item.category}</td>
                        <td className="px-5 py-3.5 font-bold text-white">{item.stock}</td>
                        <td className="px-5 py-3.5 text-white/40">{item.minStock}</td>
                        <td className="px-5 py-3.5 text-white/60">{item.unit}</td>
                        <td className="px-5 py-3.5 text-white/60">{rp(item.price)}</td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[st]}`}>{STATUS_LABEL[st]}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex gap-2">
                            <button onClick={() => openAdjust(item)} className="px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all hover:bg-indigo-500/20" style={{ background: 'rgba(99,102,241,.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,.3)' }}>Sesuaikan</button>
                            <button onClick={() => openEdit(item)} className="px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all hover:bg-white/10" style={{ background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.7)', border: '1px solid rgba(255,255,255,.1)' }}>Edit</button>
                            <button onClick={() => handleDelete(item.id)} className="px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all hover:bg-red-500/20" style={{ background: 'rgba(239,68,68,.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,.25)' }}>Hapus</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Add/Edit Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(4px)' }}>
          <div className={`${GLASS} w-full max-w-lg p-6`}>
            <h2 className="text-lg font-black text-white mb-5">{modal === 'add' ? 'Tambah Item' : 'Edit Item'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-white/40 mb-1 font-semibold uppercase">Nama Item *</label>
                <input className={INPUT} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Contoh: Beras Premium" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/40 mb-1 font-semibold uppercase">Kategori</label>
                  <select className={INPUT + ' [&>option]:bg-slate-900'} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1 font-semibold uppercase">Satuan</label>
                  <select className={INPUT + ' [&>option]:bg-slate-900'} value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>
                    {UNITS.map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-white/40 mb-1 font-semibold uppercase">Stok Awal</label>
                  <input type="number" className={INPUT} value={form.stock} onChange={e => setForm({ ...form, stock: +e.target.value })} min={0} />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1 font-semibold uppercase">Min. Stok</label>
                  <input type="number" className={INPUT} value={form.minStock} onChange={e => setForm({ ...form, minStock: +e.target.value })} min={0} />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1 font-semibold uppercase">Harga/Unit</label>
                  <input type="number" className={INPUT} value={form.price} onChange={e => setForm({ ...form, price: +e.target.value })} min={0} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all hover:bg-white/10" style={{ background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.7)', border: '1px solid rgba(255,255,255,.1)' }}>Batal</button>
              <button onClick={modal === 'add' ? handleAdd : handleEdit} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer transition-all hover:-translate-y-0.5" style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {modal === 'adjust' && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(4px)' }}>
          <div className={`${GLASS} w-full max-w-sm p-6`}>
            <h2 className="text-lg font-black text-white mb-1">Sesuaikan Stok</h2>
            <p className="text-sm text-white/40 mb-5">{selected.name} — Stok saat ini: <span className="text-white font-bold">{selected.stock} {selected.unit}</span></p>
            <div className="flex gap-2 mb-4">
              {(['in', 'out'] as const).map(t => (
                <button key={t} onClick={() => setAdjustType(t)} className={`flex-1 py-2 rounded-xl text-sm font-bold cursor-pointer transition-all ${adjustType === t ? (t === 'in' ? 'bg-green-500/25 text-green-400 border-green-500/50' : 'bg-red-500/25 text-red-400 border-red-500/50') : 'bg-white/5 text-white/50'} border border-white/10`}>
                  {t === 'in' ? '+ Masuk' : '− Keluar'}
                </button>
              ))}
            </div>
            <input type="number" className={INPUT + ' mb-4'} value={adjustQty} onChange={e => setAdjustQty(Math.max(0, +e.target.value))} min={0} placeholder="Jumlah" />
            <div className="text-sm text-white/40 mb-5">
              Hasil: <span className="text-white font-bold">{Math.max(0, selected.stock + (adjustType === 'in' ? adjustQty : -adjustQty))} {selected.unit}</span>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold cursor-pointer hover:bg-white/10" style={{ background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.7)', border: '1px solid rgba(255,255,255,.1)' }}>Batal</button>
              <button onClick={handleAdjust} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer hover:-translate-y-0.5" style={{ background: adjustType === 'in' ? 'linear-gradient(135deg,#22c55e,#16a34a)' : 'linear-gradient(135deg,#ef4444,#dc2626)' }}>Update Stok</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
