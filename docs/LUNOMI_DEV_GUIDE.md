# 🚀 Lunomi POS: Technical Development Guide & Roadmap

Dokumen ini dirancang untuk memberikan konteks penuh kepada AI Agent/Developer guna melanjutkan pengembangan ekosistem **Lunomi POS**.

## 1. Ringkasan Proyek
Lunomi adalah sistem POS (Point of Sale) SaaS yang menargetkan pasar Indonesia, mencakup lini bisnis **F&B, Retail, dan Jasa**.
*   **Tech Stack:** HTML5, Tailwind CSS, Vanilla JavaScript.
*   **Database:** LocalStorage (Offline-first) dengan prefix `lunomi_`.
*   **Desain:** Glassmorphism, Navy Blue (#020617), Font: Plus Jakarta Sans.

## 2. Arsitektur Kode Saat Ini
*   **`lunomi-core.js`**: Jantung aplikasi. Berisi helper format mata uang (`rp()`), manajemen sesi, validasi form, dan `RecipeManager` untuk otomatisasi stok bahan baku.
*   **`dashboard.html`**: Layout utama dengan sidebar kiri yang collapsible dan responsif mobile.
*   **`pos.html`**: Terminal kasir dengan dukungan Barcode Scanner (SKU) dan integrasi Master Resep.

## 3. Panduan Gaya (Style Guide)
*   **Warna Utama:** Background `#020617`, Card `rgba(255,255,255,0.05)` dengan `backdrop-filter: blur(16px)`.
*   **Ikon:** Material Symbols Outlined.
*   **Komponen:** Gunakan class `glass-card` untuk kontainer dan `glass-input` untuk form.

## 4. Sisa Roadmap Implementasi (Prioritas AI)
Lanjutkan pembuatan file-file berikut dengan logika yang terintegrasi ke `localStorage`:

### A. Modul Retur & Refund (`return-refund.html`)
*   **Fitur:** Retur barang ke supplier & Refund uang ke pelanggan.
*   **Logika:** Update stok secara otomatis dan catat transaksi negatif di `lunomi_transactions`.

### B. Modul WhatsApp & CRM (`whatsapp-crm.html`)
*   **Fitur:** Pengaturan notifikasi WA (Struk, Booking, Survey).
*   **Integrasi:** Simulasi pengiriman pesan dan dashboard analitik kepuasan pelanggan.

### C. Modul Admin & Performa (`staff-admin.html`)
*   **Fitur:** Laporan penjualan per staf dan pengaturan hak akses (Role-Based Access Control).

### D. Modul Sistem (`system-health.html`)
*   **Fitur:** Status sinkronisasi cloud, Backup/Restore JSON, dan Hardware Test (Printer/Scanner).

## 5. Instruksi untuk AI Agent
1.  **Baca Context**: Selalu baca `lunomi-core.js` sebelum membuat halaman baru.
2.  **Konsistensi UI**: Pastikan sidebar di setiap halaman baru identik dengan `dashboard.html`.
3.  **Data Integrity**: Pastikan setiap transaksi baru selalu memicu `RecipeManager.deductStock()` jika produk memiliki resep.

---
*Dokumen ini dibuat oleh Manus AI untuk memastikan kelangsungan pengembangan Lunomi POS.*
