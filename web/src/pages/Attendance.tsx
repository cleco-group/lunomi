import { useState, useEffect, useRef } from 'react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import Sidebar from '../components/Sidebar';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  status: string;
}

interface AttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  role: string;
  date: string;
  time: string;
  type: 'in' | 'out';
  duration?: string;
  note: string;
  createdAt: string;
}

const GLASS = 'rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm';
const INPUT = 'w-full px-3 py-2.5 rounded-xl text-sm bg-white/7 border border-white/15 text-white placeholder:text-white/35 focus:border-indigo-500/70 focus:ring-3 focus:ring-indigo-500/15 outline-none transition';

function getAttendance(): AttendanceRecord[] {
  try { return JSON.parse(localStorage.getItem('lunomi_attendance') || '[]'); } catch { return []; }
}

function saveAttendance(arr: AttendanceRecord[]) {
  localStorage.setItem('lunomi_attendance', JSON.stringify(arr));
}

function getStaff(): StaffMember[] {
  try { return JSON.parse(localStorage.getItem('lunomi_staff') || '[]'); } catch { return []; }
}

export default function Attendance() {
  const { signOut } = useSupabaseAuth();
  const [activeTab, setActiveTab] = useState<'absen' | 'history'>('absen');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [absenNote, setAbsenNote] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [liveClock, setLiveClock] = useState('');
  const [liveDate, setLiveDate] = useState('');
  const [toast, setToast] = useState('');
  const [toastErr, setToastErr] = useState(false);
  const clockRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setRecords(getAttendance());
    setStaff(getStaff().filter(s => s.status === 'active'));
    const now = new Date();
    setMonthFilter(now.toISOString().slice(0, 7));

    const tick = () => {
      const n = new Date();
      setLiveClock(n.toLocaleTimeString('id-ID', { hour12: false }));
      setLiveDate(n.toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }));
    };
    tick();
    clockRef.current = setInterval(tick, 1000);
    return () => { if (clockRef.current) clearInterval(clockRef.current); };
  }, []);

  const showToastMsg = (msg: string, isErr = false) => {
    setToast(msg);
    setToastErr(isErr);
    setTimeout(() => setToast(''), 3000);
  };

  const today = new Date().toISOString().slice(0, 10);

  const getStatus = (): { text: string; bg: string; color: string } | null => {
    if (!selectedStaffId) return null;
    const todayRecs = records.filter(a => a.staffId === selectedStaffId && a.date === today);
    const lastRec = todayRecs[todayRecs.length - 1];
    if (!lastRec) {
      return { text: 'Belum clock in hari ini', bg: 'rgba(255,255,255,.07)', color: 'rgba(255,255,255,.5)' };
    } else if (lastRec.type === 'in') {
      return { text: `Clock In: ${lastRec.time} — Sedang bertugas`, bg: 'rgba(16,185,129,.12)', color: '#4ade80' };
    } else {
      return { text: `Sudah Clock Out: ${lastRec.time}`, bg: 'rgba(245,158,11,.12)', color: '#fcd34d' };
    }
  };

  const clockIn = () => {
    if (!selectedStaffId) { showToastMsg('Pilih karyawan terlebih dahulu!', true); return; }
    const member = staff.find(s => s.id === selectedStaffId);
    const existing = records.find(a => a.staffId === selectedStaffId && a.date === today && a.type === 'in');
    if (existing) { showToastMsg(`${member?.name || 'Karyawan'} sudah clock in hari ini`, true); return; }

    const now = new Date();
    const rec: AttendanceRecord = {
      id: 'ATT-' + Date.now(),
      staffId: selectedStaffId,
      staffName: member?.name || '—',
      role: member?.role || '—',
      date: today,
      time: now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      type: 'in',
      note: absenNote.trim(),
      createdAt: now.toISOString(),
    };
    const updated = [...records, rec];
    saveAttendance(updated);
    setRecords(updated);
    setAbsenNote('');
    showToastMsg(`${member?.name || 'Karyawan'} Clock In ${rec.time}`);
  };

  const clockOut = () => {
    if (!selectedStaffId) { showToastMsg('Pilih karyawan terlebih dahulu!', true); return; }
    const member = staff.find(s => s.id === selectedStaffId);
    const todayRecs = records.filter(a => a.staffId === selectedStaffId && a.date === today);
    const hasIn = todayRecs.some(a => a.type === 'in');
    const hasOut = todayRecs.some(a => a.type === 'out');
    if (!hasIn) { showToastMsg(`${member?.name || 'Karyawan'} belum clock in!`, true); return; }
    if (hasOut) { showToastMsg(`${member?.name || 'Karyawan'} sudah clock out hari ini`, true); return; }

    const now = new Date();
    const inRec = todayRecs.find(a => a.type === 'in');
    let duration = '';
    if (inRec) {
      const [inH, inM] = inRec.time.split(':').map(Number);
      const mins = (now.getHours() - inH) * 60 + (now.getMinutes() - inM);
      const h = Math.floor(mins / 60), m = mins % 60;
      duration = `${h}j ${m}m`;
    }
    const rec: AttendanceRecord = {
      id: 'ATT-' + Date.now(),
      staffId: selectedStaffId,
      staffName: member?.name || '—',
      role: member?.role || '—',
      date: today,
      time: now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      type: 'out',
      duration,
      note: absenNote.trim(),
      createdAt: now.toISOString(),
    };
    const updated = [...records, rec];
    saveAttendance(updated);
    setRecords(updated);
    setAbsenNote('');
    showToastMsg(`${member?.name || 'Karyawan'} Clock Out ${rec.time}${duration ? ' (' + duration + ')' : ''}`);
  };

  // Today stats
  const todayRecs = records.filter(a => a.date === today);
  const staffInSet = new Set(todayRecs.filter(r => r.type === 'in').map(r => r.staffId));
  const outSet = new Set(todayRecs.filter(r => r.type === 'out').map(r => r.staffId));
  const onsiteCount = [...staffInSet].filter(id => !outSet.has(id)).length;

  // Today activity (sorted newest first)
  const todayActivity = [...todayRecs].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  // History filtered
  const historyRecs = records
    .filter(a => !monthFilter || a.date.startsWith(monthFilter))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const status = getStatus();

  return (
    <div
      className="flex min-h-screen"
      style={{
        background: '#020617',
        backgroundImage:
          'radial-gradient(ellipse 70% 50% at 10% 0%,rgba(99,102,241,.2) 0%,transparent 60%),radial-gradient(ellipse 60% 45% at 90% 100%,rgba(16,185,129,.12) 0%,transparent 60%)',
      }}
    >
      <Sidebar onLogout={signOut} />
      <main className="flex-1 min-h-screen lg:ml-64">
        {/* Header */}
        <header
          className="sticky top-0 z-40 px-8 py-4 flex items-center justify-between"
          style={{ background: 'rgba(2,6,23,.7)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,.08)' }}
        >
          <div>
            <h1 className="text-xl font-black text-white">Absensi Staf</h1>
            <p className="text-xs text-white/40">Clock in &amp; clock out karyawan harian</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('absen')}
              className="px-4 py-1.5 rounded-full text-xs font-semibold transition"
              style={{
                background: activeTab === 'absen' ? 'rgba(99,102,241,.25)' : 'transparent',
                border: activeTab === 'absen' ? '1px solid rgba(99,102,241,.5)' : '1px solid rgba(255,255,255,.12)',
                color: activeTab === 'absen' ? 'white' : 'rgba(255,255,255,.5)',
              }}
            >
              Clock In/Out
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className="px-4 py-1.5 rounded-full text-xs font-semibold transition"
              style={{
                background: activeTab === 'history' ? 'rgba(99,102,241,.25)' : 'transparent',
                border: activeTab === 'history' ? '1px solid rgba(99,102,241,.5)' : '1px solid rgba(255,255,255,.12)',
                color: activeTab === 'history' ? 'white' : 'rgba(255,255,255,.5)',
              }}
            >
              Riwayat
            </button>
          </div>
        </header>

        <div className="p-8">
          {/* TAB: Clock In/Out */}
          {activeTab === 'absen' && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Clock Panel */}
              <div className={`${GLASS} p-6 text-center`}>
                <div className="text-4xl font-extrabold text-white mb-1">{liveClock}</div>
                <div className="text-xs mb-6 text-white/40">{liveDate}</div>

                {/* Staff Selector */}
                <div className="text-left mb-4">
                  <label className="text-xs font-semibold mb-2 block text-white/50">Pilih Karyawan</label>
                  <select
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                    className={INPUT}
                  >
                    <option value="">— Pilih karyawan —</option>
                    {staff.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                    ))}
                  </select>
                </div>

                {/* Status indicator */}
                {status && selectedStaffId && (
                  <div
                    className="mb-4 py-2 px-4 rounded-xl text-xs font-bold text-left"
                    style={{ background: status.bg, color: status.color }}
                  >
                    {status.text}
                  </div>
                )}

                {/* Clock In / Clock Out buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={clockIn}
                    className="py-3.5 rounded-xl font-bold text-white transition flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 4px 16px rgba(16,185,129,.25)' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Clock In
                  </button>
                  <button
                    onClick={clockOut}
                    className="py-3.5 rounded-xl font-bold text-white transition flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)', boxShadow: '0 4px 16px rgba(239,68,68,.25)' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6v4H9z" />
                    </svg>
                    Clock Out
                  </button>
                </div>

                {/* Note */}
                <div className="mt-4 text-left">
                  <label className="text-xs font-semibold mb-1.5 block text-white/50">Catatan (opsional)</label>
                  <input
                    type="text"
                    value={absenNote}
                    onChange={(e) => setAbsenNote(e.target.value)}
                    className={INPUT}
                    placeholder="cth: telat karena macet..."
                  />
                </div>
              </div>

              {/* Today Summary */}
              <div className="space-y-4">
                <div className={`${GLASS} p-5`}>
                  <div className="font-bold text-white text-sm mb-4">Aktivitas Hari Ini</div>
                  {todayActivity.length === 0 ? (
                    <div className="text-sm text-center py-4 text-white/30">Belum ada absensi hari ini</div>
                  ) : (
                    <div className="space-y-0">
                      {todayActivity.map(r => (
                        <div
                          key={r.id}
                          className="flex items-center justify-between py-2"
                          style={{ borderBottom: '1px solid rgba(255,255,255,.05)' }}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{
                                background: r.type === 'in' ? 'rgba(16,185,129,.15)' : 'rgba(239,68,68,.15)',
                              }}
                            >
                              {r.type === 'in' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#4ade80' }}>
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#f87171' }}>
                                  <rect x="7" y="7" width="10" height="10" rx="1" />
                                </svg>
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-white">{r.staffName}</div>
                              <div className="text-xs text-white/35">{r.role}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold" style={{ color: r.type === 'in' ? '#4ade80' : '#f87171' }}>{r.time}</div>
                            {r.duration && <div className="text-xs text-white/30">{r.duration}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className={`${GLASS} p-3 text-center`}>
                    <div className="text-xs mb-1 text-white/40">Hadir</div>
                    <div className="text-xl font-extrabold text-green-400">{staffInSet.size}</div>
                  </div>
                  <div className={`${GLASS} p-3 text-center`}>
                    <div className="text-xs mb-1 text-white/40">Masih Di Sini</div>
                    <div className="text-xl font-extrabold text-indigo-400">{onsiteCount}</div>
                  </div>
                  <div className={`${GLASS} p-3 text-center`}>
                    <div className="text-xs mb-1 text-white/40">Pulang</div>
                    <div className="text-xl font-extrabold text-amber-400">{outSet.size}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: History */}
          {activeTab === 'history' && (
            <div className={`${GLASS} overflow-hidden`}>
              <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,.07)' }}>
                <div className="font-bold text-white">Riwayat Absensi</div>
                <input
                  type="month"
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl text-xs outline-none"
                  style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)', color: 'white' }}
                />
              </div>

              {historyRecs.length === 0 ? (
                <div className="py-16 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 mx-auto mb-3 opacity-25" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-white/40">Belum ada riwayat absensi</div>
                </div>
              ) : (
                <div>
                  {historyRecs.map(r => (
                    <div
                      key={r.id}
                      className="px-5 py-3 flex items-center justify-between"
                      style={{ borderBottom: '1px solid rgba(255,255,255,.05)' }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: r.type === 'in' ? 'rgba(16,185,129,.12)' : 'rgba(239,68,68,.12)' }}
                        >
                          {r.type === 'in' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#4ade80' }}>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#f87171' }}>
                              <rect x="7" y="7" width="10" height="10" rx="1" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">
                            {r.staffName}{' '}
                            <span className="text-white/30 text-[0.7rem]">{r.role}</span>
                          </div>
                          <div className="text-xs text-white/35">
                            {r.date} · {r.type === 'in' ? 'Clock In' : 'Clock Out'}
                            {r.duration ? ' · ' + r.duration : ''}
                          </div>
                          {r.note && <div className="text-xs italic text-white/25">{r.note}</div>}
                        </div>
                      </div>
                      <div className="font-bold text-sm" style={{ color: r.type === 'in' ? '#4ade80' : '#f87171' }}>
                        {r.time}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 px-5 py-3 rounded-xl text-sm font-semibold shadow-xl flex items-center gap-2 z-50"
          style={{
            background: toastErr ? 'rgba(239,68,68,.85)' : 'rgba(34,197,94,.85)',
            backdropFilter: 'blur(8px)',
            border: toastErr ? '1px solid rgba(239,68,68,.4)' : '1px solid rgba(34,197,94,.4)',
            color: 'white',
          }}
        >
          {!toastErr && (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {toast}
        </div>
      )}
    </div>
  );
}
