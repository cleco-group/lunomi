import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export async function updateOrderStatus(
  companyId: string,
  orderId: string,
  newStatus: OrderStatus
) {
  try {
    const orderRef = doc(db, `companies/${companyId}/orders/${orderId}`);
    
    await updateDoc(orderRef, {
      status: newStatus,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}
