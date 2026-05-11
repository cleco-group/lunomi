import { useState, useEffect, useCallback } from 'react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import Sidebar from '../components/Sidebar';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlatformConfig {
  apiKey: string;
  merchantId: string;
  autoAccept: boolean;
  syncInventory: boolean;
}

interface OnlineConfig {
  enabled: Record<string, boolean>;
  platforms: Record<string, PlatformConfig>;
  updatedAt?: string;
}

type OrderStatus = 'new' | 'cooking' | 'ready' | 'done' | 'cancel';

interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

interface OnlineOrder {
  id: string;
  orderNo: string;
  platform: 'shopee' | 'gofood' | 'grabfood' | 'tiktok';
  customer: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ONLINE_KEY = 'lunomi_online_config';
const ORDERS_KEY = 'lunomi_online_orders';

const GLASS = 'rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm';
const INPUT = 'w-full px-3 py-2.5 rounded-xl text-sm bg-white/7 border border-white/15 text-white placeholder:text-white/35 focus:border-indigo-500/70 focus:ring-3 focus:ring-indigo-500/15 outline-none transition';

const PLATFORMS = [
  { id: 'shopee' as const,   label: 'Shopee Food',  colorClass: 'border-orange-500/40',  icon: '🍊' },
  { id: 'gofood' as const,   label: 'GoFood',       colorClass: 'border-emerald-500/40', icon: '🟢' },
  { id: 'grabfood' as const, label: 'GrabFood',     colorClass: 'border-green-500/40',   icon: '🟩' },
  { id: 'tiktok' as const,   label: 'TikTok Shop',  colorClass: 'border-pink-500/40',    icon: '🎵' },
] as const;

type PlatformId = typeof PLATFORMS[number]['id'];

const STATUS_CFG: Record<OrderStatus, { label: string; cls: string }> = {
  new:     { label: 'Baru',    cls: 'bg-yellow-500/20 text-yellow-400' },
  cooking: { label: 'Dimasak', cls: 'bg-blue-500/20 text-blue-400' },
  ready:   { label: 'Siap',    cls: 'bg-emerald-500/20 text-emerald-400' },
  done:    { label: 'Selesai', cls: 'bg-white/10 text-white/40' },
  cancel:  { label: 'Batal',   cls: 'bg-red-500/20 text-red-400' },
};

const MENU_SAMPLES = [
  'Nasi Goreng Spesial', 'Mie Ayam Bakso', 'Ayam Bakar',
  'Es Teh Manis', 'Soto Ayam', 'Gado-gado', 'Rendang', 'Nasi Padang',
];

const CUSTOMERS = ['Budi S.', 'Rina D.', 'Ahmad F.', 'Siti M.', 'Hendra K.'];

const defaultConfig = (): OnlineConfig => ({ enabled: {}, platforms: {} });

const rp = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

// ─── Toggle component ─────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative inline-flex w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none"
      style={{ background: checked ? '#22c55e' : 'rgba(255,255,255,.15)' }}
    >
      <span
        className="inline-block w-[18px] h-[18px] bg-white rounded-full mt-[3px] transition-transform duration-300 shadow"
        style={{ transform: checked ? 'translateX(23px)' : 'translateX(3px)' }}
      />
    </button>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ msg }: { msg: string }) {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] px-5 py-3 rounded-xl bg-emerald-600 text-white text-sm font-semibold shadow-xl flex items-center gap-2 animate-fade-in">
      <span>✓</span>
      <span>{msg}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Online() {
  const { signOut } = useSupabaseAuth();

  const [cfg, setCfg] = useState<OnlineConfig>(defaultConfig);
  const [orders, setOrders] = useState<OnlineOrder[]>([]);
  const [currentTab, setCurrentTab] = useState<'all' | OrderStatus>('all');
  const [platformFilter, setPlatformFilter] = useState<PlatformId | ''>('');
  const [toastMsg, setToastMsg] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<PlatformId | null>(null);
  const [modalForm, setModalForm] = useState({
    apiKey: '',
    merchantId: '',
    autoAccept: false,
    syncInventory: false,
  });

  // ─── Load ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    const c = localStorage.getItem(ONLINE_KEY);
    if (c) setCfg(JSON.parse(c));
    const o = localStorage.getItem(ORDERS_KEY);
    if (o) setOrders(JSON.parse(o));
  }, []);

  // ─── Persist helpers ───────────────────────────────────────────────────────

  const saveOrders = (newOrders: OnlineOrder[]) => {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(newOrders));
    setOrders(newOrders);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2800);
  };

  // ─── Config ────────────────────────────────────────────────────────────────

  const togglePlatform = (id: PlatformId, val: boolean) => {
    setCfg(prev => ({ ...prev, enabled: { ...prev.enabled, [id]: val } }));
  };

  const openPlatformModal = (id: PlatformId) => {
    setEditingPlatform(id);
    const platCfg = cfg.platforms?.[id];
    setModalForm({
      apiKey:        platCfg?.apiKey        ?? '',
      merchantId:    platCfg?.merchantId    ?? '',
      autoAccept:    platCfg?.autoAccept    ?? false,
      syncInventory: platCfg?.syncInventory ?? false,
    });
    setModalOpen(true);
  };

  const savePlatformConfig = () => {
    if (!editingPlatform) return;
    setCfg(prev => ({
      ...prev,
      platforms: {
        ...prev.platforms,
        [editingPlatform]: {
          apiKey:        modalForm.apiKey.trim(),
          merchantId:    modalForm.merchantId.trim(),
          autoAccept:    modalForm.autoAccept,
          syncInventory: modalForm.syncInventory,
        },
      },
    }));
    setModalOpen(false);
    showToast('Konfigurasi platform disimpan');
  };

  const saveOnline = () => {
    const toSave = { ...cfg, updatedAt: new Date().toISOString() };
    localStorage.setItem(ONLINE_KEY, JSON.stringify(toSave));
    setCfg(toSave);
    showToast('Pengaturan online disimpan!');
  };

  // ─── Orders ────────────────────────────────────────────────────────────────

  const updateOrderStatus = (id: string, newStatus: OrderStatus) => {
    const updated = orders.map(o =>
      o.id === id ? { ...o, status: newStatus, updatedAt: new Date().toISOString() } : o
    );
    saveOrders(updated);
  };

  const addDemoOrder = () => {
    const platformIds: PlatformId[] = ['shopee', 'gofood', 'grabfood', 'tiktok'];
    const platform = platformIds[Math.floor(Math.random() * platformIds.length)];
    const itemCount = Math.ceil(Math.random() * 3);
    const items: OrderItem[] = Array.from({ length: itemCount }, () => ({
      name:  MENU_SAMPLES[Math.floor(Math.random() * MENU_SAMPLES.length)],
      qty:   Math.ceil(Math.random() * 2),
      price: (Math.ceil(Math.random() * 5) * 10 + 20) * 1000,
    }));
    const total = items.reduce((s, i) => s + i.qty * i.price, 0);
    const orderNo = String(orders.length + 1).padStart(4, '0');
    const newOrder: OnlineOrder = {
      id:        'onl_' + Date.now(),
      orderNo,
      platform,
      customer:  CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)],
      items,
      total,
      status:    'new',
      createdAt: new Date().toISOString(),
    };
    saveOrders([newOrder, ...orders]);
  };

  // ─── Derived ───────────────────────────────────────────────────────────────

  const today = new Date().toISOString().slice(0, 10);
  const todayOrders = orders.filter(o => o.createdAt?.slice(0, 10) === today);
  const stats = {
    today:   todayOrders.length,
    done:    todayOrders.filter(o => o.status === 'done').length,
    pending: todayOrders.filter(o => o.status === 'new' || o.status === 'cooking').length,
    revenue: todayOrders.filter(o => o.status === 'done').reduce((s, o) => s + o.total, 0),
  };

  const filteredOrders = useCallback(() => {
    return orders
      .filter(o => currentTab === 'all' || o.status === currentTab)
      .filter(o => !platformFilter || o.platform === platformFilter)
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
      .slice(0, 30);
  }, [orders, currentTab, platformFilter]);

  const platMap = Object.fromEntries(PLATFORMS.map(p => [p.id, p]));
  const displayed = filteredOrders();

  const TABS: Array<{ key: 'all' | OrderStatus; label: string }> = [
    { key: 'all',     label: 'Semua' },
    { key: 'new',     label: 'Baru' },
    { key: 'cooking', label: 'Dimasak' },
    { key: 'ready',   label: 'Siap' },
  ];

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      className="flex min-h-screen"
      style={{
        background: '#020617',
        backgroundImage:
          'radial-gradient(ellipse 70% 50% at 10% 0%,rgba(99,102,241,.25) 0%,transparent 60%),' +
          'radial-gradient(ellipse 60% 45% at 90% 100%,rgba(16,185,129,.12) 0%,transparent 60%)',
      }}
    >
      <Sidebar onLogout={signOut} />

      <main className="flex-1 min-h-screen lg:ml-64">
        {/* Sticky header */}
        <header
          className="sticky top-0 z-40 px-8 py-4 flex items-center justify-between"
          style={{
            background: 'rgba(2,6,23,.7)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,.08)',
          }}
        >
          <div>
            <h1 className="text-xl font-black text-white">Online Integration</h1>
            <p className="text-xs text-white/40">Kelola pesanan dari platform online delivery</p>
          </div>
          <button
            onClick={saveOnline}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}
          >
            Simpan Pengaturan
          </button>
        </header>

        <div className="p-8 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Order Online Hari Ini', value: stats.today,          color: '#f97316', textCls: 'text-white' },
              { label: 'Selesai',               value: stats.done,           color: '#10b981', textCls: 'text-emerald-400' },
              { label: 'Pending',               value: stats.pending,        color: '#eab308', textCls: 'text-yellow-400' },
              { label: 'Revenue Online',        value: rp(stats.revenue),    color: '#3b82f6', textCls: 'text-white' },
            ].map(s => (
              <div
                key={s.label}
                className="rounded-2xl p-5"
                style={{
                  background: 'rgba(255,255,255,.04)',
                  border: '1px solid rgba(255,255,255,.08)',
                  borderLeft: `4px solid ${s.color}`,
                }}
              >
                <p className="text-[10px] font-bold text-white/40 uppercase mb-1">{s.label}</p>
                <h3 className={`text-2xl font-extrabold ${s.textCls}`}>{s.value}</h3>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Platform Config */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">Platform</h3>

              {PLATFORMS.map(p => {
                const isConn = !!(cfg.platforms?.[p.id]?.apiKey);
                const isEnabled = !!(cfg.enabled?.[p.id]);
                return (
                  <div
                    key={p.id}
                    className={`${GLASS} p-4 transition-all`}
                    style={isConn ? { borderColor: 'rgba(34,197,94,.4)' } : undefined}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{p.icon}</span>
                        <div>
                          <p className="font-bold text-sm text-white">{p.label}</p>
                          <p className={`text-xs ${isConn ? 'text-emerald-400' : 'text-white/30'}`}>
                            {isConn ? 'Terhubung' : 'Belum terhubung'}
                          </p>
                        </div>
                      </div>
                      <Toggle checked={isEnabled} onChange={val => togglePlatform(p.id, val)} />
                    </div>
                    <button
                      onClick={() => openPlatformModal(p.id)}
                      className={`w-full py-1.5 rounded-xl text-xs font-semibold transition ${GLASS} hover:bg-white/10`}
                    >
                      {isConn ? 'Edit Konfigurasi' : 'Hubungkan'}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Right: Order Queue */}
            <div className="lg:col-span-2">
              <div className={`${GLASS} overflow-hidden`}>
                {/* Queue header */}
                <div
                  className="p-5 flex flex-wrap gap-3 items-center justify-between"
                  style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}
                >
                  <h3 className="font-bold text-white">Antrian Pesanan Online</h3>
                  <div className="flex gap-2 flex-wrap">
                    {TABS.map(t => (
                      <button
                        key={t.key}
                        onClick={() => setCurrentTab(t.key)}
                        className="px-3 py-1 rounded-full text-xs font-semibold border transition"
                        style={
                          currentTab === t.key
                            ? { background: 'rgba(99,102,241,.25)', borderColor: 'rgba(99,102,241,.5)', color: 'white' }
                            : { background: 'transparent', borderColor: 'rgba(255,255,255,.12)', color: 'rgba(255,255,255,.5)' }
                        }
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filter bar */}
                <div
                  className="p-4 flex gap-3 items-center"
                  style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}
                >
                  <button
                    onClick={addDemoOrder}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition ${GLASS} hover:bg-white/10 whitespace-nowrap`}
                  >
                    + Simulasi Pesanan Baru
                  </button>
                  <select
                    value={platformFilter}
                    onChange={e => setPlatformFilter(e.target.value as PlatformId | '')}
                    className="text-xs px-3 py-1.5 rounded-xl"
                    style={{
                      background: 'rgba(255,255,255,.06)',
                      border: '1px solid rgba(255,255,255,.12)',
                      color: 'white',
                      outline: 'none',
                    }}
                  >
                    <option value="">Semua platform</option>
                    {PLATFORMS.map(p => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                </div>

                {/* Order list */}
                <div className="divide-y max-h-[480px] overflow-y-auto" style={{ borderColor: 'rgba(255,255,255,.05)' }}>
                  {displayed.length === 0 ? (
                    <div className="px-5 py-12 text-center text-sm" style={{ color: 'rgba(255,255,255,.3)' }}>
                      <div className="text-3xl mb-2">🛵</div>
                      Tidak ada pesanan
                    </div>
                  ) : displayed.map(o => {
                    const st = STATUS_CFG[o.status] ?? STATUS_CFG.new;
                    const plat = platMap[o.platform] ?? { label: o.platform, icon: '📦' };
                    const dt = o.createdAt
                      ? new Date(o.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                      : '-';

                    return (
                      <div key={o.id} className="px-5 py-4 transition hover:bg-white/5">
                        <div className="flex justify-between items-start gap-3 mb-1.5">
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-base">{plat.icon}</span>
                              <span className="font-bold text-sm text-white">#{o.orderNo}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${st.cls}`}>
                                {st.label}
                              </span>
                            </div>
                            <p className="text-xs text-white/40">
                              {plat.label} · {dt} · {o.customer}
                            </p>
                          </div>
                          <div className="text-right shrink-0 space-y-1">
                            <p className="font-bold text-sm text-white">{rp(o.total)}</p>
                            {o.status === 'new' && (
                              <button
                                onClick={() => updateOrderStatus(o.id, 'cooking')}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-bold transition block"
                              >
                                Masak
                              </button>
                            )}
                            {o.status === 'cooking' && (
                              <button
                                onClick={() => updateOrderStatus(o.id, 'ready')}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-xs font-bold transition block"
                              >
                                Siap
                              </button>
                            )}
                            {o.status === 'ready' && (
                              <button
                                onClick={() => updateOrderStatus(o.id, 'done')}
                                className="px-3 py-1 rounded-lg text-xs font-bold transition block"
                                style={{ background: 'rgba(255,255,255,.2)' }}
                              >
                                Selesai
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-white/40 truncate">
                          {o.items.map(i => i.name).join(', ')}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Platform Config Modal */}
      {modalOpen && editingPlatform && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(8px)' }}
        >
          <div className={`${GLASS} w-full max-w-md shadow-2xl`}>
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{ borderBottom: '1px solid rgba(255,255,255,.08)' }}
            >
              <h3 className="text-base font-bold text-white">
                Konfigurasi {platMap[editingPlatform]?.label ?? editingPlatform}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-white/40 hover:text-white text-xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-white/40 mb-1">API Key / Token</label>
                <input
                  type="text"
                  value={modalForm.apiKey}
                  onChange={e => setModalForm(f => ({ ...f, apiKey: e.target.value }))}
                  className={INPUT}
                  placeholder="Masukkan API key dari platform"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/40 mb-1">Merchant ID</label>
                <input
                  type="text"
                  value={modalForm.merchantId}
                  onChange={e => setModalForm(f => ({ ...f, merchantId: e.target.value }))}
                  className={INPUT}
                  placeholder="ID merchant Anda"
                />
              </div>
              <div
                className={`flex items-center justify-between p-3 ${GLASS} rounded-xl`}
              >
                <div>
                  <p className="text-sm font-semibold text-white">Auto-accept pesanan</p>
                  <p className="text-xs text-white/40">Terima otomatis tanpa konfirmasi manual</p>
                </div>
                <Toggle
                  checked={modalForm.autoAccept}
                  onChange={val => setModalForm(f => ({ ...f, autoAccept: val }))}
                />
              </div>
              <div
                className={`flex items-center justify-between p-3 ${GLASS} rounded-xl`}
              >
                <div>
                  <p className="text-sm font-semibold text-white">Sync inventory</p>
                  <p className="text-xs text-white/40">Sinkronkan stok menu ke platform</p>
                </div>
                <Toggle
                  checked={modalForm.syncInventory}
                  onChange={val => setModalForm(f => ({ ...f, syncInventory: val }))}
                />
              </div>
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${GLASS} hover:bg-white/10 text-white/70`}
              >
                Batal
              </button>
              <button
                onClick={savePlatformConfig}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-sm font-bold text-white transition"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMsg && <Toast msg={toastMsg} />}
    </div>
  );
}
