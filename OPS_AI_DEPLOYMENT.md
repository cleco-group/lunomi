# OPS AI Backend — Deployment Guide (Google Cloud Run)

## Prerequisites
- Google Cloud account dengan billing enabled
- `gcloud` CLI installed
- Docker installed (opsional, Cloud Build bisa handle)

## Step 1: Prepare Deployment Files

### 1.1 Create `Dockerfile`
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ops_ai.py ops_ai_api.py firebase-config.js ./
COPY serviceAccountKey.json ./

ENV PORT=8080
ENV PYTHONUNBUFFERED=1

CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 ops_ai_api:app
```

### 1.2 Update `requirements.txt`
```txt
google-genai>=1.0.0
firebase-admin>=6.0.0
flask>=3.0.0
flask-cors>=4.0.0
python-dotenv>=1.0.0
gunicorn>=21.0.0
```

### 1.3 Create `.gcloudignore`
```
.git
.gitignore
__pycache__/
*.pyc
.env
node_modules/
*.html
*.md
```

## Step 2: Setup Google Cloud Project

```bash
# Login
gcloud auth login

# Create project (atau gunakan existing)
gcloud projects create lunomi-ops-ai --name="Lunomi OPS AI"

# Set project
gcloud config set project lunomi-ops-ai

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

## Step 3: Set Environment Variables

```bash
# Create .env.yaml untuk Cloud Run
cat > .env.yaml << EOF
GEMINI_API_KEY: "your_actual_gemini_api_key"
FIREBASE_SERVICE_ACCOUNT_PATH: "./serviceAccountKey.json"
OPS_AI_TOKEN: "your_secret_token_here"
EOF
```

## Step 4: Deploy to Cloud Run

```bash
cd C:\Users\CLARA PC\Documents\Proyek\lunomi

# Deploy (Cloud Build akan otomatis build Docker image)
gcloud run deploy ops-ai-api \
  --source . \
  --platform managed \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --env-vars-file .env.yaml \
  --memory 512Mi \
  --timeout 300s \
  --max-instances 3
```

Output akan memberikan URL seperti:
```
Service URL: https://ops-ai-api-xxxxx-as.a.run.app
```

## Step 5: Update Dashboard

Edit `dashboard.html` line 408:
```javascript
const OPS_API_BASE = 'https://ops-ai-api-xxxxx-as.a.run.app/api/ops';
```

## Step 6: Test Deployment

```bash
# Health check
curl https://ops-ai-api-xxxxx-as.a.run.app/api/ops/health

# Mock endpoint
curl https://ops-ai-api-xxxxx-as.a.run.app/api/ops/mock

# Real analysis (butuh token)
curl -H "Authorization: Bearer your_secret_token_here" \
     https://ops-ai-api-xxxxx-as.a.run.app/api/ops/status
```

## Alternative: Railway Deployment (Lebih Mudah)

### 1. Install Railway CLI
```bash
npm install -g @railway/cli
```

### 2. Login & Deploy
```bash
railway login
railway init
railway up
```

### 3. Set Environment Variables di Railway Dashboard
- `GEMINI_API_KEY`
- `FIREBASE_SERVICE_ACCOUNT_PATH`
- `OPS_AI_TOKEN`

Railway akan auto-generate URL: `https://ops-ai-api.up.railway.app`

## Troubleshooting

### Error: "serviceAccountKey.json not found"
**Solusi**: Upload file via Secret Manager:
```bash
gcloud secrets create firebase-service-account \
  --data-file=serviceAccountKey.json

# Update deployment untuk mount secret
gcloud run services update ops-ai-api \
  --update-secrets=/app/serviceAccountKey.json=firebase-service-account:latest
```

### Error: "GEMINI_API_KEY tidak ditemukan"
**Solusi**: Pastikan `.env.yaml` sudah di-set dengan benar.

### Error: "Memory limit exceeded"
**Solusi**: Increase memory:
```bash
gcloud run services update ops-ai-api --memory 1Gi
```

## Cost Estimation

**Google Cloud Run** (Free Tier):
- 2 juta requests/bulan gratis
- 360,000 GB-seconds gratis
- Estimasi: **$0-5/bulan** untuk traffic rendah

**Railway**:
- $5/bulan untuk Hobby plan
- 500 jam execution time

## Next Steps After Deployment

1. Update `dashboard.html` dengan URL production
2. Test endpoint dari dashboard
3. Setup monitoring (Cloud Logging)
4. Setup cron job untuk analisis otomatis
5. Add alerting via WhatsApp/Email
