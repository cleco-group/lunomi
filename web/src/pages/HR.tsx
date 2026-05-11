import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import Sidebar from '../components/Sidebar';

type EmployeeRole = 'Kasir' | 'Manager' | 'Chef / Koki' | 'Pelayan' | 'Barista' | 'Kurir' | 'Admin' | 'Owner' | 'Staff Umum';
type EmployeeStatus = 'active' | 'inactive';

interface Employee {
  id: string;
  name: string;
  role: EmployeeRole;
  status: EmployeeStatus;
  phone: string;
  startDate: string;
  salary: number;
  email: string;
  address: string;
  notes: string;
  createdAt: string;
}

const GLASS = 'rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm';
const INPUT = 'w-full px-3 py-2.5 rounded-xl text-sm bg-white/7 border border-white/15 text-white placeholder:text-white/35 focus:border-indigo-500/70 focus:ring-3 focus:ring-indigo-500/15 outline-none transition';

const ROLES: EmployeeRole[] = ['Kasir', 'Manager', 'Chef / Koki', 'Pelayan', 'Barista', 'Kurir', 'Admin', 'Owner', 'Staff Umum'];

const ROLE_COLORS: Record<EmployeeRole, { bg: string; color: string }> = {
  'Owner':       { bg: 'rgba(245,158,11,.15)',  color: '#fcd34d' },
  'Manager':     { bg: 'rgba(99,102,241,.15)',   color: '#a5b4fc' },
  'Kasir':       { bg: 'rgba(59,130,246,.15)',   color: '#93c5fd' },
  'Chef / Koki': { bg: 'rgba(249,115,22,.15)',   color: '#fdba74' },
  'Barista':     { bg: 'rgba(236,72,153,.15)',   color: '#f9a8d4' },
  'Pelayan':     { bg: 'rgba(16,185,129,.15)',   color: '#6ee7b7' },
  'Kurir':       { bg: 'rgba(139,92,246,.15)',   color: '#c4b5fd' },
  'Admin':       { bg: 'rgba(20,184,166,.15)',   color: '#5eead4' },
  'Staff Umum':  { bg: 'rgba(255,255,255,.08)',  color: 'rgba(255,255,255,.5)' },
};

const rp = (n: number) => 'Rp ' + (n || 0).toLocaleString('id-ID');

const getInitials = (name: string) =>
  name.split(' ').slice(0, 2).map(w => w[0] || '').join('').toUpperCase();

const EMPTY_FORM = {
  name: '',
  role: 'Kasir' as EmployeeRole,
  status: 'active' as EmployeeStatus,
  phone: '',
  startDate: new Date().toISOString().slice(0, 10),
  salary: 0,
  email: '',
  address: '',
  notes: '',
};

