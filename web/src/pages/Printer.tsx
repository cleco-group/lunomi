import { useState, useEffect, useMemo } from 'react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import Sidebar from '../components/Sidebar';
import toast from 'react-hot-toast';

const GLASS = 'rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm';
const INPUT = 'w-full px-3 py-2.5 rounded-xl text-sm bg-white/7 border border-white/15 text-white placeholder:text-white/35 focus:border-indigo-500/70 focus:ring-3 focus:ring-indigo-500/15 outline-none transition';
const PRINTER_KEY = 'lunomi_printer_config';

type PrinterType = 'browser' | 'usb' | 'network' | 'bluetooth';
type PaperSize = '58' | '80' | 'a4';
type FontSize = '10' | '12' | '14';

interface PrinterConfig {
  type: PrinterType;
  ip: string;
  port: number;
  paperSize: PaperSize;
  header: string;
  footer: string;
  copies: number;
  fontSize: FontSize;
  autoPrint: boolean;
  showQR: boolean;
  kitchenPrint: boolean;
  updatedAt?: string;
}

const DEFAULTS: PrinterConfig = {
  type: 'browser',
  ip: '',
  port: 9100,
  paperSize: '80',
  header: '',
  footer: '',
  copies: 1,
  fontSize: '12',
  autoPrint: false,
  showQR: false,
  kitchenPrint: false,
};

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-6 rounded-full transition-all cursor-pointer flex-shrink-0 ${checked ? 'bg-indigo-500' : 'bg-white/15'}`}
      aria-checked={checked}
      role="switch"
    >
      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${checked ? 'left-7' : 'left-1'}`} />
    </button>
  );
}

function buildPreview(header: string, footer: string, paperSize: PaperSize): string {
  const cols = paperSize === '58' ? 32 : 42;
  const divider = '-'.repeat(cols);
  const now = new Date();
  const effectiveHeader = header || 'LUNOMI RESTORAN\nJl. Contoh No. 1\nTlp: 021-0000';
  const effectiveFooter = footer || 'Terima kasih atas kunjungan Anda!\nSampai jumpa kembali :)';

  return [
    effectiveHeader,
    divider,
    'No. Struk  : INV-0001',
    'Tanggal    : ' + now.toLocaleDateString('id-ID'),
    'Jam        : ' + now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    'Kasir      : Admin',
    'Meja       : 5',
    divider,
    '1 x Nasi Goreng Spesial',
    '  Rp 35.000',
    '1 x Es Teh Manis',
    '  Rp 8.000',
    '2 x Kerupuk',
    '  Rp 4.000',
    divider,
    'Subtotal   :      Rp 47.000',
    'PPN 10%    :       Rp 4.700',
    divider,
    'TOTAL      :      Rp 51.700',
    'Bayar      :      Rp 60.000',
    'Kembali    :       Rp 8.300',
    divider,
    effectiveFooter,
  ].join('\n');
}

