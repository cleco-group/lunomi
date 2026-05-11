import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  type?: string;
  is_active?: boolean;
}

interface ProductGridProps {
  onAddToCart: (product: Product) => void;
}

export default function ProductGrid({ onAddToCart }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      // Try Supabase first
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('company_id', '00000000-0000-0000-0000-000000000001')
        .eq('is_active', true);
      
      if (data && data.length > 0) {
        setProducts(data);
      } else {
        // Fallback to localStorage
        const stored = localStorage.getItem('lunomi_products');
        if (stored) {
          const localProducts = JSON.parse(stored);
          // Normalize field names from Product page (cat → category, avail → is_active)
          const normalized = localProducts
            .filter((p: any) => p.avail !== false && p.is_active !== false)
            .map((p: any) => ({
              id: String(p.id),
              name: p.name,
              category: p.category || p.cat || 'Lainnya',
              price: p.price,
            }));
          setProducts(normalized);
        } else {
          // Create demo products if none exist
          const demoProducts: Product[] = [
            { id: '1', name: 'Nasi Goreng Spesial', category: 'Makanan', price: 25000 },
            { id: '2', name: 'Mie Goreng', category: 'Makanan', price: 20000 },
            { id: '3', name: 'Ayam Bakar Madu', category: 'Makanan', price: 35000 },
            { id: '4', name: 'Es Teh Manis', category: 'Minuman', price: 5000 },
            { id: '5', name: 'Kopi Hitam', category: 'Minuman', price: 8000 },
            { id: '6', name: 'Jus Jeruk', category: 'Minuman', price: 12000 },
            { id: '7', name: 'Soto Ayam', category: 'Makanan', price: 18000 },
            { id: '8', name: 'Gado-Gado', category: 'Makanan', price: 15000 },
          ];
          setProducts(demoProducts);
          localStorage.setItem('lunomi_products', JSON.stringify(demoProducts));
        }
      }
    } catch (error) {
      console.error('Error loading products:', error);
      // Fallback to localStorage on error
      const stored = localStorage.getItem('lunomi_products');
      if (stored) {
        const raw = JSON.parse(stored);
        setProducts(raw.filter((p: any) => p.avail !== false && p.is_active !== false).map((p: any) => ({
          id: String(p.id), name: p.name, category: p.category || p.cat || 'Lainnya', price: p.price,
        })));
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-white text-xl">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-auto">
      {/* Search & Filter */}
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Cari produk..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-3 rounded-xl text-white"
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-6 py-3 rounded-xl text-white font-semibold"
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}
        >
          {categories.map(cat => (
            <option key={cat} value={cat} className="bg-gray-800">
              {cat === 'all' ? 'Semua Kategori' : cat}
            </option>
          ))}
        </select>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProducts.map(product => (
          <div
            key={product.id}
            onClick={() => onAddToCart(product)}
            className="p-5 rounded-xl cursor-pointer transition-all hover:scale-105 hover:shadow-lg"
            style={{
              background: 'rgba(13,59,74,0.5)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(201,168,76,0.2)'
            }}
          >
            <div className="mb-3">
              <h3 className="font-bold text-white text-lg mb-1">{product.name}</h3>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {product.category}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold" style={{ color: '#C9A84C' }}>
                Rp {product.price.toLocaleString('id-ID')}
              </p>
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(201,168,76,0.2)' }}
              >
                <span className="text-xl">+</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-white/60 text-lg">Tidak ada produk ditemukan</p>
          <p className="text-white/40 text-sm mt-2">
            Tambahkan produk di menu Master Menu
          </p>
        </div>
      )}
    </div>
  );
}
