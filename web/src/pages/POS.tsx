import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import ProductGrid from '../components/pos/ProductGrid';
import ShoppingCart from '../components/pos/ShoppingCart';
import CheckoutModal from '../components/pos/CheckoutModal';
import { useCartStore } from '../stores/cartStore';
import toast from 'react-hot-toast';

export default function POS() {
  const { user, signOut } = useSupabaseAuth();
  const { addItem } = useCartStore();
  const [showCheckout, setShowCheckout] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const navigate = useNavigate();

  const handleAddToCart = (product: any) => {
    addItem(product);
    toast.success(`${product.name} ditambahkan ke keranjang`);
  };

  const handleCheckout = () => {
    setShowCheckout(true);
  };

  return (
    <div className="min-h-screen flex flex-col w-full" style={{ 
      background: '#061820',
      backgroundImage: 'radial-gradient(ellipse 70% 50% at 10% 0%, rgba(13,59,74,0.6) 0%, transparent 60%), radial-gradient(ellipse 60% 45% at 90% 100%, rgba(201,168,76,0.08) 0%, transparent 60%)'
    }}>
      {/* Header */}
      <header className="px-3 md:px-6 py-4 flex items-center justify-between border-b"
              style={{ 
                background: 'rgba(2,6,23,0.7)', 
                backdropFilter: 'blur(20px)',
                borderColor: 'rgba(255,255,255,0.08)' 
              }}>
        <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-white opacity-50 hover:opacity-100 transition text-xl md:text-2xl flex-shrink-0"
            title="Back to Dashboard"
          >
            ←
          </button>
          <div className="min-w-0">
            <h1 className="text-lg md:text-2xl font-bold text-white truncate">POS Terminal</h1>
            <p className="text-xs md:text-sm truncate" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Cleco Pii - {user?.email}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setShowCart(!showCart)}
            className="md:hidden px-3 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{ 
              background: 'rgba(99,102,241,0.2)', 
              color: '#a5b4fc', 
              border: '1px solid rgba(99,102,241,0.3)' 
            }}
          >
            🛒
          </button>
          <button
            onClick={signOut}
            className="px-3 md:px-6 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all"
            style={{ 
              background: 'rgba(239,68,68,0.2)', 
              color: '#fca5a5', 
              border: '1px solid rgba(239,68,68,0.3)' 
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden flex-col md:flex-row w-full">
        <div className={`flex-1 overflow-auto ${showCart ? 'hidden' : 'block'} md:block`}>
          <ProductGrid onAddToCart={handleAddToCart} />
        </div>
        <div className={`${showCart ? 'block' : 'hidden'} md:block w-full md:w-80 border-l`} style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <ShoppingCart onCheckout={handleCheckout} />
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal 
          onClose={() => setShowCheckout(false)}
          onSuccess={() => {
            toast.success('Order berhasil dibuat!');
            setShowCart(false);
          }}
        />
      )}
    </div>
  );
}
