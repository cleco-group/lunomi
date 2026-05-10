# Panduan Implementasi Praktis - Autonomous Agent dengan Antigravity

Dokumen ini berisi template siap pakai dan contoh implementasi yang dapat langsung Anda gunakan di PC Anda.

---

## 1. Template Planning Document

Gunakan template ini untuk setiap tugas baru yang ingin Anda tangani.

### Template: Task Planning Sheet

```markdown
# Task: [Nama Tugas]
Date: [Tanggal]
Status: [Planning/In Progress/Completed]

## Goal
[Satu kalimat yang jelas tentang hasil akhir]

## Context
- Background: [Latar belakang masalah]
- Constraints: [Batasan yang ada]
- Available Resources: [Resource yang tersedia]
- Known Issues: [Masalah yang sudah diketahui]

## Phases

### Phase 1: [Nama Fase]
**Duration:** [Estimasi waktu]
**Deliverable:** [Output konkret]
**Success Criteria:** [Cara mengukur kesuksesan]

Steps:
1. [Langkah 1]
2. [Langkah 2]
3. [Langkah 3]

**Status:** [ ] Pending [ ] In Progress [ ] Completed

---

### Phase 2: [Nama Fase]
**Duration:** [Estimasi waktu]
**Deliverable:** [Output konkret]
**Success Criteria:** [Cara mengukur kesuksesan]

Steps:
1. [Langkah 1]
2. [Langkah 2]

**Status:** [ ] Pending [ ] In Progress [ ] Completed

---

## Risk Assessment

| Risk | Severity | Mitigation |
| :--- | :--- | :--- |
| [Risiko 1] | High/Medium/Low | [Strategi mitigasi] |
| [Risiko 2] | High/Medium/Low | [Strategi mitigasi] |

## Notes
[Catatan tambahan, temuan, atau perubahan rencana]

## Completion Summary
- Total Duration: [Waktu sebenarnya]
- Issues Encountered: [Masalah yang ditemui]
- Lessons Learned: [Pelajaran yang diambil]
```

### Contoh Penggunaan

```markdown
# Task: Build User Authentication System
Date: 2024-05-08
Status: In Progress

## Goal
Membangun sistem autentikasi user dengan JWT token dan refresh token untuk aplikasi Node.js Express.

## Context
- Background: Aplikasi saat ini tidak memiliki sistem login
- Constraints: Hanya gunakan library open-source, tidak boleh mengubah database schema existing
- Available Resources: Node.js 18, Express 4, MySQL database
- Known Issues: Database connection timeout kadang terjadi

## Phases

### Phase 1: Setup Database & Models
**Duration:** 20 menit
**Deliverable:** User table dengan password hashing, model Sequelize
**Success Criteria:** User dapat dibuat dan diverifikasi password-nya

Steps:
1. Buat migration untuk user table
2. Setup Sequelize model
3. Implementasi password hashing dengan bcrypt
4. Test create dan verify user

**Status:** [x] Pending [ ] In Progress [ ] Completed

### Phase 2: JWT Token Implementation
**Duration:** 30 menit
**Deliverable:** Login endpoint yang mengembalikan access & refresh token
**Success Criteria:** Token dapat di-verify dan refresh token berfungsi

Steps:
1. Install jsonwebtoken library
2. Buat login endpoint
3. Generate access token (15 menit expiry)
4. Generate refresh token (7 hari expiry)
5. Test dengan Postman

**Status:** [ ] Pending [ ] In Progress [ ] Completed

### Phase 3: Protected Routes
**Duration:** 15 menit
**Deliverable:** Middleware untuk verify JWT token
**Success Criteria:** Protected routes hanya bisa diakses dengan valid token

Steps:
1. Buat middleware verifyToken
2. Implementasikan di protected routes
3. Test dengan invalid token
4. Test dengan expired token

**Status:** [ ] Pending [ ] In Progress [ ] Completed

## Risk Assessment

| Risk | Severity | Mitigation |
| :--- | :--- | :--- |
| Token hijacking | High | Gunakan HTTPS, secure cookie flag, CORS policy |
| Password leak | High | Hash password dengan bcrypt, jangan log password |
| Token expiry handling | Medium | Implementasikan refresh token flow |
| Database connection | Low | Gunakan connection pooling, retry logic |

## Notes
- Perlu setup HTTPS untuk production
- Refresh token harus disimpan di database untuk revocation
- Implementasikan rate limiting untuk login endpoint

## Completion Summary
- Total Duration: [Akan diisi setelah selesai]
- Issues Encountered: [Akan diisi setelah selesai]
- Lessons Learned: [Akan diisi setelah selesai]
```

