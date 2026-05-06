# 🚀 Lunomi — Instruksi Manual Restrukturisasi

## Status: Folder sudah dibuat ✅

Folder baru sudah berhasil dibuat:
- ✅ `backend/`
- ✅ `docs/`
- ✅ `public/css/`
- ✅ `public/js/core/`
- ✅ `public/js/agents/`

---

## Langkah Manual (Copy-Paste di PowerShell)

### 1. Pindahkan File Backend
```powershell
cd "C:\Users\CLARA PC\Documents\Proyek\lunomi"
Move-Item ops_ai.py backend/
Move-Item ops_ai_api.py backend/
Move-Item requirements.txt backend/
Move-Item Dockerfile backend/
```

### 2. Pindahkan File Dokumentasi
```powershell
Move-Item AUDIT_STRATEGIS_LUNOMI.md docs/
Move-Item CLAUDE.md docs/
Move-Item DEPLOYMENT_GUIDE.md docs/
Move-Item LUNOMI_COMPLETENESS_ANALYSIS.md docs/
Move-Item OPS_AI_DEPLOYMENT.md docs/
Move-Item RAILWAY_DEPLOYMENT.md docs/
```

### 3. Pindahkan CSS & JS
```powershell
Move-Item lunomi-brand.css public/css/brand.css
Move-Item lunomi-core.js public/js/core/
Move-Item firebase-config.js public/js/core/
```

### 4. Update Path di Semua HTML Files

Cari & replace di **SEMUA file .html** (gunakan VS Code Find & Replace):

**Find:**
```
lunomi-brand.css
```
**Replace:**
```
public/css/brand.css
```

**Find:**
```
lunomi-core.js
```
**Replace:**
```
public/js/core/lunomi-core.js
```

**Find:**
```
firebase-config.js
```
**Replace:**
```
public/js/core/firebase-config.js
```

### 5. Commit Semua Perubahan
```bash
git add .
git commit -m "refactor: reorganize project structure - move backend, docs, and assets to dedicated folders"
git push origin master
```

---

## ⚠️ PRIORITAS TERTINGGI: Fix OPS AI Panel Dulu!

**Sebelum restrukturisasi**, jalankan ini dulu:

```bash
git add dashboard.html .claude/skills/GLOBAL_SKILLS.md
git commit -m "fix: OPS AI panel visibility + tagline POS PINTAR"
git push origin master
```

Tunggu 2-3 menit → Refresh https://lunomi.vercel.app/dashboard.html → Panel OPS AI akan muncul!

---

## Estimasi Waktu
- Fix OPS AI: **5 menit**
- Restrukturisasi manual: **15-20 menit**
- Testing: **10 menit**

**Total: ~35 menit**

---

## Verifikasi Setelah Selesai

1. Buka https://lunomi.vercel.app/
2. Cek semua halaman tidak broken
3. Cek OPS AI panel muncul di dashboard
4. Test Railway backend: `https://lunomi-ops-ai-production.up.railway.app/api/ops/health`

---

**Mau saya bantu yang mana dulu?**
- A. Fix OPS AI panel (commit & push `dashboard.html`)
- B. Lanjut restrukturisasi manual (ikuti instruksi di atas)
- C. Skip restrukturisasi, fokus ke fitur lain
