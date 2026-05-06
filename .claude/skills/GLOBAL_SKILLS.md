---
name: Global Skills Foundation
description: "A foundational set of global skills integrating best practices from Karpathy-skills (code quality), Aider (precise editing), TypeChat (schema-driven LLM interaction), GenericAgent (self-evolving agents), Kronos (task scheduling), and OpenSRE (reliability engineering). This foundation also incorporates UI/UX Pro Max visual rules with a Dark Teal (#0D3B4A) and Gold (#C9A84C) color palette and the 'ruang ketiga' tagline."
---
# Global Skills Foundation: Fondasi Kerja Terpadu

Dokumen ini menguraikan fondasi kerja terpadu yang menggabungkan prinsip-prinsip inti dari enam repositori terkemuka sebagai Global Skills, bersama dengan aturan visual UI/UX Pro Max yang disesuaikan. Fondasi ini akan memandu semua operasi dan pengembangan untuk memastikan kualitas, efisiensi, keandalan, dan pengalaman pengguna yang optimal.

## 1. Karpathy-skills: Kualitas Kode & Ketelitian

Berdasarkan pengamatan Andrej Karpathy tentang kesalahan umum dalam pengkodean LLM, prinsip-prinsip ini menekankan kehati-hatian, kesederhanaan, dan eksekusi berbasis tujuan dalam pengembangan kode [1].

### Prinsip Inti:

*   **Berpikir Sebelum Mengkode:** Hindari asumsi, sampaikan kebingungan, dan pertimbangkan trade-off secara eksplisit sebelum implementasi.
*   **Kesederhanaan Pertama:** Tulis kode minimal yang menyelesaikan masalah, tanpa fitur spekulatif atau abstraksi yang tidak perlu.
*   **Perubahan Bedah:** Hanya sentuh apa yang mutlak diperlukan dalam kode yang ada. Pertahankan gaya yang sudah ada dan bersihkan hanya kekacauan yang Anda buat sendiri.
*   **Eksekusi Berbasis Tujuan:** Ubah tugas menjadi kriteria keberhasilan yang dapat diverifikasi dan ulangi hingga terverifikasi (misalnya, "perbaiki bug" menjadi "tulis tes yang mereproduksinya, lalu buat agar lulus").

## 2. Aider: Pengeditan Presisi Berbantuan AI

Aider memfasilitasi pemrograman berpasangan dengan LLM, memungkinkan pengeditan kode yang presisi dan terintegrasi dengan alur kerja pengembangan [2].

### Prinsip Inti:

*   **Integrasi LLM:** Manfaatkan LLM untuk membantu dalam pengeditan kode, pembuatan fitur, kasus uji, dan perbaikan bug.
*   **Pemetaan Basis Kode:** Gunakan pemetaan basis kode untuk pemahaman yang lebih baik dalam proyek yang lebih besar.
*   **Integrasi Git:** Manfaatkan integrasi Git untuk melacak perubahan, melihat perbedaan, dan mengelola revisi yang dibuat oleh AI.
*   **Umpan Balik Berkelanjutan:** Otomatiskan linting dan pengujian setelah perubahan kode untuk memastikan kualitas dan memperbaiki masalah yang terdeteksi.

## 3. TypeChat: Interaksi LLM Berbasis Skema

TypeChat menggantikan rekayasa prompt dengan rekayasa skema untuk mendapatkan respons yang diketik dengan baik dari model bahasa, membangun antarmuka bahasa alami yang pragmatis [3].

### Prinsip Inti:

*   **Definisi Tipe:** Tentukan tipe yang mewakili maksud yang didukung dalam aplikasi bahasa alami Anda.
*   **Validasi & Perbaikan:** Validasi respons LLM agar sesuai dengan skema. Jika validasi gagal, perbaiki output yang tidak sesuai melalui interaksi model bahasa lebih lanjut.
*   **Ringkasan Ringkas:** Ringkas instance secara ringkas untuk mengonfirmasi keselarasan dengan maksud pengguna.

## 4. GenericAgent: Orkestrasi Agen yang Berevolusi Sendiri

