import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import Sidebar from '../components/Sidebar';
import toast from 'react-hot-toast';

const GLASS = 'rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm';
const INPUT = 'w-full px-3 py-2.5 rounded-xl text-sm bg-white/7 border border-white/15 text-white placeholder:text-white/35 focus:border-indigo-500/70 focus:ring-3 focus:ring-indigo-500/15 outline-none transition';
const TAX_KEY = 'lunomi_tax_settings';

type TaxMode = 'inclusive' | 'exclusive';
type RoundMode = 'none' | '100' | '500' | '1000';

interface TaxSettings {
  ppn: number;
  service: number;
  taxMode: TaxMode;
  round: RoundMode;
  ptkp: number;
  pph: number;
}

const DEFAULTS: TaxSettings = {
  ppn: 10,
  service: 0,
  taxMode: 'inclusive',
  round: 'none',
  ptkp: 4750000,
  pph: 5,
};

function calcPreview(settings: TaxSettings, base: number) {
  const { ppn, service, taxMode, round } = settings;
  let neto: number, ppnAmt: number, svcAmt: number, total: number;

  if (taxMode === 'inclusive') {
    const div = 1 + (ppn + service) / 100;
    neto = base / div;
    ppnAmt = (neto * ppn) / 100;
    svcAmt = (neto * service) / 100;
    total = base;
  } else {
    neto = base;
    ppnAmt = (base * ppn) / 100;
    svcAmt = (base * service) / 100;
    total = base + ppnAmt + svcAmt;
  }

  if (round !== 'none') {
    const r = parseInt(round, 10);
    total = Math.ceil(total / r) * r;
  }

  return { neto, ppnAmt, svcAmt, total };
}

function fmt(n: number) {
  return 'Rp ' + Math.round(n).toLocaleString('id-ID');
}

