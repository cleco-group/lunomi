import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import Sidebar from '../components/Sidebar';

interface Product {
  id: number;
  name: string;
  cat: string;
  price: number;
  cost: number;
  emoji: string;
  sku: string;
  avail: boolean;
}

const GLASS = 'rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm';
const INPUT = 'w-full px-3 py-2.5 rounded-xl text-sm bg-white/7 border border-white/15 text-white placeholder:text-white/35 focus:border-indigo-500/70 focus:ring-3 focus:ring-indigo-500/15 outline-none transition';

const DEFAULT_PRODUCTS: Product[] = [
  { id: 1, name: 'Nasi Goreng', cat: 'Makanan', price: 22000, cost: 8000, emoji: '🍳', sku: 'MENU-001', avail: true },
  { id: 2, name: 'Mie Ayam', cat: 'Makanan', price: 18000, cost: 6000, emoji: '🍜', sku: 'MENU-002', avail: true },
  { id: 3, name: 'Soto Ayam', cat: 'Makanan', price: 20000, cost: 7000, emoji: '🥘', sku: 'MENU-003', avail: true },
  { id: 4, name: 'Ayam Bakar', cat: 'Makanan', price: 28000, cost: 10000, emoji: '🍗', sku: 'MENU-004', avail: true },
  { id: 5, name: 'Es Teh Manis', cat: 'Minuman', price: 8000, cost: 2000, emoji: '🧊', sku: 'MENU-005', avail: true },
  { id: 6, name: 'Es Jeruk', cat: 'Minuman', price: 10000, cost: 3000, emoji: '🍊', sku: 'MENU-006', avail: true },
  { id: 7, name: 'Jus Alpukat', cat: 'Minuman', price: 15000, cost: 5000, emoji: '🥑', sku: 'MENU-007', avail: true },
  { id: 8, name: 'Kentang Goreng', cat: 'Snack', price: 12000, cost: 4000, emoji: '🍟', sku: 'MENU-008', avail: true },
  { id: 9, name: 'Pisang Goreng', cat: 'Snack', price: 10000, cost: 3000, emoji: '🍌', sku: 'MENU-009', avail: false },
  { id: 10, name: 'Es Krim Vanilla', cat: 'Dessert', price: 14000, cost: 5000, emoji: '🍦', sku: 'MENU-010', avail: true },
];

const CATEGORIES = ['Semua', 'Makanan', 'Minuman', 'Snack', 'Dessert', 'Paket'];

const rp = (n: number) => 'Rp ' + (n || 0).toLocaleString('id-ID');

