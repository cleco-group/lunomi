# CLAUDE.md — Lunomi POS Pintar

> Instruksi wajib dibaca sebelum menulis kode apapun di repo ini.

---

## 🧠 Tentang Project Ini

**Lunomi** adalah sistem POS (Point of Sale) berbasis multi-agent AI untuk bisnis F&B multi-outlet di Indonesia. Bukan sekadar POS biasa — Lunomi punya 6 AI Sub-Agent yang bekerja otomatis di bawah CEO Orchestrator.

- **Live URL:** https://lunomi.vercel.app
- **Repo:** https://github.com/cleco-group/lunomi
- **Owner:** Andi Setiawan (Super Admin)

---

## ⚠️ PERINGATAN STACK — BACA DULU

### Next.js 16 + React 19 = Bukan yang Kamu Kenal

```
next: 16.2.4
react: 19.2.4
tailwindcss: ^4
```

- **Next.js 16** memiliki breaking changes dari v13/14/15. Jangan asumsikan API lama masih berlaku.
- **Tailwind v4** menggunakan CSS-first config (`@import "tailwindcss"`) bukan `tailwind.config.js`.
- Sebelum menulis kode apapun yang melibatkan routing, middleware, atau config — baca dulu file aktual di repo.
- Jika ragu tentang API Next.js 16: baca `node_modules/next/dist/docs/` atau tanya dulu sebelum asumsi.

### TypeScript vs JavaScript

- Config files: TypeScript (`.ts`)
- Komponen & logic: JavaScript (`.jsx`, `.js`) — **ini keputusan deliberate, jangan ubah ke TS tanpa instruksi eksplisit**
- Jika membuat file baru: tanyakan ekstensi yang diinginkan

---

## 📁 Struktur Folder

```
lunomi/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Route group: login, register
│   │   ├── dashboard/          # Dashboard Owner (terbuka)
│   │   ├── kasir/              # POS Kasir (belum dibangun)
│   │   └── layout.js           # Root layout
│   ├── components/
│   │   ├── agents/             # UI per AI Agent (FIN, HR, OPS, dll)
│   │   ├── dashboard/          # Widget dashboard
│   │   ├── pos/                # Komponen kasir
│   │   └── ui/                 # Komponen reusable (Button, Card, dll)
│   ├── lib/
│   │   ├── supabase/           # Supabase client & queries
│   │   ├── agents/             # Logic AI Agent
│   │   └── utils/              # Helper functions
│   └── store/                  # Zustand stores
├── public/
├── CLAUDE.md                   # File ini
├── AGENTS.md                   # Instruksi tambahan
└── package.json
```

> ⚠️ Jika folder belum ada — **buat dulu**, jangan skip struktur ini.

---

## 🗄️ Database — Supabase

**Package:** `@supabase/supabase-js ^2.104`

### Cara Inisialisasi Client

```javascript
// src/lib/supabase/client.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default supabase
```

### Tabel Utama (Schema Target)

```sql
-- Core
outlets          (id, name, city, is_active, created_at)
users            (id, name, email, role, outlet_id)
roles            (id, name) -- owner, manager, kasir

-- Transaksi
transactions     (id, outlet_id, kasir_id, total, status, created_at)
transaction_items(id, transaction_id, product_id, qty, price)

-- Produk
products         (id, name, category, price, outlet_id)
inventory        (id, product_id, outlet_id, stock, updated_at)

-- SDM
employees        (id, name, outlet_id, role_id, salary)
attendance       (id, employee_id, date, check_in, check_out)

-- AI
agent_logs       (id, agent_type, action, result, created_at)
```

### Aturan Query

- Selalu gunakan `.select()` yang spesifik — jangan `select('*')` di production
- Selalu handle error: `const { data, error } = await supabase.from(...)`
- Untuk realtime: gunakan `supabase.channel()` bukan API lama

---

## 🤖 Arsitektur Multi-Agent

### Hierarki

```
CEO Orchestrator (visible, interaktif)
├── FIN AI  — Finance & Cashflow
├── HR AI   — Payroll & Absensi  
├── OPS AI  — Kitchen & Operations
├── MKT AI  — Campaign & Promo
├── IT AI   — Security & Infrastructure
└── DES AI  — Creative & Design
```

### Status Agent

Setiap agent memiliki status: `ACTIVE | THINKING | WORKING | IDLE | ERROR`

### Struktur Agent Logic

```javascript
// src/lib/agents/base-agent.js — template untuk semua agent
export class BaseAgent {
  constructor(type) {
    this.type = type  // 'FIN' | 'HR' | 'OPS' | 'MKT' | 'IT' | 'DES'
    this.status = 'IDLE'
  }

  async run(context) {
    // Override di setiap agent
    throw new Error('run() harus diimplementasikan')
  }

  async log(action, result) {
    // Simpan ke tabel agent_logs di Supabase
  }
}
```

