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
      className="w-full md:w-96 flex flex-col border-l"
      style={{ 
        borderColor: 'rgba(255,255,255,0.1)',
        background: 'rgba(2,6,23,0.5)'
      }}
    >
      {/* Header */}
      <div className="p-3 md:p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <h2 className="text-xl md:text-2xl font-bold text-white">Keranjang</h2>
        <p className="text-xs md:text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
          {items.length} item
        </p>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-auto p-3 md:p-6">
        {items.length === 0 ? (
          <div className="text-center py-8 md:py-12">
            <p className="text-white/60 text-sm md:text-base">Keranjang kosong</p>
            <p className="text-white/40 text-xs md:text-sm mt-2">Pilih produk untuk memulai</p>
          </div>
        ) : (
          <div className="space-y-2 md:space-y-3">
            {items.map(item => (
              <div
                key={item.id}
                className="p-3 md:p-4 rounded-lg md:rounded-xl"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <div className="flex justify-between items-start mb-2 md:mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-sm md:text-base truncate">{item.name}</h3>
                    <p className="text-xs md:text-sm mt-1" style={{ color: '#C9A84C' }}>
                      Rp {item.price.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-400 hover:text-red-300 transition ml-2 flex-shrink-0"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.qty - 1)}
                      className="w-7 md:w-8 h-7 md:h-8 rounded-lg flex items-center justify-center font-bold transition text-sm"
                      style={{
                        background: 'rgba(255,255,255,0.1)',
                        color: 'white'
                      }}
                    >
                      −
                    </button>
                    <span className="text-white font-bold w-6 text-center text-sm">{item.qty}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.qty + 1)}
                      className="w-7 md:w-8 h-7 md:h-8 rounded-lg flex items-center justify-center font-bold transition text-sm"
                      style={{
                        background: 'rgba(201,168,76,0.2)',
                        color: '#C9A84C'
                      }}
                    >
                      +
                    </button>
                  </div>
                  <p className="text-sm md:text-lg font-bold text-white">
                    Rp {(item.price * item.qty).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="p-3 md:p-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <div className="space-y-2 md:space-y-3 mb-4">
          <div className="flex justify-between text-white text-xs md:text-sm">
            <span>Subtotal</span>
            <span>Rp {subtotal.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-white text-xs md:text-sm">
            <span>Pajak (11%)</span>
            <span>Rp {tax.toLocaleString('id-ID')}</span>
          </div>
          <div 
            className="flex justify-between text-lg md:text-xl font-bold text-white pt-2 md:pt-3 border-t"
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
          className="w-full py-3 md:py-4 rounded-lg md:rounded-xl font-bold text-sm md:text-lg transition-all"
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