---

## 2. Template Error Debugging

Gunakan template ini ketika menghadapi error.

### Template: Error Debugging Sheet

```markdown
# Error Debugging Report
Date: [Tanggal]
Error ID: [Nomor error atau hash]

## Error Information
**Error Message:** [Pesan error lengkap]
**Stack Trace:** [Stack trace lengkap]
**Severity:** [Critical/High/Medium/Low]
**Affected Component:** [Komponen mana yang error]

## Reproduction Steps
1. [Langkah 1]
2. [Langkah 2]
3. [Langkah 3]

## Root Cause Analysis
**Hypothesis 1:** [Kemungkinan penyebab 1]
- Evidence: [Bukti]
- Likelihood: [Tinggi/Sedang/Rendah]

**Hypothesis 2:** [Kemungkinan penyebab 2]
- Evidence: [Bukti]
- Likelihood: [Tinggi/Sedang/Rendah]

**Most Likely Cause:** [Penyebab yang paling mungkin]

## Fix Attempts

### Attempt 1: [Nama strategi perbaikan]
**Method:** [Deskripsi metode]
**Result:** [Berhasil/Gagal]
**Reason:** [Jika gagal, mengapa?]

### Attempt 2: [Nama strategi perbaikan]
**Method:** [Deskripsi metode]
**Result:** [Berhasil/Gagal]
**Reason:** [Jika gagal, mengapa?]

### Attempt 3: [Nama strategi perbaikan]
**Method:** [Deskripsi metode]
**Result:** [Berhasil/Gagal]
**Reason:** [Jika gagal, mengapa?]

## Final Solution
**Fix Applied:** [Deskripsi perbaikan yang berhasil]
**Code Changes:** [Kode yang diubah]
**Verification:** [Cara memverifikasi perbaikan]

## Prevention
**How to prevent this in future:**
- [Strategi 1]
- [Strategi 2]

## Time Log
- Start: [Waktu mulai debugging]
- End: [Waktu selesai]
- Total: [Total waktu]
```

### Contoh Penggunaan

```markdown
# Error Debugging Report
Date: 2024-05-08
Error ID: ERR_MODULE_NOT_FOUND_001

## Error Information
**Error Message:** Error: Cannot find module 'express'
**Stack Trace:**
```
Error: Cannot find module 'express'
    at Function.Module._load (internal/modules/commonjs/loader.js:1015:24)
    at Module.require (internal/modules/loader.js:847:11)
    at Object.<anonymous> (/home/user/app.js:1:18)
    at Module._load (internal/modules/commonjs/loader.js:973:11)
    at Function.Module._load (internal/modules/commonjs/loader.js:973:11)
    at Function.executeUserEntry [as runMain] (internal/modules/loader.js:17:5)
    at internal/main/run_main_module.js:102:11
```
**Severity:** High
**Affected Component:** Application startup

## Reproduction Steps
1. Clone repository
2. Run `node app.js`
3. Error appears immediately

## Root Cause Analysis
**Hypothesis 1:** Express tidak diinstall
- Evidence: Error message "Cannot find module 'express'"
- Likelihood: Tinggi

**Hypothesis 2:** Node modules folder tidak ada
- Evidence: Tidak ada folder node_modules
- Likelihood: Tinggi

**Most Likely Cause:** Dependencies tidak diinstall setelah clone repository

## Fix Attempts

### Attempt 1: Install Express
**Method:** `npm install express`
**Result:** Berhasil
**Reason:** N/A

## Final Solution
**Fix Applied:** Jalankan `npm install` untuk menginstall semua dependencies
**Code Changes:** Tidak ada perubahan kode
**Verification:** `node app.js` berjalan tanpa error

## Prevention
**How to prevent this in future:**
- Selalu jalankan `npm install` setelah clone repository
- Tambahkan node_modules ke .gitignore
- Dokumentasikan setup instructions di README.md

## Time Log
- Start: 14:30
- End: 14:35
- Total: 5 menit
```

---

## 3. Template Cron Job Setup

Gunakan template ini untuk membuat scheduled automation.

### Template: Cron Job Configuration