---

## 🔐 Auth & Role-Based Access

### Role yang Ada

| Role | Akses |
|------|-------|
| `owner` | Semua menu, semua outlet |
| `manager` | Outlet sendiri, tanpa payroll & laporan keuangan |
| `kasir` | POS saja |

### Aturan Auth

- Auth menggunakan Supabase Auth
- Setiap route di `/dashboard` wajib ada auth guard
- Route `/kasir` hanya untuk role `kasir` dan `manager`
- Jangan simpan role di localStorage — ambil dari Supabase session

---

## 🏪 State Management — Zustand

**Package:** `zustand ^5`

```javascript
// Contoh store
// src/store/outlet-store.js
import { create } from 'zustand'

export const useOutletStore = create((set) => ({
  outlets: [],
  selectedOutlet: null,
  setOutlets: (outlets) => set({ outlets }),
  selectOutlet: (outlet) => set({ selectedOutlet: outlet }),
}))
```

### Store yang Perlu Ada

- `auth-store.js` — user session & role
- `outlet-store.js` — daftar & outlet aktif
- `transaction-store.js` — transaksi POS aktif
- `agent-store.js` — status semua 6 agent

---

## 💅 Styling — Tailwind v4

**Penting:** Tailwind v4 tidak menggunakan `tailwind.config.js`.

```css
/* Cara import yang benar di globals.css */
@import "tailwindcss";
```

### Warna Brand Lunomi

```css
/* Gunakan custom properties ini, bukan warna Tailwind arbitrary */
--lunomi-primary: #6366f1    /* Indigo — warna utama */
--lunomi-secondary: #8b5cf6  /* Purple — accent */
--lunomi-success: #10b981    /* Green — positif/aktif */
--lunomi-warning: #f59e0b    /* Amber — peringatan */
--lunomi-danger: #ef4444     /* Red — error/turun */
--lunomi-dark: #0f172a       /* Slate 900 — background dark */
```

### Konvensi Komponen

- Gunakan `className` bukan `style={}`
- Mobile-first: selalu mulai dari mobile, tambah breakpoint `md:` dan `lg:`
- Kasir UI harus 100% mobile-friendly (digunakan di tablet/HP)

---

## 💰 Format Data Indonesia

```javascript
// Currency — selalu gunakan ini
export const formatRupiah = (amount) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
// Output: "Rp 45.230.000"

// Date — timezone WIB
export const formatTanggal = (date) =>
  new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit', month: 'long', year: 'numeric',
  }).format(new Date(date))

// Angka singkat
export const formatSingkat = (num) => {
  if (num >= 1_000_000_000) return `${(num/1_000_000_000).toFixed(1)}M`
  if (num >= 1_000_000) return `${(num/1_000_000).toFixed(1)} Jt`
  if (num >= 1_000) return `${(num/1_000).toFixed(0)}K`
  return num.toString()
}
```

---

## 🚫 Hal yang DILARANG

1. **Jangan hardcode data dummy** di komponen — semua data harus dari Supabase atau state
2. **Jangan gunakan `any` di TypeScript** jika ada file TS
3. **Jangan commit `.env.local`** — sudah ada di `.gitignore`
4. **Jangan buat komponen > 300 baris** — pecah jadi sub-komponen
5. **Jangan gunakan `console.log` di production** — gunakan agent_logs di Supabase
6. **Jangan asumsi API Next.js** — versi 16 bisa berbeda dari yang kamu tahu
7. **Jangan buka menu baru** sebelum menu yang ada sudah berfungsi penuh

---

## ✅ Checklist Sebelum Commit

- [ ] Tidak ada data hardcoded/dummy
- [ ] Semua Supabase query handle error
- [ ] Komponen mobile-responsive (test di viewport 375px)
- [ ] Format Rupiah menggunakan `formatRupiah()`
- [ ] Tidak ada `console.log` yang tertinggal
- [ ] Nama file & variabel dalam Bahasa Inggris, teks UI dalam Bahasa Indonesia

---

## 🏁 Status Development Saat Ini

| Fitur | Status |
|-------|--------|
| Login / Auth | ✅ Basic |
| Dashboard Owner | 🟡 UI ada, data masih dummy |
| Multi-agent UI | 🟡 Cosmetic saja, belum ada logic |
| Supabase connection | ✅ Terinstall, belum ada query real |
| POS Kasir | ❌ Belum dibangun |
| RBAC / Route guard | ❌ Belum |
| Semua menu lainnya | ❌ Belum |

**Prioritas saat ini:** Hubungkan dashboard ke data Supabase nyata → Auth guard per role → POS Kasir MVP

---

*Terakhir diupdate: April 2026*
