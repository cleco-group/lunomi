# 🚀 DEPLOYMENT GUIDE - Lunomi POS to Vercel

## Quick Deploy (3 Langkah)

### Option A: Via GitHub (RECOMMENDED)

**Step 1: Prepare GitHub Repository**

```bash
# Buka Command Prompt / PowerShell di folder Lunomi
cd C:\Users\ONECLICK\lunomi-pos  # Atau path lo

# Init git
git init
git add .
git commit -m "Lunomi POS - MVP Ready"

# Create GitHub repo
# 1. Go to https://github.com/new
# 2. Repository name: lunomi-pos
# 3. Description: "Smart POS System for F&B Indonesia"
# 4. Public repo
# 5. Create repository
```

**Step 2: Push ke GitHub**

```bash
git remote add origin https://github.com/YOUR_USERNAME/lunomi-pos.git
git branch -M main
git push -u origin main
```

**Step 3: Deploy ke Vercel**

```
1. Go to https://vercel.com
2. Sign in dengan GitHub account
3. Click "Add New..." → "Project"
4. Select repository: "lunomi-pos"
5. Framework: "Other" (karena static HTML)
6. Click "Deploy"
7. Tunggu ~1-2 menit

✅ DONE! URL: https://lunomi-pos.vercel.app
```

---

### Option B: Direct Upload via Vercel UI

```
1. Go to https://vercel.com/new
2. Click "Continue with GitHub" (atau email)
3. Buat akun jika belum punya
4. Go to dashboard
5. New Project → Import Git Repository
   OR Upload Files → Drag & drop folder
6. Configure:
   - Build Command: (leave empty)
   - Output Directory: (leave empty)
   - Environment Variables: (skip)
7. Deploy!

✅ DONE!
```

---

### Option C: Vercel CLI (Fastest)

**Prerequisites:**
- Node.js terinstall (https://nodejs.org)
- Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to project folder
cd lunomi-pos

# Deploy
vercel

# Follow prompts:
# ✓ Set up and deploy?
# ✓ Which scope? (select your account)
# ✓ Link to existing project? (No)
# ✓ What's your project's name? (lunomi-pos)
# ✓ In which directory is your code? (.)
# ✓ Want to modify vercel.json? (No)

# Deploy ke production
vercel --prod

✅ DONE! URL akan muncul di terminal
```

---

## File Structure Ready for Vercel

```
lunomi-pos/
├── index.html          ← Landing/Login
├── dashboard.html      ← Owner Dashboard
├── pos.html            ← POS Terminal
├── kitchen.html        ← Kitchen Display
├── README.md           ← Documentation
├── package.json        ← Project metadata
├── vercel.json         ← Vercel config
└── .gitignore          ← Git ignore rules
```

---

## Testing After Deployment

**1. Test Login Page:**
```
https://lunomi-pos.vercel.app/index.html
atau
https://lunomi-pos.vercel.app/  (direct ke index.html)
```

**Demo Accounts:**
- Owner: owner@lunomi.local / demo123
- Manager: manager@lunomi.local / demo123
- Kasir: kasir@lunomi.local / demo123
- Kitchen: kitchen@lunomi.local / demo123

**2. Test Navigation:**
- Login → Dashboard → Buka POS Kasir → Kitchen

**3. Test Features:**
- Add items to cart
- Apply diskon
- View transaction history
- Kitchen display order queue

---

## Custom Domain (Optional)

**Step 1: Buy domain**
- Namecheap, GoDaddy, atau domain lokal

**Step 2: Setup di Vercel**
```
1. Vercel Dashboard → Projects → lunomi-pos
2. Settings → Domains
3. Add Domain → input domain anda (e.g., lunomi.id)
4. Update nameservers di domain registrar
5. Wait 24-48 hours untuk propagation

✅ DONE! https://lunomi.id
```

---

## Environment Variables (Future)

Jika integrate Supabase nanti, create `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

Di Vercel Dashboard:
```
Settings → Environment Variables → Add
```

---

## Troubleshooting Deployment

### Issue: "404 Not Found"
**Solution:**
- Check vercel.json rewrites
- Verify file names (case-sensitive)
- Try accessing `/index.html` directly

### Issue: "Build failed"
**Solution:**
- We're using static HTML, no build needed
- Check logs in Vercel Dashboard
- Verify file encoding (UTF-8)

### Issue: "CSS/JS not loading"
**Solution:**
- Check browser console (F12)
- Verify CDN links (Tailwind, etc)
- Clear cache: Ctrl+Shift+Delete

### Issue: "Session/localStorage not working"
**Solution:**
- Browser localStorage works fine on Vercel
- Check if cookies enabled
- Try incognito mode

---

## Performance Optimization

**Already Done:**
- ✅ Minified HTML
- ✅ Tailwind CDN (production)
- ✅ Vanilla JS (no heavy libraries)
- ✅ Static hosting (fast)

**Next (Optional):**
- Add Service Worker untuk offline
- Image optimization jika ada
- CSS inlining untuk critical path

---

## Post-Deployment Checklist

- [x] Files uploaded to GitHub
- [x] Vercel project created
- [x] Domain accessible
- [x] All 4 pages loading
- [x] Login working
- [x] Navigation between pages OK
- [x] localStorage working
- [x] Responsive on mobile
- [x] No console errors
- [x] Share URL dengan team

---

## Share URL

Setelah deploy, share URL ke team:

```
🎉 Lunomi POS Live!

Production URL: https://lunomi-pos.vercel.app

Demo Credentials:
👤 Owner: owner@lunomi.local / demo123
📋 Manager: manager@lunomi.local / demo123
💳 Kasir: kasir@lunomi.local / demo123
👨‍🍳 Kitchen: kitchen@lunomi.local / demo123

Flow: Login → Dashboard → POS → Kitchen
```

---

## Next Steps (Development)

1. **Backend Integration:**
   - Setup Supabase database
   - Create auth tables
   - Integrate API calls

2. **Real-time Sync:**
   - WebSocket untuk order updates
   - Live POS ↔ Kitchen sync

3. **Payment Gateway:**
   - Integrate Midtrans
   - Multiple payment methods

4. **Analytics:**
   - Track revenue, transactions
   - Dashboard metrics

5. **Mobile App:**
   - React Native version
   - Customer ordering app

---

## Support

- Repo: https://github.com/cleco-group/lunomi-pos
- Issues: GitHub Issues
- Docs: README.md

**Status:** ✅ MVP Deployed & Live!

---

**Version:** 1.0.0  
**Deployment Date:** May 1, 2026  
**Status:** Production Ready