GenericAgent adalah kerangka kerja agen otonom yang minimal dan berevolusi sendiri, yang memungkinkan LLM mengontrol sistem secara langsung dan mengakumulasi keterampilan dari waktu ke waktu [4].

### Prinsip Inti:

*   **Evolusi Diri:** Otomatiskan kristalisasi jalur eksekusi menjadi keterampilan yang dapat digunakan kembali untuk tugas serupa di masa mendatang.
*   **Arsitektur Minimal:** Pertahankan inti kode yang ringkas dan efisien untuk mengurangi kompleksitas dan overhead penyebaran.
*   **Kontrol Sistem yang Kuat:** Manfaatkan alat atom untuk kontrol tingkat sistem atas browser, terminal, sistem file, input keyboard/mouse, dan visi layar.
*   **Sistem Memori Berlapis:** Gunakan memori berlapis (Aturan Meta, Indeks Wawasan, Fakta Global, Keterampilan Tugas/SOP, Arsip Sesi) untuk manajemen konteks yang efisien dan akumulasi pengalaman.

## 5. Kronos: Penjadwalan Tugas yang Kuat

Kronos menyediakan dasbor penjadwalan/orkestrasi untuk menjalankan tugas agen melalui ACP, dengan fokus pada manajemen siklus hidup tugas dan keandalan [5].

### Prinsip Inti:

*   **Penjadwalan Tugas:** Jadwalkan tugas agen dari dasbor dengan parameter seperti jadwal, mode, batas waktu, dan saluran notifikasi.
*   **Pelacakan Siklus Hidup:** Lacak status tugas melalui siklus hidup yang ditentukan (`SCHEDULED -> DISPATCHED -> IN_PROGRESS -> terminal`).
*   **Pengiriman Antrean:** Gunakan antrean HTTP yang dapat dialirkan untuk pekerja, dengan fallback polling untuk keandalan.
*   **Otentikasi Aman:** Manfaatkan pembuatan token jembatan dan otentikasi pekerja berbasis alias.

## 6. OpenSRE: Rekayasa Keandalan Proaktif

OpenSRE adalah kerangka kerja sumber terbuka untuk agen AI SRE yang menyelidiki insiden produksi, dengan tujuan membangun lingkungan pembelajaran penguatan terbuka untuk respons insiden infrastruktur [6].

### Prinsip Inti:

*   **Investigasi Insiden Terstruktur:** Lakukan analisis akar masalah yang berkorelasi di semua sinyal (log, metrik, jejak).
*   **Penalaran Sadar Runbook:** Baca runbook dan terapkan secara otomatis untuk panduan investigasi.
*   **Deteksi Kegagalan Prediktif:** Identifikasi masalah yang muncul sebelum menjadi insiden kritis.
*   **Akar Masalah Berbasis Bukti:** Pastikan setiap kesimpulan didukung oleh bukti yang jelas.
*   **Integrasi Ekstensif:** Hubungkan dengan berbagai alat observabilitas, infrastruktur, basis data, dan manajemen insiden.

## Aturan Visual UI/UX Pro Max Terintegrasi

Aturan visual ini memperluas `ui-ux-pro-max` yang sudah ada dengan skema warna dan tagline yang ditentukan, memastikan konsistensi dan identitas merek di seluruh antarmuka [7].

### Skema Warna Utama:

*   **Dark Teal:** `#0D3B4A` (Warna utama)
*   **Gold:** `#C9A84C` (Warna aksen)

### Tagline:

*   **"ruang ketiga"**

### Prinsip UI/UX Tambahan (dari `ui-ux-pro-max`):

