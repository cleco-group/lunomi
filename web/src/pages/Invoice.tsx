import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import Sidebar from '../components/Sidebar';

interface InvoiceItem {
  name: string;
  qty: number;
  price: number;
}

interface Invoice {
  invoiceNo: string;
  trxId?: string;
  customerName: string;
  customerPhone: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  payMethod: string;
  note: string;
  status: 'paid' | 'unpaid';
  issuedAt: string;
  paidAt?: string;
}

const GLASS = 'rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm';
const INPUT = 'w-full px-3 py-2 rounded-xl text-sm bg-white/7 border border-white/15 text-white placeholder:text-white/35 focus:border-emerald-500/70 focus:ring-3 focus:ring-emerald-500/15 outline-none transition';

const rp = (n: number) => 'Rp ' + (n || 0).toLocaleString('id-ID');

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

export default function Invoice() {
  const { signOut } = useSupabaseAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [status, setStatus] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showView, setShowView] = useState(false);
  const [currentInv, setCurrentInv] = useState<Invoice | null>(null);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    items: [] as InvoiceItem[],
    discount: 0,
    tax: 0,
    note: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('lunomi_invoices');
    setInvoices(stored ? JSON.parse(stored) : []);
  }, []);

  const saveInvoices = (newInvoices: Invoice[]) => {
    localStorage.setItem('lunomi_invoices', JSON.stringify(newInvoices));
    setInvoices(newInvoices);
  };

  const generateInvoiceNo = () => {
    const date = new Date();
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const seq = invoices.filter(i => i.invoiceNo.includes(dateStr)).length + 1;
    return `INV-${dateStr}-${String(seq).padStart(3, '0')}`;
  };

  const filteredInvoices = () => {
    let filtered = invoices;

    if (status !== 'all') {
      filtered = filtered.filter(i => i.status === status);
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(i =>
        i.invoiceNo.toLowerCase().includes(q) ||
        i.customerName.toLowerCase().includes(q)
      );
    }

    return filtered.sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());
  };

  const getStats = () => {
    const paid = invoices.filter(i => i.status === 'paid').length;
    const unpaid = invoices.filter(i => i.status === 'unpaid').length;
    const total = invoices.reduce((s, i) => s + i.total, 0);
    return { total: invoices.length, paid, unpaid, value: total };
  };

  const openCreate = () => {
    setFormData({
      customerName: '',
      customerPhone: '',
      items: [{ name: 'Produk/Layanan', qty: 1, price: 0 }],
      discount: 0,
      tax: 0,
      note: '',
    });
    setError('');
    setShowCreate(true);
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: '', qty: 1, price: 0 }],
    });
  };

  const removeItem = (idx: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== idx),
    });
  };

  const updateItem = (idx: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[idx] = { ...newItems[idx], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotal = () => {
    const subtotal = formData.items.reduce((s, it) => s + it.qty * it.price, 0);
    const afterDiscount = subtotal - formData.discount;
    const total = afterDiscount + formData.tax;
    return { subtotal, total };
  };

  const createInvoice = () => {
    if (!formData.customerName.trim()) {
      setError('Nama pelanggan wajib diisi.');
      return;
    }
    if (formData.items.length === 0) {
      setError('Tambahkan minimal 1 item.');
      return;
    }

    const { subtotal, total } = calculateTotal();
    const invoice: Invoice = {
      invoiceNo: generateInvoiceNo(),
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      items: formData.items,
      subtotal,
      discount: formData.discount,
      tax: formData.tax,
      total,
      payMethod: 'Tunai',
      note: formData.note,
      status: 'unpaid',
      issuedAt: new Date().toISOString(),
    };

    saveInvoices([invoice, ...invoices]);
    setShowCreate(false);
  };

  const markPaid = (invoiceNo: string) => {
    const newInvoices = invoices.map(i =>
      i.invoiceNo === invoiceNo
        ? { ...i, status: 'paid' as const, paidAt: new Date().toISOString() }
        : i
    );
    saveInvoices(newInvoices);
    if (currentInv) setCurrentInv(newInvoices.find(i => i.invoiceNo === currentInv.invoiceNo) || null);
  };

  const deleteInvoice = (invoiceNo: string) => {
    if (confirm('Hapus invoice ini?')) {
      saveInvoices(invoices.filter(i => i.invoiceNo !== invoiceNo));
      setShowView(false);
    }
  };

  const printInvoice = () => {
    if (!currentInv) return;
    const printWindow = window.open('', '', 'width=700,height=900');
    if (!printWindow) return;

    const outlet = JSON.parse(localStorage.getItem('lunomi_outlet') || '{}');
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${currentInv.invoiceNo}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 2rem; background: white; color: #000; }
          .header { display: flex; justify-content: space-between; margin-bottom: 2rem; }
          .outlet { font-weight: bold; font-size: 1.2rem; }
          .inv-no { color: green; font-weight: bold; font-size: 1.1rem; text-align: right; }
          .inv-date { color: #666; text-align: right; font-size: 0.9rem; }
          .customer { background: #f5f5f5; padding: 1rem; margin: 1rem 0; border-radius: 8px; }
          .customer-label { font-weight: bold; color: #666; font-size: 0.8rem; margin-bottom: 0.5rem; }
          .items { width: 100%; margin: 1rem 0; border-collapse: collapse; }
          .items th { text-align: left; border-bottom: 2px solid #000; padding: 0.5rem; font-weight: bold; }
          .items td { padding: 0.75rem; border-bottom: 1px solid #ddd; }
          .items .total { text-align: right; font-weight: bold; }
          .summary { margin: 1rem 0; padding: 1rem; background: #f9f9f9; border-radius: 8px; }
          .summary-row { display: flex; justify-content: space-between; margin: 0.5rem 0; }
          .summary-label { color: #666; }
          .final { font-weight: bold; font-size: 1.1rem; border-top: 2px solid #000; padding-top: 0.5rem; margin-top: 0.5rem; }
          .status { text-align: center; margin: 1rem 0; padding: 0.75rem; background: ${currentInv.status === 'paid' ? '#4ade80' : '#fca5a5'}; color: white; border-radius: 4px; font-weight: bold; }
          @media print { body { background: white; color: #000; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="outlet">${outlet.name || 'Lunomi'}</div>
            <div style="color: #666; font-size: 0.9rem;">${outlet.address || ''}</div>
          </div>
          <div>
            <div class="inv-no">${currentInv.invoiceNo}</div>
            <div class="inv-date">${fmtDate(currentInv.issuedAt)}</div>
          </div>
        </div>

        <div class="customer">
          <div class="customer-label">KEPADA</div>
          <div style="font-weight: bold;">${currentInv.customerName || 'Umum'}</div>
          ${currentInv.customerPhone ? `<div style="font-size: 0.9rem; color: #666;">${currentInv.customerPhone}</div>` : ''}
        </div>

        <table class="items">
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align: right; width: 80px;">Qty</th>
              <th style="text-align: right; width: 100px;">Harga</th>
              <th style="text-align: right; width: 100px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${currentInv.items.map(it => `
              <tr>
                <td>${it.name}</td>
                <td style="text-align: right;">${it.qty}</td>
                <td style="text-align: right;">${rp(it.price)}</td>
                <td style="text-align: right;">${rp(it.qty * it.price)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="summary">
          <div class="summary-row">
            <span class="summary-label">Subtotal</span>
            <span>${rp(currentInv.subtotal)}</span>
          </div>
          ${currentInv.discount ? `<div class="summary-row"><span class="summary-label">Diskon</span><span>-${rp(currentInv.discount)}</span></div>` : ''}
          ${currentInv.tax ? `<div class="summary-row"><span class="summary-label">Pajak</span><span>${rp(currentInv.tax)}</span></div>` : ''}
          <div class="summary-row final">
            <span>TOTAL</span>
            <span>${rp(currentInv.total)}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Pembayaran</span>
            <span>${currentInv.payMethod || '—'}</span>
          </div>
        </div>

        ${currentInv.note ? `<div style="color: #666; font-size: 0.9rem; margin: 1rem 0; border-left: 4px solid #6366f1; padding-left: 1rem;">${currentInv.note}</div>` : ''}

        <div class="status">${currentInv.status === 'paid' ? '✅ LUNAS' : '⏳ BELUM LUNAS'}</div>

        <div style="text-align: center; margin-top: 2rem; color: #999; font-size: 0.8rem;">
          Terima kasih atas transaksi Anda!
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  const stats = getStats();
  const filtered = filteredInvoices();
  const { total } = calculateTotal();

  return (
    <div className="flex min-h-screen" style={{ background: '#020617', backgroundImage: 'radial-gradient(ellipse 70% 50% at 10% 0%,rgba(16,185,129,.2) 0%,transparent 60%),radial-gradient(ellipse 60% 45% at 90% 100%,rgba(59,130,246,.15) 0%,transparent 60%)' }}>
      <Sidebar onLogout={signOut} />
      <main className="flex-1 min-h-screen" style={{ marginLeft: '256px' }}>
        <header className="sticky top-0 z-40 px-8 py-4 flex items-center justify-between" style={{ background: 'rgba(2,6,23,.7)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
          <div>
            <h1 className="text-xl font-black text-white">Invoice & Nota</h1>
            <p className="text-xs text-white/40">Manajemen invoice dan nota pembayaran</p>
          </div>
          <button onClick={openCreate} className="px-4 py-2 rounded-xl text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
            + Buat Invoice
          </button>
        </header>

        <div className="p-8 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`${GLASS} p-4`}>
              <p className="text-xs text-white/40 mb-1">Total Invoice</p>
              <p className="text-2xl font-black text-white">{stats.total}</p>
            </div>
            <div className={`${GLASS} p-4`}>
              <p className="text-xs text-green-400 mb-1">Lunas</p>
              <p className="text-2xl font-black text-green-400">{stats.paid}</p>
            </div>
            <div className={`${GLASS} p-4`}>
              <p className="text-xs text-red-400 mb-1">Belum Lunas</p>
              <p className="text-2xl font-black text-red-400">{stats.unpaid}</p>
            </div>
            <div className={`${GLASS} p-4`}>
              <p className="text-xs text-white/40 mb-1">Nilai Total</p>
              <p className="text-xl font-black text-white">{rp(stats.value)}</p>
            </div>
          </div>

          {/* Filter */}
          <div className={`${GLASS} p-4 flex flex-wrap gap-3 items-center`}>
            <input
              type="text"
              placeholder="🔍 Cari no invoice / nama customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${INPUT} flex-1 min-w-[180px]`}
            />
            <div className="flex gap-2">
              {(['all', 'paid', 'unpaid'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all border ${
                    status === s
                      ? 'bg-emerald-500/25 border-emerald-500/60 text-white'
                      : 'border-white/10 text-white/40 hover:border-white/25'
                  }`}
                >
                  {s === 'all' ? 'Semua' : s === 'paid' ? '✅ Lunas' : '⏳ Belum Lunas'}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className={`${GLASS} overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,.1)' }}>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white/40">No Invoice</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/40 hidden sm:table-cell">Customer</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/40 hidden md:table-cell">Tanggal</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/40">Total</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/40">Status</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/40">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center">
                        <div className="text-4xl mb-3">🧾</div>
                        <div className="text-sm font-semibold text-white/40">Belum ada invoice</div>
                        <div className="text-xs text-white/25 mt-1">Klik "+ Buat Invoice" atau buat invoice baru</div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map(inv => (
                      <tr key={inv.invoiceNo} style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }} className="hover:bg-white/5 transition cursor-pointer">
                        <td className="px-5 py-3.5 font-mono font-semibold text-emerald-400">{inv.invoiceNo}</td>
                        <td className="px-4 py-3.5 hidden sm:table-cell">
                          <div className="font-semibold text-white">{inv.customerName || 'Umum'}</div>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-white/50 hidden md:table-cell">{fmtDate(inv.issuedAt)}</td>
                        <td className="px-4 py-3.5 text-right font-bold text-white">{rp(inv.total)}</td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            inv.status === 'paid'
                              ? 'bg-green-500/25 border border-green-500/50 text-green-400'
                              : 'bg-red-500/25 border border-red-500/50 text-red-400'
                          }`}>
                            {inv.status === 'paid' ? '✅ Lunas' : '⏳ Belum Lunas'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <button
                            onClick={() => {
                              setCurrentInv(inv);
                              setShowView(true);
                            }}
                            className="text-xs px-3 py-1.5 rounded-lg font-semibold bg-white/8 text-white/70 hover:text-white transition"
                          >
                            Lihat
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(4px)' }}>
          <div className={`${GLASS} rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-white text-lg">Buat Invoice</h3>
              <button onClick={() => setShowCreate(false)} className="text-white/40 hover:text-white text-xl leading-none">✕</button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-white/40 mb-1 block">Nama Customer *</label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className={INPUT}
                    placeholder="Nama customer"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/40 mb-1 block">No. HP</label>
                  <input
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    className={INPUT}
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-white/40">Item *</label>
                  <button
                    onClick={addItem}
                    className="text-xs px-2 py-1 rounded-lg font-bold text-white"
                    style={{ background: 'rgba(99,102,241,.2)', color: '#a5b4fc' }}
                  >
                    + Tambah
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.items.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-10 gap-2 items-end">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateItem(idx, 'name', e.target.value)}
                        className={`${INPUT} col-span-5`}
                        placeholder="Nama item"
                      />
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => updateItem(idx, 'qty', Number(e.target.value))}
                        className={`${INPUT} col-span-2`}
                        placeholder="Qty"
                      />
                      <input
                        type="number"
                        min="0"
                        value={item.price}
                        onChange={(e) => updateItem(idx, 'price', Number(e.target.value))}
                        className={`${INPUT} col-span-2`}
                        placeholder="Harga"
                      />
                      {formData.items.length > 1 && (
                        <button
                          onClick={() => removeItem(idx)}
                          className="text-red-400 hover:text-red-300 text-xl"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-white/40 mb-1 block">Diskon</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                    className={INPUT}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/40 mb-1 block">Pajak/PPN</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.tax}
                    onChange={(e) => setFormData({ ...formData, tax: Number(e.target.value) })}
                    className={INPUT}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/40 mb-1 block">Total</label>
                  <div className="px-3 py-2 rounded-xl text-sm font-bold text-emerald-400 bg-white/5 border border-white/10">
                    {rp(total)}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-white/40 mb-1 block">Catatan</label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className={`${INPUT} resize-none h-16`}
                  placeholder="Catatan untuk customer..."
                />
              </div>
            </div>

            {error && (
              <div className="mt-3 px-3 py-2 rounded-xl text-xs" style={{ background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.3)', color: '#fca5a5' }}>
                {error}
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.6)' }}>
                Batal
              </button>
              <button onClick={createInvoice} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
                Buat Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showView && currentInv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(4px)' }}>
          <div className={`${GLASS} rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden`}>
            <div className="flex items-center justify-between p-6 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,.08)' }}>
              <h2 className="font-bold text-white">Detail Invoice</h2>
              <button onClick={() => setShowView(false)} className="text-white/40 hover:text-white text-xl">×</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <div className="text-xs text-white/40 mb-1">No Invoice</div>
                <div className="font-mono font-bold text-emerald-400">{currentInv.invoiceNo}</div>
              </div>

              <div className={`${GLASS} p-4`}>
                <div className="text-xs font-semibold text-white/40 mb-2">Customer</div>
                <div className="font-bold text-white">{currentInv.customerName || 'Umum'}</div>
                {currentInv.customerPhone && <div className="text-sm text-white/50 mt-0.5">{currentInv.customerPhone}</div>}
              </div>

              <div>
                <div className="text-xs font-semibold text-white/40 mb-2">Item</div>
                <div className="space-y-1">
                  {currentInv.items.map((it, i) => (
                    <div key={i} className="flex justify-between text-sm py-1.5" style={{ borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                      <span className="text-white">{it.name} <span style={{ color: 'rgba(255,255,255,.4)' }}>x{it.qty}</span></span>
                      <span className="font-semibold text-white">{rp(it.qty * it.price)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`${GLASS} p-4 space-y-2 text-sm`}>
                <div className="flex justify-between">
                  <span style={{ color: 'rgba(255,255,255,.5)' }}>Subtotal</span>
                  <span className="text-white">{rp(currentInv.subtotal)}</span>
                </div>
                {currentInv.discount > 0 && (
                  <div className="flex justify-between">
                    <span style={{ color: 'rgba(255,255,255,.5)' }}>Diskon</span>
                    <span className="text-red-400">-{rp(currentInv.discount)}</span>
                  </div>
                )}
                {currentInv.tax > 0 && (
                  <div className="flex justify-between">
                    <span style={{ color: 'rgba(255,255,255,.5)' }}>Pajak</span>
                    <span className="text-white">{rp(currentInv.tax)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base" style={{ borderTop: '1px solid rgba(255,255,255,.1)', paddingTop: '0.5rem' }}>
                  <span className="text-white">Total</span>
                  <span className="text-emerald-400">{rp(currentInv.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'rgba(255,255,255,.5)' }}>Pembayaran</span>
                  <span className="text-white">{currentInv.payMethod || '—'}</span>
                </div>
              </div>

              {currentInv.note && (
                <div className={`${GLASS} p-3 text-xs`} style={{ color: 'rgba(255,255,255,.5)' }}>
                  {currentInv.note}
                </div>
              )}

              <div className="text-center">
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                  currentInv.status === 'paid'
                    ? 'bg-green-500/25 border border-green-500/50 text-green-400'
                    : 'bg-red-500/25 border border-red-500/50 text-red-400'
                }`}>
                  {currentInv.status === 'paid' ? '✅ LUNAS' : '⏳ BELUM LUNAS'}
                </span>
              </div>
            </div>

            <div className="p-6 pt-4 flex gap-2 flex-wrap" style={{ borderTop: '1px solid rgba(255,255,255,.08)' }}>
              {currentInv.status === 'unpaid' && (
                <button
                  onClick={() => {
                    markPaid(currentInv.invoiceNo);
                  }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: 'rgba(34,197,94,.15)', border: '1px solid rgba(34,197,94,.3)', color: '#4ade80' }}
                >
                  ✅ Tandai Lunas
                </button>
              )}
              <button
                onClick={printInvoice}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: 'rgba(99,102,241,.15)', border: '1px solid rgba(99,102,241,.3)', color: '#a5b4fc' }}
              >
                🖨️ Print
              </button>
              <button
                onClick={() => deleteInvoice(currentInv.invoiceNo)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.3)', color: '#fca5a5' }}
              >
                🗑️ Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
