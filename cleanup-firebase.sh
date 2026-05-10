#!/bin/bash
# Cleanup Firebase files and prepare for Supabase

echo "🧹 Cleaning up Firebase files..."

# Remove Firebase config files
rm -f firebase.json
rm -f firestore.rules
rm -f firestore.indexes.json
rm -f .gcloudignore
rm -f seed-data.js

# Remove Firebase folders
rm -rf .firebase
rm -rf functions

# Remove Firebase from web folder
rm -f web/src/firebase.ts
rm -f web/src/contexts/AuthContext.tsx

echo "✅ Firebase files removed"
echo ""
echo "📦 Keeping for reference:"
echo "  - LUNOMI_AUDIT_V2.md"
echo "  - README.md"
echo ""
echo "🎯 Ready for Supabase migration!"
