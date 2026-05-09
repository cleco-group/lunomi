import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  orderType: string;
  totalAmount: number;
  createdAt: Timestamp;
  items?: any[];
}

export function useOrders(companyId: string, statuses: string[]) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const ordersRef = collection(db, `companies/${companyId}/orders`);
    const q = query(
      ordersRef,
      where('status', 'in', statuses),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const newOrders: Order[] = [];
        snapshot.forEach(doc => {
          newOrders.push({ 
            id: doc.id, 
            ...doc.data() 
          } as Order);
        });
        
        setOrders(newOrders);
        setLoading(false);
      },
      (err) => {
        console.error('Error listening to orders:', err);
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [companyId, statuses.join(',')]);

  return { orders, loading, error };
}
