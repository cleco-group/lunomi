import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Order {
  id: string;
  order_number: string;
  status: string;
  order_type: string;
  total_amount: number;
  created_at: string;
  items?: any[];
}

export function useOrders(companyId: string, statuses: string[]) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Initial fetch
    fetchOrders();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `company_id=eq.${companyId}`
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [companyId, statuses.join(',')]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('company_id', companyId)
        .in('status', statuses)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err as Error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  return { orders, loading, error };
}
