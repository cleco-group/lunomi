import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import Sidebar from '../components/Sidebar';
import toast from 'react-hot-toast';

const GLASS = 'rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm';
const INPUT = 'w-full px-3 py-2.5 rounded-xl text-sm bg-white/7 border border-white/15 text-white placeholder:text-white/35 focus:border-indigo-500/70 focus:ring-3 focus:ring-indigo-500/15 outline-none transition';
const WA_KEY = 'lunomi_whatsapp_config';

interface Template {
  id: string;
  name: string;
  msg: string;
}

interface WAConfig {
  number: string;
  businessName: string;
  notifBooking: boolean;
  notifReceipt: boolean;
  notifReady: boolean;
  notifPromo: boolean;
  templates: Template[];
  updatedAt?: string;
}

const DEFAULT_TEMPLATES: Template[] = [
  { id: 'tpl_booking', name: 'Konfirmasi Booking', msg: 'Halo {nama}! Reservasi Anda di {outlet} untuk {tanggal} telah dikonfirmasi. Terima kasih!' },
  { id: 'tpl_receipt', name: 'Struk Digital', msg: 'Halo {nama}, terima kasih telah makan di {outlet}! Total: {total}. Sampai jumpa lagi!' },
  { id: 'tpl_promo', name: 'Promo Spesial', msg: 'Halo {nama}! Ada promo spesial dari {outlet}. Segera kunjungi kami!' },
];

const DEFAULT_CONFIG: WAConfig = {
  number: '',
  businessName: '',
  notifBooking: true,
  notifReceipt: false,
  notifReady: false,
  notifPromo: false,
  templates: DEFAULT_TEMPLATES,
};

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-6 rounded-full transition-all cursor-pointer flex-shrink-0 ${checked ? 'bg-emerald-500' : 'bg-white/15'}`}
      aria-checked={checked}
      role="switch"
    >
      <span
        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${checked ? 'left-7' : 'left-1'}`}
      />
    </button>
  );
}

