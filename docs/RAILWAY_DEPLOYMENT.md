# 🚂 Railway Deployment — Step by Step Guide

Railway adalah platform deployment paling mudah untuk OPS AI backend. Tidak perlu Docker knowledge, cukup klik-klik saja!

---

## Step 1: Install Railway CLI

Buka terminal dan jalankan:

```bash
npm install -g @railway/cli
```

Atau download installer dari: https://railway.app/cli

---

## Step 2: Login ke Railway

```bash
railway login
```

Browser akan terbuka, login dengan:
- GitHub account (recommended), atau
- Email

---

## Step 3: Initialize Project

Di folder `lunomi/`:

```bash
cd C:\Users\CLARA PC\Documents\Proyek\lunomi
railway init
```

Pilih:
- **Create new project** → Enter
- Project name: `lunomi-ops-ai` → Enter

---

## Step 4: Deploy!

```bash
railway up
```

Railway akan otomatis:
1. Detect `Dockerfile`
2. Build Docker image
3. Deploy ke cloud
4. Generate URL public

Output akan seperti:
```
✓ Build successful
✓ Deployment live at https://lunomi-ops-ai-production.up.railway.app
```

**Copy URL ini!** Anda akan butuh untuk update dashboard.

---

## Step 5: Set Environment Variables

### Via CLI:
```bash
railway variables set GEMINI_API_KEY="your_actual_gemini_api_key"
railway variables set OPS_AI_TOKEN="your_secret_token_here"
railway variables set FIREBASE_SERVICE_ACCOUNT_PATH="./serviceAccountKey.json"
```

### Via Dashboard (Lebih Mudah):
1. Buka https://railway.app/dashboard
2. Pilih project `lunomi-ops-ai`
3. Tab **Variables**
4. Klik **+ New Variable**
5. Tambahkan:
   - `GEMINI_API_KEY` = (paste API key Anda)
   - `OPS_AI_TOKEN` = (buat token rahasia, contoh: `lunomi-ops-2026-secret`)
   - `FIREBASE_SERVICE_ACCOUNT_PATH` = `./serviceAccountKey.json`

---

## Step 6: Upload Service Account Key

Railway tidak bisa akses file lokal `serviceAccountKey.json`. Ada 2 cara:

### Cara 1: Encode ke Base64 (Recommended)
```bash
# Windows PowerShell
$content = Get-Content serviceAccountKey.json -Raw
$bytes = [System.Text.Encoding]::UTF8.GetBytes($content)
$base64 = [Convert]::ToBase64String($bytes)
echo $base64
```

Copy output, lalu set variable:
```bash
railway variables set FIREBASE_SERVICE_ACCOUNT_BASE64="paste_base64_here"
```

Edit `ops_ai.py` line 52-53:
```python
# Decode base64 service account
import base64
import json
SERVICE_ACCOUNT_BASE64 = os.environ.get("FIREBASE_SERVICE_ACCOUNT_BASE64")
if SERVICE_ACCOUNT_BASE64:
    SERVICE_ACCOUNT_PATH = "/tmp/serviceAccountKey.json"
    with open(SERVICE_ACCOUNT_PATH, "w") as f:
        f.write(base64.b64decode(SERVICE_ACCOUNT_BASE64).decode())
else:
    SERVICE_ACCOUNT_PATH = os.environ.get("FIREBASE_SERVICE_ACCOUNT_PATH", "./serviceAccountKey.json")
```

### Cara 2: Hardcode (Tidak Recommended untuk Production)
Copy isi `serviceAccountKey.json` dan paste langsung di `ops_ai.py` sebagai dict.

---

## Step 7: Redeploy

Setelah set variables:
```bash
railway up
```

---

## Step 8: Test Deployment

```bash
# Health check
curl https://lunomi-ops-ai-production.up.railway.app/api/ops/health

# Mock endpoint
curl https://lunomi-ops-ai-production.up.railway.app/api/ops/mock

# Real analysis (ganti YOUR_TOKEN)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://lunomi-ops-ai-production.up.railway.app/api/ops/status
```

Jika health check return `{"status":"online"}`, berarti **BERHASIL!** ✅

---

## Step 9: Update Dashboard

Edit `dashboard.html` line 408:
```javascript
const OPS_API_BASE = 'https://lunomi-ops-ai-production.up.railway.app/api/ops';
```

Edit line 409 (ganti dengan token yang Anda set):
```javascript
const OPS_AI_TOKEN = 'lunomi-ops-2026-secret'; // sama dengan yang di Railway
```

Commit & push:
```bash
git add dashboard.html
git commit -m "feat: connect dashboard to Railway OPS AI backend"
git push origin master
```

Vercel akan auto-deploy dalam 2-3 menit.

---

## Step 10: Test End-to-End

1. Buka https://lunomi.vercel.app/
2. Login dengan akun demo
3. Scroll ke panel **OPS AI — Manajer Operasional**
4. Klik tombol **"Analisis Sekarang"**
5. Tunggu 10-30 detik
6. Panel akan update dengan status (🟢 SAFE / 🟡 ALERT / 🔴 WARNING)

Jika muncul data, **DEPLOYMENT SUKSES!** 🎉

---

## Troubleshooting

### Error: "Module not found"
**Solusi**: Railway belum install dependencies. Pastikan `requirements.txt` ada di root folder.

### Error: "serviceAccountKey.json not found"
**Solusi**: Gunakan Cara 1 (Base64 encoding) di Step 6.

### Error: "GEMINI_API_KEY tidak ditemukan"
**Solusi**: Cek Railway dashboard → Variables, pastikan sudah diset.

### Error: "Port already in use"
**Solusi**: Railway otomatis set `PORT` env var, pastikan `ops_ai_api.py` line 18 sudah benar:
```python
PORT = int(os.environ.get("OPS_AI_PORT", 5050))
```

Ganti jadi:
```python
PORT = int(os.environ.get("PORT", 8080))
```

---

## Monitoring & Logs

### View Logs:
```bash
railway logs
```

### View Metrics:
Buka Railway dashboard → tab **Metrics**

---

## Cost

**Railway Hobby Plan**: $5/bulan
- 500 jam execution time
- $0.000231/GB-hour memory
- Unlimited bandwidth

**Estimasi untuk OPS AI**: ~$5-8/bulan (sangat affordable!)

---

## Next Steps

- [ ] Setup cron job untuk analisis otomatis setiap 6 jam
- [ ] Add monitoring alerts via email/WhatsApp
- [ ] Scale up jika traffic tinggi (Railway auto-scale)

---

**Selamat! OPS AI Anda sudah live di cloud!** 🚀
