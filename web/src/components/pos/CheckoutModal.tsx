import { useState, useEffect } from 'react';
import { useCartStore } from '../../stores/cartStore';
import { useSupabaseAuth } from '../../contexts/SupabaseAuthContext';
import toast from 'react-hot-toast';

interface CheckoutModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CheckoutModal({ onClose, onSuccess }: CheckoutModalProps) {
  const { user } = useSupabaseAuth();
  const { items, getSubtotal, getTax, getTotal, clearCart } = useCartStore();
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'qris'>('cash');
  const [orderType, setOrderType] = useState<'dine_in' | 'takeaway' | 'delivery'>('dine_in');
  const [tableNo, setTableNo] = useState('');
  const [loading, setLoading] = useState(false);

  const subtotal = getSubtotal();
  const tax = getTax();
  const total = getTotal();

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error('Keranjang kosong');
      return;
    }

    setLoading(true);
    try {
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
      const existing = JSON.parse(localStorage.getItem('lunomi_kitchen_orders') || '[]');
      const seq = String(existing.length + 1).padStart(3, '0');
      const orderNumber = `ORD-${dateStr}-${seq}`;

      const newOrder = {
        id: 'ord_' + Date.now(),
        orderNumber,
        status: 'pending',
        orderType,
        tableNo: tableNo.trim() || null,
        items: items.map(item => ({ name: item.name, qty: item.qty, category: item.category })),
        subtotal,
        tax,
        total,
        paymentMethod,
        createdAt: now.toISOString(),
        createdBy: user?.email || 'kasir',
      };

      // Save to kitchen orders
      existing.unshift(newOrder);
      localStorage.setItem('lunomi_kitchen_orders', JSON.stringify(existing));

      // Save to transactions for reports
      const txs = JSON.parse(localStorage.getItem('lunomi_transactions') || '[]');
      txs.unshift({
        id: newOrder.id,
        orderNumber,
        date: now.toISOString().slice(0, 10),
        total,
        paymentMethod,
        items: newOrder.items,
        status: 'paid',
      });
      localStorage.setItem('lunomi_transactions', JSON.stringify(txs));

      toast.success(`Order ${orderNumber} berhasil dibuat!`);
      clearCart();
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Checkout gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div
        className="max-w-md w-full rounded-2xl p-6"
        style={{
          background: 'rgba(13,59,74,0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(201,168,76,0.3)',
        }}
      >
        <h2 className="text-2xl font-bold text-white mb-5">Checkout</h2>

        {/* Order Type */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2 text-white/70">Tipe Order</label>
          <div className="grid grid-cols-3 gap-2">
            {(['dine_in', 'takeaway', 'delivery'] as const).map(type => (
              <button
                key={type}
                onClick={() => setOrderType(type)}
                className="py-2.5 px-3 rounded-xl font-semibold text-sm transition-all"
                style={{
                  background: orderType === type ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.1)',
                  border: orderType === type ? '2px solid #C9A84C' : '1px solid rgba(255,255,255,0.2)',
                  color: orderType === type ? '#C9A84C' : 'white',
                }}
              >
                {type === 'dine_in' ? 'Dine In' : type === 'takeaway' ? 'Takeaway' : 'Delivery'}
              </button>
            ))}
          </div>
        </div>

        {/* Table No (for dine in) */}
        {orderType === 'dine_in' && (
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2 text-white/70">No. Meja (opsional)</label>
            <input
              type="text"
              value={tableNo}
              onChange={e => setTableNo(e.target.value)}
              placeholder="cth: T-01"
              className="w-full px-4 py-2.5 rounded-xl text-white text-sm"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
            />
          </div>
        )}

        {/* Payment Method */}
        <div className="mb-5">
          <label className="block text-sm font-semibold mb-2 text-white/70">Metode Pembayaran</label>
          <div className="grid grid-cols-3 gap-2">
            {(['cash', 'card', 'qris'] as const).map(method => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method)}
                className="py-2.5 px-3 rounded-xl font-semibold text-sm transition-all"
                style={{
                  background: paymentMethod === method ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.1)',
                  border: paymentMethod === method ? '2px solid #C9A84C' : '1px solid rgba(255,255,255,0.2)',
                  color: paymentMethod === method ? '#C9A84C' : 'white',
                }}
              >
                {method === 'cash' ? 'Cash' : method === 'card' ? 'Card' : 'QRIS'}
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="p-4 rounded-xl mb-5" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="space-y-2 text-white text-sm">
            {items.map(item => (
              <div key={item.id} className="flex justify-between text-white/60">
                <span>{item.name} ×{item.qty}</span>
                <span>Rp {(item.price * item.qty).toLocaleString('id-ID')}</span>
              </div>
            ))}
            <div className="border-t border-white/10 pt-2 mt-2 space-y-1">
              <div className="flex justify-between">
                <span>Subtotal</span><span>Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Pajak (11%)</span><span>Rp {tax.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-1" style={{ color: '#C9A84C' }}>
                <span>Total</span><span>Rp {total.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 rounded-xl font-bold transition-all"
            style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            Batal
          </button>
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="flex-1 py-3 rounded-xl font-bold transition-all"
            style={{
              background: loading ? 'rgba(201,168,76,0.5)' : 'linear-gradient(135deg,#C9A84C,#a8863a)',
              color: '#0D3B4A',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Memproses...' : 'Bayar'}
          </button>
        </div>
      </div>
    </div>
  );
}