```bash
#!/bin/bash
# File: setup-cron-job.sh
# Fungsi: Setup cron job untuk autonomous agent

JOB_NAME=$1
SCRIPT_PATH=$2
SCHEDULE=$3
LOG_FILE=$4

if [ -z "$JOB_NAME" ] || [ -z "$SCRIPT_PATH" ] || [ -z "$SCHEDULE" ] || [ -z "$LOG_FILE" ]; then
  echo "Usage: ./setup-cron-job.sh <job-name> <script-path> <schedule> <log-file>"
  echo "Example: ./setup-cron-job.sh daily-report /home/user/scripts/report.sh '0 8 * * *' /home/user/logs/report.log"
  exit 1
fi

# Validasi script exists
if [ ! -f "$SCRIPT_PATH" ]; then
  echo "❌ Error: Script not found at $SCRIPT_PATH"
  exit 1
fi

# Buat log directory jika belum ada
LOG_DIR=$(dirname "$LOG_FILE")
mkdir -p "$LOG_DIR"

# Buat temporary file untuk crontab
TEMP_CRON=$(mktemp)

# Export existing crontab
crontab -l > "$TEMP_CRON" 2>/dev/null || true

# Tambahkan job baru
echo "# $JOB_NAME" >> "$TEMP_CRON"
echo "$SCHEDULE $SCRIPT_PATH >> $LOG_FILE 2>&1" >> "$TEMP_CRON"

# Install crontab baru
crontab "$TEMP_CRON"

# Cleanup
rm "$TEMP_CRON"

echo "✅ Cron job '$JOB_NAME' installed successfully"
echo "📋 Details:"
echo "  Schedule: $SCHEDULE"
echo "  Script: $SCRIPT_PATH"
echo "  Log: $LOG_FILE"
echo ""
echo "📝 To verify: crontab -l"
echo "🗑️  To remove: crontab -e (and delete the line)"
```

### Contoh Penggunaan

```bash
# Setup daily report job
./setup-cron-job.sh \
  "daily-report" \
  "/home/user/scripts/generate-report.sh" \
  "0 8 * * *" \
  "/home/user/logs/report.log"

# Verify
crontab -l

# Output:
# # daily-report
# 0 8 * * * /home/user/scripts/generate-report.sh >> /home/user/logs/report.log 2>&1
```

---

## 4. Template Autonomous Workflow Script

Gunakan template ini untuk membuat workflow otomatis.

### Template: Autonomous Workflow

```bash
#!/bin/bash
# File: autonomous-workflow.sh
# Fungsi: Workflow autonomous agent untuk tugas kompleks

set -e  # Exit jika ada error

# Configuration
TASK_NAME="${1:-default-task}"
TASK_DIR="./tasks/$TASK_NAME"
LOG_FILE="./logs/${TASK_NAME}-$(date +%Y%m%d-%H%M%S).log"
STATUS_FILE="./status/${TASK_NAME}.status"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
  local level=$1
  shift
  local message="$@"
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  
  case $level in
    INFO)
      echo -e "${BLUE}[${timestamp}] ℹ️  ${message}${NC}" | tee -a "$LOG_FILE"
      ;;
    SUCCESS)
      echo -e "${GREEN}[${timestamp}] ✅ ${message}${NC}" | tee -a "$LOG_FILE"
      ;;
    WARN)
      echo -e "${YELLOW}[${timestamp}] ⚠️  ${message}${NC}" | tee -a "$LOG_FILE"
      ;;
    ERROR)
      echo -e "${RED}[${timestamp}] ❌ ${message}${NC}" | tee -a "$LOG_FILE"
      ;;
  esac
}

# Initialize
log INFO "Starting autonomous workflow: $TASK_NAME"
mkdir -p "$(dirname "$LOG_FILE")" "$(dirname "$STATUS_FILE")" "$TASK_DIR"

# Phase 1: Analysis
log INFO "Phase 1/5: Analysis"
log INFO "  - Analyzing task requirements..."
# TODO: Implementasi analisis

log SUCCESS "Phase 1 completed"

# Phase 2: Planning
log INFO "Phase 2/5: Planning"
log INFO "  - Creating execution plan..."
# TODO: Implementasi planning

log SUCCESS "Phase 2 completed"

# Phase 3: Execution
log INFO "Phase 3/5: Execution"
log INFO "  - Executing plan..."

# Sub-phase 3.1
log INFO "  - Sub-phase 3.1: [Deskripsi]"
# TODO: Implementasi sub-phase

# Sub-phase 3.2
log INFO "  - Sub-phase 3.2: [Deskripsi]"
# TODO: Implementasi sub-phase

log SUCCESS "Phase 3 completed"

# Phase 4: Verification
log INFO "Phase 4/5: Verification"
log INFO "  - Verifying results..."

# Check result 1
if [ -f "$TASK_DIR/output.txt" ]; then
  log SUCCESS "  - Output file generated"
else
  log ERROR "  - Output file not found"
  exit 1
fi

log SUCCESS "Phase 4 completed"

# Phase 5: Reporting
log INFO "Phase 5/5: Reporting"
log INFO "  - Generating report..."

# Generate summary
cat > "$STATUS_FILE" << EOF
Task: $TASK_NAME
Status: COMPLETED
Timestamp: $(date)
Duration: $SECONDS seconds
Log: $LOG_FILE
EOF

log SUCCESS "Phase 5 completed"

# Final summary
log SUCCESS "Workflow completed successfully!"
log INFO "Summary:"
log INFO "  - Task: $TASK_NAME"
log INFO "  - Status: COMPLETED"
log INFO "  - Duration: $SECONDS seconds"
log INFO "  - Log: $LOG_FILE"
log INFO "  - Status file: $STATUS_FILE"
```