export default function HR() {
  const { signOut } = useSupabaseAuth();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | EmployeeRole>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<{
    name: string;
    role: EmployeeRole;
    status: EmployeeStatus;
    phone: string;
    startDate: string;
    salary: number;
    email: string;
    address: string;
    notes: string;
  }>(EMPTY_FORM);

  useEffect(() => {
    const stored = localStorage.getItem('lunomi_employees');
    setEmployees(stored ? JSON.parse(stored) : []);
  }, []);

  const saveEmployees = (data: Employee[]) => {
    localStorage.setItem('lunomi_employees', JSON.stringify(data));
    setEmployees(data);
  };

  const filtered = employees.filter(e => {
    const matchStatus = statusFilter === 'all' || e.status === statusFilter;
    const matchRole = roleFilter === 'all' || e.role === roleFilter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      e.name.toLowerCase().includes(q) ||
      e.role.toLowerCase().includes(q) ||
      (e.phone || '').includes(q);
    return matchStatus && matchRole && matchSearch;
  });

  const statTotal = employees.length;
  const statActive = employees.filter(e => e.status === 'active').length;
  const statInactive = employees.filter(e => e.status === 'inactive').length;
  const statSalary = employees.filter(e => e.status === 'active').reduce((s, e) => s + (e.salary || 0), 0);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ ...EMPTY_FORM, startDate: new Date().toISOString().slice(0, 10) });
    setError('');
    setShowModal(true);
  };

  const openEditModal = (emp: Employee) => {
    setEditingId(emp.id);
    setFormData({
      name: emp.name,
      role: emp.role,
      status: emp.status,
      phone: emp.phone,
      startDate: emp.startDate,
      salary: emp.salary,
      email: emp.email,
      address: emp.address,
      notes: emp.notes,
    });
    setError('');
    setShowModal(true);
  };

  const saveEmployee = () => {
    if (!formData.name.trim()) { setError('Nama harus diisi.'); return; }
    setError('');

    const data = [...employees];
    if (editingId !== null) {
      const idx = data.findIndex(e => e.id === editingId);
      if (idx >= 0) data[idx] = { ...data[idx], ...formData };
    } else {
      data.unshift({
        id: 'STF-' + Date.now(),
        ...formData,
        createdAt: new Date().toISOString(),
      });
    }
    saveEmployees(data);
    setShowModal(false);
  };

  const deleteEmployee = (id: string) => {
    const emp = employees.find(e => e.id === id);
    if (!emp) return;
    if (confirm(`Hapus karyawan "${emp.name}"? Tindakan ini tidak bisa dibatalkan.`)) {
      saveEmployees(employees.filter(e => e.id !== id));
    }
  };

  return (
    <div className="flex min-h-screen" style={{ background: '#020617', backgroundImage: 'radial-gradient(ellipse 70% 50% at 10% 0%,rgba(99,102,241,.25) 0%,transparent 60%),radial-gradient(ellipse 60% 45% at 90% 100%,rgba(16,185,129,.15) 0%,transparent 60%)' }}>
      <Sidebar onLogout={signOut} />
      <main className="flex-1 min-h-screen lg:ml-64">

        {/* Sticky Header */}
        <header className="sticky top-0 z-40 px-8 py-4 flex items-center justify-between" style={{ background: 'rgba(2,6,23,.7)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
          <div>
            <h1 className="text-xl font-black text-white">Kelola Karyawan</h1>
            <p className="text-xs text-white/40">Manajemen SDM &amp; penggajian</p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            Tambah Karyawan
          </button>
        </header>

        <div className="p-8 space-y-6">

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className={`${GLASS} p-4`}>
              <div className="text-xs mb-1 text-white/40">Total Karyawan</div>
              <div className="text-2xl font-black text-white">{statTotal}</div>
            </div>
            <div className={`${GLASS} p-4`}>
              <div className="text-xs mb-1 text-green-400">Aktif</div>
              <div className="text-2xl font-black text-green-400">{statActive}</div>
            </div>
            <div className={`${GLASS} p-4`}>
              <div className="text-xs mb-1 text-indigo-400">Total Gaji / Bulan</div>
              <div className="text-lg font-black text-indigo-400">{rp(statSalary)}</div>
            </div>
            <div className={`${GLASS} p-4`}>
              <div className="text-xs mb-1 text-amber-400">Non-Aktif</div>
              <div className="text-2xl font-black text-amber-400">{statInactive}</div>
            </div>
          </div>

          {/* Search + Status Filter */}
          <div className={`${GLASS} p-4 flex flex-wrap gap-3 items-center`}>
            <input
              type="text"
              placeholder="Cari nama, jabatan, telepon..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`${INPUT} flex-1 min-w-48`}
            />
            <div className="flex gap-2 flex-wrap">
              {(['all', 'active', 'inactive'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold border transition"
                  style={statusFilter === s
                    ? { background: 'rgba(99,102,241,.25)', borderColor: 'rgba(99,102,241,.5)', color: 'white' }
                    : { background: 'transparent', borderColor: 'rgba(255,255,255,.12)', color: 'rgba(255,255,255,.5)' }}
                >
                  {s === 'all' ? 'Semua' : s === 'active' ? 'Aktif' : 'Non-Aktif'}
                </button>
              ))}
            </div>
          </div>

          {/* Role Filter */}
          <div className="flex gap-2 flex-wrap">
            {(['all', ...ROLES] as const).map(r => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold border transition"
                style={roleFilter === r
                  ? { background: 'rgba(99,102,241,.25)', borderColor: 'rgba(99,102,241,.5)', color: 'white' }
                  : { background: 'transparent', borderColor: 'rgba(255,255,255,.12)', color: 'rgba(255,255,255,.5)' }}
              >
                {r === 'all' ? 'Semua Jabatan' : r}
              </button>
            ))}
          </div>

          {/* Employee List */}
          <div className={`${GLASS} overflow-hidden`}>
            {filtered.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: 'rgba(99,102,241,.15)' }}>
                  <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <div className="text-sm font-semibold text-white/40">Belum ada karyawan</div>
                <div className="text-xs mt-1 text-white/25">Tambahkan karyawan pertama outlet Anda</div>
              </div>
            ) : (
              filtered.map(emp => {
                const rc = ROLE_COLORS[emp.role];
                const since = emp.startDate
                  ? new Date(emp.startDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                  : '—';
                return (
                  <div key={emp.id} className="px-5 py-4 flex items-center gap-4 border-b border-white/5 hover:bg-white/[.02] transition">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-black"
                      style={{ background: rc.bg, color: rc.color }}>
                      {getInitials(emp.name) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-sm">{emp.name}</span>
                        <span className="px-2 py-0.5 rounded-full text-[.68rem] font-bold" style={{ background: rc.bg, color: rc.color }}>{emp.role}</span>
                        <span className="px-2 py-0.5 rounded-full text-[.68rem] font-bold border"
                          style={emp.status === 'active'
                            ? { background: 'rgba(34,197,94,.12)', color: '#4ade80', borderColor: 'rgba(34,197,94,.25)' }
                            : { background: 'rgba(255,255,255,.07)', color: 'rgba(255,255,255,.4)', borderColor: 'rgba(255,255,255,.1)' }}>
                          {emp.status === 'active' ? 'Aktif' : 'Non-Aktif'}
                        </span>
                      </div>
                      <div className="text-xs mt-0.5 flex gap-3 flex-wrap text-white/35">
                        {emp.phone && <span>{emp.phone}</span>}
                        <span>Masuk: {since}</span>
                        {emp.salary > 0 && <span>{rp(emp.salary)}/bln</span>}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => openEditModal(emp)}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold"
                        style={{ background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.6)' }}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        Edit
                      </button>
                      <button
                        onClick={() => deleteEmployee(emp.id)}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold"
                        style={{ background: 'rgba(239,68,68,.1)', color: '#f87171' }}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Hapus
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden" style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,.12)' }}>
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,.08)' }}>
              <h2 className="font-bold text-white">{editingId ? 'Edit Karyawan' : 'Tambah Karyawan'}</h2>
              <button onClick={() => setShowModal(false)} className="text-xl font-bold hover:text-white text-white/40">×</button>
            </div>

            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-semibold mb-1.5 block text-white/50">Nama Lengkap *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className={INPUT}
                    placeholder="Nama karyawan"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold mb-1.5 block text-white/50">Jabatan *</label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value as EmployeeRole })}
                    className={INPUT}
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold mb-1.5 block text-white/50">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as EmployeeStatus })}
                    className={INPUT}
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Non-Aktif</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold mb-1.5 block text-white/50">No. Telepon</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className={INPUT}
                    placeholder="08xxx"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold mb-1.5 block text-white/50">Tanggal Masuk</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    className={INPUT}
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-semibold mb-1.5 block text-white/50">Gaji Pokok (Rp / bulan)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.salary || ''}
                    onChange={e => setFormData({ ...formData, salary: parseFloat(e.target.value) || 0 })}
                    className={INPUT}
                    placeholder="0"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-semibold mb-1.5 block text-white/50">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className={INPUT}
                    placeholder="email@contoh.com"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-semibold mb-1.5 block text-white/50">Alamat</label>
                  <textarea
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    rows={2}
                    className={INPUT + ' resize-none'}
                    placeholder="Alamat lengkap..."
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-semibold mb-1.5 block text-white/50">Catatan</label>
                  <textarea
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                    className={INPUT + ' resize-none'}
                    placeholder="Opsional..."
                  />
                </div>
              </div>

              {error && (
                <div className="px-3 py-2 rounded-xl text-xs" style={{ background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.3)', color: '#fca5a5' }}>
                  {error}
                </div>
              )}
            </div>

            <div className="px-6 pb-5 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.7)' }}
              >
                Batal
              </button>
              <button
                onClick={saveEmployee}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
