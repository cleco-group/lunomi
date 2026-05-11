# HTML to React Conversion Guide - Lunomi POS

**Tujuan:** Convert 41 HTML files di `public/` menjadi React components di `web/src/pages/`

**Status:** Planning phase
**Estimasi:** 2-3 hari untuk konvert halaman kritis

---

## Priority Pages to Convert

### Tier 1 (CRITICAL - Do First)
1. **POS.tsx** - Main point-of-sale interface
   - Source: `public/pos.html`
   - Features: Item selection, cart, payment
   - Dependencies: LunomiDB, SessionManager
   
2. **Kitchen.tsx** - Kitchen display system
   - Source: `public/kitchen.html`
   - Features: Order queue, status updates
   - Dependencies: Real-time order sync

3. **Dashboard.tsx** (Already started)
   - Source: `public/dashboard.html`
   - Features: KPIs, charts, revenue
   - Status: Partially done - needs completion

4. **Inventory.tsx**
   - Source: `public/inventory.html`
   - Features: Stock levels, product management
   - Dependencies: LunomiDB products

5. **Login.tsx** (Already exists)
   - Source: `public/index.html` (login form)
   - Status: Already converted
   - Needs: Style refinement

### Tier 2 (IMPORTANT - Do Second)
- Customer.tsx
- Invoice.tsx
- Booking.tsx
- Loyalty.tsx
- Analytics.tsx

### Tier 3 (NICE-TO-HAVE - Do Later)
- Settings pages (tax, printer, whatsapp, etc)
- Audit/Security pages
- HR/Attendance
- Financial statements

---

## Conversion Process

### Step 1: Extract Structure
```bash
# Analyze HTML file
grep -E "class=|id=|onclick=" public/pos.html | head -30
```

### Step 2: Identify Components
```
Layout:
├── Header (title, user, logout)
├── Sidebar (navigation, menu items)
├── Main Content
│   ├── Item Grid/List
│   ├── Cart/Order Summary
│   └── Payment Section
└── Toast/Notifications
```

### Step 3: Create React File Structure
```
web/src/pages/POS.tsx
web/src/components/pos/ItemGrid.tsx
web/src/components/pos/CartSummary.tsx
web/src/components/pos/PaymentModal.tsx
```

### Step 4: Migrate JavaScript Logic
- `sessionManager.get/set` → React Context
- `localStorage` → Zustand store or Context
- `onclick` handlers → onClick React events
- `document.getElementById` → React refs or state

### Step 5: Apply Tailwind Styling
- Dark glass theme: `bg-[#061820]`, `backdrop-blur-sm`
- Cards: `rounded-2xl`, `border border-white/10`
- Buttons: Gradient or glass effect

---

## Code Template for Each Page

### Basic Component Structure
```typescript
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import toast from 'react-hot-toast';

export default function POSPage() {
  const { user } = useSupabaseAuth();
  const [state, setState] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load from Supabase or localStorage
      setLoading(false);
    } catch (error) {
      toast.error('Error loading data');
    }
  };

  return (
    <div className="flex min-h-screen" style={{ background: '#061820' }}>
      <Sidebar />
      <main className="flex-1">
        {/* Page content */}
      </main>
    </div>
  );
}
```

### Styling Constants
```typescript
const GLASS_CARD = 'rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm';
const GLASS_INPUT = 'rounded-xl bg-white/5 border border-white/10 text-white px-4 py-2';
const BTN_PRIMARY = 'rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 px-6 py-3 font-bold text-white transition-all';
const BTN_SECONDARY = 'rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 px-6 py-3 font-bold text-white transition-all';
```

---

## Data Layer Integration

### Option A: localStorage (Quick)
```typescript
import SessionManager from '../lib/sessionManager';

const data = SessionManager.get('transactions');
SessionManager.set('transactions', updated);
```

### Option B: Supabase (Better)
```typescript
import { supabase } from '../lib/supabase';

const { data, error } = await supabase
  .from('transactions')
  .select('*');
```

### Option C: LunomiDB (Hybrid)
```typescript
import LunomiDB from '../lib/lunomiDB';

const transactions = LunomiDB.getTransactions();
LunomiDB.saveTransactions(updated);
```

---

## Testing Checklist

- [ ] Page renders without errors
- [ ] Auth guard works (redirect if not logged in)
- [ ] Data loads correctly
- [ ] CRUD operations work (Create, Read, Update, Delete)
- [ ] Styling matches dark theme
- [ ] Responsive on mobile
- [ ] Toast notifications appear
- [ ] Sidebar navigation works
- [ ] Logout button works

---

## Files to Keep (Reference)

```
public/pos.html          → web/src/pages/POS.tsx
public/kitchen.html      → web/src/pages/Kitchen.tsx
public/dashboard.html    → web/src/pages/Dashboard.tsx (WIP)
public/inventory.html    → web/src/pages/Inventory.tsx
public/customer.html     → web/src/pages/Customer.tsx
public/login.html        → web/src/pages/Login.tsx (DONE)
```

---

## Routing Setup

Add routes to `web/src/main.tsx`:

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Kitchen from './pages/Kitchen';
import Inventory from './pages/Inventory';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pos" element={<POS />} />
        <Route path="/kitchen" element={<Kitchen />} />
        <Route path="/inventory" element={<Inventory />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## Known Issues & Solutions

| Issue | Solution |
|-------|----------|
| localStorage keys conflict | Use namespaced keys: `lunomi_pos_cart`, `lunomi_kitchen_orders` |
| Real-time updates lag | Use Supabase subscriptions with `onInsert`, `onUpdate` |
| Sidebar not showing | Check `marginLeft: '256px'` on main content |
| Styling not applying | Ensure Tailwind import in `index.css` |
| Auth redirect loop | Check SessionManager.isValid() logic |

---

## Commands

```bash
# Create new React page from template
touch web/src/pages/PageName.tsx

# Test build locally
cd web && npm run dev

# Build for production
npm run build

# Check for TypeScript errors
npm run build -- --watch
```

---

## Next Steps

1. **Tier 1 Priority** - Pick POS.tsx or Kitchen.tsx to start
2. **Create rough skeleton** - Layout, sidebar, basic sections
3. **Add data loading** - Connect to localStorage/Supabase
4. **Implement CRUD** - Forms, modals, delete confirmations
5. **Polish styling** - Responsive, dark theme, animations
6. **Test thoroughly** - All user flows

Estimated time per Tier 1 page: **4-6 hours**
