import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import Sidebar from '../components/Sidebar';

interface Booking {
  id: string;
  name: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  guests: number;
  notes: string;
  status: 'pending' | 'confirmed' | 'done' | 'cancelled';
  outlet: string;
  createdAt: string;
  updatedAt?: string;
}

const GLASS = 'rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm';
const INPUT = 'w-full px-3 py-2 rounded-xl text-sm bg-white/7 border border-white/15 text-white placeholder:text-white/35 focus:border-indigo-500/70 focus:ring-3 focus:ring-indigo-500/15 outline-none transition';
const MONTH_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

const statusColors: Record<string, { bg: string; text: string; badge: string }> = {
  pending: { bg: 'rgba(245,158,11,.2)', text: '#fcd34d', badge: 'badge-pending' },
  confirmed: { bg: 'rgba(34,197,94,.2)', text: '#6ee7b7', badge: 'badge-confirmed' },
  done: { bg: 'rgba(99,102,241,.2)', text: '#a5b4fc', badge: 'badge-done' },
  cancelled: { bg: 'rgba(239,68,68,.2)', text: '#fca5a5', badge: 'badge-cancelled' },
};

const statusLabels: Record<string, string> = {
  pending: 'Menunggu',
  confirmed: 'Dikonfirmasi',
  done: 'Selesai',
  cancelled: 'Dibatalkan',
};

