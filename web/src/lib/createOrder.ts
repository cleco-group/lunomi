import { collection, addDoc, serverTimestamp, writeBatch, doc } from 'firebase/firestore';
import { db } from '../firebase';

interface OrderItem {
  productVariantId: string;
  productName: string;
  qty: number;
  price: number;
  discount: number;
}

interface CreateOrderInput {
  companyId: string;
  locationId: string;
  customerId?: string;
  items: OrderItem[];
  orderType: 'dine_in' | 'takeaway' | 'delivery';
  taxRate: number;
  payments: Array<{
    method: 'cash' | 'card' | 'qris';
    amount: number;
  }>;
  createdBy: string;
}

export async function createOrder(input: CreateOrderInput) {
  const { companyId, locationId, items, orderType, taxRate, payments, createdBy } = input;
  
  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty - item.discount), 0);
  const taxAmount = Math.round(subtotal * taxRate);
  const totalAmount = subtotal + taxAmount;
  const amountPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  
  // Validate payment
  if (amountPaid < totalAmount) {
    throw new Error('Pembayaran tidak mencukupi');
  }
  
  // Create order
  const orderRef = await addDoc(collection(db, `companies/${companyId}/orders`), {
    orderNumber: `ORD-${Date.now()}`,
    locationId,
    customerId: input.customerId || null,
    status: 'pending',
    orderType,
    subtotal,
    taxAmount,
    discountAmount: 0,
    totalAmount,
    amountPaid,
    paymentStatus: 'paid',
    paymentMethods: payments.map(p => p.method),
    createdAt: serverTimestamp(),
    createdBy
  });
  
  // Create items and payments subcollections using batch
  const batch = writeBatch(db);
  
  // Add items
  items.forEach(item => {
    const itemRef = doc(collection(db, `companies/${companyId}/orders/${orderRef.id}/items`));
    batch.set(itemRef, {
      productName: item.productName,
      qty: item.qty,
      price: item.price,
      discount: item.discount,
      subtotal: item.price * item.qty - item.discount
    });
  });
  
  // Add payments
  payments.forEach(payment => {
    const paymentRef = doc(collection(db, `companies/${companyId}/orders/${orderRef.id}/payments`));
    batch.set(paymentRef, {
      method: payment.method,
      amount: payment.amount,
      paidAt: serverTimestamp(),
      reference: null
    });
  });
  
  await batch.commit();
  
  return {
    orderId: orderRef.id,
    orderNumber: `ORD-${Date.now()}`
  };
}
