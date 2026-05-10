import { supabase } from './supabase';

type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export async function updateOrderStatus(
  companyId: string,
  orderId: string,
  newStatus: OrderStatus
) {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .eq('company_id', companyId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}
