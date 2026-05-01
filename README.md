# 🏪 Lunomi POS System

**Sistem POS Pintar untuk F&B Indonesia dengan Multi-Agent AI Orchestration**

## 📋 Project Overview

Lunomi adalah sistem POS (Point of Sale) terintegrasi untuk bisnis Food & Beverage multi-outlet di Indonesia, dilengkapi dengan CEO Orchestrator AI yang mengelola 6 sub-agents specialist (Finance, HR, Operations, Marketing, IT, Design).

**Stack:** 
- Frontend: Pure HTML5 + Tailwind CSS + Vanilla JavaScript
- Auth: localStorage (demo mode)
- Data: Dummy/Sample data (siap integrasi Supabase)
- Deployment: Vercel / Static hosting

---

## 📁 File Structure

```
.
├── index.html          # Login page - 4 role selector (Owner, Manager, Kasir, Kitchen)
├── dashboard.html      # Owner Dashboard dengan CEO Orchestrator + HO Activity Log
├── pos.html            # POS Terminal Kasir - Product grid, cart, diskon, riwayat transaksi
├── kitchen.html        # Kitchen Display System - Order queue real-time dengan timer
├── README.md           # Dokumentasi ini
└── .env.example        # (Opsional) Environment variables untuk Supabase integrasi
```

---

## 🎯 Features

### 1. **Login (index.html)**
- 4 Role selector: Owner, Manager, Kasir, Kitchen
- Demo account auto-fill per role
- Session management via localStorage
- Gradient background dengan animated orbs
- Responsive mobile + desktop

**Demo Accounts:**
```
Owner:   owner@lunomi.local / demo123
Manager: manager@lunomi.local / demo123
Kasir:   kasir@lunomi.local / demo123
Kitchen: kitchen@lunomi.local / demo123
```

### 2. **Owner Dashboard (dashboard.html)**
- 🤖 CEO Orchestrator interface (visible, "Tanya Lunomi" menu)
- 6 Sub-agents status (FIN/HR/OPS/MKT/IT/DES) dengan live pulse
- Real-time metrics: Penjualan, Transaksi, Stok Alert, Outlet Status
- 📋 HO Activity Log dengan 5 sample activities
- ⚡ Quick Actions ke halaman lain
- Responsive grid layout

### 3. **POS Terminal (pos.html)**
- 📦 Product grid 12 items (Makanan, Minuman, Snack, Dessert)
- 🛒 Active cart dengan qty control (+/-)
- 🏷️ Diskon menu (Persentase atau Nominal)
- 📋 Riwayat transaksi (8 sample, filter: Semua/Dibayar/Menunggu)
- Auto-calculate: Subtotal, Diskon, PPN 10%, Total
- Dark mode optimized untuk retail environment

### 4. **Kitchen Display System (kitchen.html)**
- 📥 3-column layout: Incoming → Cooking → Ready
- ⏱️ Live timer per order (count-up) dengan color indicator
- 🚨 Urgent flag (red pulse animation)
- 👨‍🍳 Button actions: Mulai Masak → Selesai → Ambil
- 📊 Stats bar: Total, Cooking, Ready, Urgent count
- Dark theme untuk kitchen environment

---

## 🚀 Quick Start

### Local Development

1. **Download semua 4 HTML files ke folder:**
```bash
mkdir lunomi-pos
cd lunomi-pos
# Copy index.html, dashboard.html, pos.html, kitchen.html ke folder ini
```

2. **Run local server (Python 3):**
```bash
python -m http.server 8000
```

Atau gunakan **Live Server** extension di VS Code.

3. **Open di browser:**
```
http://localhost:8000
```

4. **Login flow:**
   - Login page: Pilih role (Owner)
   - Klik "Masuk ke Lunomi"
   - Redirect ke Dashboard

---

## 📝 Demo Flow

### Full Workflow:
```
1. index.html (Login)
   ↓ (Select: Owner role, auto-filled email/password)
   ↓
2. dashboard.html (Owner Dashboard)
   ↓ (Click "Buka POS Kasir" button)
   ↓
3. pos.html (POS Terminal)
   ↓ (Add items, apply diskon, proceed to payment)
   ↓
4. kitchen.html (KDS)
   ↓ (View order queue, manage cooking status)
```

### Testing Scenarios:

**Scenario A: Simple Transaction**
- Login as Kasir
- Add 3 items (Nasi Goreng, Es Teh, Roti Goreng)
- Apply 10% diskon
- Proceed pembayaran (Tunai)
- Check Riwayat Transaksi

**Scenario B: Kitchen Operations**
- Login as Kitchen
- View 8 incoming orders
- Click "Mulai Masak" → Timer start
- Click "Selesai" → Move to Ready column
- Click "Ambil" → Order cleared

