import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import Sidebar from '../components/Sidebar';

interface MenuItem {
  id: number;
  n: string;
  cat: string;
}

interface RawItem {
  id: number;
  name: string;
  unit: string;
}

interface Ingredient {
  rawId: number;
  qty: number;
}

type RecipeMap = Record<number, Ingredient[]>;

const GLASS = 'rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm';
const INPUT = 'w-full px-3 py-2.5 rounded-xl text-sm bg-white/7 border border-white/15 text-white placeholder:text-white/35 focus:border-indigo-500/70 focus:ring-3 focus:ring-indigo-500/15 outline-none transition';

const MENU_ITEMS: MenuItem[] = [
  { id: 1,  n: 'Nasi Goreng',    cat: 'Makanan' },
  { id: 2,  n: 'Mie Ayam',       cat: 'Makanan' },
  { id: 3,  n: 'Soto Ayam',      cat: 'Makanan' },
  { id: 4,  n: 'Ayam Bakar',     cat: 'Makanan' },
  { id: 5,  n: 'Es Teh Manis',   cat: 'Minuman' },
  { id: 6,  n: 'Es Jeruk',       cat: 'Minuman' },
  { id: 7,  n: 'Jus Alpukat',    cat: 'Minuman' },
  { id: 8,  n: 'Kentang Goreng', cat: 'Snack'   },
  { id: 9,  n: 'Pisang Goreng',  cat: 'Snack'   },
  { id: 10, n: 'Lumpia',         cat: 'Snack'   },
  { id: 11, n: 'Kue Lapis',      cat: 'Dessert' },
  { id: 12, n: 'Bika Ambon',     cat: 'Dessert' },
];

const RAW_ITEMS: RawItem[] = [
  { id: 1,  name: 'Nasi (Beras)',     unit: 'kg'    },
  { id: 2,  name: 'Ayam Fillet',      unit: 'kg'    },
  { id: 3,  name: 'Mie Kuning',       unit: 'kg'    },
  { id: 4,  name: 'Soto Ayam Presto', unit: 'porsi' },
  { id: 5,  name: 'Es Batu',          unit: 'kg'    },
  { id: 6,  name: 'Teh Celup',        unit: 'box'   },
  { id: 7,  name: 'Minyak Goreng',    unit: 'liter' },
  { id: 8,  name: 'Kecap Manis',      unit: 'botol' },
  { id: 9,  name: 'Telur',            unit: 'butir' },
  { id: 10, name: 'Gula Pasir',       unit: 'kg'    },
  { id: 11, name: 'Garam',            unit: 'gram'  },
  { id: 12, name: 'Bawang Merah',     unit: 'gram'  },
  { id: 13, name: 'Bawang Putih',     unit: 'gram'  },
];

const CAT_COLORS: Record<string, { bg: string; color: string }> = {
  Makanan: { bg: 'rgba(249,115,22,.15)',  color: '#fdba74' },
  Minuman: { bg: 'rgba(59,130,246,.15)',  color: '#93c5fd' },
  Snack:   { bg: 'rgba(236,72,153,.15)', color: '#f9a8d4' },
  Dessert: { bg: 'rgba(168,85,247,.15)', color: '#d8b4fe' },
};

function loadRecipes(): RecipeMap {
  const s = localStorage.getItem('lunomi_recipes');
  return s ? JSON.parse(s) : {};
}

function saveRecipes(map: RecipeMap) {
  localStorage.setItem('lunomi_recipes', JSON.stringify(map));
}

