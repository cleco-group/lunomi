# LUNOMI – AUDIT & RENCANA PENGEMBANGAN LENGKAP

**Versi**: 2.0  
**Tanggal**: 7 Mei 2026  
**Status**: Production Ready (HTML) + Development (React + Firebase)

---

## DAFTAR ISI

1. [Status Saat Ini](#status-saat-ini)
2. [Target Arsitektur](#target-arsitektur)
3. [Masalah Kritis](#masalah-kritis)
4. [Database Design](#database-design)
5. [Tahapan Pengembangan](#tahapan-pengembangan)
6. [Konfigurasi Proyek](#konfigurasi-proyek)
7. [Cloud Functions Detail](#cloud-functions-detail)
8. [Security Rules](#security-rules)
9. [UI/UX Guidelines](#uiux-guidelines)
10. [Testing Plan](#testing-plan)
11. [Monitoring & Backup](#monitoring-backup)

---

## STATUS SAAT INI

### ✅ Yang Sudah Selesai

- ✅ **TAHAP 0**: Bug Dashboard fixed (HTML version)
- ✅ **TAHAP 1**: Firebase project setup complete
  - Firebase project: `lunomi-pos`
  - Firestore enabled (asia-southeast1)
  - Authentication enabled (Email/Password)
  - React app dengan Vite + TypeScript
  - Dependencies installed
- ✅ **TAHAP 2 (Partial)**: Authentication working
  - Login page functional
  - Auth Context implemented
  - Protected routes working
  - 4 demo users created (tanpa custom claims)

### ⚠️ Yang Belum Selesai

- ❌ **TAHAP 3**: Firestore masih kosong (no data)
- ❌ **TAHAP 4**: Cloud Functions code ready tapi belum deployed (butuh Blaze plan)
- ❌ **TAHAP 5-7**: POS, KDS, Dashboard real-time belum implemented
- ❌ **TAHAP 8**: Firestore rules belum deployed

### 🔴 Critical Blockers

1. **Firestore Security Rules** - Masih test mode (INSECURE!)
2. **No Blaze Plan** - Cloud Functions tidak bisa deployed
3. **No Demo Data** - Firestore kosong
4. **React Styling** - Tidak match dengan HTML version

---

## TARGET ARSITEKTUR

### Frontend
- **Production**: HTML/CSS/JS di Vercel (https://lunomi.vercel.app)
- **Development**: React (Vite) + TypeScript + Firebase SDK

### Backend
- **Cloud Functions**: Node.js 18+ TypeScript
- **Database**: Firestore (NoSQL)
- **Auth**: Firebase Authentication + Custom Claims
- **Notifications**: Firebase Cloud Messaging (FCM)

### Hosting
- **HTML**: Vercel (current)
- **React**: Firebase Hosting (future)

---

## MASALAH KRITIS YANG HARUS DIPERBAIKI

### 1. Bug Dashboard ✅ FIXED
**Status**: Resolved  
**Solution**: Inline CSS/JS, Chart.js integrated

### 2. Tidak Ada Backend & Database ⚠️ IN PROGRESS
**Status**: Firebase setup done, data seeding pending  
**Next**: Seed demo data

### 3. Keamanan Nol 🔴 CRITICAL
**Status**: Firestore in test mode  
**Action Required**: Deploy security rules IMMEDIATELY

### 4. Data Statis/Dummy ⚠️ PENDING
**Status**: All data hardcoded  
**Next**: Connect to Firestore

### 5. Tidak Mendukung Multi Lini Usaha ⚠️ PENDING
**Status**: Only F&B supported  
**Next**: Add businessType flag and adaptive UI

---

## DATABASE DESIGN

### Struktur Koleksi Firestore

```
companies/{companyId}
├─ fields: name, businessType, isMultiOutlet, settings
├─ locations/{locationId}
│   ├─ type: "outlet"|"warehouse"|"both"
│   └─ inventory/{inventoryId}
│       └─ fields: productVariantRef, quantity, reservedQuantity
├─ products/{productId}
│   ├─ type: "physical"|"service"|"bundle"
│   └─ variants/{variantId}
│       └─ fields: name, sku, barcode, price, costPrice
├─ customers/{customerId}
├─ suppliers/{supplierId}
├─ purchaseOrders/{poId}
│   └─ items/{itemId}
├─ orders/{orderId}
│   ├─ items/{itemId}
│   └─ payments/{paymentId}
└─ appointments/{appointmentId}
```

---

## TAHAPAN PENGEMBANGAN

### TAHAP 0 – PERBAIKAN DARURAT ✅ COMPLETE
- [x] Fix dashboard rendering
- [x] Remove broken CSS references
- [x] Add Chart.js for graphs

### TAHAP 1 – SETUP PROYEK & FIREBASE ✅ COMPLETE
- [x] Create React app with Vite
- [x] Install dependencies
- [x] Setup Firebase config
- [x] Initialize Firebase CLI
- [x] Enable Firestore & Authentication

### TAHAP 2 – AUTHENTIKASI & CUSTOM CLAIMS ⚠️ PARTIAL (60%)
- [x] Login page with Firebase Auth
- [x] Auth Context with onAuthStateChanged
- [x] Protected routes
- [ ] Deploy Cloud Functions for custom claims
- [ ] Create users with role-based access

### TAHAP 3 – MODEL DATA & SEEDING ❌ NOT STARTED (0%)
- [ ] Create companies collection
- [ ] Add demo company
- [ ] Seed products (10-20 items)
- [ ] Seed customers (5-10)
- [ ] Seed sample orders (20-30)

### TAHAP 4 – CLOUD FUNCTIONS ⚠️ CODE READY (50%)
- [x] Write createTransaction function
- [x] Write setUserClaims function
- [x] Write createDemoUsers function
- [ ] Deploy to Firebase (requires Blaze plan)
- [ ] Add dailySalesReport cron job
- [ ] Add unit tests

### TAHAP 5 – UI POS UNIVERSAL ❌ NOT STARTED (0%)
- [ ] Product grid from Firestore
- [ ] Shopping cart with calculations
- [ ] Checkout flow
- [ ] Receipt generation
- [ ] Barcode scanner (retail)
- [ ] Table selection (F&B)
- [ ] Appointment booking (service)

### TAHAP 6 – KITCHEN DISPLAY SYSTEM ❌ NOT STARTED (0%)
- [ ] Real-time order listener
- [ ] Order grid with timer
- [ ] Status update buttons
- [ ] FCM notifications

### TAHAP 7 – DASHBOARD REAL-TIME ⚠️ PARTIAL (30%)
- [x] Dashboard UI with Chart.js
- [ ] Connect to Firestore
- [ ] Real-time metrics
- [ ] Sales graph from actual data
- [ ] Top products from orders

### TAHAP 8 – DEPLOYMENT & TESTING ⚠️ PARTIAL (40%)
- [x] Firestore rules written
- [ ] Deploy Firestore rules
- [ ] Deploy Cloud Functions
- [ ] Build React app
- [ ] Deploy to Firebase Hosting
- [ ] End-to-end testing

---

## KONFIGURASI PROYEK

### Struktur Folder

```
lunomi/
├── web/                    # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/        # Button, Card, Input
│   │   │   ├── layout/    # Sidebar, Header
│   │   │   ├── pos/       # ProductGrid, Cart
│   │   │   ├── kds/       # Kitchen Display
│   │   │   └── auth/      # LoginForm
│   │   ├── hooks/         # useAuth, useOrders
│   │   ├── lib/           # firebase.ts, constants
│   │   ├── pages/         # Dashboard, POS, KDS
│   │   ├── stores/        # Zustand stores
│   │   └── App.tsx
│   ├── .env.local
│   └── package.json
├── functions/              # Cloud Functions
│   ├── src/
│   │   ├── auth/
│   │   ├── transactions/
│   │   ├── inventory/
│   │   ├── reports/
│   │   └── index.ts
│   └── package.json
├── public/                 # HTML version (production)
├── firestore.rules
├── firestore.indexes.json
└── firebase.json
```

### Dependencies

**Frontend** (`web/package.json`):
```json
{
  "dependencies": {
    "firebase": "^10.0.0",
    "react": "^18.2.0",
    "react-router-dom": "^6.10.0",
    "zustand": "^4.3.8",
    "recharts": "^2.7.0",
    "react-hot-toast": "^2.4.1",
    "date-fns": "^2.30.0"
  }
}
```

**Backend** (`functions/package.json`):
```json
{
  "dependencies": {
    "firebase-admin": "^11.0.0",
    "firebase-functions": "^4.0.0"
  }
}
```

---

## CLOUD FUNCTIONS DETAIL

### 1. createTransaction (HTTP Callable)

**Purpose**: Create order with inventory update

**Input**:
```typescript
{
  companyId: string;
  locationId: string;
  customerId?: string;
  items: Array<{
    productVariantId: string;
    productName: string;
    quantity: number;
    price: number;
    discount: number;
  }>;
  orderType: 'dine_in' | 'takeaway' | 'delivery';
  taxRate: number;
  payments: Array<{
    method: 'cash' | 'card' | 'qris';
    amount: number;
  }>;
}
```

**Logic**:
1. Validate stock availability
2. Calculate subtotal, tax, total
3. Create order document
4. Update inventory
5. Send FCM notification to kitchen
6. Return orderId and orderNumber

### 2. setUserClaims (HTTP Callable)

**Purpose**: Set custom claims for role-based access

**Input**:
```typescript
{
  uid: string;
  companyId: string;
  role: 'owner' | 'manager' | 'cashier' | 'kitchen';
  locationIds: string[];
}
```

**Security**: Only owner can call this function

### 3. dailySalesReport (Scheduled)

**Trigger**: Every day at 00:00 (Asia/Jakarta)

**Logic**:
1. Query all orders from yesterday
2. Calculate total revenue, order count
3. Find top products
4. Save to `reports/{companyId}/daily/{date}`

---

## SECURITY RULES

### Firestore Rules (`firestore.rules`)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function hasCompanyRole(companyId) {
      return request.auth.token.companyId == companyId;
    }
    
    function hasRole(role) {
      return request.auth.token.role == role;
    }
    
    function hasAnyRole(roles) {
      return request.auth.token.role in roles;
    }
    
    match /companies/{companyId} {
      allow read, write: if isAuthenticated() && hasCompanyRole(companyId);
      
      match /products/{productId} {
        allow write: if hasAnyRole(['owner','manager']);
      }
      
      match /orders/{orderId} {
        allow read: if true;
        allow create: if hasAnyRole(['owner','manager','cashier']);
        allow update: if hasAnyRole(['owner','manager','cashier','kitchen']);
        allow delete: if hasAnyRole(['owner','manager']);
      }
      
      match /locations/{locId}/inventory/{invId} {
        allow read: if true;
        allow write: if hasAnyRole(['owner','manager','warehouse']);
      }
    }
  }
}
```

---

## UI/UX GUIDELINES

### Multi-Business Type Support

**Retail Mode**:
- Simple product grid
- Barcode scanner
- Quick checkout
- No table management

**F&B Mode**:
- Table selection
- Kitchen Display System
- Modifiers (extra toppings)
- Split bill feature

**Service Mode**:
- Appointment calendar
- Staff assignment
- Duration selection
- Service queue

### Adaptive UI Components

```typescript
// Example: Conditional rendering based on businessType
{businessType === 'fnb' && <TableSelector />}
{businessType === 'retail' && <BarcodeScanner />}
{businessType === 'service' && <AppointmentCalendar />}
```

---

## TESTING PLAN

### Unit Tests
- **Frontend**: Vitest + React Testing Library
- **Functions**: Jest + Firestore Emulator

### Integration Tests
- Firebase Emulator Suite
- Test full flow: Login → Create Order → Update Inventory

### E2E Tests
- Playwright or Cypress
- Test user journeys for each role

### UAT Checklist
- [ ] Owner can create company and outlets
- [ ] Manager can add products
- [ ] Cashier can create orders
- [ ] Kitchen can update order status
- [ ] Dashboard shows real-time metrics
- [ ] Role-based access working

---

## MONITORING & BACKUP

### Monitoring
- Firebase Crashlytics for error tracking
- Cloud Functions logging
- Firestore usage alerts
- Google Analytics for user events

### Backup Strategy
- Daily Firestore export to Cloud Storage
- Stream to BigQuery for analytics
- Automated backup function

---

## NEXT ACTIONS (PRIORITIZED)

### 🔴 CRITICAL (Do Now)
1. Deploy Firestore security rules
2. Seed demo data to Firestore
3. Test Firebase Auth with custom claims

### 🟡 HIGH (This Week)
1. Upgrade to Blaze plan
2. Deploy Cloud Functions
3. Implement POS with Firestore integration

### 🟢 MEDIUM (This Month)
1. Build Kitchen Display System
2. Add real-time dashboard
3. Implement testing suite

### 🔵 LOW (Future)
1. Multi-language support
2. Offline mode
3. Advanced analytics

---

**Document Version**: 2.0  
**Last Updated**: 2026-05-07  
**Next Review**: After Firestore rules deployment