**Scenario C: Owner Monitoring**
- Login as Owner
- View CEO Orchestrator status
- Check HO Activity Log
- View 4 metrics cards (Revenue, Transactions, Stock, Outlets)

---

## 🔧 Configuration

### Environment Variables (Opsional untuk Supabase integrasi)
Create `.env.local`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

### Current Auth Method:
- **Demo mode:** localStorage + hardcoded accounts
- **Production:** Integrate dengan Supabase Auth

---

## 🎨 Design System

**Colors:**
- Primary: #2563EB (Blue)
- Accent: #F0A500 (Orange)
- AI Purple: #7C6BFF
- Dark: #0F172A (Kitchen background)

**Typography:**
- Headlines: Syne (Inter family fallback)
- Body: Inter
- Icons: Material Symbols Outlined

**Responsive:**
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)

---

## 📊 Data Structure

### Sample Order Data (pos.html)
```javascript
{
  id: "ORD-001",
  time: "09:30",
  items: "Nasi Goreng x2, Mie Ayam",
  status: "paid", // atau "pending"
  total: 75000,
  method: "cash" // cash, card, ewallet, bank
}
```

### Sample KDS Order (kitchen.html)
```javascript
{
  id: "ORD-001",
  time: "09:30",
  items: "Nasi Goreng x2, Mie Ayam",
  status: "pending", // atau "cooking", "ready"
  estimatedTime: 8, // minutes
  urgent: false,
  elapsed: 0 // seconds
}
```

---

## 🔌 Integration Points (Ready untuk development)

### 1. **Supabase Backend**
```javascript
// Replace localStorage dengan Supabase Auth
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(URL, ANON_KEY)
```

### 2. **Real-time Data**
```javascript
// Subscribe to POS orders
supabase
  .from('transactions')
  .on('INSERT', (payload) => updateCart(payload))
  .subscribe()
```

### 3. **AI Agent API**
```javascript
// Call CEO Orchestrator
fetch('/api/agents/ceo', {
  method: 'POST',
  body: JSON.stringify({ prompt: userInput })
})
```

---

## 📱 Mobile Responsiveness

- ✅ Login: Full responsive (stack on mobile)
- ✅ Dashboard: Grid collapses to 1 column on mobile
- ✅ POS: Product grid 2-col on mobile, 4-col on desktop
- ✅ Kitchen: 3-col on desktop, 1-col on mobile
- ✅ Touch-friendly: Buttons min 44px height

---

## 🚢 Deployment to Vercel

### Step 1: Prepare Files
```bash
git init
git add .
git commit -m "Lunomi POS - Initial commit"
```

### Step 2: Create Vercel Project
```bash
npm i -g vercel
vercel
```

Follow prompts:
- Project name: `lunomi-pos`
- Framework: "Other"
- Root directory: `.`

### Step 3: Deploy
```bash
vercel --prod
```

### Step 4: Custom Domain (Opsional)
- Vercel Dashboard → Settings → Domains
- Add custom domain (e.g., `lunomi.vercel.app` atau domain custom)

---

## 🐛 Troubleshooting

### Issue: Login tidak bisa masuk
**Solution:**
- Clear browser cache/cookies
- Check console (F12) untuk error
- Verify localStorage: `localStorage.getItem('lunomi_session')`

### Issue: Dashboard blank
**Solution:**
- Pastikan session sudah tersimpan dari login
- Check roles: owner, manager, cashier, kitchen

### Issue: POS cart tidak update
**Solution:**
- Refresh page
- Check browser console untuk JavaScript error
- Verify product data di `PROD` array

### Issue: Kitchen timer tidak berjalan
**Solution:**
- setInterval berjalan otomatis saat page load
- Check browser tab tidak ter-minimize (browser pause intervals)

---

## 📞 Support & Next Steps

### Untuk Development Lebih Lanjut:
1. **Backend Integration:** Setup Supabase untuk persistent data
2. **Real-time Sync:** WebSocket untuk multi-user simultaneous editing
3. **Payment Gateway:** Integrate Midtrans/Stripe untuk pembayaran
4. **Inventory Management:** Connect ke master menu + stock tracking
5. **Reporting:** Export laporan ke PDF/Excel

### Contact:
- Repo: github.com/cleco-group/lunomi
- Issues: GitHub Issues
- Docs: https://lunomi.vercel.app/docs

---

## 📄 License

MIT - Open source untuk development & learning

---

**Version:** 1.0.0  
**Last Updated:** May 1, 2026  
**Status:** ✅ MVP Ready for Vercel Deployment
