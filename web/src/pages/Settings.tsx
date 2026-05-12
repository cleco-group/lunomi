import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import Sidebar from '../components/Sidebar';
import toast from 'react-hot-toast';

const GLASS = 'rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm';
const INPUT = 'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white text-sm placeholder-white/30 focus:border-indigo-500/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all';

type TabId = 'outlet' | 'tax' | 'payment' | 'printer' | 'whatsapp';

const TABS: { id: TabId; label: string }[] = [
  { id: 'outlet', label: 'Outlet' },
  { id: 'tax', label: 'Pajak' },
  { id: 'payment', label: 'Pembayaran' },
  { id: 'printer', label: 'Printer' },
  { id: 'whatsapp', label: 'WhatsApp' },
];

export default function Settings() {
  const { signOut } = useSupabaseAuth();
  const [tab, setTab] = useState<TabId>('outlet');

  // Outlet
  const [outlet, setOutlet] = useState({ name: 'Lunomi Resto', address: 'Jl. Merdeka No. 1', phone: '08123456789', email: 'lunomi@resto.com', city: 'Jakarta', npwp: '' });

  // Tax
  const [tax, setTax] = useState({ ppn: 11, service: 0, mode: 'exclusive', round: 'none', ptkp: 4750000, pph: 5 });
  const [simBase, setSimBase] = useState(100000);

  // Payment
  const [payment, setPayment] = useState({ cash: true, qris: true, transfer: true, gopay: false, ovo: false, dana: false, shopeepay: false });

  // Printer
  const [printer, setPrinter] = useState({ type: 'thermal', ip: '192.168.1.100', port: '9100', paper: '80mm', copies: 1, header: 'Terima kasih telah berkunjung', footer: 'Silahkan datang kembali' });

  // WhatsApp
  const [wa, setWa] = useState({ number: '', businessName: '', notifBooking: true, notifReceipt: false, notifReady: false });

  useEffect(() => {
    const cfg = JSON.parse(localStorage.getItem('lunomi_config') || '{}');
    if (cfg.tax !== undefined) setTax({ ppn: cfg.tax, service: cfg.service ?? 0, mode: cfg.taxMode || 'exclusive', round: cfg.round || 'none', ptkp: cfg.ptkp ?? 4750000, pph: cfg.pph ?? 5 });
    const ol = JSON.parse(localStorage.getItem('lunomi_outlet') || '{}');
    if (ol.name) setOutlet({ name: ol.name, address: ol.address || '', phone: ol.phone || '', email: ol.email || '', city: ol.city || '', npwp: ol.npwp || '' });
    const pc = JSON.parse(localStorage.getItem('lunomi_payment_config') || '{}');
    if (Object.keys(pc).length) setPayment({ cash: pc.cash ?? true, qris: pc.qris ?? true, transfer: pc.transfer ?? true, gopay: pc.gopay ?? false, ovo: pc.ovo ?? false, dana: pc.dana ?? false, shopeepay: pc.shopeepay ?? false });
    const pr = JSON.parse(localStorage.getItem('lunomi_printer_config') || '{}');
    if (pr.type) setPrinter({ type: pr.type || 'thermal', ip: pr.ip || '', port: pr.port || '9100', paper: pr.paper || '80mm', copies: pr.copies || 1, header: pr.header || '', footer: pr.footer || '' });
    const wc = JSON.parse(localStorage.getItem('lunomi_wa_config') || '{}');
    if (wc.number !== undefined) setWa({ number: wc.number || '', businessName: wc.businessName || '', notifBooking: wc.notifBooking ?? true, notifReceipt: wc.notifReceipt ?? false, notifReady: wc.notifReady ?? false });
  }, []);

  const saveOutlet = () => { localStorage.setItem('lunomi_outlet', JSON.stringify(outlet)); toast.success('Pengaturan outlet disimpan!'); };
  const saveTax = () => { const cfg = JSON.parse(localStorage.getItem('lunomi_config') || '{}'); cfg.tax = tax.ppn; cfg.service = tax.service; cfg.taxMode = tax.mode; cfg.round = tax.round; cfg.ptkp = tax.ptkp; cfg.pph = tax.pph; localStorage.setItem('lunomi_config', JSON.stringify(cfg)); toast.success('Pengaturan pajak disimpan!'); };
  const savePayment = () => { localStorage.setItem('lunomi_payment_config', JSON.stringify(payment)); toast.success('Metode pembayaran disimpan!'); };
  const savePrinter = () => { localStorage.setItem('lunomi_printer_config', JSON.stringify(printer)); toast.success('Pengaturan printer disimpan!'); };
  const saveWA = () => { localStorage.setItem('lunomi_wa_config', JSON.stringify(wa)); toast.success('Pengaturan WhatsApp disimpan!'); };

  const totalTax = () => {
    const base = simBase;
    if (tax.mode === 'exclusive') {
      const ppnAmt = base * tax.ppn / 100;
      const svcAmt = base * tax.service / 100;
      return base + ppnAmt + svcAmt;
    }
    return base;
  };

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button onClick={() => onChange(!checked)} className={`relative w-12 h-6 rounded-full transition-all cursor-pointer ${checked ? 'bg-indigo-500' : 'bg-white/15'}`}>
      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${checked ? 'left-7' : 'left-1'}`} />
    </button>
  );

  return (
    <div className="flex min-h-screen" style={{ background: '#020617' }}>
      <Sidebar onLogout={signOut} />
      <main className="flex-1 min-h-screen lg:ml-64">
        <header className="sticky top-0 z-40 px-8 py-4" style={{ background: 'rgba(2,6,23,.7)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
          <h1 className="text-xl font-black text-white">Pengaturan</h1>
          <p className="text-xs text-white/40">Konfigurasi outlet, pajak, pembayaran, dan perangkat</p>
        </header>

        <div className="p-8">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-5 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all border ${tab === t.id ? 'bg-indigo-500/25 border-indigo-500/60 text-white' : 'border-white/10 text-white/40 hover:border-white/25 bg-white/5'}`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Outlet Tab */}
          {tab === 'outlet' && (
            <div className={`${GLASS} p-6 max-w-2xl space-y-4`}>
              <h2 className="text-base font-black text-white mb-4">Identitas Outlet</h2>
              {[
                { label: 'Nama Outlet *', key: 'name', placeholder: 'Lunomi Resto' },
                { label: 'Alamat', key: 'address', placeholder: 'Jl. Merdeka No. 1' },
                { label: 'No. Telepon', key: 'phone', placeholder: '08xxxxxxxxxx' },
                { label: 'Email', key: 'email', placeholder: 'info@outlet.com' },
                { label: 'Kota', key: 'city', placeholder: 'Jakarta' },
                { label: 'NPWP', key: 'npwp', placeholder: 'xx.xxx.xxx.x-xxx.xxx' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs text-white/40 mb-1 font-semibold uppercase">{f.label}</label>
                  <input className={INPUT} value={(outlet as any)[f.key]} onChange={e => setOutlet({ ...outlet, [f.key]: e.target.value })} placeholder={f.placeholder} />
                </div>
              ))}
              <button onClick={saveOutlet} className="mt-2 px-8 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer transition-all hover:-translate-y-0.5" style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>Simpan Outlet</button>
            </div>
          )}

          {/* Tax Tab */}
          {tab === 'tax' && (
            <div className="max-w-2xl space-y-6">
              <div className={`${GLASS} p-6 space-y-4`}>
                <h2 className="text-base font-black text-white">Tarif Pajak & Layanan</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs text-white/40 mb-1 font-semibold uppercase">PPN / PB1 (%)</label><input type="number" className={INPUT} value={tax.ppn} onChange={e => setTax({ ...tax, ppn: +e.target.value })} min={0} max={100} step={0.5} /></div>
                  <div><label className="block text-xs text-white/40 mb-1 font-semibold uppercase">Service Charge (%)</label><input type="number" className={INPUT} value={tax.service} onChange={e => setTax({ ...tax, service: +e.target.value })} min={0} max={100} step={0.5} /></div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1 font-semibold uppercase">Tipe Kalkulasi</label>
                    <select className={INPUT + ' [&>option]:bg-slate-900'} value={tax.mode} onChange={e => setTax({ ...tax, mode: e.target.value })}>
                      <option value="exclusive">Exclusive (ditambah di akhir)</option>
                      <option value="inclusive">Inclusive (sudah termasuk)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1 font-semibold uppercase">Pembulatan</label>
                    <select className={INPUT + ' [&>option]:bg-slate-900'} value={tax.round} onChange={e => setTax({ ...tax, round: e.target.value })}>
                      <option value="none">Tidak ada</option>
                      <option value="100">Rp 100</option>
                      <option value="500">Rp 500</option>
                      <option value="1000">Rp 1.000</option>
                    </select>
                  </div>
                </div>
                <div className={`${GLASS} p-4`}>
                  <p className="text-xs text-white/40 mb-2">Simulasi — Harga: <input type="number" className="inline-block w-28 bg-transparent border-b border-white/20 text-white text-xs px-1 focus:outline-none" value={simBase} onChange={e => setSimBase(+e.target.value)} /></p>
                  <p className="text-sm font-bold text-white">Total: Rp {Math.round(totalTax()).toLocaleString('id-ID')}</p>
                </div>
                <button onClick={saveTax} className="px-8 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer hover:-translate-y-0.5 transition-all" style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>Simpan Pajak</button>
              </div>
            </div>
          )}

          {/* Payment Tab */}
          {tab === 'payment' && (
            <div className={`${GLASS} p-6 max-w-2xl`}>
              <h2 className="text-base font-black text-white mb-5">Metode Pembayaran</h2>
              <div className="space-y-3">
                {[
                  { key: 'cash', label: 'Tunai (Cash)', desc: 'Pembayaran langsung' },
                  { key: 'qris', label: 'QRIS', desc: 'QR code universal' },
                  { key: 'transfer', label: 'Transfer Bank', desc: 'ATM/mobile banking' },
                  { key: 'gopay', label: 'GoPay', desc: 'Dompet digital Gojek' },
                  { key: 'ovo', label: 'OVO', desc: 'Dompet digital OVO' },
                  { key: 'dana', label: 'DANA', desc: 'Dompet digital DANA' },
                  { key: 'shopeepay', label: 'ShopeePay', desc: 'Dompet digital Shopee' },
                ].map(m => (
                  <div key={m.key} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all" style={{ border: '1px solid rgba(255,255,255,.06)' }}>
                    <div>
                      <p className="text-sm font-semibold text-white">{m.label}</p>
                      <p className="text-xs text-white/40">{m.desc}</p>
                    </div>
                    <Toggle checked={(payment as any)[m.key]} onChange={v => setPayment({ ...payment, [m.key]: v })} />
                  </div>
                ))}
              </div>
              <button onClick={savePayment} className="mt-5 px-8 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer hover:-translate-y-0.5 transition-all" style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>Simpan Pembayaran</button>
            </div>
          )}

          {/* Printer Tab */}
          {tab === 'printer' && (
            <div className={`${GLASS} p-6 max-w-2xl space-y-4`}>
              <h2 className="text-base font-black text-white">Konfigurasi Printer</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/40 mb-1 font-semibold uppercase">Tipe Printer</label>
                  <select className={INPUT + ' [&>option]:bg-slate-900'} value={printer.type} onChange={e => setPrinter({ ...printer, type: e.target.value })}>
                    <option value="thermal">Thermal (USB/LAN)</option>
                    <option value="bluetooth">Bluetooth</option>
                    <option value="pdf">PDF / Browser</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1 font-semibold uppercase">Ukuran Kertas</label>
                  <select className={INPUT + ' [&>option]:bg-slate-900'} value={printer.paper} onChange={e => setPrinter({ ...printer, paper: e.target.value })}>
                    <option value="58mm">58mm</option>
                    <option value="80mm">80mm</option>
                    <option value="A4">A4</option>
                  </select>
                </div>
                <div><label className="block text-xs text-white/40 mb-1 font-semibold uppercase">IP Address</label><input className={INPUT} value={printer.ip} onChange={e => setPrinter({ ...printer, ip: e.target.value })} placeholder="192.168.1.100" /></div>
                <div><label className="block text-xs text-white/40 mb-1 font-semibold uppercase">Port</label><input className={INPUT} value={printer.port} onChange={e => setPrinter({ ...printer, port: e.target.value })} placeholder="9100" /></div>
              </div>
              <div><label className="block text-xs text-white/40 mb-1 font-semibold uppercase">Header Struk</label><input className={INPUT} value={printer.header} onChange={e => setPrinter({ ...printer, header: e.target.value })} placeholder="Terima kasih" /></div>
              <div><label className="block text-xs text-white/40 mb-1 font-semibold uppercase">Footer Struk</label><input className={INPUT} value={printer.footer} onChange={e => setPrinter({ ...printer, footer: e.target.value })} placeholder="Selamat datang kembali" /></div>
              <button onClick={savePrinter} className="px-8 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer hover:-translate-y-0.5 transition-all" style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>Simpan Printer</button>
            </div>
          )}

          {/* WhatsApp Tab */}
          {tab === 'whatsapp' && (
            <div className={`${GLASS} p-6 max-w-2xl space-y-4`}>
              <h2 className="text-base font-black text-white">Konfigurasi WhatsApp</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/40 mb-1 font-semibold uppercase">Nomor WA (+62)</label>
                  <input className={INPUT} value={wa.number} onChange={e => setWa({ ...wa, number: e.target.value })} placeholder="81234567890" />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1 font-semibold uppercase">Nama Bisnis</label>
                  <input className={INPUT} value={wa.businessName} onChange={e => setWa({ ...wa, businessName: e.target.value })} placeholder="Nama Outlet" />
                </div>
              </div>
              {wa.number && (
                <button onClick={() => window.open(`https://wa.me/62${wa.number}?text=Halo! Ini test pesan dari Lunomi POS.`, '_blank')}
                  className="px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all" style={{ background: 'rgba(34,197,94,.2)', color: '#4ade80', border: '1px solid rgba(34,197,94,.35)' }}>
                  Test Kirim WA
                </button>
              )}
              <h3 className="text-sm font-bold text-white/60 pt-2">Notifikasi Otomatis</h3>
              {[
                { key: 'notifBooking', label: 'Konfirmasi Booking', desc: 'Kirim WA saat reservasi dikonfirmasi' },
                { key: 'notifReceipt', label: 'Struk Digital', desc: 'Kirim struk ke pelanggan setelah transaksi' },
                { key: 'notifReady', label: 'Pesanan Siap', desc: 'Notif WA ketika pesanan siap diambil' },
              ].map(n => (
                <div key={n.key} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)' }}>
                  <div><p className="text-sm font-semibold text-white">{n.label}</p><p className="text-xs text-white/40">{n.desc}</p></div>
                  <button onClick={() => setWa({ ...wa, [n.key]: !(wa as any)[n.key] })} className={`relative w-12 h-6 rounded-full transition-all cursor-pointer ${(wa as any)[n.key] ? 'bg-indigo-500' : 'bg-white/15'}`}>
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${(wa as any)[n.key] ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
              ))}
              <button onClick={saveWA} className="px-8 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer hover:-translate-y-0.5 transition-all" style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>Simpan WhatsApp</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
