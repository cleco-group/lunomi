import { db } from '../firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';

export async function seedDemoData() {
  console.log('🌱 Starting data seeding...\n');

  try {
    // 1. Create Demo Company
    const companyRef = doc(db, 'companies', 'demo_company');
    await setDoc(companyRef, {
      name: 'Cleco Group',
      businessType: 'fnb',
      isMultiOutlet: true,
      settings: {
        currency: 'IDR',
        timezone: 'Asia/Jakarta',
        taxRate: 0.11,
        serviceCharge: 0
      },
      createdAt: serverTimestamp()
    });
    console.log('✅ Company created: Cleco Group');

    // 2. Create Outlet
    const locationRef = doc(db, 'companies/demo_company/locations', 'outlet_cleco_pii');
    await setDoc(locationRef, {
      name: 'Cleco Pii',
      type: 'outlet',
      address: 'Jl. Sudirman No. 12, Jakarta',
      phone: '021-12345678',
      isActive: true,
      createdAt: serverTimestamp()
    });
    console.log('✅ Outlet created: Cleco Pii');

    // 3. Create Products
    const products = [
      { name: 'Nasi Goreng Spesial', category: 'Makanan', price: 35000, cost: 15000 },
      { name: 'Mie Goreng', category: 'Makanan', price: 30000, cost: 12000 },
      { name: 'Ayam Bakar Madu', category: 'Makanan', price: 45000, cost: 20000 },
      { name: 'Sate Ayam', category: 'Makanan', price: 40000, cost: 18000 },
      { name: 'Gado-Gado', category: 'Makanan', price: 25000, cost: 10000 },
      { name: 'Es Teh Manis', category: 'Minuman', price: 8000, cost: 2000 },
      { name: 'Es Jeruk', category: 'Minuman', price: 10000, cost: 3000 },
      { name: 'Kopi Hitam', category: 'Minuman', price: 12000, cost: 4000 },
      { name: 'Jus Alpukat', category: 'Minuman', price: 15000, cost: 6000 },
      { name: 'Pisang Goreng', category: 'Snack', price: 15000, cost: 5000 },
    ];

    for (const product of products) {
      const productRef = await addDoc(collection(db, 'companies/demo_company/products'), {
        ...product,
        type: 'physical',
        isActive: true,
        createdAt: serverTimestamp()
      });

      // Create default variant
      await setDoc(doc(db, `companies/demo_company/products/${productRef.id}/variants`, 'default'), {
        name: 'Regular',
        sku: `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        price: product.price,
        costPrice: product.cost,
        stockQuantity: 100,
        lowStockAlert: 10,
        isActive: true
      });

      // Create inventory
      await setDoc(doc(db, `companies/demo_company/locations/outlet_cleco_pii/inventory/${productRef.id}`), {
        productVariantId: productRef.id,
        quantity: 100,
        reservedQuantity: 0,
        updatedAt: serverTimestamp()
      });
    }
    console.log(`✅ ${products.length} products created`);

    // 4. Create Customers
    const customers = [
      { name: 'Budi Santoso', phone: '081234567890', email: 'budi@example.com', membershipTier: 'regular', loyaltyPoints: 150 },
      { name: 'Siti Nurhaliza', phone: '081234567891', email: 'siti@example.com', membershipTier: 'silver', loyaltyPoints: 500 },
      { name: 'Ahmad Yani', phone: '081234567892', email: 'ahmad@example.com', membershipTier: 'regular', loyaltyPoints: 80 },
      { name: 'Dewi Lestari', phone: '081234567893', email: 'dewi@example.com', membershipTier: 'gold', loyaltyPoints: 1200 },
      { name: 'Rudi Hartono', phone: '081234567894', email: 'rudi@example.com', membershipTier: 'regular', loyaltyPoints: 50 },
    ];

    for (const customer of customers) {
      await addDoc(collection(db, 'companies/demo_company/customers'), {
        ...customer,
        storeCredit: 0,
        createdAt: serverTimestamp()
      });
    }
    console.log(`✅ ${customers.length} customers created`);

    // 5. Create Sample Orders
    const orderTypes = ['dine_in', 'takeaway', 'delivery'];
    const statuses = ['completed', 'completed', 'ready', 'preparing'];
    
    for (let i = 0; i < 20; i++) {
      const randomProducts = products.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1);
      
      let subtotal = 0;
      const items = [];
      
      for (const product of randomProducts) {
        const qty = Math.floor(Math.random() * 3) + 1;
        const itemSubtotal = product.price * qty;
        subtotal += itemSubtotal;
        
        items.push({
          productName: product.name,
          qty,
          price: product.price,
          discount: 0,
          subtotal: itemSubtotal
        });
      }
      
      const taxAmount = Math.round(subtotal * 0.11);
      const totalAmount = subtotal + taxAmount;
      
      // Create order 1-7 days ago
      const daysAgo = Math.floor(Math.random() * 7);
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - daysAgo);
      
      const orderRef = await addDoc(collection(db, 'companies/demo_company/orders'), {
        orderNumber: `ORD-${Date.now()}-${i}`,
        locationId: 'outlet_cleco_pii',
        customerId: null,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        orderType: orderTypes[Math.floor(Math.random() * orderTypes.length)],
        subtotal,
        taxAmount,
        discountAmount: 0,
        totalAmount,
        amountPaid: totalAmount,
        paymentStatus: 'paid',
        paymentMethods: ['cash'],
        createdAt: Timestamp.fromDate(orderDate),
        createdBy: 'seed_script'
      });
      
      // Add items subcollection
      for (const item of items) {
        await addDoc(collection(db, `companies/demo_company/orders/${orderRef.id}/items`), item);
      }
      
      // Add payment subcollection
      await addDoc(collection(db, `companies/demo_company/orders/${orderRef.id}/payments`), {
        method: 'cash',
        amount: totalAmount,
        paidAt: Timestamp.fromDate(orderDate),
        reference: null
      });
    }
    console.log('✅ 20 sample orders created');

    console.log('\n🎉 Data seeding complete!');
    return {
      success: true,
      message: 'Demo data seeded successfully!'
    };
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
}
