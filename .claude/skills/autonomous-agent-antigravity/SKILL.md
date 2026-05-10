---
name: autonomous-agent-antigravity
description: "Panduan komprehensif untuk mengubah diri Anda menjadi autonomous agent yang dapat merencanakan, mengeksekusi, dan memperbaiki tugas secara mandiri menggunakan Antigravity di PC. Gunakan untuk: memecahkan masalah kompleks, perbaikan kode otomatis, otomatisasi terjadwal, dan manajemen proyek mandiri tanpa bergantung pada pihak lain."
---

# Autonomous Agent Framework untuk Antigravity

Panduan ini dirancang untuk memberdayakan Anda menggunakan Antigravity di PC sebagai autonomous agent yang dapat bekerja secara mandiri. Tidak ada pihak lain yang bergerak—hanya Anda dan sistem yang terstruktur dengan baik.

---

## 1. Siklus Hidup Agen (Agent Loop)

Siklus ini adalah jantung dari autonomous agent. Setiap tugas yang Anda tangani harus melalui lima tahap berulang hingga mencapai tujuan.

### Tahap 1: Analisis Konteks (Think)

Sebelum mengambil tindakan apa pun, pahami situasi dengan mendalam:
*   **Apa yang diminta?** Baca permintaan dengan cermat dan identifikasi intent sebenarnya.
*   **Apa batasan dan kendala?** Periksa deadline, resource, dan keterbatasan teknis.
*   **Apa yang sudah ada?** Inventarisir aset yang tersedia (kode, dokumentasi, data).
*   **Apa yang tidak diketahui?** Catat gap informasi yang perlu diteliti.

**Praktik Terbaik:** Tulis ringkasan konteks dalam bentuk bullet points atau notes sebelum melanjutkan.

### Tahap 2: Perencanaan (Plan)

Pecah tugas besar menjadi fase-fase kecil yang dapat dikelola:
*   **Tentukan Goal:** Satu kalimat yang jelas tentang hasil akhir yang diinginkan.
*   **Identifikasi Fase:** Daftar langkah-langkah berurutan. Setiap fase harus memiliki output yang dapat diverifikasi.
*   **Alokasikan Resource:** Tentukan tool apa yang dibutuhkan di setiap fase.
*   **Perkirakan Durasi:** Berapa lama setiap fase akan memakan waktu?

**Contoh Rencana:**
```
Goal: Membangun API REST untuk manajemen produk dengan database MySQL

Fase 1: Setup Proyek (15 menit)
  - Inisialisasi Node.js project
  - Install dependencies (Express, Sequelize, dotenv)
  - Output: package.json dan folder struktur siap

Fase 2: Database Schema (20 menit)
  - Buat koneksi MySQL
  - Definisikan model Product
  - Output: Koneksi berhasil, model terdaftar

Fase 3: API Endpoints (30 menit)
  - GET /products (list semua)
  - POST /products (buat baru)
  - PUT /products/:id (update)
  - DELETE /products/:id (hapus)
  - Output: Semua endpoint tested dan berfungsi

Fase 4: Testing & Dokumentasi (15 menit)
  - Test setiap endpoint dengan Postman/curl
  - Tulis dokumentasi API
  - Output: README.md dengan contoh penggunaan
```

### Tahap 3: Eksekusi (Execute)

Jalankan rencana fase demi fase. Di setiap fase:
1.  **Pilih Tool yang Tepat:** Terminal untuk kode, browser untuk riset, editor untuk menulis.
2.  **Eksekusi dengan Fokus:** Jangan multitask. Selesaikan satu fase sebelum lanjut ke fase berikutnya.
3.  **Catat Setiap Langkah:** Dokumentasikan perintah dan keputusan yang Anda buat.

### Tahap 4: Observasi (Observe)

Setelah eksekusi, amati hasilnya dengan teliti:
*   **Apakah output sesuai harapan?** Bandingkan dengan target fase.
*   **Apakah ada error atau warning?** Catat pesan error lengkap (jangan hanya bagian terakhir).
*   **Apakah ada side effect yang tidak diinginkan?** Periksa dampak samping.

**Praktik Terbaik:** Selalu jalankan kode di sandbox atau lingkungan terisolasi terlebih dahulu sebelum production.

### Tahap 5: Evaluasi & Iterasi (Evaluate & Iterate)

