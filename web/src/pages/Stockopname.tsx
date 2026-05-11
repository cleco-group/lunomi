import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import Sidebar from '../components/Sidebar';

interface MenuItem {
  id: number;
  n: string;
  unit: string;
}

interface RawItem {
  id: number;
  name: string;
  unit: string;
}

interface MenuStock {
  qty: number;
  min: number;
  max: number;
}

interface RawStock {
  qty: number;
  unit: string;
}

interface OpnameLog {
  date: string;
  tab: 'menu' | 'bahan';
  adjustments: number;
}

type TabType = 'menu' | 'bahan';

const GLASS = 'rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm';

const MENU_ITEMS: MenuItem[] = [
  { id: 1,  n: 'Nasi Goreng', unit: 'porsi' },
  { id: 2,  n: 'Mie Ayam',    unit: 'porsi' },
  { id: 3,  n: 'Soto Ayam',   unit: 'porsi' },
  { id: 4,  n: 'Ikan Bakar',  unit: 'porsi' },
  { id: 5,  n: 'Es Teh',      unit: 'gelas' },
  { id: 6,  n: 'Kopi',        unit: 'gelas' },
  { id: 7,  n: 'Jus',         unit: 'gelas' },
  { id: 8,  n: 'Smoothie',    unit: 'gelas' },
  { id: 9,  n: 'Roti Goreng', unit: 'pcs'   },
  { id: 10, n: 'Lumpia',      unit: 'pcs'   },
  { id: 11, n: 'Kue Lapis',   unit: 'pcs'   },
  { id: 12, n: 'Bika Ambon',  unit: 'pcs'   },
];

const RAW_ITEMS: RawItem[] = [
  { id: 1, name: 'Nasi (Beras)',     unit: 'kg'    },
  { id: 2, name: 'Ayam Fillet',      unit: 'kg'    },
  { id: 3, name: 'Mie Kuning',       unit: 'kg'    },
  { id: 4, name: 'Soto Ayam Presto', unit: 'porsi' },
  { id: 5, name: 'Es Batu',          unit: 'kg'    },
  { id: 6, name: 'Teh Celup',        unit: 'box'   },
  { id: 7, name: 'Minyak Goreng',    unit: 'liter' },
  { id: 8, name: 'Kecap Manis',      unit: 'botol' },
];

function getMenuStock(): Record<number, MenuStock> {
  const s = localStorage.getItem('lunomi_menu_stock');
  if (s) return JSON.parse(s);
  const d: Record<number, MenuStock> = {};
  MENU_ITEMS.forEach(p => {
    d[p.id] = { qty: p.unit === 'gelas' ? 60 : 30, min: 5, max: p.unit === 'gelas' ? 80 : 40 };
  });
  return d;
}

function getRawStock(): Record<number, RawStock> {
  const s = localStorage.getItem('lunomi_raw_stock');
  if (s) return JSON.parse(s);
  const d: Record<number, RawStock> = {};
  RAW_ITEMS.forEach(i => { d[i.id] = { qty: 0, unit: i.unit }; });
  return d;
}

