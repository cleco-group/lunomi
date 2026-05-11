import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import Sidebar from '../components/Sidebar';

// ─── Types ────────────────────────────────────────────────────────────────────

type AutoLockMode = 'none' | 'pin' | 'logout';
type SessionTimeout = 0 | 15 | 30 | 60 | 120 | 480;

interface SecuritySettings {
  pin?: string;
  pinChangedAt?: string;
  sessionTimeout: SessionTimeout;
  autoLock: AutoLockMode;
  pinRefund: boolean;
  pinVoid: boolean;
  pinDiscount: boolean;
  updatedAt?: string;
}

interface AuditEntry {
  id: string;
  action: string;
  detail: string;
  at: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SEC_KEY   = 'lunomi_security_log';
const AUDIT_KEY = 'lunomi_audit_log';

const GLASS = 'rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm';
const INPUT = 'w-full px-3 py-2.5 rounded-xl text-sm bg-white/7 border border-white/15 text-white placeholder:text-white/35 focus:border-indigo-500/70 focus:ring-3 focus:ring-indigo-500/15 outline-none transition';

const defaultSettings = (): SecuritySettings => ({
  sessionTimeout: 30,
  autoLock:       'none',
  pinRefund:      true,
  pinVoid:        true,
  pinDiscount:    false,
});

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ msg }: { msg: string }) {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] px-5 py-3 rounded-xl bg-emerald-600 text-white text-sm font-semibold shadow-xl flex items-center gap-2">
      <span>✓</span>
      <span>{msg}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Security() {
  const { signOut } = useSupabaseAuth();

  const [settings, setSettings] = useState<SecuritySettings>(defaultSettings);
  const [auditLog, setAuditLog]  = useState<AuditEntry[]>([]);
  const [toastMsg, setToastMsg]  = useState('');

  // PIN form
  const [oldPin,     setOldPin]     = useState('');
  const [newPin,     setNewPin]     = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError,   setPinError]   = useState('');

  // ─── Load ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    const s = localStorage.getItem(SEC_KEY);
    if (s) setSettings({ ...defaultSettings(), ...JSON.parse(s) });

    const a = localStorage.getItem(AUDIT_KEY);
    if (a) setAuditLog(JSON.parse(a));
  }, []);

  // ─── Helpers ───────────────────────────────────────────────────────────────

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2800);
  };

  const addAuditEntry = (action: string, detail: string) => {
    const entry: AuditEntry = {
      id:     'aud_' + Date.now(),
      action,
      detail,
      at:     new Date().toISOString(),
    };
    const updated = [...auditLog, entry];
    setAuditLog(updated);
    localStorage.setItem(AUDIT_KEY, JSON.stringify(updated));
    return updated;
  };

  // ─── PIN strength ──────────────────────────────────────────────────────────

  const pinStrengthLabel = (() => {
    const len = newPin.length;
    if (len === 0) return 'Masukkan PIN baru';
    if (len < 3)   return 'Terlalu pendek';
    if (len === 3) return 'Hampir';
    return 'PIN siap';
  })();

  const pinStrengthColor = newPin.length === 4 ? '#4ade80' : 'rgba(255,255,255,.3)';

  // ─── Change PIN ────────────────────────────────────────────────────────────

  const changePin = () => {
    setPinError('');
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setPinError('PIN harus 4 digit angka.');
      return;
    }
    if (newPin !== confirmPin) {
      setPinError('Konfirmasi PIN tidak cocok.');
      return;
    }
    const stored = JSON.parse(localStorage.getItem(SEC_KEY) || '{}') as SecuritySettings;
    if (stored.pin && stored.pin !== oldPin) {
      setPinError('PIN lama tidak sesuai.');
      return;
    }

    const updated: SecuritySettings = {
      ...settings,
      pin:          newPin,
      pinChangedAt: new Date().toISOString(),
    };
    localStorage.setItem(SEC_KEY, JSON.stringify(updated));
    setSettings(updated);
    setOldPin('');
    setNewPin('');
    setConfirmPin('');
    addAuditEntry('security_pin_change', 'PIN kasir diperbarui');
    showToast('PIN berhasil diperbarui!');
  };

  // ─── Save settings ─────────────────────────────────────────────────────────

  const saveSettings = () => {
    const updated: SecuritySettings = { ...settings, updatedAt: new Date().toISOString() };
    localStorage.setItem(SEC_KEY, JSON.stringify(updated));
    setSettings(updated);
    addAuditEntry(
      'security_settings_save',
      `Pengaturan keamanan disimpan — timeout ${settings.sessionTimeout} mnt`
    );
    showToast('Pengaturan keamanan disimpan!');
  };

  // ─── Audit log ─────────────────────────────────────────────────────────────

  const clearAuditLog = () => {
    if (!confirm('Hapus semua log aktivitas? Tindakan ini tidak bisa dibatalkan.')) return;
    localStorage.removeItem(AUDIT_KEY);
    setAuditLog([]);
    showToast('Log aktivitas dihapus');
  };

  const recentLogs = [...auditLog].reverse().slice(0, 20);

  // ─── Session ───────────────────────────────────────────────────────────────

  const logoutNow = () => {
    if (!confirm('Logout sekarang?')) return;
    addAuditEntry('security_logout', 'Logout manual dari halaman keamanan');
    signOut();
  };

  const logoutAllSessions = () => {
    if (!confirm('Logout semua sesi aktif? Anda akan diarahkan ke login.')) return;
    addAuditEntry('security_logout_all', 'Logout semua sesi');
    signOut();
  };

  // ─── Settings toggle helper ────────────────────────────────────────────────

  const toggle = (key: 'pinRefund' | 'pinVoid' | 'pinDiscount') =>
    setSettings(s => ({ ...s, [key]: !s[key] }));

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
          className="sticky top-0 z-40 pl-14 pr-6 lg:px-8 py-4 flex items-center justify-between"
          style={{
            background: 'rgba(2,6,23,.7)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,.08)',
          }}
        >
          <div>
            <h1 className="text-xl font-black text-white">Keamanan Akun</h1>
            <p className="text-xs text-white/40">Kelola PIN, sesi, dan log aktivitas</p>
          </div>
          <button
            onClick={saveSettings}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)' }}
          >
            Simpan Pengaturan
          </button>
        </header>

        <div className="p-8 max-w-3xl space-y-6">
          {/* ── PIN Kasir ─────────────────────────────────────────── */}
          <div className={`${GLASS} p-6`}>
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              🔴 PIN Kasir
            </h3>
            <p className="text-xs text-white/40 mb-4">
              PIN 4 digit digunakan untuk membuka POS dan konfirmasi transaksi penting.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'PIN Lama',      val: oldPin,     setter: setOldPin,     placeholder: '••••' },
                { label: 'PIN Baru',      val: newPin,     setter: setNewPin,     placeholder: '••••' },
                { label: 'Konfirmasi PIN', val: confirmPin, setter: setConfirmPin, placeholder: '••••' },
              ].map(({ label, val, setter, placeholder }) => (
                <div key={label}>
                  <label className="block text-xs font-bold text-white/40 mb-1">{label}</label>
                  <input
                    type="password"
                    maxLength={4}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={val}
                    onChange={e => setter(e.target.value.replace(/\D/g, ''))}
                    className={INPUT + ' tracking-widest'}
                    placeholder={placeholder}
                  />
                </div>
              ))}
            </div>

            {/* PIN strength dots */}
            <div className="mt-3 flex items-center gap-1.5">
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full transition-all duration-200"
                  style={{
                    background:   i < newPin.length ? '#ef4444' : 'rgba(255,255,255,.15)',
                    border:       `2px solid ${i < newPin.length ? '#ef4444' : 'rgba(255,255,255,.3)'}`,
                  }}
                />
              ))}
              <span className="text-xs ml-2 transition-colors" style={{ color: pinStrengthColor }}>
                {pinStrengthLabel}
              </span>
            </div>

            {pinError && (
              <div
                className="mt-3 px-3 py-2 rounded-xl text-xs"
                style={{ background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.3)', color: '#fca5a5' }}
              >
                {pinError}
              </div>
            )}

            <button
              onClick={changePin}
              className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 rounded-xl text-sm font-bold text-white transition"
            >
              Perbarui PIN
            </button>
          </div>

          {/* ── Sesi & Timeout ──────────────────────────────────────── */}
          <div className={`${GLASS} p-6`}>
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              🟠 Sesi &amp; Timeout
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-white/40 mb-1">Timeout Sesi (menit)</label>
                <select
                  value={settings.sessionTimeout}
                  onChange={e => setSettings(s => ({ ...s, sessionTimeout: Number(e.target.value) as SessionTimeout }))}
                  className={INPUT}
                >
                  <option value={0}>Tidak ada timeout</option>
                  <option value={15}>15 menit</option>
                  <option value={30}>30 menit</option>
                  <option value={60}>1 jam</option>
                  <option value={120}>2 jam</option>
                  <option value={480}>8 jam</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-white/40 mb-1">Mode Kunci Otomatis</label>
                <select
                  value={settings.autoLock}
                  onChange={e => setSettings(s => ({ ...s, autoLock: e.target.value as AutoLockMode }))}
                  className={INPUT}
                >
                  <option value="none">Tidak</option>
                  <option value="pin">Kunci dengan PIN</option>
                  <option value="logout">Logout otomatis</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              {([
                { key: 'pinRefund'   as const, label: 'Require PIN untuk Refund',           desc: 'Wajib masuk PIN sebelum proses refund' },
                { key: 'pinVoid'     as const, label: 'Require PIN untuk Hapus Transaksi',   desc: 'Wajib masuk PIN sebelum void/delete transaksi' },
                { key: 'pinDiscount' as const, label: 'Require PIN untuk Diskon',            desc: 'Wajib masuk PIN untuk memberikan diskon manual' },
              ]).map(({ key, label, desc }) => (
                <label
                  key={key}
                  className={`flex items-center justify-between p-3 ${GLASS} rounded-xl cursor-pointer hover:bg-white/5 transition`}
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{label}</p>
                    <p className="text-xs text-white/40">{desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings[key]}
                    onChange={() => toggle(key)}
                    className="w-4 h-4 accent-red-500"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* ── Log Aktivitas ────────────────────────────────────────── */}
          <div className={`${GLASS} overflow-hidden`}>
            <div
              className="p-5 flex justify-between items-center"
              style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}
            >
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                🔵 Log Aktivitas Terbaru
              </h3>
              <button
                onClick={clearAuditLog}
                className="text-xs text-red-400 hover:text-red-300 transition flex items-center gap-1"
              >
                🗑 Hapus Log
              </button>
            </div>
            <div className="divide-y max-h-64 overflow-y-auto" style={{ borderColor: 'rgba(255,255,255,.05)' }}>
              {recentLogs.length === 0 ? (
                <div className="px-6 py-8 text-center text-sm" style={{ color: 'rgba(255,255,255,.3)' }}>
                  Tidak ada log aktivitas
                </div>
              ) : recentLogs.map(l => {
                const dt = new Date(l.at).toLocaleString('id-ID', {
                  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                });
                return (
                  <div key={l.id} className="px-6 py-3 flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{l.detail}</p>
                      <p className="text-xs font-mono" style={{ color: 'rgba(255,255,255,.3)' }}>{l.action}</p>
                    </div>
                    <span className="text-xs shrink-0" style={{ color: 'rgba(255,255,255,.3)' }}>{dt}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Sesi Aktif ──────────────────────────────────────────── */}
          <div className={`${GLASS} p-6`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                🟢 Sesi Aktif
              </h3>
              <button
                onClick={logoutAllSessions}
                className="text-xs text-red-400 hover:text-red-300 transition"
              >
                Logout Semua
              </button>
            </div>

            <div className={`${GLASS} p-4 text-sm space-y-2`}>
              <div className="flex justify-between">
                <span className="text-white/40">Status</span>
                <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  Aktif
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Sesi saat ini</span>
                <span className="font-semibold text-white text-xs">1 sesi</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-white/40 text-xs">Aksi</span>
                <button
                  onClick={logoutNow}
                  className="text-xs text-red-400 hover:text-red-300 transition"
                >
                  Logout Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {toastMsg && <Toast msg={toastMsg} />}
    </div>
  );
}