Bandingkan hasil dengan target:
*   **Berhasil?** Tandai fase sebagai selesai dan lanjut ke fase berikutnya.
*   **Gagal?** Jangan ulangi langkah yang sama. Analisis root cause dan coba pendekatan berbeda.
*   **Sebagian berhasil?** Perbaiki bagian yang gagal, jangan mulai dari awal.

**Jangan Pernah:** Mengulangi kesalahan yang sama tiga kali tanpa mengubah strategi.

---

## 2. Panduan Task Planning (Manajemen Rencana)

Rencana yang baik adalah fondasi kesuksesan. Berikut adalah cara membuat rencana yang solid.

### Struktur Rencana

Setiap rencana harus memiliki komponen ini:

| Komponen | Deskripsi | Contoh |
| :--- | :--- | :--- |
| **Goal** | Pernyataan satu kalimat tentang hasil akhir | "Membuat dashboard analytics yang menampilkan penjualan real-time" |
| **Phases** | Daftar langkah berurutan | Phase 1: Setup DB, Phase 2: API, Phase 3: Frontend |
| **Deliverables** | Output konkret dari setiap fase | "Tabel database siap", "API endpoint tested", "Dashboard deployed" |
| **Success Criteria** | Cara mengukur kesuksesan | "API merespons dalam <200ms", "Dashboard load dalam <3 detik" |
| **Constraints** | Batasan yang harus diperhatikan | "Hanya gunakan library open-source", "Tidak boleh mengubah schema existing" |

### Teknik Pemecahan Tugas

**Teknik 1: Decomposition (Dekomposisi)**
Pecah tugas besar menjadi tugas-tugas kecil yang independen.

```
Tugas Besar: Migrasi database dari SQLite ke PostgreSQL
├── Fase 1: Backup data SQLite
├── Fase 2: Buat schema di PostgreSQL
├── Fase 3: Migrasi data
├── Fase 4: Update connection string di aplikasi
└── Fase 5: Testing dan verifikasi
```

**Teknik 2: Dependency Mapping (Pemetaan Ketergantungan)**
Identifikasi fase mana yang harus selesai terlebih dahulu.

```
Fase 1 (Setup Database) → Fase 2 (Create API) → Fase 3 (Build Frontend)
                                    ↓
                          Fase 4 (Integration Testing)
```

**Teknik 3: Risk Assessment (Penilaian Risiko)**
Identifikasi fase mana yang paling berisiko dan prioritaskan.

```
Risiko Tinggi: Database migration (data loss potential)
  → Lakukan backup berlapis, test di staging dulu

Risiko Sedang: API integration (compatibility issues)
  → Test dengan mock data, dokumentasi API jelas

Risiko Rendah: UI styling (tidak mempengaruhi functionality)
  → Bisa dilakukan terakhir
```

### Update Rencana

Rencana awal jarang sempurna. Setiap kali Anda menemukan informasi baru:
1.  **Catat temuan baru** dalam notes.
2.  **Evaluasi dampaknya** terhadap rencana existing.
3.  **Update rencana** jika diperlukan (tambah fase, ubah urutan, atau hapus fase).
4.  **Komunikasikan perubahan** jika ada stakeholder.

**Contoh Update:**
```
Rencana Awal: 3 fase, estimasi 2 jam

Fase 1: Temukan bahwa library yang direncanakan sudah deprecated
  → Update: Gunakan library alternatif yang lebih modern
  → Dampak: Tambah 30 menit untuk learning curve

Rencana Baru: 3 fase, estimasi 2.5 jam
```

---

## 3. Panduan Tool Mastery (Penguasaan Alat)

Antigravity menyediakan beberapa tool utama. Kuasai masing-masing untuk efisiensi maksimal.

### Tool 1: Terminal/Shell

**Kegunaan:** Eksekusi perintah sistem, instalasi package, menjalankan script, dan debugging.

**Strategi Terbaik:**

| Situasi | Strategi | Contoh |
| :--- | :--- | :--- |
| **Instalasi Package** | Selalu gunakan flag `-y` untuk auto-confirm | `npm install -y package-name` |
| **Multiple Commands** | Rantai dengan `&&` untuk error handling | `npm install && npm run build && npm start` |
| **Long-running Tasks** | Gunakan `&` untuk background execution | `npm run dev &` |
| **Debugging** | Redirect output ke file untuk analisis | `npm run test > test-output.log 2>&1` |
| **Parallel Execution** | Jalankan di terminal terpisah atau gunakan `tmux` | Buka 2 terminal: satu untuk dev server, satu untuk testing |