export default function WhatsApp() {
  const { signOut } = useSupabaseAuth();

  const [config, setConfig] = useState<WAConfig>(DEFAULT_CONFIG);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(WA_KEY) || '{}') as Partial<WAConfig>;
      setConfig({
        number: saved.number ?? '',
        businessName: saved.businessName ?? '',
        notifBooking: saved.notifBooking ?? true,
        notifReceipt: saved.notifReceipt ?? false,
        notifReady: saved.notifReady ?? false,
        notifPromo: saved.notifPromo ?? false,
        templates: saved.templates ?? JSON.parse(JSON.stringify(DEFAULT_TEMPLATES)),
      });
    } catch {
      /* ignore */
    }
  }, []);

  const handleSave = () => {
    const toSave: WAConfig = { ...config, updatedAt: new Date().toISOString() };
    localStorage.setItem(WA_KEY, JSON.stringify(toSave));
    toast.success('Pengaturan WhatsApp disimpan!');
  };

  const handleTestWA = () => {
    const num = config.number.trim();
    if (!num) { toast.error('Masukkan nomor WA terlebih dahulu.'); return; }
    window.open('https://wa.me/62' + num + '?text=' + encodeURIComponent('Halo! Ini adalah test pesan dari Lunomi POS.'), '_blank');
  };

  const handleAddTemplate = () => {
    const newTpl: Template = { id: 'tpl_' + Date.now(), name: 'Template Baru', msg: 'Halo {nama}!' };
    setConfig({ ...config, templates: [...config.templates, newTpl] });
  };

  const handleDeleteTemplate = (index: number) => {
    const updated = config.templates.filter((_, i) => i !== index);
    setConfig({ ...config, templates: updated });
    setDeleteIndex(null);
    toast.success('Template dihapus.');
  };

  const handleUpdateTemplate = (index: number, field: 'name' | 'msg', value: string) => {
    const updated = config.templates.map((t, i) => (i === index ? { ...t, [field]: value } : t));
    setConfig({ ...config, templates: updated });
  };

  const handleSendTemplateTest = (index: number) => {
    const num = config.number.trim();
    if (!num) { toast.error('Masukkan nomor WA terlebih dahulu.'); return; }
    const outlet = (() => { try { return JSON.parse(localStorage.getItem('lunomi_outlet') || '{}'); } catch { return {}; } })();
    const msg = config.templates[index].msg
      .replace(/{nama}/g, 'Pelanggan')
      .replace(/{total}/g, 'Rp 100.000')
      .replace(/{tanggal}/g, new Date().toLocaleDateString('id-ID'))
      .replace(/{outlet}/g, outlet.name || 'Outlet');
    window.open('https://wa.me/62' + num + '?text=' + encodeURIComponent(msg), '_blank');
  };

  return (
    <div
      className="flex min-h-screen"
      style={{
        background: '#020617',
        backgroundImage:
          'radial-gradient(ellipse at 20% 20%, rgba(34,197,94,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(99,102,241,0.05) 0%, transparent 60%)',
      }}
    >
      <Sidebar onLogout={signOut} />
      <main className="flex-1 min-h-screen lg:ml-64">
        {/* Sticky Header */}
        <header
          className="sticky top-0 z-40 flex items-center justify-between px-8 py-4"
          style={{
            background: 'rgba(2,6,23,0.75)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div>
            <h1 className="text-xl font-black text-white">WhatsApp Business</h1>
            <p className="text-xs text-white/40">Konfigurasi nomor dan template pesan WhatsApp</p>
          </div>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 cursor-pointer"
            style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)' }}
          >
            Simpan Pengaturan
          </button>
        </header>

        <div className="p-8 max-w-4xl space-y-6">
          {/* Nomor WA */}
          <div className={GLASS + ' p-6'}>
            <h3 className="text-base font-bold mb-5 text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              Nomor WhatsApp Bisnis
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-white/40 mb-1 uppercase tracking-wide">
                  Nomor WA Outlet *
                </label>
                <div className="flex gap-2">
                  <span className="px-3 py-2.5 rounded-xl text-sm border border-white/15 bg-white/5 text-white/60 shrink-0">
                    +62
                  </span>
                  <input
                    type="tel"
                    value={config.number}
                    onChange={(e) => setConfig({ ...config, number: e.target.value })}
                    placeholder="81234567890"
                    className={INPUT}
                  />
                </div>
                <p className="text-xs text-white/30 mt-1">Tanpa angka 0 di awal, tanpa spasi/strip</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/40 mb-1 uppercase tracking-wide">
                  Nama Bisnis WA
                </label>
                <input
                  type="text"
                  value={config.businessName}
                  onChange={(e) => setConfig({ ...config, businessName: e.target.value })}
                  placeholder="Lunomi Restoran"
                  className={INPUT}
                />
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={handleTestWA}
                className="px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer hover:-translate-y-0.5"
                style={{ background: 'rgba(34,197,94,0.2)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.35)' }}
              >
                Test Kirim WA
              </button>
            </div>
          </div>

          {/* Template Pesan */}
          <div className={GLASS + ' p-6'}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
                Template Pesan
              </h3>
              <button
                onClick={handleAddTemplate}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white border border-white/10 hover:border-white/25 bg-white/5 hover:bg-white/10 transition cursor-pointer flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Tambah
              </button>
            </div>
            <p className="text-xs text-white/30 mb-4">
              Gunakan variabel:{' '}
              {['{nama}', '{total}', '{tanggal}', '{outlet}'].map((v) => (
                <code key={v} className="bg-white/10 px-1.5 py-0.5 rounded text-white/60 mr-1">{v}</code>
              ))}
            </p>

            <div className="space-y-3">
              {config.templates.map((tpl, i) => (
                <div key={tpl.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <input
                      type="text"
                      value={tpl.name}
                      onChange={(e) => handleUpdateTemplate(i, 'name', e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg text-sm font-semibold bg-white/7 border border-white/15 text-white outline-none focus:border-indigo-500/70 transition"
                    />
                    <button
                      onClick={() => setDeleteIndex(i)}
                      className="text-red-400 hover:text-red-300 transition cursor-pointer shrink-0 p-1"
                      aria-label="Hapus template"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
                      </svg>
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={tpl.msg}
                    onChange={(e) => handleUpdateTemplate(i, 'msg', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-xs bg-white/7 border border-white/15 text-white outline-none focus:border-indigo-500/70 transition resize-none"
                  />
                  <button
                    onClick={() => handleSendTemplateTest(i)}
                    className="mt-2 text-xs text-emerald-400 hover:text-emerald-300 transition cursor-pointer flex items-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                    Test kirim
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Notifikasi Otomatis */}
          <div className={GLASS + ' p-6'}>
            <h3 className="text-base font-bold mb-5 text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />
              Notifikasi Otomatis
            </h3>
            <div className="space-y-3">
              {[
                { key: 'notifBooking' as const, label: 'Konfirmasi Booking', desc: 'Kirim WA saat reservasi dikonfirmasi' },
                { key: 'notifReceipt' as const, label: 'Struk Digital', desc: 'Kirim struk ke pelanggan setelah transaksi' },
                { key: 'notifReady' as const, label: 'Reminder Pesanan Siap', desc: 'Notif WA ketika pesanan siap diambil' },
                { key: 'notifPromo' as const, label: 'Promo & Broadcast', desc: 'Aktifkan fitur broadcast ke customer' },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/8 transition cursor-pointer"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <p className="text-xs text-white/40">{item.desc}</p>
                  </div>
                  <Toggle
                    checked={config[item.key]}
                    onChange={(v) => setConfig({ ...config, [item.key]: v })}
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Bottom Save */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="px-8 py-3 rounded-xl text-sm font-bold text-white transition shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 cursor-pointer"
              style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)' }}
            >
              Simpan Pengaturan
            </button>
          </div>
        </div>
      </main>

      {/* Delete Template Confirm Modal */}
      {deleteIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
        >
          <div className={GLASS + ' p-6 w-full max-w-sm mx-4'}>
            <h3 className="text-base font-bold text-white mb-2">Hapus Template?</h3>
            <p className="text-sm text-white/50 mb-5">
              Template "<span className="text-white">{config.templates[deleteIndex]?.name}</span>" akan dihapus permanen.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteIndex(null)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white/60 hover:text-white border border-white/10 hover:border-white/25 bg-white/5 hover:bg-white/10 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => handleDeleteTemplate(deleteIndex)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition cursor-pointer"
                style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)' }}
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