export default function Booking() {
  const { signOut } = useSupabaseAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentTab, setCurrentTab] = useState<'all' | 'today' | 'pending' | 'confirmed' | 'done'>('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    service: '',
    date: new Date().toISOString().slice(0, 10),
    time: '10:00',
    guests: 1,
    notes: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('lunomi_bookings');
    setBookings(stored ? JSON.parse(stored) : []);
  }, []);

  const saveBookings = (newBookings: Booking[]) => {
    localStorage.setItem('lunomi_bookings', JSON.stringify(newBookings));
    setBookings(newBookings);
  };

  const getToday = () => new Date().toISOString().slice(0, 10);

  const getStats = () => {
    const today = getToday();
    const todayBookings = bookings.filter(b => b.date === today);
    return {
      today: todayBookings.length,
      confirmed: todayBookings.filter(b => b.status === 'confirmed').length,
      pending: todayBookings.filter(b => b.status === 'pending').length,
      cancelled: todayBookings.filter(b => b.status === 'cancelled').length,
    };
  };

  const filteredBookings = () => {
    const today = getToday();
    let filtered = bookings;

    if (currentTab === 'today') {
      filtered = filtered.filter(b => b.date === today);
    } else if (currentTab === 'pending') {
      filtered = filtered.filter(b => b.status === 'pending');
    } else if (currentTab === 'confirmed') {
      filtered = filtered.filter(b => b.status === 'confirmed');
    } else if (currentTab === 'done') {
      filtered = filtered.filter(b => b.status === 'done');
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(b => (b.name + b.service).toLowerCase().includes(q));
    }

    return filtered.sort((a, b) => a.date === b.date ? a.time.localeCompare(b.time) : b.date.localeCompare(a.date));
  };

  const openAdd = () => {
    setEditId(null);
    setFormData({
      name: '',
      phone: '',
      service: '',
      date: getToday(),
      time: '10:00',
      guests: 1,
      notes: '',
    });
    setError('');
    setShowModal(true);
  };

  const openEdit = (booking: Booking) => {
    setEditId(booking.id);
    setFormData({
      name: booking.name,
      phone: booking.phone,
      service: booking.service,
      date: booking.date,
      time: booking.time,
      guests: booking.guests,
      notes: booking.notes,
    });
    setError('');
    setShowModal(true);
  };

  const saveBooking = () => {
    if (!formData.name.trim()) {
      setError('Nama pelanggan wajib diisi.');
      return;
    }
    if (!formData.service.trim()) {
      setError('Layanan wajib diisi.');
      return;
    }
    if (!formData.date || !formData.time) {
      setError('Tanggal dan jam wajib diisi.');
      return;
    }

    const newBookings = [...bookings];
    if (editId) {
      const idx = newBookings.findIndex(x => x.id === editId);
      if (idx >= 0) {
        newBookings[idx] = {
          ...newBookings[idx],
          ...formData,
          guests: Number(formData.guests),
          updatedAt: new Date().toISOString(),
        };
      }
    } else {
      newBookings.unshift({
        id: 'BKG-' + Date.now(),
        ...formData,
        guests: Number(formData.guests),
        status: 'pending',
        outlet: '',
        createdAt: new Date().toISOString(),
      });
    }

    saveBookings(newBookings);
    setShowModal(false);
  };

  const updateStatus = (id: string, newStatus: Booking['status']) => {
    const newBookings = bookings.map(b =>
      b.id === id ? { ...b, status: newStatus, updatedAt: new Date().toISOString() } : b
    );
    saveBookings(newBookings);
  };

  const deleteBooking = (id: string) => {
    if (confirm('Hapus booking ini?')) {
      saveBookings(bookings.filter(b => b.id !== id));
    }
  };

  const sendWA = (booking: Booking) => {
    if (!booking.phone) return;
    const outlet = JSON.parse(localStorage.getItem('lunomi_outlet') || '{}');
    const msg = `Halo *${booking.name}*! 😊\n\nKonfirmasi booking Anda di *${outlet.name || 'Outlet Kami'}*:\n\n📌 Layanan: ${booking.service}\n📅 Tanggal: ${booking.date}\n⏰ Jam: ${booking.time} WIB\n👥 Tamu: ${booking.guests}\n\nTerima kasih telah booking! Sampai jumpa 🙏`;
    window.open(`https://wa.me/${booking.phone.replace(/^0/, '62')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const copyLink = () => {
    const link = `lunomi.id/b/outlet`;
    navigator.clipboard.writeText(link).then(() => {
      alert('Link berhasil disalin!');
    }).catch(() => {
      alert('Link: ' + link);
    });
  };

  const stats = getStats();
  const filtered = filteredBookings();

  return (
    <div className="flex min-h-screen" style={{ background: '#020617', backgroundImage: 'radial-gradient(ellipse 70% 50% at 10% 0%,rgba(99,102,241,.25) 0%,transparent 60%),radial-gradient(ellipse 60% 45% at 90% 100%,rgba(59,130,246,.2) 0%,transparent 60%)' }}>
      <Sidebar onLogout={signOut} />
      <main className="flex-1 min-h-screen" style={{ marginLeft: '256px' }}>
        <header className="sticky top-0 z-40 px-8 py-4 flex items-center justify-between" style={{ background: 'rgba(2,6,23,.7)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
          <div>
            <h1 className="text-xl font-black text-white">Manajemen Booking</h1>
            <p className="text-xs text-white/40">Kelola reservasi & jadwal pelayanan</p>
          </div>
          <button onClick={openAdd} className="px-4 py-2 rounded-xl text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>
            + Tambah Booking
          </button>
        </header>

        <div className="p-8 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Hari Ini', value: stats.today, color: '#a5b4fc' },
              { label: 'Dikonfirmasi', value: stats.confirmed, color: '#6ee7b7' },
              { label: 'Menunggu', value: stats.pending, color: '#fcd34d' },
              { label: 'Dibatalkan', value: stats.cancelled, color: '#fca5a5' },
            ].map(s => (
              <div key={s.label} className={`${GLASS} p-5`}>
                <p className="text-xs text-white/40 mb-1">{s.label}</p>
                <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Booking Link */}
          <div className={`${GLASS} p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3`}>
            <div className="flex-1">
              <p className="text-xs font-bold text-white/40 uppercase mb-0.5">Link Booking Anda</p>
              <p className="text-xs text-white/50">Bagikan ke pelanggan atau pasang di Bio Instagram</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <input type="text" readOnly value="lunomi.id/b/outlet" className={`${INPUT} sm:w-48 flex-1`} />
              <button onClick={copyLink} className="px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap" style={{ background: 'rgba(99,102,241,.2)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,.3)' }}>
                Salin
              </button>
            </div>
          </div>

          {/* Tabs & List */}
          <div className={`${GLASS} overflow-hidden`}>
            <div className="p-4 border-b border-white/5 flex flex-wrap gap-2 items-center">
              {(['all', 'today', 'pending', 'confirmed', 'done'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setCurrentTab(tab)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all border ${
                    currentTab === tab
                      ? 'bg-indigo-500/25 border-indigo-500/60 text-white'
                      : 'border-white/10 text-white/40 hover:border-white/25'
                  }`}
                >
                  {tab === 'all' ? 'Semua' : tab === 'today' ? 'Hari Ini' : tab === 'pending' ? 'Menunggu' : tab === 'confirmed' ? 'Dikonfirmasi' : 'Selesai'}
                </button>
              ))}
              <input
                type="text"
                placeholder="Cari nama / layanan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`${INPUT} ml-auto w-44`}
              />
            </div>

            <div className="divide-y divide-white/5 min-h-[180px]">
              {filtered.length === 0 ? (
                <div className="py-14 text-center text-white/25 text-sm">Tidak ada booking ditemukan</div>
              ) : (
                filtered.map(b => {
                  const [y, m, d] = b.date.split('-');
                  const dateLabel = `${d} ${MONTH_ID[parseInt(m) - 1]} ${y}`;
                  return (
                    <div key={b.id} className="p-4 hover:bg-white/5 transition flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl flex flex-col items-center justify-center flex-shrink-0" style={{ background: 'rgba(99,102,241,.15)', color: '#a5b4fc' }}>
                        <span className="text-[9px] font-bold">{MONTH_ID[parseInt(m) - 1]}</span>
                        <span className="text-lg font-black leading-none">{d}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm">{b.name}</span>
                          <span className="px-2 py-1 rounded-full text-xs font-bold" style={{ background: statusColors[b.status].bg, color: statusColors[b.status].text }}>
                            {statusLabels[b.status]}
                          </span>
                          {b.guests > 1 && <span className="text-xs text-white/35">{b.guests} tamu</span>}
                        </div>
                        <p className="text-xs text-white/45 mt-0.5">{b.service} • {b.time} WIB • {dateLabel}</p>
                        {b.notes && <p className="text-xs text-white/25 italic mt-0.5">"{b.notes}"</p>}
                      </div>
                      <div className="flex gap-1.5 flex-wrap items-center">
                        {b.phone && (
                          <button onClick={() => sendWA(b)} className="px-2 py-1 rounded-lg text-[10px] font-bold" style={{ background: 'rgba(37,211,102,.12)', color: '#25d366', border: '1px solid rgba(37,211,102,.22)' }}>
                            WA
                          </button>
                        )}
                        {b.status === 'pending' && (
                          <button onClick={() => updateStatus(b.id, 'confirmed')} className="px-2 py-1 rounded-lg text-[10px] font-bold" style={{ background: 'rgba(34,197,94,.12)', color: '#6ee7b7', border: '1px solid rgba(34,197,94,.22)' }}>
                            Konfirmasi
                          </button>
                        )}
                        {b.status === 'confirmed' && (
                          <button onClick={() => updateStatus(b.id, 'done')} className="px-2 py-1 rounded-lg text-[10px] font-bold" style={{ background: 'rgba(99,102,241,.12)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,.22)' }}>
                            Selesai
                          </button>
                        )}
                        {b.status !== 'done' && b.status !== 'cancelled' && (
                          <button onClick={() => updateStatus(b.id, 'cancelled')} className="px-2 py-1 rounded-lg text-[10px] font-bold" style={{ background: 'rgba(239,68,68,.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,.2)' }}>
                            Batalkan
                          </button>
                        )}
                        <button onClick={() => openEdit(b)} className="px-2 py-1 rounded-lg text-[10px] font-bold" style={{ background: 'rgba(255,255,255,.05)', color: 'rgba(255,255,255,.45)', border: '1px solid rgba(255,255,255,.1)' }}>
                          Edit
                        </button>
                        <button onClick={() => deleteBooking(b.id)} className="px-2 py-1 rounded-lg text-[10px] font-bold" style={{ background: 'rgba(239,68,68,.06)', color: 'rgba(239,68,68,.5)', border: '1px solid rgba(239,68,68,.12)' }}>
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(8px)' }}>
          <div className="rounded-2xl p-6 w-full max-w-md shadow-2xl" style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,.1)' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-white">{editId ? 'Edit Booking' : 'Tambah Booking'}</h3>
              <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white text-xl leading-none">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-white/40 mb-1 block">Nama Pelanggan *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={INPUT}
                  placeholder="Nama pelanggan"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-white/40 mb-1 block">No. HP</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={INPUT}
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/40 mb-1 block">Jumlah Tamu</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.guests}
                    onChange={(e) => setFormData({ ...formData, guests: Number(e.target.value) })}
                    className={INPUT}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-white/40 mb-1 block">Layanan *</label>
                <input
                  type="text"
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  className={INPUT}
                  placeholder="Contoh: Potong Rambut + Cuci"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-white/40 mb-1 block">Tanggal *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className={INPUT}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/40 mb-1 block">Jam *</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className={INPUT}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-white/40 mb-1 block">Catatan</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className={`${INPUT} h-16 resize-none`}
                  placeholder="Catatan tambahan..."
                />
              </div>
            </div>
            {error && (
              <div className="mt-3 px-3 py-2 rounded-xl text-xs" style={{ background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.3)', color: '#fca5a5' }}>
                {error}
              </div>
            )}
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.6)' }}>
                Batal
              </button>
              <button onClick={saveBooking} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
