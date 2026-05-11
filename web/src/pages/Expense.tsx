import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import Sidebar from '../components/Sidebar';

interface Expense {
  id: string;
  date: string;
  cat: 'Gaji & Upah' | 'Listrik & Air' | 'Sewa' | 'Bahan Baku' | 'Marketing' | 'Perawatan' | 'Lain-lain';
  desc: string;
  amount: number;
  note: string;
  outlet_id?: string;
}

const GLASS = 'rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm';
const INPUT = 'w-full px-3 py-2.5 rounded-xl text-sm bg-white/7 border border-white/15 text-white placeholder:text-white/35 focus:border-indigo-500/70 focus:ring-3 focus:ring-indigo-500/15 outline-none transition';

const CATEGORIES = ['Gaji & Upah', 'Listrik & Air', 'Sewa', 'Bahan Baku', 'Marketing', 'Perawatan', 'Lain-lain'] as const;

const CAT_COLORS: Record<string, { bg: string; color: string; icon: string }> = {
  'Gaji & Upah': { bg: 'rgba(99,102,241,.15)', color: '#a5b4fc', icon: '👥' },
  'Listrik & Air': { bg: 'rgba(59,130,246,.15)', color: '#93c5fd', icon: '💡' },
  'Sewa': { bg: 'rgba(245,158,11,.15)', color: '#fcd34d', icon: '🏠' },
  'Bahan Baku': { bg: 'rgba(34,197,94,.15)', color: '#86efac', icon: '🥩' },
  'Marketing': { bg: 'rgba(236,72,153,.15)', color: '#f9a8d4', icon: '📣' },
  'Perawatan': { bg: 'rgba(249,115,22,.15)', color: '#fdba74', icon: '🔧' },
  'Lain-lain': { bg: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.6)', icon: '📎' },
};

const DEFAULT_EXPENSES: Expense[] = [
  { id: 'EXP-1', date: new Date().toISOString().split('T')[0], cat: 'Gaji & Upah', desc: 'Gaji karyawan bulan Mei', amount: 25000000, note: '15 orang', outlet_id: '' },
  { id: 'EXP-2', date: new Date().toISOString().split('T')[0], cat: 'Listrik & Air', desc: 'Tagihan listrik dan air', amount: 5000000, note: 'Seluruh outlet', outlet_id: '' },
];

