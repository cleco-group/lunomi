import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import Sidebar from '../components/Sidebar';
import toast from 'react-hot-toast';

interface PurchaseOrderItem {
  id?: string;
  product_id: string;
  product_name: string;
  unit: string;
  qty: number;
  price: number;
  subtotal: number;
}

interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_name: string;
  order_date: string;
  total_amount: number;
  notes?: string;
  status: string;
  items: PurchaseOrderItem[];
  company_id: string;
  location_id: string;
  created_at?: string;
}

interface RawItem {
  id: string;
  name: string;
  unit: string;
}

const RAW_ITEMS: RawItem[] = [
  { id: '1', name: 'Nasi (Beras)', unit: 'kg' },
  { id: '2', name: 'Ayam Fillet', unit: 'kg' },
  { id: '3', name: 'Mie Kuning', unit: 'kg' },
  { id: '4', name: 'Soto Ayam Presto', unit: 'porsi' },
  { id: '5', name: 'Es Batu', unit: 'kg' },
  { id: '6', name: 'Teh Celup', unit: 'box' },
  { id: '7', name: 'Minyak Goreng', unit: 'liter' },
  { id: '8', name: 'Kecap Manis', unit: 'botol' },
];

export default function Purchase() {
  const { user: _user, signOut } = useSupabaseAuth();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [supplierName, setSupplierName] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [poLines, setPoLines] = useState<PurchaseOrderItem[]>([
    { product_id: '1', product_name: 'Nasi (Beras)', unit: 'kg', qty: 1, price: 0, subtotal: 0 }
  ]);

  // Stats
  const [stats, setStats] = useState({
    monthTotal: 0,
    count: 0,
    suppliers: 0
  });

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      // For now, use localStorage as fallback
      const stored = localStorage.getItem('lunomi_purchases');
      if (stored) {
        const data = JSON.parse(stored);
        setOrders(data);
        calculateStats(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Error loading purchase orders');
      setLoading(false);
    }
  };

  const calculateStats = (ordersList: PurchaseOrder[]) => {
    const now = new Date();
    const monthTotal = ordersList
      .filter(p => {
        const d = new Date(p.order_date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, p) => sum + p.total_amount, 0);

    const suppliers = new Set(ordersList.map(p => p.supplier_name)).size;

    setStats({
      monthTotal,
      count: ordersList.length,
      suppliers
    });
  };

  const addPOLine = () => {
    setPoLines([...poLines, {
      product_id: '1',
      product_name: 'Nasi (Beras)',
      unit: 'kg',
      qty: 1,
      price: 0,
      subtotal: 0
    }]);
  };

  const removePOLine = (index: number) => {
    if (poLines.length === 1) return;
    const newLines = poLines.filter((_, i) => i !== index);
    setPoLines(newLines);
  };

  const updatePOLine = (index: number, field: keyof PurchaseOrderItem, value: any) => {
    const newLines = [...poLines];
    if (field === 'product_id') {
      const item = RAW_ITEMS.find(r => r.id === value);
      if (item) {
        newLines[index].product_id = value;
        newLines[index].product_name = item.name;
        newLines[index].unit = item.unit;
      }
    } else {
      (newLines[index] as any)[field] = value;
    }
    
    // Calculate subtotal
    newLines[index].subtotal = newLines[index].qty * newLines[index].price;
    setPoLines(newLines);
  };

  const calculateTotal = () => {
    return poLines.reduce((sum, line) => sum + line.subtotal, 0);
  };

  const formatRupiah = (amount: number) => {
    return 'Rp ' + Math.max(0, amount).toLocaleString('id-ID');
  };

  const openModal = () => {
    setSupplierName('');
    setOrderDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setPoLines([{
      product_id: '1',
      product_name: 'Nasi (Beras)',
      unit: 'kg',
      qty: 1,
      price: 0,
      subtotal: 0
    }]);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const savePO = async () => {
    // Validation
    if (!supplierName.trim()) {
      toast.error('Nama supplier harus diisi');
      return;
    }
    if (!orderDate) {
      toast.error('Tanggal harus diisi');
      return;
    }
    if (poLines.length === 0 || poLines.every(l => l.qty <= 0)) {
      toast.error('Tambahkan minimal 1 item');
      return;
    }

    try {
      const total = calculateTotal();
      const validItems = poLines.filter(l => l.qty > 0);

      const newPO: PurchaseOrder = {
        id: 'PO-' + Date.now(),
        po_number: 'PO-' + Date.now(),
        supplier_name: supplierName,
        order_date: orderDate,
        total_amount: total,
        notes: notes,
        status: 'received',
        items: validItems,
        company_id: '00000000-0000-0000-0000-000000000001',
        location_id: '00000000-0000-0000-0000-000000000002',
        created_at: new Date().toISOString()
      };

      // Save to localStorage
      const stored = localStorage.getItem('lunomi_purchases');
      const purchases = stored ? JSON.parse(stored) : [];
      purchases.unshift(newPO);
      localStorage.setItem('lunomi_purchases', JSON.stringify(purchases));

      // Update raw stock
      const stockKey = 'lunomi_raw_stock';
      const stockData = localStorage.getItem(stockKey);
      const stock = stockData ? JSON.parse(stockData) : {};
      
      validItems.forEach(item => {
        if (!stock[item.product_id]) {
          stock[item.product_id] = { qty: 0, unit: item.unit };
        }
        stock[item.product_id].qty = parseFloat((stock[item.product_id].qty + item.qty).toFixed(2));
      });
      localStorage.setItem(stockKey, JSON.stringify(stock));

      // Auto-log as expense
      if (total > 0) {
        const expensesKey = 'lunomi_expenses';
        const expData = localStorage.getItem(expensesKey);
        const expenses = expData ? JSON.parse(expData) : [];
        expenses.unshift({
          id: 'EXP-PO-' + Date.now(),
          date: orderDate,
          cat: 'Bahan Baku',
          desc: `PO: ${supplierName} (${validItems.length} item)`,
          amount: total,
          note: notes,
          outlet_id: '00000000-0000-0000-0000-000000000002'
        });
        localStorage.setItem(expensesKey, JSON.stringify(expenses));
      }

      toast.success('PO berhasil disimpan & stok diperbarui!');
      closeModal();
      loadOrders();
    } catch (error) {
      console.error('Error saving PO:', error);
      toast.error('Gagal menyimpan PO');
    }
  };

  const showDetail = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const filteredOrders = orders.filter(order =>
    !searchQuery ||
    order.supplier_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.po_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: '#061820' }}>
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#061820' }}>
      <Sidebar onLogout={signOut} />
      
      <main className="flex-1">
        {/* Header */}
        <header className="sticky top-0 z-40 px-6 py-4 flex items-center justify-between"
                style={{
                  background: 'rgba(2,6,23,0.7)',
                  backdropFilter: 'blur(20px)',
                  borderBottom: '1px solid rgba(255,255,255,0.08)'
                }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
              <span className="text-xl">🛒</span>
            </div>
            <div>
              <h1 className="font-extrabold text-white">Pembelian Barang</h1>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Cleco Pii
              </p>
            </div>
          </div>
          <button
            onClick={openModal}
            className="px-4 py-2 rounded-xl text-sm font-bold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
          >
            + Buat PO
          </button>
        </header>

        <div className="p-6 max-w-6xl mx-auto">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="rounded-2xl p-5"
                 style={{
                   background: 'rgba(255,255,255,0.05)',
                   backdropFilter: 'blur(16px)',
                   border: '1px solid rgba(255,255,255,0.1)'
                 }}>
              <div className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Total Bulan Ini
              </div>
              <div className="text-2xl font-extrabold text-white">
                {formatRupiah(stats.monthTotal)}
              </div>
            </div>
            <div className="rounded-2xl p-5"
                 style={{
                   background: 'rgba(255,255,255,0.05)',
                   backdropFilter: 'blur(16px)',
                   border: '1px solid rgba(255,255,255,0.1)'
                 }}>
              <div className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Jumlah PO
              </div>
              <div className="text-2xl font-extrabold text-white">
                {stats.count}
              </div>
            </div>
            <div className="rounded-2xl p-5"
                 style={{
                   background: 'rgba(255,255,255,0.05)',
                   backdropFilter: 'blur(16px)',
                   border: '1px solid rgba(255,255,255,0.1)'
                 }}>
              <div className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Supplier Aktif
              </div>
              <div className="text-2xl font-extrabold text-white">
                {stats.suppliers}
              </div>
            </div>
          </div>

          {/* Purchase History */}
          <div className="rounded-2xl overflow-hidden"
               style={{
                 background: 'rgba(255,255,255,0.05)',
                 backdropFilter: 'blur(16px)',
                 border: '1px solid rgba(255,255,255,0.1)'
               }}>
            <div className="px-5 py-4 flex items-center justify-between"
                 style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="font-bold text-white">📋 Riwayat Pembelian</h3>
              <input
                type="text"
                placeholder="Cari supplier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-2 rounded-lg text-xs w-48"
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'white'
                }}
              />
            </div>

            {filteredOrders.length === 0 ? (
              <div className="py-12 text-center text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Belum ada riwayat pembelian.
              </div>
            ) : (
              <div>
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => showDetail(order)}
                    className="px-5 py-4 flex items-center justify-between cursor-pointer transition-all"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div>
                      <div className="font-semibold text-white">{order.supplier_name}</div>
                      <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {order.po_number} · {order.order_date} · {order.items.length} item
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-white">{formatRupiah(order.total_amount)}</div>
                      <div className="text-xs mt-1 text-green-400">✓ Diterima</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create PO Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
             style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-lg rounded-2xl shadow-2xl max-h-[90vh] flex flex-col"
               style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.12)' }}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4"
                 style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <h2 className="font-bold text-white">🛒 Buat Purchase Order</h2>
              <button
                onClick={closeModal}
                className="text-2xl font-bold transition-colors"
                style={{ color: 'rgba(255,255,255,0.4)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold mb-2 block" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    Supplier
                  </label>
                  <input
                    type="text"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    placeholder="Nama supplier"
                    className="w-full px-3 py-2.5 rounded-xl text-sm"
                    style={{
                      background: 'rgba(255,255,255,0.07)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: 'white'
                    }}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold mb-2 block" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    Tanggal
                  </label>
                  <input
                    type="date"
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm"
                    style={{
                      background: 'rgba(255,255,255,0.07)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: 'white'
                    }}
                  />
                </div>
              </div>

              {/* Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    Item yang Dibeli
                  </label>
                  <button
                    onClick={addPOLine}
                    className="text-xs px-3 py-1 rounded-lg font-semibold"
                    style={{
                      background: 'rgba(99,102,241,0.2)',
                      border: '1px solid rgba(99,102,241,0.4)',
                      color: '#a5b4fc'
                    }}
                  >
                    + Tambah Item
                  </button>
                </div>

                {/* Header */}
                <div className="grid grid-cols-[1fr_80px_120px_32px] gap-2 text-xs font-semibold mb-2 px-1"
                     style={{ color: 'rgba(255,255,255,0.35)' }}>
                  <span>Item</span>
                  <span className="text-center">Qty</span>
                  <span className="text-right">Harga/Satuan</span>
                  <span></span>
                </div>

                {/* Lines */}
                <div className="space-y-2">
                  {poLines.map((line, index) => (
                    <div key={index} className="grid grid-cols-[1fr_80px_120px_32px] gap-2">
                      <select
                        value={line.product_id}
                        onChange={(e) => updatePOLine(index, 'product_id', e.target.value)}
                        className="px-2 py-2 rounded-lg text-xs"
                        style={{
                          background: 'rgba(255,255,255,0.07)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          color: 'white'
                        }}
                      >
                        {RAW_ITEMS.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name} ({item.unit})
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        value={line.qty}
                        onChange={(e) => updatePOLine(index, 'qty', parseFloat(e.target.value) || 0)}
                        className="px-2 py-2 rounded-lg text-xs text-center"
                        style={{
                          background: 'rgba(255,255,255,0.07)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          color: 'white'
                        }}
                        placeholder="Qty"
                      />
                      <input
                        type="number"
                        min="0"
                        value={line.price || ''}
                        onChange={(e) => updatePOLine(index, 'price', parseFloat(e.target.value) || 0)}
                        className="px-2 py-2 rounded-lg text-xs text-right"
                        style={{
                          background: 'rgba(255,255,255,0.07)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          color: 'white'
                        }}
                        placeholder="Harga"
                      />
                      <button
                        onClick={() => removePOLine(index)}
                        disabled={poLines.length === 1}
                        className="text-red-400 hover:text-red-300 font-bold text-lg leading-none"
                        style={{ opacity: poLines.length === 1 ? 0.3 : 1 }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="rounded-xl px-4 py-3 flex justify-between items-center"
                   style={{
                     background: 'rgba(99,102,241,0.1)',
                     border: '1px solid rgba(99,102,241,0.2)'
                   }}>
                <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  Total PO
                </span>
                <span className="font-extrabold text-white">{formatRupiah(calculateTotal())}</span>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-semibold mb-2 block" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Catatan
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Opsional..."
                  className="w-full px-3 py-2.5 rounded-xl text-sm resize-none"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: 'white'
                  }}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 flex gap-3"
                 style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.7)'
                }}
              >
                Batal
              </button>
              <button
                onClick={savePO}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
              >
                Simpan & Update Stok
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
             style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-md rounded-2xl shadow-2xl"
               style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.12)' }}>
            <div className="flex items-center justify-between px-6 py-4"
                 style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <h2 className="font-bold text-white text-sm">
                {selectedOrder.po_number} — {selectedOrder.supplier_name}
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-2xl font-bold"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                ×
              </button>
            </div>
            <div className="px-6 py-5 space-y-3 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div style={{ color: 'rgba(255,255,255,0.5)' }}>Tanggal</div>
                <div className="font-semibold text-white">{selectedOrder.order_date}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)' }}>Supplier</div>
                <div className="font-semibold text-white">{selectedOrder.supplier_name}</div>
                {selectedOrder.notes && (
                  <>
                    <div style={{ color: 'rgba(255,255,255,0.5)' }}>Catatan</div>
                    <div className="font-semibold text-white">{selectedOrder.notes}</div>
                  </>
                )}
              </div>
              <div className="space-y-2">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm py-2"
                       style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div>
                      <div className="font-semibold text-white">{item.product_name}</div>
                      <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {item.qty} {item.unit} × {formatRupiah(item.price)}
                      </div>
                    </div>
                    <div className="font-bold text-white">{formatRupiah(item.subtotal)}</div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-extrabold text-white mt-3 pt-3"
                   style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <span>Total</span>
                <span>{formatRupiah(selectedOrder.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
