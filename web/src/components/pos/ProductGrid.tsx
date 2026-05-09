import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  type: string;
  isActive: boolean;
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
      const productsRef = collection(db, 'companies/demo_company/products');
      const snapshot = await getDocs(productsRef);
      
      const loadedProducts: Product[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.isActive) {
          loadedProducts.push({
            id: doc.id,
            name: data.name,
            category: data.category,
            price: data.price,
            type: data.type,
            isActive: data.isActive
          });
        }
      });
      
      setProducts(loadedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
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
        </div>
      )}
    </div>
  );
}