export default function Expense() {
  const { signOut } = useSupabaseAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<{
    date: string;
    cat: 'Gaji & Upah' | 'Listrik & Air' | 'Sewa' | 'Bahan Baku' | 'Marketing' | 'Perawatan' | 'Lain-lain';
    desc: string;
    amount: string;
    note: string;
  }>({
    date: new Date().toISOString().split('T')[0],
    cat: 'Gaji & Upah',
    desc: '',
    amount: '',
    note: '',
  });

  useEffect(() => {
    const stored = localStorage.getItem('lunomi_expenses');
    setExpenses(stored ? JSON.parse(stored) : DEFAULT_EXPENSES);
  }, []);

  const saveExpenses = (newExpenses: Expense[]) => {
    localStorage.setItem('lunomi_expenses', JSON.stringify(newExpenses));
    setExpenses(newExpenses);
  };

  const rp = (n: number) => 'Rp ' + Math.max(0, n).toLocaleString('id-ID');

  const filteredExpenses = () => {
    return expenses.filter(e => {
      const monthKey = e.date.slice(0, 7);
      const matchSearch = !search || e.desc.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter === 'all' || e.cat === categoryFilter;
      const matchMonth = !monthFilter || monthKey === monthFilter;
      return matchSearch && matchCategory && matchMonth;
    });
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      cat: 'Gaji & Upah',
      desc: '',
      amount: '',
      note: '',
    });
    setError('');
    setShowModal(true);
  };

  const openEditModal = (expense: Expense) => {
    setEditingId(expense.id);
    setFormData({
      date: expense.date,
      cat: expense.cat,
      desc: expense.desc,
      amount: expense.amount.toString(),
      note: expense.note,
    });
    setError('');
    setShowModal(true);
  };

  const saveExpense = () => {
    if (!formData.date) {
      setError('Tanggal harus diisi.');
      return;
    }
    if (!formData.desc.trim()) {
      setError('Deskripsi harus diisi.');
      return;
    }
    const amount = parseFloat(formData.amount) || 0;
    if (amount <= 0) {
      setError('Jumlah harus lebih dari 0.');
      return;
    }
    setError('');

    const newExpenses = [...expenses];
    if (editingId !== null) {
      const idx = newExpenses.findIndex(e => e.id === editingId);
      if (idx >= 0) {
        newExpenses[idx] = {
          ...newExpenses[idx],
          date: formData.date,
          cat: formData.cat,
          desc: formData.desc.trim(),
          amount,
          note: formData.note.trim(),
        };
      }
    } else {
      const newExpense: Expense = {
        id: 'EXP-' + Date.now(),
        date: formData.date,
        cat: formData.cat,
        desc: formData.desc.trim(),
        amount,
        note: formData.note.trim(),
        outlet_id: '',
      };
      newExpenses.unshift(newExpense);
    }

    saveExpenses(newExpenses);
    setShowModal(false);
  };

  const deleteExpense = (id: string) => {
    if (confirm('Hapus catatan ini?')) {
      saveExpenses(expenses.filter(e => e.id !== id));
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const nowMonth = today.slice(0, 7);
  const filtered = filteredExpenses();
  const todayTotal = expenses.filter(e => e.date === today).reduce((s, e) => s + e.amount, 0);
  const monthTotal = expenses.filter(e => e.date.startsWith(nowMonth)).reduce((s, e) => s + e.amount, 0);

  const monthExps = expenses.filter(e => e.date.startsWith(nowMonth));
  const catTotals: Record<string, number> = {};
  monthExps.forEach(e => { catTotals[e.cat] = (catTotals[e.cat] || 0) + e.amount; });
  const biggestCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

  const months = [...new Set(expenses.map(e => e.date.slice(0, 7)))].sort().reverse();

  return (
    <div className="flex min-h-screen" style={{ background: '#020617', backgroundImage: 'radial-gradient(ellipse 70% 50% at 10% 0%,rgba(99,102,241,.25) 0%,transparent 60%),radial-gradient(ellipse 60% 45% at 90% 100%,rgba(59,130,246,.2) 0%,transparent 60%)' }}>
      <Sidebar onLogout={signOut} />
      <main className="flex-1 min-h-screen" style={{ marginLeft: '256px' }}>
        <header className="sticky top-0 z-40 px-8 py-4 flex items-center justify-between" style={{ background: 'rgba(2,6,23,.7)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
          <div>
            <h1 className="text-xl font-black text-white">Pengeluaran Operasional</h1>
            <p className="text-xs text-white/40">Catat semua biaya operasional</p>
          </div>
          <button onClick={openAddModal} className="px-4 py-2 rounded-xl text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>
            + Catat Pengeluaran
          </button>
        </header>

        <div className="p-8 space-y-6">
          {/* Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderLeft: '3px solid #f87171' }}>
              <div className="text-xs mb-1" style={{ color: 'rgba(255,255,255,.4)' }}>Hari Ini</div>
              <div className="text-xl font-black text-white">{rp(todayTotal)}</div>
            </div>
            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderLeft: '3px solid #f59e0b' }}>
              <div className="text-xs mb-1" style={{ color: 'rgba(255,255,255,.4)' }}>Bulan Ini</div>
              <div className="text-xl font-black text-white">{rp(monthTotal)}</div>
            </div>
            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderLeft: '3px solid #6366f1' }}>
              <div className="text-xs mb-1" style={{ color: 'rgba(255,255,255,.4)' }}>Total Catatan</div>
              <div className="text-xl font-black text-white">{expenses.length}</div>
            </div>
            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderLeft: '3px solid #22c55e' }}>
              <div className="text-xs mb-1" style={{ color: 'rgba(255,255,255,.4)' }}>Terbesar Bulan Ini</div>
              <div className="text-xl font-black text-white">{biggestCat}</div>
            </div>
          </div>

          {/* Filter */}
          <div className={`${GLASS} p-4 flex flex-wrap gap-3 items-center`}>
            <input
              type="text"
              placeholder="🔍 Cari deskripsi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${INPUT} flex-1 min-w-40`}
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
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className={INPUT}
            >
              <option value="">Semua Bulan</option>
              {months.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Expense List */}
          <div className={`${GLASS} rounded-2xl overflow-hidden`}>
            {filtered.length === 0 ? (
              <div className="py-12 text-center text-sm" style={{ color: 'rgba(255,255,255,.3)' }}>
                Belum ada catatan pengeluaran.
              </div>
            ) : (
              <div style={{ borderColor: 'rgba(255,255,255,.06)' }}>
                {filtered.map(e => {
                  const cs = CAT_COLORS[e.cat] || CAT_COLORS['Lain-lain'];
                  return (
                    <div key={e.id} className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0" style={{ background: cs.bg }}>
                          {cs.icon}
                        </div>
                        <div>
                          <div className="font-semibold text-white text-sm">{e.desc}</div>
                          <div className="text-xs mt-0.5 flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: cs.bg, color: cs.color }}>
                              {e.cat}
                            </span>
                            <span style={{ color: 'rgba(255,255,255,.35)' }}>{e.date}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                        <div className="text-right">
                          <div className="font-bold text-white text-sm">{rp(e.amount)}</div>
                          {e.note && <div className="text-xs" style={{ color: 'rgba(255,255,255,.3)' }}>{e.note}</div>}
                        </div>
                        <div className="flex flex-col gap-1">
                          <button onClick={() => openEditModal(e)} className="text-xs px-2 py-1 rounded-lg font-semibold" style={{ background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.6)' }}>
                            Edit
                          </button>
                          <button onClick={() => deleteExpense(e.id)} className="text-xs px-2 py-1 rounded-lg font-semibold" style={{ background: 'rgba(239,68,68,.1)', color: '#f87171' }}>
                            Hapus
                          </button>
                        </div>
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
              <h2 className="font-bold text-white">{editingId ? 'Edit Pengeluaran' : 'Catat Pengeluaran'}</h2>
              <button onClick={() => setShowModal(false)} style={{ color: 'rgba(255,255,255,.4)' }} className="hover:text-white text-xl font-bold">
                ×
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-white/50 mb-1.5 block">Tanggal</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className={INPUT}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/50 mb-1.5 block">Kategori</label>
                  <select
                    value={formData.cat}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        cat: e.target.value as 'Gaji & Upah' | 'Listrik & Air' | 'Sewa' | 'Bahan Baku' | 'Marketing' | 'Perawatan' | 'Lain-lain',
                      });
                    }}
                    className={INPUT}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-white/50 mb-1.5 block">Deskripsi</label>
                <input
                  type="text"
                  value={formData.desc}
                  onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                  className={INPUT}
                  placeholder="cth: Gaji karyawan bulan Mei"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-white/50 mb-1.5 block">Jumlah (Rp)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className={INPUT}
                  placeholder="0"
                  inputMode="numeric"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-white/50 mb-1.5 block">Catatan</label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  rows={2}
                  className={INPUT}
                  placeholder="Opsional..."
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
              <button onClick={saveExpense} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
