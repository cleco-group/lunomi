import { useCartStore } from '../../stores/cartStore';

interface ShoppingCartProps {
  onCheckout: () => void;
}

export default function ShoppingCart({ onCheckout }: ShoppingCartProps) {
  const { items, removeItem, updateQuantity, getSubtotal, getTax, getTotal } = useCartStore();
  
  const subtotal = getSubtotal();
  const tax = getTax();
  const total = getTotal();

  return (
    <div 
      className="w-96 flex flex-col border-l"
      style={{ 
        borderColor: 'rgba(255,255,255,0.1)',
        background: 'rgba(2,6,23,0.5)'
      }}
    >
      {/* Header */}
      <div className="p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <h2 className="text-2xl font-bold text-white">Keranjang</h2>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
          {items.length} item
        </p>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-auto p-6">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/60">Keranjang kosong</p>
            <p className="text-white/40 text-sm mt-2">Pilih produk untuk memulai</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(item => (
              <div
                key={item.id}
                className="p-4 rounded-xl"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{item.name}</h3>
                    <p className="text-sm mt-1" style={{ color: '#C9A84C' }}>
                      Rp {item.price.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-400 hover:text-red-300 transition"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.id, item.qty - 1)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold transition"
                      style={{
                        background: 'rgba(255,255,255,0.1)',
                        color: 'white'
                      }}
                    >
                      −
                    </button>
                    <span className="text-white font-bold w-8 text-center">{item.qty}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.qty + 1)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold transition"
                      style={{
                        background: 'rgba(201,168,76,0.2)',
                        color: '#C9A84C'
                      }}
                    >
                      +
                    </button>
                  </div>
                  <p className="text-lg font-bold text-white">
                    Rp {(item.price * item.qty).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="p-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <div className="space-y-3 mb-4">
          <div className="flex justify-between text-white">
            <span>Subtotal</span>
            <span>Rp {subtotal.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-white">
            <span>Pajak (11%)</span>
            <span>Rp {tax.toLocaleString('id-ID')}</span>
          </div>
          <div 
            className="flex justify-between text-xl font-bold text-white pt-3 border-t"
            style={{ borderColor: 'rgba(255,255,255,0.1)' }}
          >
            <span>Total</span>
            <span style={{ color: '#C9A84C' }}>
              Rp {total.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        <button
          onClick={onCheckout}
          disabled={items.length === 0}
          className="w-full py-4 rounded-xl font-bold text-lg transition-all"
          style={{
            background: items.length === 0 
              ? 'rgba(255,255,255,0.1)' 
              : 'linear-gradient(135deg, #C9A84C, #a8863a)',
            color: items.length === 0 ? 'rgba(255,255,255,0.3)' : '#0D3B4A',
            cursor: items.length === 0 ? 'not-allowed' : 'pointer',
            opacity: items.length === 0 ? 0.5 : 1
          }}
        >
          Checkout
        </button>
      </div>
    </div>
  );
}