export default function Recipe() {
  const { signOut } = useSupabaseAuth();
  const [search, setSearch] = useState('');
  const [recipes, setRecipes] = useState<RecipeMap>({});
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setRecipes(loadRecipes());
  }, []);

  const showToastMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const filteredMenus = MENU_ITEMS.filter(m =>
    m.n.toLowerCase().includes(search.toLowerCase())
  );

  const openRecipe = (id: number) => {
    setActiveMenuId(id);
    const existing = recipes[id] || [];
    setIngredients(existing.length > 0 ? [...existing] : [{ rawId: 0, qty: 0 }]);
    setShowModal(true);
  };

  const addIngredientRow = () => {
    setIngredients(prev => [...prev, { rawId: 0, qty: 0 }]);
  };

  const removeIngredientRow = (idx: number) => {
    setIngredients(prev => prev.filter((_, i) => i !== idx));
  };

  const updateIngredient = (idx: number, field: 'rawId' | 'qty', value: number) => {
    setIngredients(prev => prev.map((ing, i) => i === idx ? { ...ing, [field]: value } : ing));
  };

  const saveRecipe = () => {
    if (activeMenuId === null) return;
    const data = ingredients.filter(ing => ing.rawId > 0 && ing.qty > 0);
    const updated = { ...recipes, [activeMenuId]: data };
    saveRecipes(updated);
    setRecipes(updated);
    setShowModal(false);
    showToastMsg('Resep berhasil disimpan!');
  };

  const activeMenu = activeMenuId !== null ? MENU_ITEMS.find(m => m.id === activeMenuId) : null;

  return (
    <div className="flex min-h-screen" style={{ background: '#020617', backgroundImage: 'radial-gradient(ellipse 70% 50% at 10% 0%,rgba(99,102,241,.25) 0%,transparent 60%)' }}>
      <Sidebar onLogout={signOut} />
      <main className="flex-1 min-h-screen lg:ml-64">

        {/* Sticky Header */}
        <header className="sticky top-0 z-40 pl-14 pr-6 lg:px-8 py-4 flex items-center justify-between" style={{ background: 'rgba(2,6,23,.7)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
          <div>
            <h1 className="text-xl font-black text-white">Master Resep</h1>
            <p className="text-xs text-white/40">Kelola komposisi bahan baku per menu</p>
          </div>
        </header>

        <div className="p-8 space-y-6">

          {/* Search */}
          <div className={`${GLASS} p-4`}>
            <input
              type="text"
              placeholder="Cari menu untuk resep..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={INPUT}
            />
          </div>

          {/* Recipe Grid */}
          {filteredMenus.length === 0 ? (
            <div className="py-16 text-center text-sm text-white/30">
              Tidak ada menu ditemukan.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMenus.map(menu => {
                const hasRecipe = (recipes[menu.id] || []).length > 0;
                const catColor = CAT_COLORS[menu.cat] || { bg: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.5)' };
                const ingredientCount = (recipes[menu.id] || []).length;

                return (
                  <button
                    key={menu.id}
                    onClick={() => openRecipe(menu.id)}
                    className="text-left p-4 rounded-2xl border transition-all"
                    style={{
                      background: 'rgba(255,255,255,.04)',
                      borderColor: 'rgba(255,255,255,.08)',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,.08)';
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(99,102,241,.3)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,.04)';
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,.08)';
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: catColor.bg }}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: catColor.color }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-white text-sm truncate">{menu.n}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: catColor.bg, color: catColor.color }}>{menu.cat}</span>
                            {hasRecipe && (
                              <span className="text-[10px] font-bold text-green-400">{ingredientCount} bahan</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
                        <span
                          className="text-[10px] uppercase tracking-wider font-bold"
                          style={{ color: hasRecipe ? '#4ade80' : 'rgba(255,255,255,.3)' }}
                        >
                          {hasRecipe ? 'Terisi' : 'Kosong'}
                        </span>
                        <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

        </div>
      </main>

      {/* Recipe Detail Modal */}
      {showModal && activeMenu && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(4px)' }}
        >
          <div className={`${GLASS} w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto`}>

            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-bold text-white text-lg">Resep: {activeMenu.n}</h2>
                <p className="text-xs text-white/40 mt-0.5">{activeMenu.cat}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-2xl font-bold text-white/40 hover:text-white transition leading-none"
              >
                ×
              </button>
            </div>

            {/* Ingredients */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/40">Bahan Baku &amp; Gramasi</h3>
                <button
                  onClick={addIngredientRow}
                  className="text-[10px] font-bold px-2 py-1 rounded-lg border transition hover:bg-indigo-500/40"
                  style={{ background: 'rgba(99,102,241,.2)', color: '#a5b4fc', borderColor: 'rgba(99,102,241,.3)' }}
                >
                  + Tambah Bahan
                </button>
              </div>

              <div className="space-y-2">
                {ingredients.map((ing, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <select
                      value={ing.rawId}
                      onChange={e => updateIngredient(idx, 'rawId', parseInt(e.target.value))}
                      className="flex-1 px-3 py-2 rounded-xl text-xs outline-none transition"
                      style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)', color: 'white' }}
                    >
                      <option value={0}>Pilih Bahan...</option>
                      {RAW_ITEMS.map(r => (
                        <option key={r.id} value={r.id} style={{ background: '#0f172a' }}>
                          {r.name} ({r.unit})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      step="any"
                      min={0}
                      value={ing.qty || ''}
                      placeholder="Qty"
                      onChange={e => updateIngredient(idx, 'qty', parseFloat(e.target.value) || 0)}
                      className="w-24 px-3 py-2 rounded-xl text-xs outline-none transition"
                      style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)', color: 'white' }}
                    />
                    <button
                      onClick={() => removeIngredientRow(idx)}
                      className="p-2 text-red-400/50 hover:text-red-400 transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}

                {ingredients.length === 0 && (
                  <p className="text-xs text-white/30 text-center py-4">Belum ada bahan. Klik "+ Tambah Bahan" untuk mulai.</p>
                )}
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition"
                style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.7)' }}
              >
                Batal
              </button>
              <button
                onClick={saveRecipe}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}
              >
                Simpan Resep
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2"
          style={{ background: 'rgba(34,197,94,.15)', border: '1px solid rgba(34,197,94,.3)', color: '#4ade80' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
          {toast}
        </div>
      )}
    </div>
  );
}