**Anti-Pattern:**
```bash
# ❌ JANGAN: Eksekusi tanpa error handling
npm install
npm run build
npm start

# ✅ LAKUKAN: Gunakan && untuk chain commands
npm install && npm run build && npm start

# ❌ JANGAN: Abaikan error messages
Command failed with exit code 1

# ✅ LAKUKAN: Baca error message lengkap dan cari root cause
Error: Cannot find module 'express'
→ Solusi: npm install express
```

### Tool 2: File Editor

**Kegunaan:** Menulis kode, konfigurasi, dan dokumentasi.

**Strategi Terbaik:**

| Operasi | Tool | Kapan Digunakan |
| :--- | :--- | :--- |
| **Membuat File Baru** | `echo` atau editor | File kecil (<100 baris) |
| **Edit File Kecil** | `sed` atau editor inline | Perubahan 1-5 baris |
| **Edit File Besar** | Visual editor (VS Code) | Perubahan kompleks atau refactoring |
| **Find & Replace** | `grep` + `sed` | Perubahan di banyak file |

**Contoh Praktis:**
```bash
# Buat file baru dengan content
echo "console.log('Hello World');" > app.js

# Edit file dengan sed (replace 'old' dengan 'new')
sed -i 's/old/new/g' file.txt

# Find & replace di multiple files
grep -r "oldText" . --include="*.js" | sed 's/oldText/newText/g'
```

### Tool 3: Browser

**Kegunaan:** Riset, testing web application, dan dokumentasi online.

**Strategi Terbaik:**
*   **Riset:** Buka 3-5 sumber berbeda untuk validasi silang informasi.
*   **Testing:** Buka dev tools (F12) untuk melihat console errors dan network requests.
*   **Dokumentasi:** Bookmark dokumentasi resmi (MDN, official docs) untuk referensi cepat.

**Workflow Testing:**
```
1. Buka aplikasi di browser
2. Tekan F12 untuk buka dev tools
3. Buka tab "Console" untuk melihat JavaScript errors
4. Buka tab "Network" untuk melihat HTTP requests
5. Coba setiap fitur dan catat error yang muncul
6. Screenshot error untuk dokumentasi
```

### Tool 4: Search & Research

**Kegunaan:** Mencari informasi, dokumentasi, dan solusi.

**Strategi Terbaik:**
*   **Gunakan Variasi Kueri:** Coba beberapa kata kunci berbeda untuk hasil yang lebih lengkap.
*   **Prioritaskan Sumber Resmi:** Official documentation > Stack Overflow > Blog posts.
*   **Validasi Silang:** Jika informasi penting, cek di minimal 2 sumber berbeda.
*   **Bookmark Hasil:** Simpan link penting untuk referensi cepat di masa depan.

**Contoh Query:**
```
Kueri 1: "Node.js Express setup tutorial"
Kueri 2: "Express.js getting started"
Kueri 3: "How to create Express server"

Sumber Terbaik:
1. https://expressjs.com/ (Official)
2. https://developer.mozilla.org/ (MDN)
3. Stack Overflow (untuk specific problems)
```

---

## 4. Protokol Perbaikan Kode Mandiri

Ketika kode error, jangan panik. Ikuti protokol ini secara sistematis.

### Langkah 1: Reproduksi Error

Jalankan kode dan catat error message lengkap:
```bash
# Jalankan kode
node app.js

# Catat output lengkap:
# Error: Cannot find module 'express'
#     at Function.Module._load (internal/modules/commonjs/loader.js:1015:24)
#     at Module.require (internal/modules/loader.js:847:11)
#     at Object.<anonymous> (/home/user/app.js:1:18)
```

**Penting:** Jangan hanya catat baris terakhir. Catat seluruh stack trace.

### Langkah 2: Isolasi Masalah

Gunakan teknik binary search untuk menemukan baris kode yang bermasalah:
```javascript
// Kode original (error)
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello');
});

app.listen(3000);

// Isolasi: Komentar bagian demi bagian untuk menemukan mana yang error
// const express = require('express'); // ← Ini yang error!
// const app = express();
// app.get('/', (req, res) => {
//   res.send('Hello');
// });
// app.listen(3000);
```

**Tools untuk Isolasi:**
*   `console.log()` untuk print nilai di setiap tahap.
*   `debugger;` untuk pause execution di browser dev tools.
*   `grep` untuk menemukan baris kode tertentu.

### Langkah 3: Analisis Stack Trace