export default function Tax() {
  const { signOut } = useSupabaseAuth();

  const [settings, setSettings] = useState<TaxSettings>(DEFAULTS);
  const [simBase, setSimBase] = useState(100000);
  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(TAX_KEY) || '{}') as Partial<TaxSettings>;
      setSettings({
        ppn: saved.ppn ?? DEFAULTS.ppn,
        service: saved.service ?? DEFAULTS.service,
        taxMode: (saved.taxMode as TaxMode) ?? DEFAULTS.taxMode,
        round: (saved.round as RoundMode) ?? DEFAULTS.round,
        ptkp: saved.ptkp ?? DEFAULTS.ptkp,
        pph: saved.pph ?? DEFAULTS.pph,
      });
    } catch {
      /* ignore */
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem(TAX_KEY, JSON.stringify(settings));
    toast.success('Pengaturan pajak disimpan!');
  };

  const handleReset = () => {
    setSettings(DEFAULTS);
    setShowResetModal(false);
    toast.success('Pengaturan direset ke default.');
  };

  const { neto, ppnAmt, svcAmt, total } = calcPreview(settings, simBase);

  return (
    <div
      className="flex min-h-screen"
      style={{
        background: '#020617',
        backgroundImage:
          'radial-gradient(ellipse at 20% 20%, rgba(99,102,241,0.07) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(249,115,22,0.05) 0%, transparent 60%)',
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
            <h1 className="text-xl font-black text-white">Pengaturan Pajak</h1>
            <p className="text-xs text-white/40">Konfigurasi PPN, service charge, dan pembulatan</p>
          </div>
          <button
            onClick={() => setShowResetModal(true)}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white/60 hover:text-white border border-white/10 hover:border-white/25 bg-white/5 hover:bg-white/10 transition cursor-pointer"
          >
            Reset Default
          </button>
        </header>

        <div className="p-8 max-w-3xl space-y-6">
          {/* PPN & Service Charge */}
          <div className={GLASS + ' p-6'}>
            <h3 className="text-base font-bold mb-5 text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />
              Tarif Pajak &amp; Layanan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-white/40 mb-1 uppercase tracking-wide">
                  PPN / PB1 (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={settings.ppn}
                  onChange={(e) => setSettings({ ...settings, ppn: parseFloat(e.target.value) || 0 })}
                  className={INPUT}
                />
                <p className="text-xs text-white/30 mt-1">Pajak Bangunan / PPN sesuai regulasi daerah</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/40 mb-1 uppercase tracking-wide">
                  Service Charge (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={settings.service}
                  onChange={(e) => setSettings({ ...settings, service: parseFloat(e.target.value) || 0 })}
                  className={INPUT}
                />
                <p className="text-xs text-white/30 mt-1">Biaya layanan tambahan (opsional)</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/40 mb-1 uppercase tracking-wide">
                  Tipe Kalkulasi
                </label>
                <select
                  value={settings.taxMode}
                  onChange={(e) =>
                    setSettings({ ...settings, taxMode: e.target.value as TaxMode })
                  }
                  className={INPUT + ' [&>option]:bg-slate-900'}
                >
                  <option value="inclusive">Inclusive (sudah termasuk)</option>
                  <option value="exclusive">Exclusive (ditambah di akhir)</option>
                </select>
                <p className="text-xs text-white/30 mt-1">Cara pajak dihitung dari harga menu</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/40 mb-1 uppercase tracking-wide">
                  Pembulatan
                </label>
                <select
                  value={settings.round}
                  onChange={(e) =>
                    setSettings({ ...settings, round: e.target.value as RoundMode })
                  }
                  className={INPUT + ' [&>option]:bg-slate-900'}
                >
                  <option value="none">Tidak ada</option>
                  <option value="100">Rp 100</option>
                  <option value="500">Rp 500</option>
                  <option value="1000">Rp 1.000</option>
                </select>
              </div>
            </div>
          </div>

          {/* PPh 21 Karyawan */}
          <div className={GLASS + ' p-6'}>
            <h3 className="text-base font-bold mb-5 text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
              PPh 21 Karyawan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-white/40 mb-1 uppercase tracking-wide">
                  PTKP per Bulan (Rp)
                </label>
                <input
                  type="number"
                  min={0}
                  value={settings.ptkp}
                  onChange={(e) => setSettings({ ...settings, ptkp: parseFloat(e.target.value) || 0 })}
                  placeholder="4750000"
                  className={INPUT}
                />
                <p className="text-xs text-white/30 mt-1">Penghasilan Tidak Kena Pajak</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/40 mb-1 uppercase tracking-wide">
                  Tarif PPh 21 (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={settings.pph}
                  onChange={(e) => setSettings({ ...settings, pph: parseFloat(e.target.value) || 0 })}
                  placeholder="5"
                  className={INPUT}
                />
              </div>
            </div>
          </div>

          {/* Simulasi Perhitungan */}
          <div className={GLASS + ' p-6'}>
            <h3 className="text-base font-bold mb-5 text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              Simulasi Perhitungan
            </h3>
            <div className="mb-4">
              <label className="block text-xs font-bold text-white/40 mb-1 uppercase tracking-wide">
                Harga Contoh (Rp)
              </label>
              <input
                type="number"
                min={0}
                value={simBase}
                onChange={(e) => setSimBase(parseFloat(e.target.value) || 0)}
                className={INPUT.replace('w-full', 'w-48')}
              />
            </div>

            <div className="border-t border-white/10 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-white/60">
                <span>Harga Dasar (neto)</span>
                <span>{fmt(neto)}</span>
              </div>
              {settings.ppn > 0 && (
                <div className="flex justify-between text-sm text-orange-400">
                  <span>PPN {settings.ppn}%</span>
                  <span>+ {fmt(ppnAmt)}</span>
                </div>
              )}
              {settings.service > 0 && (
                <div className="flex justify-between text-sm text-blue-400">
                  <span>Service Charge {settings.service}%</span>
                  <span>+ {fmt(svcAmt)}</span>
                </div>
              )}
              {settings.round !== 'none' && (
                <div className="flex justify-between text-sm text-yellow-400">
                  <span>Pembulatan ke Rp {parseInt(settings.round).toLocaleString('id-ID')}</span>
                  <span>–</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-white border-t border-white/10 pt-2 mt-2">
                <span>Total Bayar</span>
                <span>{fmt(total)}</span>
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="px-8 py-3 rounded-xl text-sm font-bold text-white transition shadow-lg shadow-orange-500/20 hover:-translate-y-0.5 cursor-pointer"
              style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}
            >
              Simpan Pengaturan
            </button>
          </div>
        </div>
      </main>

      {/* Reset Confirm Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className={GLASS + ' p-6 w-full max-w-sm mx-4'}>
            <h3 className="text-base font-bold text-white mb-2">Reset ke Default?</h3>
            <p className="text-sm text-white/50 mb-5">
              Semua pengaturan pajak akan direset ke nilai default (PPN 10%, Service 0%).
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white/60 hover:text-white border border-white/10 hover:border-white/25 bg-white/5 hover:bg-white/10 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleReset}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition cursor-pointer"
                style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
