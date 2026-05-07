// Seed Demo Data to Firestore
// Run: node seed-data.js

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function seedData() {
  console.log('🌱 Starting data seeding...\n');

  // 1. Create Demo Company
  const companyRef = db.collection('companies').doc('demo_company');
  await companyRef.set({
    name: 'Cleco Group',
    businessType: 'fnb',
    isMultiOutlet: true,
    settings: {
      currency: 'IDR',
      timezone: 'Asia/Jakarta',
      taxRate: 0.11,
      serviceCharge: 0
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  console.log('✅ Company created: Cleco Group');

  // 2. Create Outlet
  const locationRef = companyRef.collection('locations').doc('outlet_cleco_pii');
  await locationRef.set({
    name: 'Cleco Pii',
    type: 'outlet',
    address: 'Jl. Sudirman No. 12, Jakarta',
    phone: '021-12345678',
    isActive: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  console.log('✅ Outlet created: Cleco Pii');

  // 3. Create Products
  const products = [
    { name: 'Nasi Goreng Spesial', category: 'Makanan', price: 35000, cost: 15000, type: 'physical' },
    { name: 'Mie Goreng', category: 'Makanan', price: 30000, cost: 12000, type: 'physical' },
    { name: 'Ayam Bakar Madu', category: 'Makanan', price: 45000, cost: 20000, type: 'physical' },
    { name: 'Sate Ayam', category: 'Makanan', price: 40000, cost: 18000, type: 'physical' },
    { name: 'Gado-Gado', category: 'Makanan', price: 25000, cost: 10000, type: 'physical' },
    { name: 'Es Teh Manis', category: 'Minuman', price: 8000, cost: 2000, type: 'physical' },
    { name: 'Es Jeruk', category: 'Minuman', price: 10000, cost: 3000, type: 'physical' },
    { name: 'Kopi Hitam', category: 'Minuman', price: 12000, cost: 4000, type: 'physical' },
    { name: 'Jus Alpukat', category: 'Minuman', price: 15000, cost: 6000, type: 'physical' },
    { name: 'Teh Tarik', category: 'Minuman', price: 10000, cost: 3000, type: 'physical' },
    { name: 'Pisang Goreng', category: 'Snack', price: 15000, cost: 5000, type: 'physical' },
    { name: 'Roti Bakar', category: 'Snack', price: 18000, cost: 7000, type: 'physical' },
  ];

  for (const product of products) {
    const productRef = companyRef.collection('products').doc();
    await productRef.set({
      ...product,
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Create default variant
    const variantRef = productRef.collection('variants').doc('default');
    await variantRef.set({
      name: 'Regular',
      sku: `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      price: product.price,
      costPrice: product.cost,
      stockQuantity: 100,
      lowStockAlert: 10,
      isActive: true
    });

    // Create inventory
    await locationRef.collection('inventory').doc(variantRef.id).set({
      productVariantRef: variantRef,
      quantity: 100,
      reservedQuantity: 0,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }
  console.log(`✅ ${products.length} products created with variants and inventory`);

  // 4. Create Customers
  const customers = [
    { name: 'Budi Santoso', phone: '081234567890', email: 'budi@example.com', membershipTier: 'regular', loyaltyPoints: 150 },
    { name: 'Siti Nurhaliza', phone: '081234567891', email: 'siti@example.com', membershipTier: 'silver', loyaltyPoints: 500 },
    { name: 'Ahmad Yani', phone: '081234567892', email: 'ahmad@example.com', membershipTier: 'regular', loyaltyPoints: 80 },
    { name: 'Dewi Lestari', phone: '081234567893', email: 'dewi@example.com', membershipTier: 'gold', loyaltyPoints: 1200 },
    { name: 'Rudi Hartono', phone: '081234567894', email: 'rudi@example.com', membershipTier: 'regular', loyaltyPoints: 50 },
  ];

  for (const customer of customers) {
    await companyRef.collection('customers').doc().set({
      ...customer,
      storeCredit: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }
  console.log(`✅ ${customers.length} customers created`);

  // 5. Create Sample Orders
  const orderTypes = ['dine_in', 'takeaway', 'delivery'];
  const statuses = ['completed', 'completed', 'completed', 'ready', 'preparing'];
  
  for (let i = 0; i < 20; i++) {
    const orderRef = companyRef.collection('orders').doc();
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
    
    const taxAmount = subtotal * 0.11;
    const totalAmount = subtotal + taxAmount;
    
    // Create order 1-7 days ago
    const daysAgo = Math.floor(Math.random() * 7);
    const orderDate = new Date();
    orderDate.setDate(orderDate.getDate() - daysAgo);
    
    await orderRef.set({
      orderNumber: `ORD-${Date.now()}-${i}`,
      locationRef: locationRef,
      customerRef: null,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      orderType: orderTypes[Math.floor(Math.random() * orderTypes.length)],
      subtotal,
      taxAmount,
      discountAmount: 0,
      totalAmount,
      amountPaid: totalAmount,
      paymentStatus: 'paid',
      paymentMethods: ['cash'],
      createdAt: admin.firestore.Timestamp.fromDate(orderDate),
      createdBy: 'seed_script'
    });
    
    // Add items subcollection
    for (const item of items) {
      await orderRef.collection('items').doc().set(item);
    }
    
    // Add payment subcollection
    await orderRef.collection('payments').doc().set({
      method: 'cash',
      amount: totalAmount,
      paidAt: admin.firestore.Timestamp.fromDate(orderDate),
      reference: null
    });
  }
  console.log('✅ 20 sample orders created');

  console.log('\n🎉 Data seeding complete!');
  console.log('\n📊 Summary:');
  console.log('   - 1 Company (Cleco Group)');
  console.log('   - 1 Outlet (Cleco Pii)');
  console.log(`   - ${products.length} Products with variants`);
  console.log(`   - ${customers.length} Customers`);
  console.log('   - 20 Sample Orders');
  console.log('\n✅ Firestore is now populated with demo data!');
}

seedData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  });