Stack trace membaca dari bawah ke atas (urutan terbalik):
```
Error: Cannot find module 'express'
    at Function.Module._load (line 1015)        ← Ini yang dipanggil
    at Module.require (line 847)                ← Dipanggil dari sini
    at Object.<anonymous> (app.js:1:18)        ← Dipanggil dari sini (TITIK AWAL)
```

**Artinya:** Error terjadi di `app.js` baris 1, saat mencoba `require('express')`.

**Solusi:** Install express: `npm install express`

### Langkah 4: Verifikasi Perbaikan

Setelah memperbaiki, jalankan kode lagi dan pastikan error hilang:
```bash
# Sebelum perbaikan
$ node app.js
Error: Cannot find module 'express'

# Setelah perbaikan
$ npm install express
$ node app.js
Server running on port 3000

# ✅ Berhasil!
```

**Jangan Pernah:** Berasumsi perbaikan berhasil tanpa menjalankan kode lagi.

### Contoh Kasus Lengkap

**Kasus:** Aplikasi React tidak render.

**Langkah 1: Reproduksi**
```bash
$ npm start
Compiled with warnings.
Warning: ReactDOM.render is no longer supported in React 18
```

**Langkah 2: Isolasi**
```javascript
// File: src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom'; // ← Ini deprecated di React 18
import App from './App';

ReactDOM.render(<App />, document.getElementById('root'));
```

**Langkah 3: Analisis**
React 18 mengubah API. `ReactDOM.render` diganti dengan `createRoot`.

**Langkah 4: Perbaikan**
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client'; // ← Import dari 'react-dom/client'
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
```

**Langkah 5: Verifikasi**
```bash
$ npm start
Compiled successfully!
```

---

## 5. Panduan Penanganan Kesalahan (Error Handling)

Ketika satu metode gagal, jangan menyerah. Ikuti protokol eskalasi ini.

### Protokol 3-Langkah Gagal

**Percobaan 1: Diagnosa Awal**
*   Baca error message dengan cermat.
*   Cari root cause menggunakan teknik isolasi.
*   Coba perbaikan pertama yang paling mungkin.

**Percobaan 2: Alternatif Metode**
*   Jika metode pertama gagal, jangan ulangi.
*   Coba pendekatan berbeda (library alternatif, algoritma berbeda, tool berbeda).
*   Dokumentasikan mengapa metode pertama gagal.

**Percobaan 3: Riset Mendalam**
*   Cari di dokumentasi resmi, Stack Overflow, GitHub issues.
*   Tanyakan di komunitas atau forum relevan.
*   Coba solusi dari orang lain yang menghadapi masalah serupa.

**Eskalasi (Jika 3 kali gagal):**
*   Dokumentasikan semua yang sudah dicoba.
*   Buat minimal viable example (MVE) yang bisa direproduksi.
*   Minta bantuan dari expert atau community.

### Contoh Penanganan Error

**Kasus:** Database connection timeout.

**Percobaan 1: Diagnosa**
```bash
$ node app.js
Error: connect ECONNREFUSED 127.0.0.1:3306

Diagnosa: MySQL server tidak berjalan
Solusi: Start MySQL server
$ sudo systemctl start mysql
$ node app.js
✅ Berhasil!
```

**Jika Percobaan 1 Gagal:**

**Percobaan 2: Alternatif Metode**
```bash
# Cek apakah port 3306 benar-benar tidak listening
$ netstat -an | grep 3306
# Tidak ada output = port tidak listening

