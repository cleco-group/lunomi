import { useState, useEffect, useCallback } from 'react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import Sidebar from '../components/Sidebar';

const GLASS = 'rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm';
const INPUT = 'w-full px-3 py-2.5 rounded-xl text-sm bg-white/7 border border-white/15 text-white placeholder:text-white/35 focus:border-indigo-500/70 focus:ring-3 focus:ring-indigo-500/15 outline-none transition';

const SCHED_KEY = 'lunomi_staff_schedule';

interface Shift {
  key: 'pagi' | 'siang' | 'malam';
  label: string;
  time: string;
  bg: string;
  color: string;
  border: string;
}

interface StaffMember {
  id: string;
  name: string;
  jabatan?: string;
  role?: string;
  status?: string;
}

interface Assignment {
  id: string;
  name: string;
  role: string;
}

type DaySchedule = Partial<Record<'pagi' | 'siang' | 'malam', Assignment>>;
type WeekSchedule = Record<string, DaySchedule>;
type AllSchedules = Record<string, WeekSchedule>;

const SHIFTS: Shift[] = [
  { key: 'pagi',  label: 'Pagi',  time: '07:00–15:00', bg: 'rgba(56,189,248,.15)',  color: '#7dd3fc', border: 'rgba(56,189,248,.3)' },
  { key: 'siang', label: 'Siang', time: '13:00–21:00', bg: 'rgba(251,191,36,.15)',  color: '#fcd34d', border: 'rgba(251,191,36,.3)' },
  { key: 'malam', label: 'Malam', time: '19:00–03:00', bg: 'rgba(129,140,248,.15)', color: '#a5b4fc', border: 'rgba(129,140,248,.3)' },
];

const DAYS_SHORT = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
const MONTH_ID = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

function getStaffList(): StaffMember[] {
  try {
    const all: StaffMember[] = JSON.parse(localStorage.getItem('lunomi_staff') || '[]');
    return all.filter(s => s.status === 'active' || !s.status);
  } catch { return []; }
}

function loadSchedules(): AllSchedules {
  try { return JSON.parse(localStorage.getItem(SCHED_KEY) || '{}'); } catch { return {}; }
}

interface AssignTarget {
  weekKey: string;
  dayIso: string;
  shiftKey: 'pagi' | 'siang' | 'malam';
}

