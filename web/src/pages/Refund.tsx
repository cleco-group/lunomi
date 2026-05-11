import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import toast from 'react-hot-toast';

interface Transaction {
  id: string;
  invoiceNumber?: string;
  customerName?: string;
  createdAt: string;
  total: number;
  items: TransactionItem[];
}

interface TransactionItem {
  name: string;
  price: number;
  qty: number;
}

interface RefundItem extends TransactionItem {
  refundQty: number;
}

interface Refund {
  id: string;
  trxId: string;
  invoiceNumber: string;
  customerName: string;
  items: RefundItem[];
  reason: string;
  notes: string;
  refundTotal: number;
  refundMethod: 'cash' | 'transfer' | 'store_credit';
  staff: string;
  outlet: string;
  createdAt: string;
}

export default function Refund() {
  const { user } = useSupabaseAuth();
  const navigate = useNavigate();
  
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  
  // Step 1: Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  
  // Step 2: Select items
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedItems, setSelectedItems] = useState<{ [key: number]: RefundItem }>({});
  const [returnReason, setReturnReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  
  // Step 3: Confirm
  const [refundMethod, setRefundMethod] = useState<'cash' | 'transfer' | 'store_credit'>('cash');
  const [refundNotes, setRefundNotes] = useState('');
  
  // History
  const [refundHistory, setRefundHistory] = useState<Refund[]>([]);

  useEffect(() => {
    loadTransactions();
    loadRefundHistory();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [searchQuery, searchDate, transactions]);

  const loadTransactions = () => {
    const stored = localStorage.getItem('lunomi_transactions');
    if (stored) {
      setTransactions(JSON.parse(stored));
    }
  };

  const loadRefundHistory = () => {
    const stored = localStorage.getItem('lunomi_refunds');
    if (stored) {
      setRefundHistory(JSON.parse(stored));
    }
  };

  const filterTransactions = () => {
    let filtered = [...transactions];
    
    if (searchDate) {
      filtered = filtered.filter(t => t.createdAt.slice(0, 10) === searchDate);
    }
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        (t.id || '').toLowerCase().includes(q) ||
        (t.customerName || '').toLowerCase().includes(q) ||
        (t.invoiceNumber || '').toLowerCase().includes(q)
      );
    }
    
    filtered.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    setFilteredTransactions(filtered.slice(0, 20));
  };

  const selectTransaction = (trx: Transaction) => {
    setSelectedTransaction(trx);
    setSelectedItems({});
    setCurrentStep(2);
  };

  const toggleItem = (index: number, item: TransactionItem) => {
    const newSelected = { ...selectedItems };
    if (newSelected[index]) {
      delete newSelected[index];
    } else {
      newSelected[index] = { ...item, refundQty: item.qty };
    }
    setSelectedItems(newSelected);
  };

  const updateItemQty = (index: number, qty: number) => {
    if (selectedItems[index]) {
      const maxQty = selectedTransaction?.items[index]?.qty || 1;
      const validQty = Math.min(Math.max(1, qty), maxQty);
      setSelectedItems({
        ...selectedItems,
        [index]: { ...selectedItems[index], refundQty: validQty }
      });
    }
  };

  const calculateRefundTotal = () => {
    return Object.values(selectedItems).reduce((sum, item) => 
      sum + (item.price * item.refundQty), 0
    );
  };

  const goToStep3 = () => {
    if (!returnReason) {
      toast.error('Pilih alasan retur');
      return;
    }
    if (Object.keys(selectedItems).length === 0) {
      toast.error('Pilih minimal 1 item untuk diretur');
      return;
    }
    setCurrentStep(3);
  };

  const submitRefund = () => {
    if (!refundMethod) {
      toast.error('Pilih metode refund');
      return;
    }

    const items = Object.values(selectedItems);
    const total = calculateRefundTotal();
    
    const newRefund: Refund = {
      id: 'RFN-' + Date.now(),
      trxId: selectedTransaction!.id,
      invoiceNumber: selectedTransaction!.invoiceNumber || selectedTransaction!.id,
      customerName: selectedTransaction!.customerName || 'Pelanggan',
      items: items,
      reason: returnReason === 'lainnya' ? otherReason : returnReason,
      notes: refundNotes,
      refundTotal: total,
      refundMethod: refundMethod,
      staff: user?.email || 'Staff',
      outlet: 'Cleco Pii',
      createdAt: new Date().toISOString()
    };

    const refunds = [newRefund, ...refundHistory];
    localStorage.setItem('lunomi_refunds', JSON.stringify(refunds));
    setRefundHistory(refunds);

    toast.success(`Retur berhasil diproses! Total: ${formatRupiah(total)}`);
    
    // Reset
    setSelectedTransaction(null);
    setSelectedItems({});
    setReturnReason('');
    setOtherReason('');
    setRefundMethod('cash');
    setRefundNotes('');
    setSearchQuery('');
    setSearchDate('');
    setCurrentStep(1);
  };

  const formatRupiah = (amount: number) => {
    return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const reasonLabels: { [key: string]: string } = {
    salah_item: 'Salah item/pesanan',
    kualitas: 'Kualitas tidak sesuai',
    tidak_sesuai: 'Tidak sesuai deskripsi',
    perubahan: 'Perubahan keputusan',
    lainnya: 'Lainnya'
  };

  const methodLabels = {
    cash: '💵 Tunai',
    transfer: '🏦 Transfer',
    store_credit: '🎁 Kredit Toko'
  };

  return (
    <div className="min-h-screen" style={{
      background: '#020617',
      backgroundImage: 'radial-gradient(ellipse 70% 50% at 10% 0%, rgba(239,68,68,0.2) 0%, transparent 60%), radial-gradient(ellipse 60% 45% at 90% 100%, rgba(99,102,241,0.08) 0%, transparent 60%)'
    }}>
      {/* Header */}
      <header className="sticky top-0 z-40 px-6 py-4"
              style={{
                background: 'rgba(2,6,23,0.7)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255,255,255,0.08)'
              }}>
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-white opacity-50 hover:opacity-100 transition text-2xl"
          >
            ←
          </button>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
               style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
            ↩️
          </div>
          <div>
            <h1 className="font-extrabold text-white">Proses Retur</h1>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Cleco Pii
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((step, idx) => (
            <div key={step} className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: step < currentStep ? 'linear-gradient(135deg, #ef4444, #dc2626)' :
                                step === currentStep ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.08)',
                    border: step === currentStep ? '2px solid #ef4444' : '2px solid rgba(255,255,255,0.15)',
                    color: step <= currentStep ? '#fca5a5' : 'rgba(255,255,255,0.3)'
                  }}
                >
                  {step < currentStep ? '✓' : step}
                </div>
                <span className={`text-xs font-bold ${step <= currentStep ? 'text-red-400' : 'text-white/30'}`}>
                  {step === 1 ? 'Cari Transaksi' : step === 2 ? 'Pilih Item' : 'Konfirmasi'}
                </span>
              </div>
              {idx < 2 && (
                <div className="flex-1 h-0.5"
                     style={{
                       background: step < currentStep ? 'linear-gradient(90deg, #ef4444, #dc2626)' : 'rgba(255,255,255,0.1)'
                     }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Search Transaction */}
        {currentStep === 1 && (
          <div>
            <div className="rounded-2xl p-5 mb-4"
                 style={{
                   background: 'rgba(255,255,255,0.05)',
                   backdropFilter: 'blur(16px)',
                   border: '1px solid rgba(255,255,255,0.1)'
                 }}>
              <h3 className="font-bold mb-3 text-sm text-white">Cari Transaksi</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Cari No. Transaksi, nama pelanggan…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-3 py-2.5 rounded-xl text-sm text-white"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.15)'
                  }}
                />
                <input
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  className="px-3 py-2.5 rounded-xl text-sm text-white"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.15)'
                  }}
                />
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden"
                 style={{
                   background: 'rgba(255,255,255,0.05)',
                   backdropFilter: 'blur(16px)',
                   border: '1px solid rgba(255,255,255,0.1)'
                 }}>
              {!searchQuery && !searchDate ? (
                <p className="py-12 text-center text-white/25 text-sm">
                  Ketik untuk mencari transaksi
                </p>
              ) : filteredTransactions.length === 0 ? (
                <p className="py-12 text-center text-white/25 text-sm">
                  Transaksi tidak ditemukan
                </p>
              ) : (
                filteredTransactions.map((trx) => (
                  <div
                    key={trx.id}
                    onClick={() => selectTransaction(trx)}
                    className="px-5 py-4 cursor-pointer transition-all"
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      borderLeft: '3px solid transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-sm text-white">
                          {trx.customerName || 'Pelanggan'}
                        </div>
                        <div className="text-xs text-white/40">
                          {trx.invoiceNumber || trx.id} • {formatDate(trx.createdAt)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm text-white">
                          {formatRupiah(trx.total)}
                        </div>
                        <div className="text-xs text-white/40">
                          {trx.items.length} item
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Step 2: Select Items */}
        {currentStep === 2 && selectedTransaction && (
          <div>
            <div className="rounded-2xl p-5 mb-4"
                 style={{
                   background: 'rgba(255,255,255,0.05)',
                   backdropFilter: 'blur(16px)',
                   border: '1px solid rgba(255,255,255,0.1)'
                 }}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-sm text-white">Pilih Item Retur</h3>
                  <p className="text-xs text-white/40 mt-0.5">
                    {selectedTransaction.invoiceNumber || selectedTransaction.id} — {formatDate(selectedTransaction.createdAt)} — {formatRupiah(selectedTransaction.total)}
                  </p>
                </div>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="text-xs text-white/40 hover:text-white"
                >
                  ← Ganti
                </button>
              </div>

              <div className="space-y-2 mb-4">
                {selectedTransaction.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 py-2.5"
                       style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <input
                      type="checkbox"
                      checked={!!selectedItems[idx]}
                      onChange={() => toggleItem(idx, item)}
                      className="w-4 h-4 accent-red-500 flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-white">{item.name}</div>
                      <div className="text-xs text-white/40">
                        {formatRupiah(item.price)} × {item.qty} = {formatRupiah(item.price * item.qty)}
                      </div>
                    </div>
                    {selectedItems[idx] && (
                      <input
                        type="number"
                        min="1"
                        max={item.qty}
                        value={selectedItems[idx].refundQty}
                        onChange={(e) => updateItemQty(idx, parseInt(e.target.value) || 1)}
                        className="w-14 px-2 py-1 rounded-lg text-xs text-center text-white"
                        style={{
                          background: 'rgba(255,255,255,0.07)',
                          border: '1px solid rgba(255,255,255,0.15)'
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div>
                <label className="text-xs font-semibold text-white/40 mb-1.5 block">
                  Alasan Retur *
                </label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.15)'
                  }}
                >
                  <option value="">Pilih alasan…</option>
                  <option value="salah_item">Salah item / pesanan</option>
                  <option value="kualitas">Kualitas tidak sesuai</option>
                  <option value="tidak_sesuai">Tidak sesuai deskripsi</option>
                  <option value="perubahan">Perubahan keputusan</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>

              {returnReason === 'lainnya' && (
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Jelaskan alasan…"
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-sm text-white"
                    style={{
                      background: 'rgba(255,255,255,0.07)',
                      border: '1px solid rgba(255,255,255,0.15)'
                    }}
                  />
                </div>
              )}
            </div>

            <div className="rounded-2xl p-4 mb-4 flex justify-between items-center"
                 style={{
                   background: 'rgba(255,255,255,0.05)',
                   backdropFilter: 'blur(16px)',
                   border: '1px solid rgba(255,255,255,0.1)'
                 }}>
              <span className="text-sm text-white/50 font-semibold">Total Refund:</span>
              <span className="text-xl font-black text-red-400">
                {formatRupiah(calculateRefundTotal())}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep(1)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold"
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.6)'
                }}
              >
                ← Kembali
              </button>
              <button
                onClick={goToStep3}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
              >
                Review →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {currentStep === 3 && selectedTransaction && (
          <div>
            <div className="rounded-2xl p-5 mb-4"
                 style={{
                   background: 'rgba(255,255,255,0.05)',
                   backdropFilter: 'blur(16px)',
                   border: '1px solid rgba(255,255,255,0.1)'
                 }}>
              <h3 className="font-bold text-sm mb-4 text-white">Konfirmasi Retur</h3>
              
              <div className="space-y-3 mb-4">
                <div className="rounded-xl p-4 space-y-2 text-sm"
                     style={{
                       background: 'rgba(255,255,255,0.05)',
                       border: '1px solid rgba(255,255,255,0.1)'
                     }}>
                  <div className="flex justify-between">
                    <span className="text-white/50">Transaksi</span>
                    <span className="font-semibold text-white">
                      {selectedTransaction.invoiceNumber || selectedTransaction.id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Pelanggan</span>
                    <span className="font-semibold text-white">
                      {selectedTransaction.customerName || 'Pelanggan'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Alasan</span>
                    <span className="font-semibold text-white">
                      {reasonLabels[returnReason] || returnReason}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl p-4"
                     style={{
                       background: 'rgba(255,255,255,0.05)',
                       border: '1px solid rgba(255,255,255,0.1)'
                     }}>
                  <p className="text-xs font-bold text-white/40 mb-2">Item Diretur</p>
                  {Object.values(selectedItems).map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm py-1 text-white">
                      <span>{item.name} ×{item.refundQty}</span>
                      <span>{formatRupiah(item.price * item.refundQty)}</span>
                    </div>
                  ))}
                  <div className="border-t mt-2 pt-2 flex justify-between font-bold"
                       style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                    <span className="text-red-400">Total Refund</span>
                    <span className="text-red-400 text-lg">
                      {formatRupiah(calculateRefundTotal())}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-white/40 mb-2 block">
                  Metode Refund *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['cash', 'transfer', 'store_credit'] as const).map((method) => (
                    <button
                      key={method}
                      onClick={() => setRefundMethod(method)}
                      className="py-2.5 rounded-xl text-xs font-bold text-center transition-all"
                      style={{
                        background: refundMethod === method ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.04)',
                        border: refundMethod === method ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(255,255,255,0.1)',
                        color: refundMethod === method ? '#fca5a5' : 'rgba(255,255,255,0.5)'
                      }}
                    >
                      {methodLabels[method]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-3">
                <label className="text-xs font-semibold text-white/40 mb-1 block">
                  Catatan (opsional)
                </label>
                <textarea
                  value={refundNotes}
                  onChange={(e) => setRefundNotes(e.target.value)}
                  placeholder="Catatan proses retur…"
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl text-sm text-white resize-none"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.15)'
                  }}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep(2)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold"
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.6)'
                }}
              >
                ← Edit
              </button>
              <button
                onClick={submitRefund}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
              >
                Proses Retur
              </button>
            </div>
          </div>
        )}

        {/* History */}
        <div className="mt-8">
          <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">
            Riwayat Retur
          </h3>
          <div className="rounded-2xl overflow-hidden"
               style={{
                 background: 'rgba(255,255,255,0.05)',
                 backdropFilter: 'blur(16px)',
                 border: '1px solid rgba(255,255,255,0.1)'
               }}>
            {refundHistory.length === 0 ? (
              <p className="py-8 text-center text-white/25 text-sm">
                Belum ada riwayat retur
              </p>
            ) : (
              refundHistory.slice(0, 10).map((refund) => (
                <div
                  key={refund.id}
                  className="px-5 py-4 flex justify-between items-center"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <div>
                    <div className="font-bold text-sm text-white">
                      {refund.customerName}{' '}
                      <span className="text-xs text-white/40 font-normal">
                        — {refund.invoiceNumber}
                      </span>
                    </div>
                    <div className="text-xs text-white/40">
                      {formatDate(refund.createdAt)} • {methodLabels[refund.refundMethod]} • {refund.staff}
                    </div>
                  </div>
                  <div className="font-bold text-red-400">
                    {formatRupiah(refund.refundTotal)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
