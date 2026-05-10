# Lunomi POS - Firebase Cleanup Script (Windows PowerShell)
# Run this to remove all Firebase files before Supabase migration

Write-Host "🧹 Starting Firebase Cleanup..." -ForegroundColor Cyan
Write-Host ""

# Backup reminder
Write-Host "⚠️  IMPORTANT: Make sure you've committed your work!" -ForegroundColor Yellow
Write-Host "   Run: git add . && git commit -m 'backup before cleanup'" -ForegroundColor Yellow
Write-Host ""
$confirm = Read-Host "Continue with cleanup? (yes/no)"

if ($confirm -ne "yes") {
    Write-Host "❌ Cleanup cancelled" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "🗑️  Deleting Firebase files..." -ForegroundColor Cyan

# Delete root Firebase files
$filesToDelete = @(
    "firebase.json",
    "firestore.rules",
    "firestore.indexes.json",
    ".gcloudignore",
    "seed-data.js"
)

foreach ($file in $filesToDelete) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ✓ Deleted: $file" -ForegroundColor Green
    } else {
        Write-Host "  - Not found: $file" -ForegroundColor Gray
    }
}

# Delete Firebase folders
$foldersToDelete = @(
    ".firebase",
    "functions"
)

foreach ($folder in $foldersToDelete) {
    if (Test-Path $folder) {
        Remove-Item $folder -Recurse -Force
        Write-Host "  ✓ Deleted folder: $folder" -ForegroundColor Green
    } else {
        Write-Host "  - Not found: $folder" -ForegroundColor Gray
    }
}

# Delete Firebase files in web folder
$webFilesToDelete = @(
    "web\src\firebase.ts",
    "web\src\contexts\AuthContext.tsx"
)

foreach ($file in $webFilesToDelete) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ✓ Deleted: $file" -ForegroundColor Green
    } else {
        Write-Host "  - Not found: $file" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "✅ Firebase cleanup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Commit cleanup: git add . && git commit -m 'chore: remove Firebase files'" -ForegroundColor White
Write-Host "  2. Setup Supabase project" -ForegroundColor White
Write-Host "  3. Execute SQL schema" -ForegroundColor White
Write-Host "  4. Update code to use Supabase" -ForegroundColor White
Write-Host ""
