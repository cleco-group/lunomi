#!/bin/bash
# Script untuk force update dashboard.html dengan OPS AI panel

echo "Backing up current dashboard.html..."
cp dashboard.html dashboard.html.backup

echo "Applying OPS AI panel fix..."
# Fix akan dilakukan manual oleh user dengan instruksi di bawah

cat << 'EOF'

INSTRUKSI MANUAL FIX:

1. Buka dashboard.html di VS Code
2. Cari line 388-389 (setelah closing </div> dari metric cards)
3. Pastikan hanya ada 1 </div>, bukan 2
4. Pastikan ada komentar: <!-- ═══ OPS AI STATUS PANEL ═══ -->
5. Save file (Ctrl+S)
6. Jalankan:
   git add dashboard.html
   git commit -m "fix: ensure OPS AI panel is visible"
   git push origin master

Jika masih tidak berhasil, copy seluruh konten dari:
C:\Users\CLARA PC\Documents\Proyek\lunomi\dashboard.html

Paste ke GitHub web editor:
https://github.com/cleco-group/lunomi/edit/master/dashboard.html

Lalu commit langsung dari GitHub.

EOF