export default function StaffSchedule() {
  const { signOut } = useSupabaseAuth();
  const [weekStart, setWeekStart] = useState<Date>(() => getWeekStart(new Date()));
  const [schedules, setSchedules] = useState<AllSchedules>({});
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [assignTarget, setAssignTarget] = useState<AssignTarget | null>(null);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [today] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    setSchedules(loadSchedules());
    setStaffList(getStaffList());
  }, []);

  const saveSchedules = useCallback((updated: AllSchedules) => {
    localStorage.setItem(SCHED_KEY, JSON.stringify(updated));
    setSchedules(updated);
  }, []);

  const weekKey = weekStart.toISOString().slice(0, 10);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const weekLabel = `${weekStart.getDate()} ${MONTH_ID[weekStart.getMonth()]} – ${weekEnd.getDate()} ${MONTH_ID[weekEnd.getMonth()]} ${weekEnd.getFullYear()}`;

  const dayDates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    dayDates.push(d);
  }

  const weekData: WeekSchedule = schedules[weekKey] || {};

  const prevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };
  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };
  const goToday = () => setWeekStart(getWeekStart(new Date()));

  // Stats
  let totalSlots = 0, filledSlots = 0;
  const assignedIds = new Set<string>();
  dayDates.forEach(d => {
    const iso = d.toISOString().slice(0, 10);
    SHIFTS.forEach(sh => {
      totalSlots++;
      if (weekData[iso]?.[sh.key]) {
        filledSlots++;
        const id = weekData[iso][sh.key]!.id;
        if (id) assignedIds.add(id);
      }
    });
  });

  // Summary
  const counts: Record<string, { name: string; role: string; shifts: number }> = {};
  staffList.forEach(s => { counts[s.id] = { name: s.name, role: s.jabatan || s.role || '—', shifts: 0 }; });
  dayDates.forEach(d => {
    const iso = d.toISOString().slice(0, 10);
    SHIFTS.forEach(sh => {
      const a = weekData[iso]?.[sh.key];
      if (a?.id && counts[a.id]) counts[a.id].shifts++;
    });
  });
  const summaryRows = Object.values(counts).filter(x => x.shifts > 0).sort((a, b) => b.shifts - a.shifts);

  const openAssign = (wKey: string, dayIso: string, shiftKey: 'pagi' | 'siang' | 'malam') => {
    const existing = schedules[wKey]?.[dayIso]?.[shiftKey];
    setSelectedStaff(existing?.id || '');
    setAssignTarget({ weekKey: wKey, dayIso, shiftKey });
  };

  const closeAssign = () => { setAssignTarget(null); setSelectedStaff(''); };

  const saveAssign = () => {
    if (!assignTarget) return;
    const { weekKey: wKey, dayIso, shiftKey } = assignTarget;
    const updated: AllSchedules = JSON.parse(JSON.stringify(schedules));
    if (!updated[wKey]) updated[wKey] = {};
    if (!updated[wKey][dayIso]) updated[wKey][dayIso] = {};

    if (!selectedStaff) {
      delete updated[wKey][dayIso][shiftKey];
    } else {
      const staff = staffList.find(s => String(s.id) === String(selectedStaff));
      if (staff) {
        updated[wKey][dayIso][shiftKey] = { id: staff.id, name: staff.name, role: staff.jabatan || staff.role || '—' };
      }
    }
    saveSchedules(updated);
    closeAssign();
  };

  const assignShift = SHIFTS.find(s => s.key === assignTarget?.shiftKey);
  const assignDay = assignTarget ? new Date(assignTarget.dayIso) : null;

  const stats = [
    { label: 'Total Slot',      val: String(totalSlots),                      color: 'rgba(255,255,255,.7)' },
    { label: 'Terisi',          val: String(filledSlots),                     color: '#6ee7b7' },
    { label: 'Kosong',          val: String(totalSlots - filledSlots),        color: '#fca5a5' },
    { label: 'Staf Terjadwal',  val: `${assignedIds.size}/${staffList.length}`, color: '#a5b4fc' },
  ];

  return (
    <div className="flex min-h-screen" style={{ background: '#020617', backgroundImage: 'radial-gradient(ellipse 70% 50% at 10% 0%,rgba(99,102,241,.25) 0%,transparent 60%),radial-gradient(ellipse 60% 45% at 90% 100%,rgba(16,185,129,.12) 0%,transparent 60%)' }}>
      <Sidebar onLogout={signOut} />
      <main className="flex-1 min-h-screen lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-40 px-8 py-4 flex items-center justify-between gap-4" style={{ background: 'rgba(2,6,23,.7)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
          <div>
            <h1 className="text-xl font-black text-white">Penjadwalan Staf</h1>
            <p className="text-xs text-white/40">Kelola jadwal shift mingguan</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={prevWeek} className={`${GLASS} px-3 py-2 text-sm font-bold hover:bg-white/10 transition cursor-pointer`}>←</button>
            <span className="text-sm font-bold px-3 text-white whitespace-nowrap">{weekLabel}</span>
            <button onClick={nextWeek} className={`${GLASS} px-3 py-2 text-sm font-bold hover:bg-white/10 transition cursor-pointer`}>→</button>
            <button onClick={goToday} className="px-3 py-2 rounded-xl text-xs font-bold cursor-pointer hover:opacity-80 transition" style={{ background: 'rgba(99,102,241,.2)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,.3)' }}>
              Minggu Ini
            </button>
          </div>
        </header>

        <div className="p-8 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map(s => (
              <div key={s.label} className={`${GLASS} p-4`}>
                <p className="text-xs text-white/40 mb-1">{s.label}</p>
                <p className="text-xl font-black" style={{ color: s.color }}>{s.val}</p>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-xs font-bold">
            {SHIFTS.map(sh => (
              <div key={sh.key} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm inline-block" style={{ background: sh.bg, border: `1px solid ${sh.border}` }} />
                <span className="text-white/70">{sh.label} {sh.time}</span>
              </div>
            ))}
            <span className="text-white/30 ml-2">Klik slot untuk assign staf</span>
          </div>

          {/* Schedule Grid */}
          <div className={`${GLASS} overflow-x-auto`}>
            <table className="w-full min-w-[700px] border-collapse">
              <thead>
                <tr style={{ background: 'rgba(255,255,255,.04)' }}>
                  <th className="px-3 py-3 text-left w-24 text-xs font-bold uppercase tracking-wider text-white/40">Shift</th>
                  {dayDates.map((d, i) => {
                    const iso = d.toISOString().slice(0, 10);
                    const isToday = iso === today;
                    return (
                      <th
                        key={iso}
                        className="px-2 py-3 text-center text-xs font-bold uppercase tracking-wider text-white/40"
                        style={isToday ? { background: 'rgba(99,102,241,.12)', borderBottom: '2px solid #6366f1' } : {}}
                      >
                        {DAYS_SHORT[i]}<br />
                        <span className="font-black text-white text-base">{d.getDate()}</span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {SHIFTS.map(sh => (
                  <tr key={sh.key} style={{ borderTop: '1px solid rgba(255,255,255,.05)' }}>
                    <td className="px-3 py-3">
                      <div className="text-xs font-bold text-white/70">{sh.label}</div>
                      <div className="text-[9px] text-white/35">{sh.time}</div>
                    </td>
                    {dayDates.map(d => {
                      const iso = d.toISOString().slice(0, 10);
                      const isToday = iso === today;
                      const assignment = weekData[iso]?.[sh.key];
                      return (
                        <td
                          key={iso}
                          className="px-2 py-2"
                          style={isToday ? { background: 'rgba(99,102,241,.05)' } : {}}
                        >
                          {assignment ? (
                            <div
                              onClick={() => openAssign(weekKey, iso, sh.key)}
                              className="rounded-lg px-2 py-1.5 cursor-pointer transition hover:brightness-110"
                              style={{ background: sh.bg, border: `1px solid ${sh.border}`, color: sh.color }}
                            >
                              <div className="text-[10px] font-bold leading-tight">{assignment.name}</div>
                              <div className="text-[8px] opacity-60 mt-0.5">{assignment.role}</div>
                            </div>
                          ) : (
                            <div
                              onClick={() => openAssign(weekKey, iso, sh.key)}
                              className="h-12 flex items-center justify-center text-white/20 text-lg rounded-lg cursor-pointer transition"
                              style={{ background: 'rgba(255,255,255,.03)', border: '1px dashed rgba(255,255,255,.1)' }}
                              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(99,102,241,.1)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(99,102,241,.4)'; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,.03)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,.1)'; }}
                            >
                              +
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Weekly Summary */}
          <div>
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Ringkasan Shift Minggu Ini</h3>
            {summaryRows.length === 0 ? (
              <p className="text-white/25 text-sm text-center py-4">Belum ada jadwal minggu ini</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {summaryRows.map(r => (
                  <div key={r.name} className={`${GLASS} rounded-xl p-3 flex justify-between items-center`}>
                    <div>
                      <div className="text-sm font-bold text-white">{r.name}</div>
                      <div className="text-xs text-white/40">{r.role}</div>
                    </div>
                    <div className="text-xl font-black text-indigo-400">
                      {r.shifts}
                      <span className="text-xs font-normal text-white/40 ml-0.5">shift</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Assign Modal */}
      {assignTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-sm rounded-2xl p-6 shadow-2xl" style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,.1)' }}>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-white">Assign {assignShift?.label}</h3>
                <p className="text-xs text-white/40 mt-0.5">
                  {assignDay ? `${DAYS_SHORT[assignDay.getDay()]} ${assignDay.getDate()} ${MONTH_ID[assignDay.getMonth()]}` : ''} — {assignShift?.time}
                </p>
              </div>
              <button onClick={closeAssign} className="text-white/40 hover:text-white text-xl cursor-pointer transition">✕</button>
            </div>

            <div>
              <label className="text-xs font-semibold text-white/40 mb-1.5 block">Pilih Staf</label>
              <select
                value={selectedStaff}
                onChange={e => setSelectedStaff(e.target.value)}
                className={INPUT}
              >
                <option value="">— Kosongkan Slot —</option>
                {staffList.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.jabatan || s.role || '—'})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={closeAssign}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold cursor-pointer hover:opacity-80 transition"
                style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.6)' }}
              >
                Batal
              </button>
              <button
                onClick={saveAssign}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer hover:opacity-90 transition"
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
