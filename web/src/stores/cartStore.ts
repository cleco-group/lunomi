import { create } from 'zustand';

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  category: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: any) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTax: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  
  addItem: (product) => {
    const items = get().items;
    const existingItem = items.find(item => item.id === product.id);
    
    if (existingItem) {
      set({
        items: items.map(item =>
          item.id === product.id
            ? { ...item, qty: item.qty + 1 }
            : item
        )
      });
    } else {
      set({
        items: [...items, {
          id: product.id,
          name: product.name,
          price: product.price,
          qty: 1,
          category: product.category
        }]
      });
    }
  },
  
  removeItem: (productId) => {
    set({
      items: get().items.filter(item => item.id !== productId)
    });
  },
  
  updateQuantity: (productId, qty) => {
    if (qty <= 0) {
      get().removeItem(productId);
      return;
    }
    
    set({
      items: get().items.map(item =>
        item.id === productId
          ? { ...item, qty }
          : item
      )
    });
  },
  
  clearCart: () => {
    set({ items: [] });
  },
  
  getSubtotal: () => {
    return get().items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  },
  
  getTax: () => {
    return Math.round(get().getSubtotal() * 0.11);
  },
  
  getTotal: () => {
    return get().getSubtotal() + get().getTax();
  }
}));
