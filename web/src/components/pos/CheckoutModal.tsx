import { useState } from 'react';
import { useCartStore } from '../../stores/cartStore';
import { createOrder } from '../../lib/createOrder';
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
      const result = await createOrder({
        companyId: '00000000-0000-0000-0000-000000000001',
        locationId: '00000000-0000-0000-0000-000000000002',
        items: items.map(item => ({
          productVariantId: item.id,
          productName: item.name,
          qty: item.qty,
          price: item.price,
          discount: 0
        })),
        orderType,
        taxRate: 0.11,
        payments: [{
          method: paymentMethod,
          amount: total
        }],
        createdBy: user?.id || 'unknown'
      });

      toast.success(`Order ${result.orderNumber} berhasil dibuat!`);
      clearCart();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Checkout error:', error);
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
          border: '1px solid rgba(201,168,76,0.3)'
        }}
      >
        <h2 className="text-2xl font-bold text-white mb-6">Checkout</h2>

        {/* Order Type */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-3 text-white">
            Tipe Order
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['dine_in', 'takeaway', 'delivery'] as const).map(type => (
              <button
                key={type}
                onClick={() => setOrderType(type)}
                className="py-3 px-4 rounded-xl font-semibold transition-all"
                style={{
                  background: orderType === type 
                    ? 'rgba(201,168,76,0.3)' 
                    : 'rgba(255,255,255,0.1)',
                  border: orderType === type 
                    ? '2px solid #C9A84C' 
                    : '1px solid rgba(255,255,255,0.2)',
                  color: orderType === type ? '#C9A84C' : 'white'
                }}
              >
                {type === 'dine_in' && '🍽️ Dine In'}
                {type === 'takeaway' && '🥡 Takeaway'}
                {type === 'delivery' && '🛵 Delivery'}
              </button>
            ))}
          </div>
        </div>

        {/* Payment Method */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-3 text-white">
            Metode Pembayaran
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['cash', 'card', 'qris'] as const).map(method => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method)}
                className="py-3 px-4 rounded-xl font-semibold transition-all"
                style={{
                  background: paymentMethod === method 
                    ? 'rgba(201,168,76,0.3)' 
                    : 'rgba(255,255,255,0.1)',
                  border: paymentMethod === method 
                    ? '2px solid #C9A84C' 
                    : '1px solid rgba(255,255,255,0.2)',
                  color: paymentMethod === method ? '#C9A84C' : 'white'
                }}
              >
                {method === 'cash' && '💵 Cash'}
                {method === 'card' && '💳 Card'}
                {method === 'qris' && '📱 QRIS'}
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div 
          className="p-4 rounded-xl mb-6"
          style={{ background: 'rgba(0,0,0,0.3)' }}
        >
          <div className="space-y-2 text-white">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>Rp {subtotal.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span>Pajak (11%)</span>
              <span>Rp {tax.toLocaleString('id-ID')}</span>
            </div>
            <div 
              className="flex justify-between text-xl font-bold pt-2 border-t"
              style={{ 
                borderColor: 'rgba(255,255,255,0.2)',
                color: '#C9A84C'
              }}
            >
              <span>Total</span>
              <span>Rp {total.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 rounded-xl font-bold transition-all"
            style={{
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            Batal
          </button>
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="flex-1 py-3 rounded-xl font-bold transition-all"
            style={{
              background: loading 
                ? 'rgba(201,168,76,0.5)' 
                : 'linear-gradient(135deg, #C9A84C, #a8863a)',
              color: '#0D3B4A',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Processing...' : 'Bayar'}
          </button>
        </div>
      </div>
    </div>
  );
}
