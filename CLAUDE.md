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
- **Tailwind v4** menggunakan CSS-first config (`@import "tailwindcss"`) — bukan `tailwind.config.js`.
- Sebelum menulis kode routing, middleware, atau config — baca file aktual di repo terlebih dahulu.
- Jika ragu tentang API Next.js 16: baca `node_modules/next/dist/docs/` sebelum berasumsi.

### TypeScript vs JavaScript

- Config files: TypeScript (`.ts`)
- Komponen & logic: JavaScript (`.jsx`, `.js`) — **keputusan deliberate, jangan ubah ke TS tanpa instruksi eksplisit**
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

## 💅 Desain & Branding

### Warna Brand (dari System Blueprint)

```css
--lunomi-primary:   #2563EB   /* Blue — warna utama, tombol, CTA */
--lunomi-accent:    #F0A500   /* Amber/Gold — highlight, badge, promo */
--lunomi-ai:        #7C6BFF   /* Purple — semua elemen AI/agent */
--lunomi-success:   #00E5A0   /* Green — positif, aktif, naik */
--lunomi-danger:    #FF4757   /* Red — error, turun, alert kritis */
--lunomi-dark:      #0F172A   /* Slate 900 — background dark mode */
--lunomi-surface:   #1E293B   /* Slate 800 — card/panel background */
```

### Font

```css
/* Heading & display text */
font-family: 'Syne', sans-serif;

/* Body, label, input, tabel */
font-family: 'Inter', sans-serif;
```

Import di `globals.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Syne:wght@600;700;800&display=swap');
```

### Konvensi Komponen

- Gunakan `className` bukan `style={}`
- Mobile-first: mulai dari 375px, tambah breakpoint `md:` dan `lg:`
- Kasir & KDS UI wajib 100% mobile/tablet-friendly
- Dark mode adalah default (background `#0F172A`)

---

## 🤖 AI Engine

### Primary: Google Gemini (Gratis)

```
Provider : Google AI Studio
Model    : gemini-2.0-flash
Free tier: 1.500 request/hari — cukup untuk dev & MVP
SDK      : @google/generative-ai (Node.js)
API key  : https://aistudio.google.com/app/apikey
```

```javascript
// src/lib/ai/gemini.js
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export const geminiFlash = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash'
})
```

### Backup: Groq (Gratis, Ultra-cepat)

```
Provider : Groq
Model    : llama-3.3-70b-versatile
Free tier: 1.000 request/hari, 5-10x lebih cepat dari GPU
Cocok untuk: alert realtime, respon agent < 1 detik
API key  : https://console.groq.com
```

### Kapan Pakai Mana

| Use Case | Engine |
|----------|--------|
| Laporan cashflow (FIN AI) | Gemini Flash |
| Alert stok / anomali (OPS AI) | Groq |
| Analisis HR & payroll | Gemini Flash |
| Respon CEO interaktif | Gemini Flash |
| Banner/copy promo (MKT AI) | Gemini Flash |

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
transactions     (id, outlet_id, kasir_id, total, payment_method, status, created_at)
transaction_items(id, transaction_id, product_id, qty, price)

-- Produk
products         (id, name, category, price, outlet_id)
inventory        (id, product_id, outlet_id, stock, updated_at)
recipes          (id, product_id, ingredient, qty, unit)

-- SDM
employees        (id, name, outlet_id, role_id, salary)
attendance       (id, employee_id, date, check_in, check_out)

-- AI
agent_logs       (id, agent_type, action, result, created_at)
```

### Aturan Query

- Selalu gunakan `.select()` spesifik — jangan `select('*')` di production
- Selalu handle error: `const { data, error } = await supabase.from(...)`
- Realtime: gunakan `supabase.channel()` — bukan API lama

---

## 🔐 Auth & Role-Based Access

| Role | Akses |
|------|-------|
| `owner` | Semua menu, semua outlet |
| `manager` | Outlet sendiri, tanpa payroll & lap. keuangan |
| `kasir` | POS & KDS saja |

**Aturan:**
- Auth via Supabase Auth
- Setiap route `/dashboard` wajib ada auth guard
- Route `/kasir` hanya untuk role `kasir` dan `manager`
- Jangan simpan role di localStorage — ambil dari Supabase session

---

## 💰 Format Data Indonesia

```javascript
// Currency
export const formatRupiah = (amount) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(amount)
// Output: "Rp 45.230.000"

// Tanggal WIB
export const formatTanggal = (date) =>
  new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit', month: 'long', year: 'numeric',
  }).format(new Date(date))

// Angka singkat dashboard
export const formatSingkat = (num) => {
  if (num >= 1_000_000_000) return `${(num/1_000_000_000).toFixed(1)}M`
  if (num >= 1_000_000) return `${(num/1_000_000).toFixed(1)} Jt`
  if (num >= 1_000) return `${(num/1_000).toFixed(0)}K`
  return num.toString()
}
```

---

## 🚫 Hal yang DILARANG

1. **Jangan hardcode data dummy** — semua data harus dari Supabase atau state
2. **Jangan gunakan warna arbitrary Tailwind** — pakai CSS variables `--lunomi-*`
3. **Jangan commit `.env.local`** — sudah ada di `.gitignore`
4. **Jangan buat komponen > 300 baris** — pecah jadi sub-komponen
5. **Jangan gunakan `console.log` di production** — gunakan `agent_logs`
6. **Jangan asumsi API Next.js** — versi 16 bisa berbeda dari yang kamu tahu
7. **Jangan buka menu baru** sebelum menu yang ada sudah berfungsi penuh

---

## ✅ Checklist Sebelum Commit

- [ ] Tidak ada data hardcoded/dummy
- [ ] Semua Supabase query handle error
- [ ] Komponen mobile-responsive (test di 375px)
- [ ] Format Rupiah menggunakan `formatRupiah()`
- [ ] Warna menggunakan CSS variables `--lunomi-*`
- [ ] Tidak ada `console.log` yang tertinggal
- [ ] Nama file & variabel: Bahasa Inggris | Teks UI: Bahasa Indonesia

---

## 🏁 Status Development

| Fitur | Status |
|-------|--------|
| Login / Auth | ✅ Basic |
| Dashboard Owner | 🟡 UI ada, data masih dummy |
| Multi-agent UI | 🟡 Cosmetic saja, belum ada logic |
| Supabase connection | ✅ Terinstall, belum ada query real |
| POS Kasir | ❌ Belum |
| KDS Dapur | ❌ Belum |
| Produk & Inventory | ❌ Belum |
| Master Resep | ❌ Belum |
| Keuangan | ❌ Belum |
| Head Office (HO) | ❌ Belum |
| HR & Payroll | ❌ Belum |
| RBAC / Route guard | ❌ Belum |

**Prioritas saat ini:**
1. Supabase schema → data nyata
2. Auth guard per role
3. POS Kasir MVP
4. KDS Dapur

---

*Terakhir diupdate: April 2026*