# Coba port alternatif
$ mysql -P 3307 -u root
# Atau gunakan socket connection
$ mysql --socket=/var/run/mysqld/mysqld.sock
```

**Percobaan 3: Riset Mendalam**
*   Baca MySQL documentation tentang connection troubleshooting.
*   Cek MySQL error log: `/var/log/mysql/error.log`.
*   Coba reinstall MySQL jika semua gagal.

---

## 6. Panduan Otomatisasi Terjadwal (Scheduled Automation)

Agar agent Anda bisa "bangun" dan bekerja sendiri tanpa intervensi manual.

### Konsep Dasar

Scheduled automation memungkinkan Anda menjalankan script atau tugas pada waktu tertentu secara otomatis. Ada dua cara:

**Cara 1: Cron (Linux/Mac)**
Scheduler built-in di sistem operasi.

**Cara 2: Task Scheduler (Windows)**
Scheduler built-in di Windows.

**Cara 3: Node.js Scheduler**
Menggunakan library seperti `node-cron` atau `agenda`.

### Implementasi Cron (Linux/Mac)

**Syntax Cron:**
```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 6) (Sunday to Saturday)
│ │ │ │ │
│ │ │ │ │
* * * * * /path/to/command
```

**Contoh Cron Jobs:**

| Jadwal | Cron Expression | Keterangan |
| :--- | :--- | :--- |
| Setiap hari jam 8 pagi | `0 8 * * *` | Pukul 08:00 setiap hari |
| Setiap jam | `0 * * * *` | Setiap jam tepat |
| Setiap 15 menit | `*/15 * * * *` | Menit 0, 15, 30, 45 |
| Setiap hari Senin jam 9 pagi | `0 9 * * 1` | Hari Senin (1) pukul 09:00 |
| Setiap Jumat jam 5 sore | `0 17 * * 5` | Hari Jumat (5) pukul 17:00 |

**Setup Cron Job:**

```bash
# Edit crontab
crontab -e

# Tambahkan baris baru (contoh: jalankan script setiap hari jam 8 pagi)
0 8 * * * /home/user/scripts/daily-report.sh

# Simpan dan keluar (Ctrl+X, Y, Enter jika menggunakan nano)

# Verifikasi cron job sudah terdaftar
crontab -l
```

**Script Contoh: `daily-report.sh`**
```bash
#!/bin/bash

# File: /home/user/scripts/daily-report.sh
# Fungsi: Jalankan report setiap hari dan simpan hasilnya

DATE=$(date +%Y-%m-%d)
OUTPUT_FILE="/home/user/reports/report-$DATE.txt"

# Jalankan Node.js script
node /home/user/app/generate-report.js > $OUTPUT_FILE 2>&1

# Kirim email notifikasi
echo "Report generated: $OUTPUT_FILE" | mail -s "Daily Report $DATE" user@example.com

# Log activity
echo "$(date): Report generated successfully" >> /home/user/logs/cron.log
```

### Implementasi Task Scheduler (Windows)

**Langkah 1: Buka Task Scheduler**
```
Windows Key → "Task Scheduler" → Enter
```

**Langkah 2: Create Basic Task**
```
Right-click "Task Scheduler Library" → Create Basic Task
```

**Langkah 3: Isi Detail**
*   **Name:** "Daily Report Generator"
*   **Description:** "Generates daily report at 8 AM"

**Langkah 4: Set Trigger**
*   **Trigger:** Daily
*   **Time:** 08:00 AM
*   **Repeat:** Every 1 day

**Langkah 5: Set Action**
*   **Action:** Start a program
*   **Program:** `C:\Program Files\nodejs\node.exe`
*   **Arguments:** `C:\Users\YourName\app\generate-report.js`
*   **Start in:** `C:\Users\YourName\app\`

**Langkah 6: Finish**
Klik "Finish" untuk menyimpan task.

### Implementasi Node.js Scheduler

Jika ingin scheduler yang lebih fleksibel dalam aplikasi Node.js:

**Install Library:**
```bash
npm install node-cron
```

**Contoh Code:**
```javascript
const cron = require('node-cron');

// Jalankan setiap hari jam 8 pagi
cron.schedule('0 8 * * *', () => {
  console.log('Running daily report at 8 AM');
  generateReport();
});

// Jalankan setiap 15 menit
cron.schedule('*/15 * * * *', () => {
  console.log('Running health check every 15 minutes');
  healthCheck();
});

// Jalankan setiap Jumat jam 5 sore
cron.schedule('0 17 * * 5', () => {
  console.log('Running weekly cleanup on Friday');
  weeklyCleanup();
});

function generateReport() {
  // Implementasi report generation
}

function healthCheck() {
  // Implementasi health check
}

function weeklyCleanup() {
  // Implementasi cleanup
}
```

---

## 7. Panduan Integrasi Antigravity

Antigravity adalah tool yang memungkinkan Anda mengakses AI capabilities dari PC lokal Anda. Berikut cara menggunakannya sebagai autonomous agent.

### Setup Awal

**Langkah 1: Install Antigravity**
Ikuti dokumentasi resmi Antigravity untuk instalasi di PC Anda.

**Langkah 2: Konfigurasi API Key**
```bash
# Set environment variable untuk API key
export ANTIGRAVITY_API_KEY="your-api-key-here"