export default function Stockopname() {
  const { signOut } = useSupabaseAuth();
  const [currentTab, setCurrentTab] = useState<TabType>('menu');
  const [physicalCounts, setPhysicalCounts] = useState<Record<number, number>>({});
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [todayStr, setTodayStr] = useState('');

  useEffect(() => {
    const now = new Date();
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
    setTodayStr(`${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`);
  }, []);

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const switchTab = (tab: TabType) => {
    setCurrentTab(tab);
    setPhysicalCounts({});
  };

  const isMenu = currentTab === 'menu';
  const items = isMenu ? MENU_ITEMS : RAW_ITEMS;
  const stock = isMenu ? getMenuStock() : getRawStock();

  const getSysQty = (id: number): number => {
    const s = stock[id];
    return s ? s.qty : 0;
  };

  const setCount = (id: number, val: number) => {
    setPhysicalCounts(prev => ({ ...prev, [id]: val }));
  };

  const summary = (() => {
    let plus = 0, match = 0, minus = 0;
    items.forEach(item => {
      if (physicalCounts[item.id] === undefined) return;
      const diff = physicalCounts[item.id] - getSysQty(item.id);
      if (diff > 0) plus++;
      else if (diff < 0) minus++;
      else match++;
    });
    return { plus, match, minus };
  })();

  const saveOpname = () => {
    const keys = Object.keys(physicalCounts).map(Number);
    if (!keys.length) { showToast('Belum ada data fisik dimasukkan.', 'info'); return; }

    if (isMenu) {
      const stk = getMenuStock();
      keys.forEach(id => {
        if (!stk[id]) stk[id] = { qty: 0, min: 5, max: 40 };
        stk[id].qty = physicalCounts[id];
      });
      localStorage.setItem('lunomi_menu_stock', JSON.stringify(stk));
    } else {
      const stk = getRawStock();
      keys.forEach(id => {
        if (!stk[id]) stk[id] = { qty: 0, unit: '-' };
        stk[id].qty = physicalCounts[id];
      });
      localStorage.setItem('lunomi_raw_stock', JSON.stringify(stk));
    }

    const logs: OpnameLog[] = JSON.parse(localStorage.getItem('lunomi_stockopname') || '[]');
    logs.unshift({ date: new Date().toISOString(), tab: currentTab, adjustments: keys.length });
    localStorage.setItem('lunomi_stockopname', JSON.stringify(logs));

    setPhysicalCounts({});
    showToast(`Stok ${isMenu ? 'menu' : 'bahan baku'} berhasil disesuaikan (${keys.length} item)!`, 'success');
  };

  const toastColors: Record<string, string> = {
    success: 'rgba(34,197,94,.15)',
    error: 'rgba(239,68,68,.15)',
    info: 'rgba(99,102,241,.15)',
  };
  const toastBorders: Record<string, string> = {
    success: 'rgba(34,197,94,.3)',
    error: 'rgba(239,68,68,.3)',
    info: 'rgba(99,102,241,.3)',
  };
  const toastTextColors: Record<string, string> = {
    success: '#4ade80',
    error: '#fca5a5',
    info: '#a5b4fc',
  };

  return (
    <div className="flex min-h-screen" style={{ background: '#020617', backgroundImage: 'radial-gradient(ellipse 70% 50% at 10% 0%,rgba(99,102,241,.25) 0%,transparent 60%),radial-gradient(ellipse 60% 45% at 90% 100%,rgba(59,130,246,.2) 0%,transparent 60%)' }}>
      <Sidebar onLogout={signOut} />
      <main className="flex-1 min-h-screen" style={{ marginLeft: '256px' }}>

        {/* Sticky Header */}
        <header className="sticky top-0 z-40 px-8 py-4 flex items-center justify-between" style={{ background: 'rgba(2,6,23,.7)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
          <div>
            <h1 className="text-xl font-black text-white">Stock Opname</h1>
            <p className="text-xs text-white/40">{todayStr}</p>
          </div>
          <button
            onClick={saveOpname}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
            Simpan Penyesuaian
          </button>
        </header>

        <div className="p-8 space-y-6">

          {/* Tabs */}
          <div className="flex gap-2">
            {(['menu', 'bahan'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => switchTab(tab)}
                className="px-5 py-2 rounded-full text-xs font-semibold border transition"
                style={currentTab === tab
                  ? { background: 'rgba(99,102,241,.25)', borderColor: 'rgba(99,102,241,.6)', color: 'white' }
                  : { background: 'transparent', borderColor: 'rgba(255,255,255,.15)', color: 'rgba(255,255,255,.5)' }}
              >
                {tab === 'menu' ? 'Stok Menu' : 'Bahan Baku'}
              </button>
            ))}
          </div>

          {/* Info bar */}
          <div className={`${GLASS} px-5 py-4 flex flex-wrap items-center gap-4 justify-between`}>
            <p className="text-sm text-white/60">Masukkan jumlah fisik yang dihitung untuk menyesuaikan stok sistem.</p>
          </div>

          {/* Table */}
          <div className={`${GLASS} overflow-hidden`}>
            {/* Header row */}
            <div className="grid px-5 py-3 text-xs font-semibold text-white/35" style={{ gridTemplateColumns: '1fr 70px 100px 70px', borderBottom: '1px solid rgba(255,255,255,.12)' }}>
              <span>Nama Item</span>
              <span className="text-center">Sistem</span>
              <span className="text-center">Fisik (Input)</span>
              <span className="text-center">Selisih</span>
            </div>

            {/* Data rows */}
            {items.map(item => {
              const sysQty = getSysQty(item.id);
              const phys = physicalCounts[item.id];
              const hasPhys = phys !== undefined;
              const diff = hasPhys ? phys - sysQty : null;
              const name = isMenu ? (item as MenuItem).n : (item as RawItem).name;
              const unit = item.unit;

              return (
                <div
                  key={item.id}
                  className="grid px-5 py-3.5 items-center"
                  style={{ gridTemplateColumns: '1fr 70px 100px 70px', borderBottom: '1px solid rgba(255,255,255,.06)' }}
                >
                  <div>
                    <div className="text-sm font-semibold text-white">{name}</div>
                    <div className="text-xs text-white/35">{unit}</div>
                  </div>
                  <div className="text-center font-bold text-white text-sm">{sysQty}</div>
                  <div className="flex justify-center">
                    <input
                      type="number"
                      min={0}
                      inputMode="numeric"
                      value={hasPhys ? phys : ''}
                      placeholder="—"
                      onChange={e => setCount(item.id, parseFloat(e.target.value) || 0)}
                      className="w-20 px-2 py-1.5 rounded-lg text-sm text-center outline-none transition"
                      style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)', color: 'white' }}
                    />
                  </div>
                  <div className="text-center text-sm font-bold">
                    {diff === null
                      ? <span className="text-white/30">—</span>
                      : diff > 0
                        ? <span className="text-green-400">+{diff}</span>
                        : diff < 0
                          ? <span className="text-red-400">{diff}</span>
                          : <span className="text-white/30">0</span>
                    }
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className={`${GLASS} p-5 grid grid-cols-3 gap-4 text-center`}>
            <div>
              <div className="text-2xl font-black text-green-400">{summary.plus}</div>
              <div className="text-xs mt-1 text-white/40">Item Lebih</div>
            </div>
            <div>
              <div className="text-2xl font-black text-white">{summary.match}</div>
              <div className="text-xs mt-1 text-white/40">Item Sesuai</div>
            </div>
            <div>
              <div className="text-2xl font-black text-red-400">{summary.minus}</div>
              <div className="text-xs mt-1 text-white/40">Item Kurang</div>
            </div>
          </div>

        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2"
          style={{
            background: toastColors[toast.type],
            border: `1px solid ${toastBorders[toast.type]}`,
            color: toastTextColors[toast.type],
          }}
        >
          {toast.type === 'success' && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
          )}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
