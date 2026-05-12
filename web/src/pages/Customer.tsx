import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import Sidebar from '../components/Sidebar';
import toast from 'react-hot-toast';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
  totalSpend: number;
  visits: number;
  joinedAt: string;
  lastVisit: string;
}

const GLASS = 'rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm';
const INPUT = 'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white text-sm placeholder-white/30 focus:border-indigo-500/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all';

const TIER_STYLE: Record<string, string> = {
  platinum: 'bg-violet-500/15 text-violet-300 border border-violet-500/30',
  gold: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
  silver: 'bg-slate-500/20 text-slate-300 border border-slate-500/30',
  bronze: 'bg-orange-500/15 text-orange-300 border border-orange-500/30',
};

const DEMO: Customer[] = [
  { id: '1', name: 'Budi Santoso', phone: '08123456789', email: 'budi@email.com', address: 'Jl. Merdeka No. 1', tier: 'gold', points: 1250, totalSpend: 2500000, visits: 18, joinedAt: '2024-01-15', lastVisit: '2026-05-10' },
  { id: '2', name: 'Siti Rahayu', phone: '08234567890', email: 'siti@email.com', address: 'Jl. Sudirman No. 5', tier: 'platinum', points: 4800, totalSpend: 9600000, visits: 64, joinedAt: '2023-06-01', lastVisit: '2026-05-11' },
  { id: '3', name: 'Ahmad Fauzi', phone: '08345678901', email: '', address: '', tier: 'silver', points: 320, totalSpend: 640000, visits: 5, joinedAt: '2025-11-20', lastVisit: '2026-04-28' },
  { id: '4', name: 'Dewi Lestari', phone: '08456789012', email: 'dewi@email.com', address: 'Jl. Gatot No. 9', tier: 'bronze', points: 80, totalSpend: 160000, visits: 2, joinedAt: '2026-03-01', lastVisit: '2026-03-22' },
];

const EMPTY: Omit<Customer, 'id' | 'joinedAt' | 'lastVisit' | 'points' | 'totalSpend' | 'visits'> = {
  name: '', phone: '', email: '', address: '', tier: 'bronze'
};