### Contoh Penggunaan

```bash
# Jalankan workflow
./autonomous-workflow.sh my-feature

# Output:
# [2024-05-08 14:30:00] ℹ️  Starting autonomous workflow: my-feature
# [2024-05-08 14:30:01] ℹ️  Phase 1/5: Analysis
# [2024-05-08 14:30:01] ℹ️    - Analyzing task requirements...
# [2024-05-08 14:30:05] ✅ Phase 1 completed
# ...
# [2024-05-08 14:35:00] ✅ Workflow completed successfully!
```

---

## 5. Template Antigravity Integration

Gunakan template ini untuk mengintegrasikan Antigravity ke workflow Anda.

### Template: Antigravity Helper Script

```bash
#!/bin/bash
# File: antigravity-helper.sh
# Fungsi: Helper functions untuk menggunakan Antigravity API

# Configuration
ANTIGRAVITY_API_KEY="${ANTIGRAVITY_API_KEY:-}"
ANTIGRAVITY_API_URL="${ANTIGRAVITY_API_URL:-https://api.antigravity.ai}"

# Validasi API key
if [ -z "$ANTIGRAVITY_API_KEY" ]; then
  echo "❌ Error: ANTIGRAVITY_API_KEY not set"
  echo "Set it with: export ANTIGRAVITY_API_KEY=your-key"
  exit 1
fi

# Function: Analyze code
antigravity_analyze() {
  local code_file=$1
  local prompt=$2
  
  if [ ! -f "$code_file" ]; then
    echo "❌ Error: File not found: $code_file"
    return 1
  fi
  
  local code_content=$(cat "$code_file")
  
  echo "🤖 Analyzing with Antigravity..."
  
  curl -s -X POST "$ANTIGRAVITY_API_URL/analyze" \
    -H "Authorization: Bearer $ANTIGRAVITY_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
      \"prompt\": \"$prompt\",
      \"code\": \"$code_content\",
      \"language\": \"javascript\"
    }"
}

# Function: Generate code
antigravity_generate() {
  local prompt=$1
  
  echo "🤖 Generating code with Antigravity..."
  
  curl -s -X POST "$ANTIGRAVITY_API_URL/generate" \
    -H "Authorization: Bearer $ANTIGRAVITY_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
      \"prompt\": \"$prompt\",
      \"language\": \"javascript\"
    }"
}

# Function: Debug error
antigravity_debug() {
  local code_file=$1
  local error_message=$2
  
  local code_content=$(cat "$code_file")
  
  echo "🤖 Debugging with Antigravity..."
  
  curl -s -X POST "$ANTIGRAVITY_API_URL/debug" \
    -H "Authorization: Bearer $ANTIGRAVITY_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
      \"code\": \"$code_content\",
      \"error\": \"$error_message\",
      \"language\": \"javascript\"
    }"
}

# Export functions
export -f antigravity_analyze
export -f antigravity_generate
export -f antigravity_debug
```

### Contoh Penggunaan

```bash
# Source helper script
source ./antigravity-helper.sh

# Analyze code
antigravity_analyze app.js "Analisis kode ini dan berikan saran perbaikan"

# Generate code
antigravity_generate "Buatkan function untuk validate email address"

# Debug error
antigravity_debug app.js "Error: Cannot find module 'express'"
```

---

## 6. Checklist Harian untuk Autonomous Agent

Gunakan checklist ini setiap hari untuk memastikan Anda bekerja dengan efisien.

### Daily Checklist