*   **Aksesibilitas (KRITIS):** Pastikan kontras warna yang memadai, status fokus yang terlihat, teks alternatif deskriptif, dan navigasi keyboard yang tepat.
*   **Sentuhan & Interaksi (KRITIS):** Terapkan target sentuh minimum, umpan balik kesalahan yang jelas, dan status pemuatan untuk interaksi asinkron.
*   **Performa (TINGGI):** Optimalkan gambar, pertimbangkan gerakan yang dikurangi, dan hindari lompatan konten.
*   **Tata Letak & Responsif (TINGGI):** Gunakan meta viewport yang tepat, ukuran font yang mudah dibaca, dan manajemen `z-index` yang terdefinisi dengan baik.
*   **Tipografi & Warna (SEDANG):** Pertahankan tinggi baris dan panjang baris yang optimal, serta pasangan font yang serasi.
*   **Animasi (SEDANG):** Gunakan durasi dan waktu yang sesuai untuk mikro-interaksi, dan manfaatkan properti `transform`/`opacity` untuk performa.
*   **Pemilihan Gaya (SEDANG):** Cocokkan gaya dengan jenis produk, pertahankan konsistensi, dan gunakan ikon SVG daripada emoji.
*   **Bagan & Data (RENDAH):** Cocokkan jenis bagan dengan jenis data, gunakan palet warna yang dapat diakses, dan sediakan alternatif tabel untuk aksesibilitas.

## Cara Menggunakan Global Skills

Saat melakukan tugas apa pun, agen harus merujuk pada fondasi Global Skills ini. Ini berarti:

1.  **Kualitas Kode:** Terapkan prinsip Karpathy-skills untuk memastikan kode yang bersih, sederhana, dan dapat diverifikasi.
2.  **Pengeditan Presisi:** Manfaatkan Aider untuk pengeditan kode yang efisien dan akurat, terutama saat berinteraksi dengan LLM.
3.  **Interaksi LLM:** Gunakan TypeChat untuk memastikan respons LLM yang terstruktur dan bebas halusinasi dalam antarmuka bahasa alami.
4.  **Orkestrasi Agen:** Pertimbangkan prinsip GenericAgent saat merancang atau mengelola alur kerja agen, dengan fokus pada evolusi diri dan manajemen memori.
5.  **Penjadwalan Tugas:** Terapkan Kronos untuk penjadwalan tugas yang andal dan pelacakan siklus hidup, terutama untuk operasi yang sensitif terhadap waktu.
6.  **Keandalan Sistem:** Integrasikan praktik OpenSRE untuk investigasi insiden proaktif, analisis akar masalah, dan peningkatan keandalan sistem secara keseluruhan.
7.  **Desain UI/UX:** Patuhi aturan visual UI/UX Pro Max, menggunakan skema warna Dark Teal dan Gold, serta tagline "ruang ketiga" untuk semua elemen visual.

## Referensi

[1] [GitHub - forrestchang/andrej-karpathy-skills](https://github.com/forrestchang/andrej-karpathy-skills)
[2] [GitHub - aider-ai/aider](https://github.com/aider-ai/aider)
[3] [GitHub - microsoft/TypeChat](https://github.com/microsoft/TypeChat)
[4] [GitHub - lsdefine/GenericAgent](https://github.com/lsdefine/GenericAgent)
[5] [GitHub - Reqeique/Kronos](https://github.com/Reqeique/Kronos)
[6] [GitHub - Tracer-Cloud/opensre](https://github.com/Tracer-Cloud/opensre)
[7] [SKILL.md - /home/ubuntu/lunomi/.claude/skills/ui-ux-pro-max/SKILL.md](file:///home/ubuntu/lunomi/.claude/skills/ui-ux-pro-max/SKILL.md)

## Aturan Khusus: FIN AI (Financial AI)
Saat mensimulasikan, merancang, atau menjalankan logika untuk **FIN AI**, patuhi secara ketat:
1. **Formula Baku (Absolut):** `OPEX = Beban Pokok + Biaya Variabel`. Definisi operasional ini tidak boleh diganti.
2. **Anti-Halusinasi (Zero Hallucination):** Dilarang keras mengarang atau menebak angka. Semua data dan kalkulasi harus berdasarkan *input* sistem yang riil.
3. **Standar TypeChat:** Semua *output* struktural, analisis, dan integrasi FIN AI harus dipaksa menggunakan format **JSON skema ketat**, memastikan tidak ada deviasi dari tipe data yang diharapkan.
