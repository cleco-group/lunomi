import { supabase } from './supabase';

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
  
  // Create order in Supabase
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      company_id: companyId,
      location_id: locationId,
      customer_id: input.customerId || null,
      order_number: `ORD-${Date.now()}`,
      status: 'pending',
      order_type: orderType,
      subtotal,
      tax_amount: taxAmount,
      discount_amount: 0,
      total_amount: totalAmount,
      amount_paid: amountPaid,
      payment_status: 'paid',
      payment_methods: payments.map(p => p.method),
      created_by: createdBy
    })
    .select()
    .single();
  
  if (orderError) throw orderError;
  
  // Create order items
  const orderItems = items.map(item => ({
    order_id: order.id,
    product_id: item.productVariantId,
    product_name: item.productName,
    qty: item.qty,
    price: item.price,
    discount: item.discount,
    subtotal: item.price * item.qty - item.discount
  }));
  
  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);
  
  if (itemsError) throw itemsError;
  
  return {
    orderId: order.id,
    orderNumber: order.order_number
  };
}