```markdown
# Daily Autonomous Agent Checklist
Date: [Tanggal]

## Morning (Perencanaan)
- [ ] Review tugas-tugas yang pending
- [ ] Prioritaskan tugas berdasarkan urgency dan complexity
- [ ] Buat planning document untuk tugas utama hari ini
- [ ] Identifikasi risiko dan mitigation strategy
- [ ] Set target completion time

## During Work (Eksekusi)
- [ ] Ikuti agent loop (Think → Plan → Execute → Observe → Iterate)
- [ ] Dokumentasikan setiap langkah yang diambil
- [ ] Catat error atau issue yang ditemui
- [ ] Gunakan sandbox untuk testing sebelum production
- [ ] Maintain transparency dengan progress updates

## Error Handling
- [ ] Jika error, ikuti protokol 3-langkah gagal
- [ ] Dokumentasikan error dan solusi di debugging sheet
- [ ] Jangan ulangi kesalahan yang sama 3 kali

## End of Day (Evaluasi)
- [ ] Review semua tugas yang selesai hari ini
- [ ] Update status di planning document
- [ ] Catat lessons learned
- [ ] Identifikasi improvement untuk besok
- [ ] Backup semua file penting

## Weekly Review (Jumat)
- [ ] Review semua tugas minggu ini
- [ ] Analisis productivity dan efficiency
- [ ] Identifikasi bottleneck atau masalah berulang
- [ ] Update skill dan knowledge berdasarkan lessons learned
- [ ] Plan untuk minggu depan
```

---

## 7. Quick Reference Card

Simpan card ini di desktop Anda untuk referensi cepat.

### Agent Loop Quick Reference

```
┌─────────────────────────────────────────────────────────────┐
│          AUTONOMOUS AGENT QUICK REFERENCE CARD              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ 1️⃣  THINK (Analisis Konteks)                                 │
│     • Apa yang diminta?                                       │
│     • Apa batasan dan kendala?                                │
│     • Apa yang sudah ada?                                     │
│     • Apa yang tidak diketahui?                               │
│                                                               │
│ 2️⃣  PLAN (Buat Rencana)                                       │
│     • Goal: 1 kalimat yang jelas                              │
│     • Phases: Langkah berurutan                               │
│     • Deliverables: Output konkret                            │
│     • Success Criteria: Cara mengukur                         │
│                                                               │
│ 3️⃣  EXECUTE (Jalankan Rencana)                                │
│     • Fase demi fase dengan fokus                             │
│     • Gunakan tool yang tepat                                 │
│     • Dokumentasikan setiap langkah                           │
│                                                               │
│ 4️⃣  OBSERVE (Amati Hasil)                                     │
│     • Apakah output sesuai harapan?                           │
│     • Apakah ada error atau warning?                          │
│     • Apakah ada side effect?                                 │
│                                                               │
│ 5️⃣  ITERATE (Evaluasi & Perbaiki)                             │
│     • Berhasil? → Lanjut fase berikutnya                      │
│     • Gagal? → Cari root cause, jangan ulangi                 │
│     • Sebagian? → Perbaiki bagian yang gagal                  │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                    ERROR HANDLING PROTOCOL                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ ❌ Attempt 1: Diagnosa Awal                                   │
│    • Baca error message dengan cermat                         │
│    • Cari root cause                                          │
│    • Coba perbaikan pertama                                   │
│                                                               │
│ ❌ Attempt 2: Alternatif Metode                               │
│    • Jangan ulangi metode pertama                             │
│    • Coba pendekatan berbeda                                  │
│    • Dokumentasikan mengapa pertama gagal                     │
│                                                               │
│ ❌ Attempt 3: Riset Mendalam                                  │
│    • Cari di dokumentasi resmi                                │
│    • Cari di Stack Overflow / GitHub                          │
│    • Tanyakan di komunitas                                    │
│                                                               │
│ 🚀 Eskalasi: Jika 3 kali gagal                                │
│    • Dokumentasikan semua yang dicoba                         │
│    • Buat minimal viable example                              │
│    • Minta bantuan expert                                     │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                      TOOL QUICK TIPS                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ 💻 Terminal: npm install && npm run build && npm start        │
│ 📝 Editor: Gunakan sed untuk find & replace                   │
│ 🌐 Browser: Validasi dari 3+ sumber berbeda                   │
│ 🔍 Search: Gunakan variasi kueri untuk coverage               │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Kesimpulan

Dengan menggunakan template dan panduan implementasi ini, Anda dapat:
1.  Merencanakan tugas dengan struktur yang jelas
2.  Debug error secara sistematis
3.  Mengotomatisasi tugas terjadwal
4.  Mengintegrasikan Antigravity ke workflow
5.  Bekerja sebagai autonomous agent yang mandiri dan efisien

**Mulai dari sekarang, gunakan template ini untuk setiap tugas yang Anda tangani!**