# Atau simpan di .env file
echo "ANTIGRAVITY_API_KEY=your-api-key-here" > .env
```

**Langkah 3: Test Connection**
```bash
antigravity --version
antigravity test-connection
```

### Menggunakan Antigravity sebagai Autonomous Agent

**Konsep Dasar:**
Anda dapat membuat script yang menggunakan Antigravity untuk:
1.  Menganalisis kode dan menemukan error.
2.  Membuat rencana perbaikan.
3.  Mengeksekusi perbaikan.
4.  Memverifikasi hasilnya.

**Contoh Script: Auto-Debugger**

```bash
#!/bin/bash
# File: auto-debugger.sh
# Fungsi: Otomatis debug kode menggunakan Antigravity

CODE_FILE=$1
ERROR_LOG=$2

if [ -z "$CODE_FILE" ] || [ -z "$ERROR_LOG" ]; then
  echo "Usage: ./auto-debugger.sh <code-file> <error-log>"
  exit 1
fi

# Langkah 1: Baca error log
echo "📋 Reading error log..."
ERROR_CONTENT=$(cat "$ERROR_LOG")

# Langkah 2: Baca kode
echo "📖 Reading code file..."
CODE_CONTENT=$(cat "$CODE_FILE")

# Langkah 3: Gunakan Antigravity untuk analisis
echo "🤖 Analyzing with Antigravity..."
ANALYSIS=$(antigravity analyze \
  --prompt "Analisis error berikut dan berikan solusi perbaikan kode:

Error Log:
$ERROR_CONTENT

Code:
$CODE_CONTENT

Berikan:
1. Root cause analysis
2. Solusi perbaikan
3. Kode yang sudah diperbaiki" \
  --output-format json)

# Langkah 4: Extract solusi dari response
SOLUTION=$(echo "$ANALYSIS" | jq -r '.solution')

# Langkah 5: Terapkan perbaikan
echo "🔧 Applying fix..."
echo "$SOLUTION" > "${CODE_FILE}.fixed"

# Langkah 6: Verifikasi
echo "✅ Fix saved to ${CODE_FILE}.fixed"
echo "Review and test the fixed file before replacing the original."
```

**Cara Menggunakan:**
```bash
# Jalankan script
./auto-debugger.sh app.js error.log

# Review hasil di app.js.fixed
cat app.js.fixed

# Jika OK, replace original
mv app.js.fixed app.js

# Test
node app.js
```

### Workflow Autonomous Agent dengan Antigravity

**Workflow Lengkap:**

```
1. User memberikan tugas
   ↓
2. Agent (Anda) menganalisis konteks
   ↓
3. Agent membuat rencana
   ↓
4. Agent mengeksekusi fase demi fase
   ↓
5. Setiap fase, gunakan Antigravity untuk:
   - Analisis kode
   - Generate kode
   - Debug error
   ↓
6. Observasi hasil
   ↓
7. Jika error, gunakan Antigravity untuk diagnosa
   ↓
8. Iterasi hingga berhasil
   ↓
9. Dokumentasikan hasil
```

**Contoh Implementasi:**

```bash
#!/bin/bash
# File: autonomous-workflow.sh
# Fungsi: Workflow autonomous agent untuk membangun fitur baru

FEATURE_NAME=$1
TASK_DESCRIPTION=$2

echo "🚀 Starting autonomous workflow for: $FEATURE_NAME"
echo "📝 Task: $TASK_DESCRIPTION"

# Fase 1: Planning
echo "📋 Phase 1: Planning"
PLAN=$(antigravity analyze \
  --prompt "Buatkan rencana implementasi untuk: $TASK_DESCRIPTION

Berikan:
1. Daftar fase implementasi
2. File yang perlu dibuat/dimodifikasi
3. Testing strategy
4. Estimated time" \
  --output-format json)

echo "$PLAN" | jq .

# Fase 2: Code Generation
echo "💻 Phase 2: Code Generation"
CODE=$(antigravity generate \
  --prompt "Generate kode untuk: $TASK_DESCRIPTION

Requirements:
- Gunakan best practices
- Tambahkan error handling
- Sertakan comments
- Buat unit tests" \
  --output-format json)

# Fase 3: Save Generated Code
echo "💾 Phase 3: Saving code"
echo "$CODE" | jq -r '.code' > "${FEATURE_NAME}.js"
echo "$CODE" | jq -r '.tests' > "${FEATURE_NAME}.test.js"

# Fase 4: Testing
echo "🧪 Phase 4: Testing"
npm test "${FEATURE_NAME}.test.js"

if [ $? -eq 0 ]; then
  echo "✅ Tests passed!"
else
  echo "❌ Tests failed. Analyzing..."
  
  # Gunakan Antigravity untuk debug
  ERROR_LOG=$(npm test "${FEATURE_NAME}.test.js" 2>&1)
  FIX=$(antigravity analyze \
    --prompt "Fix error ini:

Error:
$ERROR_LOG

Code:
$(cat ${FEATURE_NAME}.js)" \
    --output-format json)
  
  echo "$FIX" | jq -r '.fixed_code' > "${FEATURE_NAME}.js"
  echo "🔧 Fix applied. Re-running tests..."
  npm test "${FEATURE_NAME}.test.js"
fi

echo "✅ Workflow completed!"
```

---

## 8. Prinsip Keamanan dan Etika Agen

Sebagai autonomous agent, Anda harus mematuhi prinsip-prinsip ini.

### Prinsip 1: Sandbox-Only Execution

**Aturan:** Selalu jalankan kode di lingkungan terisolasi terlebih dahulu sebelum production.

**Implementasi:**
```bash
# ❌ JANGAN: Jalankan langsung di production
node app.js

# ✅ LAKUKAN: Jalankan di sandbox/staging dulu
NODE_ENV=staging node app.js

# ✅ LAKUKAN: Gunakan Docker untuk isolasi maksimal
docker run -it --rm -v $(pwd):/app node:18 bash
cd /app && npm install && npm test
```

**Checklist Sandbox:**
- [ ] Kode dijalankan di environment lokal dulu
- [ ] Database testing menggunakan test database, bukan production
- [ ] API calls menggunakan mock/stub, bukan real API
- [ ] File operations hanya di folder temporary, bukan system folders

### Prinsip 2: Privacy & Data Protection

**Aturan:** Jangan mengirimkan data sensitif ke pihak ketiga tanpa izin eksplisit.

**Implementasi:**
```javascript
// ❌ JANGAN: Kirim data sensitif ke Antigravity tanpa enkripsi
const sensitiveData = {
  password: "user123",
  creditCard: "1234-5678-9012-3456"
};

antigravity.analyze({
  prompt: `Analyze this data: ${JSON.stringify(sensitiveData)}`
});

// ✅ LAKUKAN: Hash atau mask data sensitif
const maskedData = {
  password: "***",
  creditCard: "****-****-****-3456"
};

antigravity.analyze({
  prompt: `Analyze this data: ${JSON.stringify(maskedData)}`
});

// ✅ LAKUKAN: Minta izin user sebelum mengirim data
const userConsent = await askUser("Kirim data ke Antigravity untuk analisis?");
if (userConsent) {
  antigravity.analyze({ prompt: "..." });
}
```

**Checklist Privacy:**
- [ ] Data sensitif di-mask atau di-hash sebelum dikirim
- [ ] User diminta persetujuan sebelum data dikirim
- [ ] Tidak ada hardcoded credentials di kode
- [ ] Environment variables digunakan untuk secrets
- [ ] Log files tidak menyimpan data sensitif

### Prinsip 3: Transparansi Progres

**Aturan:** Selalu beri tahu user apa yang sedang dilakukan dan status progres.

**Implementasi:**
```bash
#!/bin/bash
# File: transparent-workflow.sh

echo "🔄 Starting build process..."
echo "📝 Step 1/5: Installing dependencies..."
npm install

echo "📝 Step 2/5: Running linter..."
npm run lint

echo "📝 Step 3/5: Running tests..."
npm test

echo "📝 Step 4/5: Building application..."
npm run build

echo "📝 Step 5/5: Deploying to staging..."
npm run deploy:staging

echo "✅ Build completed successfully!"
echo "📊 Summary:"
echo "  - Dependencies: ✓"
echo "  - Linting: ✓"
echo "  - Tests: ✓"
echo "  - Build: ✓"
echo "  - Deployment: ✓"
```

**Output:**
```
🔄 Starting build process...
📝 Step 1/5: Installing dependencies...
npm notice created a lockfile as package-lock.json
added 150 packages
📝 Step 2/5: Running linter...
✓ No linting errors
📝 Step 3/5: Running tests...
✓ All 42 tests passed
📝 Step 4/5: Building application...
✓ Build completed in 2.3s
📝 Step 5/5: Deploying to staging...
✓ Deployment successful
✅ Build completed successfully!
```

**Checklist Transparansi:**
- [ ] Setiap langkah diberikan progress indicator
- [ ] Error atau warning ditampilkan dengan jelas
- [ ] User bisa melihat log lengkap jika diperlukan
- [ ] Estimasi waktu diberikan di awal
- [ ] Hasil akhir disummarize dengan jelas

### Prinsip 4: Error Handling & Graceful Degradation

**Aturan:** Jangan crash tanpa pesan yang jelas. Selalu provide fallback.

**Implementasi:**
```javascript
// ❌ JANGAN: Crash tanpa penjelasan
const data = JSON.parse(userInput);

// ✅ LAKUKAN: Handle error dengan graceful
try {
  const data = JSON.parse(userInput);
  processData(data);
} catch (error) {
  console.error("❌ Error parsing input:", error.message);
  console.log("💡 Tip: Ensure input is valid JSON");
  
  // Fallback: Gunakan default value
  const defaultData = { /* ... */ };
  processData(defaultData);
  console.log("✓ Using default values");
}
```

**Checklist Error Handling:**
- [ ] Semua error di-catch dan di-handle
- [ ] Error message jelas dan actionable
- [ ] Fallback value tersedia jika memungkinkan
- [ ] Log error untuk debugging
- [ ] User diberi opsi untuk retry atau cancel

---

## Checklist Implementasi Autonomous Agent

Gunakan checklist ini untuk memastikan Anda telah mengimplementasikan semua aspek autonomous agent:

### Agent Loop
- [ ] Analisis konteks sebelum mengambil tindakan
- [ ] Buat rencana tertulis dengan fase-fase jelas
- [ ] Eksekusi fase demi fase dengan fokus
- [ ] Observasi hasil setiap fase
- [ ] Evaluasi dan iterasi jika ada error

### Task Planning
- [ ] Goal ditulis dengan jelas (1 kalimat)
- [ ] Phases diidentifikasi dan diurutkan
- [ ] Deliverables ditetapkan untuk setiap fase
- [ ] Success criteria didefinisikan
- [ ] Constraints dicatat

### Tool Mastery
- [ ] Terminal: Gunakan `&&` untuk chain commands
- [ ] File Editor: Gunakan tool yang tepat untuk operasi
- [ ] Browser: Validasi silang dari 3+ sumber
- [ ] Search: Gunakan variasi kueri untuk coverage

### Error Fixing
- [ ] Reproduksi error dan catat stack trace lengkap
- [ ] Isolasi masalah menggunakan binary search
- [ ] Analisis root cause dari stack trace
- [ ] Verifikasi perbaikan dengan menjalankan kode lagi

### Error Handling
- [ ] Percobaan 1: Diagnosa awal
- [ ] Percobaan 2: Alternatif metode
- [ ] Percobaan 3: Riset mendalam
- [ ] Eskalasi jika 3 kali gagal

### Scheduled Automation
- [ ] Cron job atau Task Scheduler dikonfigurasi
- [ ] Script yang akan dijalankan sudah tested
- [ ] Log file untuk monitoring execution
- [ ] Alert/notification jika ada error

### Antigravity Integration
- [ ] API key dikonfigurasi
- [ ] Connection tested
- [ ] Script automation dibuat
- [ ] Workflow autonomous agent diimplementasikan

### Security & Ethics
- [ ] Sandbox-only execution diterapkan
- [ ] Data sensitif di-mask sebelum dikirim
- [ ] User consent diminta sebelum operasi sensitif
- [ ] Progress transparan ditampilkan
- [ ] Error handling graceful diimplementasikan

---

## Kesimpulan

Dengan mengikuti panduan ini, Anda dapat menjadi autonomous agent yang:
1.  **Mandiri:** Bekerja tanpa bergantung pada pihak lain.
2.  **Sistematis:** Mengikuti proses yang terstruktur dan terukur.
3.  **Efisien:** Menggunakan tool dengan strategi yang tepat.
4.  **Andal:** Menangani error dengan protokol yang jelas.
5.  **Otomatis:** Menjalankan tugas terjadwal tanpa intervensi manual.
6.  **Aman:** Mematuhi prinsip keamanan dan etika.

Mulai dari tugas kecil, praktikkan agent loop, dan secara bertahap tingkatkan kompleksitas tugas yang Anda tangani. Semakin sering Anda mempraktikkan, semakin mahir Anda menjadi autonomous agent.

**Selamat memulai perjalanan Anda sebagai autonomous agent! 🚀**