export default function CustomerPage() {
  const { signOut } = useSupabaseAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [filterTier, setFilterTier] = useState('all');
  const [modal, setModal] = useState<'add' | 'edit' | 'detail' | null>(null);
  const [selected, setSelected] = useState<Customer | null>(null);
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    const stored = localStorage.getItem('lunomi_customers');
    setCustomers(stored ? JSON.parse(stored) : DEMO);
  }, []);

  const save = (updated: Customer[]) => {
    setCustomers(updated);
    localStorage.setItem('lunomi_customers', JSON.stringify(updated));
  };

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.email.toLowerCase().includes(q);
    const matchTier = filterTier === 'all' || c.tier === filterTier;
    return matchSearch && matchTier;
  });

  const stats = {
    total: customers.length,
    platinum: customers.filter(c => c.tier === 'platinum').length,
    gold: customers.filter(c => c.tier === 'gold').length,
    totalSpend: customers.reduce((s, c) => s + c.totalSpend, 0),
  };

  const handleAdd = () => {
    if (!form.name.trim() || !form.phone.trim()) { toast.error('Nama dan nomor HP wajib diisi'); return; }
    const c: Customer = { ...form, id: Date.now().toString(), points: 0, totalSpend: 0, visits: 0, joinedAt: new Date().toISOString().slice(0, 10), lastVisit: new Date().toISOString().slice(0, 10) };
    save([...customers, c]);
    setModal(null);
    toast.success('Customer berhasil ditambahkan');
  };

  const handleEdit = () => {
    if (!selected || !form.name.trim()) { toast.error('Nama wajib diisi'); return; }
    save(customers.map(c => c.id === selected.id ? { ...c, ...form } : c));
    setModal(null);
    toast.success('Data customer diperbarui');
  };

  const handleDelete = (id: string) => {
    if (!confirm('Hapus customer ini?')) return;
    save(customers.filter(c => c.id !== id));
    toast.success('Customer dihapus');
  };

  const openAdd = () => { setForm(EMPTY); setModal('add'); };
  const openEdit = (c: Customer) => { setSelected(c); setForm({ name: c.name, phone: c.phone, email: c.email, address: c.address, tier: c.tier }); setModal('edit'); };
  const openDetail = (c: Customer) => { setSelected(c); setModal('detail'); };

  const rp = (n: number) => 'Rp ' + n.toLocaleString('id-ID');

  return (
    <div className="flex min-h-screen" style={{ background: '#020617', backgroundImage: 'radial-gradient(ellipse 70% 50% at 10% 0%,rgba(99,102,241,.25) 0%,transparent 60%),radial-gradient(ellipse 60% 45% at 90% 100%,rgba(59,130,246,.2) 0%,transparent 60%)' }}>
      <Sidebar onLogout={signOut} />
      <main className="flex-1 min-h-screen lg:ml-64">
        <header className="sticky top-0 z-40 pl-14 pr-6 lg:px-8 py-4 flex items-center justify-between" style={{ background: 'rgba(2,6,23,.7)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
          <div>
            <h1 className="text-xl font-black text-white">Manajemen Customer</h1>
            <p className="text-xs text-white/40">Kelola data & loyalitas pelanggan</p>
          </div>
          <button onClick={openAdd} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer transition-all hover:-translate-y-0.5" style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>
            + Tambah Customer
          </button>
        </header>

        <div className="p-8 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Customer', value: stats.total, sub: 'Terdaftar', color: 'text-white' },
              { label: 'Platinum', value: stats.platinum, sub: 'Member', color: 'text-violet-300' },
              { label: 'Gold', value: stats.gold, sub: 'Member', color: 'text-amber-300' },
              { label: 'Total Spend', value: rp(stats.totalSpend), sub: 'Semua member', color: 'text-green-400' },
            ].map(s => (
              <div key={s.label} className={`${GLASS} p-5`}>
                <p className="text-xs text-white/40 mb-1">{s.label}</p>
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs text-white/30 mt-1">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className={`${GLASS} p-4 flex flex-wrap gap-3 items-center`}>
            <input type="text" placeholder="Cari nama, HP, atau email..." value={search} onChange={e => setSearch(e.target.value)}
              className="flex-1 min-w-48 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-indigo-500/50" />
            <div className="flex gap-2">
              {['all', 'platinum', 'gold', 'silver', 'bronze'].map(t => (
                <button key={t} onClick={() => setFilterTier(t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all border ${filterTier === t ? 'bg-indigo-500/25 border-indigo-500/60 text-white' : 'border-white/15 text-white/40 hover:border-white/30'}`}>
                  {t === 'all' ? 'Semua' : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Customer Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.length === 0 ? (
              <div className={`${GLASS} p-12 text-center text-white/30 col-span-3`}>Tidak ada customer ditemukan</div>
            ) : filtered.map(c => (
              <div key={c.id} className={`${GLASS} p-5 cursor-pointer hover:border-white/25 transition-all hover:-translate-y-0.5`} onClick={() => openDetail(c)}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm" style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{c.name}</p>
                      <p className="text-xs text-white/40">{c.phone}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${TIER_STYLE[c.tier]}`}>{c.tier.charAt(0).toUpperCase() + c.tier.slice(1)}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="text-center"><p className="text-xs text-white/30">Points</p><p className="font-bold text-amber-300">{c.points}</p></div>
                  <div className="text-center"><p className="text-xs text-white/30">Kunjungan</p><p className="font-bold text-white">{c.visits}x</p></div>
                  <div className="text-center"><p className="text-xs text-white/30">Total</p><p className="font-bold text-green-400 text-xs">{rp(c.totalSpend)}</p></div>
                </div>
                <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                  <button onClick={() => openEdit(c)} className="flex-1 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all hover:bg-white/10" style={{ background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.7)', border: '1px solid rgba(255,255,255,.1)' }}>Edit</button>
                  <button onClick={() => handleDelete(c.id)} className="flex-1 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all hover:bg-red-500/20" style={{ background: 'rgba(239,68,68,.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,.25)' }}>Hapus</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Add/Edit Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(4px)' }}>
          <div className={`${GLASS} w-full max-w-md p-6`}>
            <h2 className="text-lg font-black text-white mb-5">{modal === 'add' ? 'Tambah Customer' : 'Edit Customer'}</h2>
            <div className="space-y-4">
              <div><label className="block text-xs text-white/40 mb-1 font-semibold uppercase">Nama *</label><input className={INPUT} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nama lengkap" /></div>
              <div><label className="block text-xs text-white/40 mb-1 font-semibold uppercase">No. HP *</label><input className={INPUT} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="08xxxxxxxxxx" /></div>
              <div><label className="block text-xs text-white/40 mb-1 font-semibold uppercase">Email</label><input className={INPUT} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@domain.com" /></div>
              <div><label className="block text-xs text-white/40 mb-1 font-semibold uppercase">Alamat</label><input className={INPUT} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Alamat lengkap" /></div>
              <div>
                <label className="block text-xs text-white/40 mb-1 font-semibold uppercase">Tier</label>
                <select className={INPUT + ' [&>option]:bg-slate-900'} value={form.tier} onChange={e => setForm({ ...form, tier: e.target.value as Customer['tier'] })}>
                  {['bronze', 'silver', 'gold', 'platinum'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold cursor-pointer hover:bg-white/10" style={{ background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.7)', border: '1px solid rgba(255,255,255,.1)' }}>Batal</button>
              <button onClick={modal === 'add' ? handleAdd : handleEdit} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer hover:-translate-y-0.5" style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {modal === 'detail' && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(4px)' }}>
          <div className={`${GLASS} w-full max-w-sm p-6`}>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-white text-xl" style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>{selected.name.charAt(0)}</div>
              <div>
                <h2 className="text-lg font-black text-white">{selected.name}</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${TIER_STYLE[selected.tier]}`}>{selected.tier.charAt(0).toUpperCase() + selected.tier.slice(1)} Member</span>
              </div>
            </div>
            <div className="space-y-2 mb-5">
              {[
                ['No. HP', selected.phone],
                ['Email', selected.email || '-'],
                ['Alamat', selected.address || '-'],
                ['Bergabung', selected.joinedAt],
                ['Kunjungan Terakhir', selected.lastVisit],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-white/40">{k}</span>
                  <span className="text-white font-medium">{v}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className={`${GLASS} p-3 text-center`}><p className="text-xs text-white/30">Points</p><p className="font-black text-amber-300">{selected.points}</p></div>
              <div className={`${GLASS} p-3 text-center`}><p className="text-xs text-white/30">Kunjungan</p><p className="font-black text-white">{selected.visits}x</p></div>
              <div className={`${GLASS} p-3 text-center`}><p className="text-xs text-white/30">Total</p><p className="font-black text-green-400 text-xs">{rp(selected.totalSpend)}</p></div>
            </div>
            <button onClick={() => setModal(null)} className="w-full py-2.5 rounded-xl text-sm font-semibold cursor-pointer hover:bg-white/10 transition-all" style={{ background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.7)', border: '1px solid rgba(255,255,255,.1)' }}>Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}