export default function Product() {
  const { signOut } = useSupabaseAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [currentCat, setCurrentCat] = useState('Semua');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAvail, setIsAvail] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    cat: 'Makanan',
    price: '',
    cost: '',
    emoji: '',
    sku: '',
  });

  useEffect(() => {
    const stored = localStorage.getItem('lunomi_products');
    setProducts(stored ? JSON.parse(stored) : DEFAULT_PRODUCTS);
  }, []);

  const saveProducts = (newProducts: Product[]) => {
    localStorage.setItem('lunomi_products', JSON.stringify(newProducts));
    setProducts(newProducts);
  };

  const filteredProducts = () => {
    let filtered = products;

    if (currentCat !== 'Semua') {
      filtered = filtered.filter(p => p.cat === currentCat);
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q)
      );
    }

    return filtered;
  };

  const openAdd = () => {
    setEditingId(null);
    setFormData({ name: '', cat: 'Makanan', price: '', cost: '', emoji: '', sku: '' });
    setIsAvail(true);
    setError('');
    setShowModal(true);
  };

  const openEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      cat: product.cat,
      price: product.price.toString(),
      cost: product.cost.toString(),
      emoji: product.emoji,
      sku: product.sku,
    });
    setIsAvail(product.avail);
    setError('');
    setShowModal(true);
  };

  const saveProduct = () => {
    if (!formData.name.trim()) {
      setError('Nama menu harus diisi.');
      return;
    }
    const price = parseInt(formData.price) || 0;
    if (price < 1) {
      setError('Harga harus lebih dari 0.');
      return;
    }

    const newProduct = {
      name: formData.name.trim(),
      cat: formData.cat,
      price,
      cost: parseInt(formData.cost) || 0,
      emoji: formData.emoji || '🍽️',
      sku: formData.sku.trim(),
      avail: isAvail,
    };

    const newProducts = [...products];
    if (editingId !== null) {
      const idx = newProducts.findIndex(p => p.id === editingId);
      if (idx >= 0) {
        newProducts[idx] = { ...newProducts[idx], ...newProduct };
      }
    } else {
      newProducts.unshift({ id: Date.now(), ...newProduct });
    }

    saveProducts(newProducts);
    setShowModal(false);
  };

  const deleteProduct = (id: number) => {
    if (confirm('Hapus menu ini?')) {
      saveProducts(products.filter(p => p.id !== id));
    }
  };

  const filtered = filteredProducts();
  const totalProducts = products.length;
  const availProducts = products.filter(p => p.avail).length;

  return (
    <div className="flex min-h-screen" style={{ background: '#020617', backgroundImage: 'radial-gradient(ellipse 70% 50% at 10% 0%,rgba(99,102,241,.25) 0%,transparent 60%),radial-gradient(ellipse 60% 45% at 90% 100%,rgba(16,185,129,.12) 0%,transparent 60%)' }}>
      <Sidebar onLogout={signOut} />
      <main className="flex-1 min-h-screen lg:ml-64">
        <header className="sticky top-0 z-40 px-8 py-4 flex items-center justify-between" style={{ background: 'rgba(2,6,23,.7)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
          <div>
            <h1 className="text-xl font-black text-white">Master Menu</h1>
            <p className="text-xs text-white/40">Kelola menu dan produk</p>
          </div>
          <div className="flex gap-2 items-center">
            <div className="text-xs px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.4)' }}>
              <span id="statCount">{totalProducts}</span> menu · <span className="text-green-400">{availProducts}</span> tersedia
            </div>
            <button onClick={openAdd} className="px-4 py-2 rounded-xl text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>
              + Tambah Menu
            </button>
          </div>
        </header>

        <div className="p-8 space-y-6">
          {/* Search & Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <input
              type="text"
              placeholder="🔍 Cari menu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${INPUT} flex-1 min-w-[180px]`}
            />
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCurrentCat(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all border ${
                    currentCat === cat
                      ? 'bg-indigo-500/25 border-indigo-500/60 text-white'
                      : 'border-white/15 text-white/50 hover:border-white/25'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-4xl mb-3">🍽️</div>
              <div className="text-sm font-semibold text-white/40">Tidak ada menu ditemukan.</div>
              <button onClick={openAdd} className="text-indigo-400 cursor-pointer text-sm mt-2 hover:text-indigo-300">
                Tambah menu baru
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {filtered.map(p => {
                const margin = p.cost ? Math.round(((p.price - p.cost) / p.price) * 100) : null;
                return (
                  <div
                    key={p.id}
                    className={`${GLASS} p-4 cursor-pointer relative group transition-all hover:bg-white/10 hover:border-indigo-500/30 hover:-translate-y-1`}
                    onClick={() => openEdit(p)}
                  >
                    {!p.avail && (
                      <div className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(239,68,68,.15)', color: '#f87171' }}>
                        Habis
                      </div>
                    )}
                    <div className="text-3xl mb-2">{p.emoji}</div>
                    <div className="font-bold text-white text-xs mb-0.5 leading-tight">{p.name}</div>
                    <div className="text-xs mb-2 text-white/35">{p.cat}</div>
                    <div className="font-black text-indigo-400 text-sm">{rp(p.price)}</div>
                    {margin !== null && <div className="text-xs mt-0.5 text-green-400">Margin {margin}%</div>}
                    {p.sku && <div className="text-xs mt-1 font-mono text-white/20">{p.sku}</div>}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteProduct(p.id);
                      }}
                      className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 text-lg leading-none"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(8px)' }}>
          <div className={`${GLASS} rounded-2xl w-full max-w-md shadow-2xl overflow-hidden`}>
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,.08)' }}>
              <h2 className="font-bold text-white">{editingId ? 'Edit Menu' : 'Tambah Menu'}</h2>
              <button onClick={() => setShowModal(false)} style={{ color: 'rgba(255,255,255,.4)' }} className="hover:text-white text-xl font-bold">
                ×
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-white/50 mb-1.5 block">Nama Menu *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={INPUT}
                    placeholder="cth: Nasi Goreng Spesial"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/50 mb-1.5 block">Kategori</label>
                  <select
                    value={formData.cat}
                    onChange={(e) => setFormData({ ...formData, cat: e.target.value })}
                    className={INPUT}
                  >
                    <option>Makanan</option>
                    <option>Minuman</option>
                    <option>Snack</option>
                    <option>Dessert</option>
                    <option>Paket</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/50 mb-1.5 block">Emoji / Icon</label>
                  <input
                    type="text"
                    value={formData.emoji}
                    onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                    className={`${INPUT} text-center text-2xl`}
                    placeholder="🍛"
                    maxLength={4}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/50 mb-1.5 block">Harga Jual (Rp) *</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className={INPUT}
                    placeholder="0"
                    inputMode="numeric"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/50 mb-1.5 block">Harga Modal (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    className={INPUT}
                    placeholder="0"
                    inputMode="numeric"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-white/50 mb-1.5 block">SKU / Kode Barcode</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className={INPUT}
                    placeholder="cth: MENU-001"
                  />
                </div>
                <div className="col-span-2 flex items-center justify-between py-1">
                  <span className="text-xs font-semibold text-white/50">Status Tersedia</span>
                  <button
                    onClick={() => setIsAvail(!isAvail)}
                    className={`w-10 h-5 rounded-full transition-all relative ${isAvail ? 'bg-indigo-500' : 'bg-white/15'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${isAvail ? 'right-0.5' : 'left-0.5'}`} />
                  </button>
                </div>
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
              <button onClick={saveProduct} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