export default function Printer() {
  const { signOut } = useSupabaseAuth();
  const [config, setConfig] = useState<PrinterConfig>(DEFAULTS);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PRINTER_KEY) || '{}') as Partial<PrinterConfig>;
      setConfig({
        type: (saved.type as PrinterType) ?? 'browser',
        ip: saved.ip ?? '',
        port: saved.port ?? 9100,
        paperSize: (saved.paperSize as PaperSize) ?? '80',
        header: saved.header ?? '',
        footer: saved.footer ?? '',
        copies: saved.copies ?? 1,
        fontSize: (saved.fontSize as FontSize) ?? '12',
        autoPrint: saved.autoPrint ?? false,
        showQR: saved.showQR ?? false,
        kitchenPrint: saved.kitchenPrint ?? false,
      });
    } catch {
      /* ignore */
    }
  }, []);

  const handleSave = () => {
    const toSave: PrinterConfig = { ...config, updatedAt: new Date().toISOString() };
    localStorage.setItem(PRINTER_KEY, JSON.stringify(toSave));
    toast.success('Pengaturan printer disimpan!');
  };

  const handleTestPrint = () => {
    window.print();
  };

  const previewText = useMemo(
    () => buildPreview(config.header, config.footer, config.paperSize),
    [config.header, config.footer, config.paperSize]
  );

  return (
    <div
      className="flex min-h-screen"
      style={{
        background: '#020617',
        backgroundImage:
          'radial-gradient(ellipse at 20% 20%, rgba(99,102,241,0.07) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(99,102,241,0.04) 0%, transparent 60%)',
      }}
    >
      <Sidebar onLogout={signOut} />
      <main className="flex-1 min-h-screen" style={{ marginLeft: '256px' }}>
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
            <h1 className="text-xl font-black text-white">Pengaturan Printer</h1>
            <p className="text-xs text-white/40">Konfigurasi printer struk dan template nota</p>
          </div>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition shadow-lg shadow-indigo-500/20 hover:-translate-y-0.5 cursor-pointer"
            style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}
          >
            Simpan Pengaturan
          </button>
        </header>

        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
            {/* Left: Settings */}
            <div className="space-y-6">
              {/* Koneksi Printer */}
              <div className={GLASS + ' p-6'}>
                <h3 className="text-base font-bold mb-5 text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" />
                  Koneksi Printer
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-white/40 mb-1 uppercase tracking-wide">
                      Tipe Koneksi
                    </label>
                    <select
                      value={config.type}
                      onChange={(e) => setConfig({ ...config, type: e.target.value as PrinterType })}
                      className={INPUT + ' [&>option]:bg-slate-900'}
                    >
                      <option value="browser">Browser Print (Default)</option>
                      <option value="usb">USB / Serial</option>
                      <option value="network">Network (IP)</option>
                      <option value="bluetooth">Bluetooth</option>
                    </select>
                  </div>

                  {config.type === 'network' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-white/40 mb-1 uppercase tracking-wide">
                          IP Address Printer
                        </label>
                        <input
                          type="text"
                          value={config.ip}
                          onChange={(e) => setConfig({ ...config, ip: e.target.value })}
                          placeholder="192.168.1.100"
                          className={INPUT}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-white/40 mb-1 uppercase tracking-wide">
                          Port
                        </label>
                        <input
                          type="number"
                          value={config.port}
                          onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) || 9100 })}
                          placeholder="9100"
                          className={INPUT}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-white/40 mb-1 uppercase tracking-wide">
                      Ukuran Kertas
                    </label>
                    <select
                      value={config.paperSize}
                      onChange={(e) => setConfig({ ...config, paperSize: e.target.value as PaperSize })}
                      className={INPUT + ' [&>option]:bg-slate-900'}
                    >
                      <option value="58">58mm (Struk kecil)</option>
                      <option value="80">80mm (Struk standar)</option>
                      <option value="a4">A4 (Invoice)</option>
                    </select>
                  </div>

                  <button
                    onClick={handleTestPrint}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold text-white border border-white/10 bg-white/5 hover:bg-white/10 transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" /><rect x="6" y="14" width="12" height="8" />
                    </svg>
                    Test Cetak
                  </button>
                </div>
              </div>

              {/* Template Struk */}
              <div className={GLASS + ' p-6'}>
                <h3 className="text-base font-bold mb-5 text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />
                  Template Struk
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-white/40 mb-1 uppercase tracking-wide">
                      Header (muncul di atas)
                    </label>
                    <textarea
                      rows={3}
                      value={config.header}
                      onChange={(e) => setConfig({ ...config, header: e.target.value })}
                      placeholder={'Nama outlet, alamat, telepon...'}
                      className={INPUT + ' resize-none'}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/40 mb-1 uppercase tracking-wide">
                      Footer (muncul di bawah)
                    </label>
                    <textarea
                      rows={2}
                      value={config.footer}
                      onChange={(e) => setConfig({ ...config, footer: e.target.value })}
                      placeholder="Terima kasih, ucapan, dll..."
                      className={INPUT + ' resize-none'}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-white/40 mb-1 uppercase tracking-wide">
                        Copies (rangkap)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={config.copies}
                        onChange={(e) => setConfig({ ...config, copies: parseInt(e.target.value) || 1 })}
                        className={INPUT}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-white/40 mb-1 uppercase tracking-wide">
                        Font Size
                      </label>
                      <select
                        value={config.fontSize}
                        onChange={(e) => setConfig({ ...config, fontSize: e.target.value as FontSize })}
                        className={INPUT + ' [&>option]:bg-slate-900'}
                      >
                        <option value="10">Kecil (10pt)</option>
                        <option value="12">Normal (12pt)</option>
                        <option value="14">Besar (14pt)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Opsi Cetak */}
              <div className={GLASS + ' p-6'}>
                <h3 className="text-base font-bold mb-5 text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                  Opsi Cetak
                </h3>
                <div className="space-y-3">
                  {[
                    { key: 'autoPrint' as const, label: 'Auto Print setelah transaksi', desc: 'Langsung cetak struk tanpa konfirmasi' },
                    { key: 'showQR' as const, label: 'Tampilkan QR Code', desc: 'QR link survey/sosmed di struk' },
                    { key: 'kitchenPrint' as const, label: 'Cetak KDS ke Dapur', desc: 'Print order ke printer dapur secara otomatis' },
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
                  className="px-8 py-3 rounded-xl text-sm font-bold text-white transition shadow-lg shadow-indigo-500/20 hover:-translate-y-0.5 cursor-pointer"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}
                >
                  Simpan Pengaturan
                </button>
              </div>
            </div>

            {/* Right: Receipt Preview */}
            <div>
              <div className={GLASS + ' p-6 sticky top-24'}>
                <h3 className="text-base font-bold mb-5 text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-white/40 inline-block" />
                  Preview Struk
                </h3>
                <div
                  style={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: config.fontSize + 'px',
                    background: '#fff',
                    color: '#000',
                    padding: '16px',
                    borderRadius: '8px',
                    whiteSpace: 'pre-wrap',
                    minHeight: '200px',
                    maxWidth: config.paperSize === '58' ? '200px' : config.paperSize === 'a4' ? '100%' : '240px',
                    margin: '0 auto',
                    lineHeight: 1.4,
                  }}
                >
                  {previewText}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
