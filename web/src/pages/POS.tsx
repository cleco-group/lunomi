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
  const navigate = useNavigate();

  const handleAddToCart = (product: any) => {
    addItem(product);
    toast.success(`${product.name} ditambahkan ke keranjang`);
  };

  const handleCheckout = () => {
    setShowCheckout(true);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ 
      background: '#061820',
      backgroundImage: 'radial-gradient(ellipse 70% 50% at 10% 0%, rgba(13,59,74,0.6) 0%, transparent 60%), radial-gradient(ellipse 60% 45% at 90% 100%, rgba(201,168,76,0.08) 0%, transparent 60%)'
    }}>
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b"
              style={{ 
                background: 'rgba(2,6,23,0.7)', 
                backdropFilter: 'blur(20px)',
                borderColor: 'rgba(255,255,255,0.08)' 
              }}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-white opacity-50 hover:opacity-100 transition text-2xl"
            title="Back to Dashboard"
          >
            ←
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">POS Terminal</h1>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Cleco Pii - {user?.email}
            </p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="px-6 py-2 rounded-lg text-sm font-semibold transition-all"
          style={{ 
            background: 'rgba(239,68,68,0.2)', 
            color: '#fca5a5', 
            border: '1px solid rgba(239,68,68,0.3)' 
          }}
        >
          Logout
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <ProductGrid onAddToCart={handleAddToCart} />
        <ShoppingCart onCheckout={handleCheckout} />
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal 
          onClose={() => setShowCheckout(false)}
          onSuccess={() => {
            toast.success('Order berhasil dibuat!');
          }}
        />
      )}
    </div>
  );
}
