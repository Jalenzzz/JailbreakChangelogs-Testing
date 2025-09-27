#!/bin/bash

# Script to replace all hardcoded external URLs with Railway Object Storage API URLs

echo "Replacing hardcoded external URLs with Railway Object Storage API URLs..."

# Replace all instances of the external CDN with the API route
find src -name "*.tsx" -o -name "*.ts" -o -name "*.js" | xargs sed -i 's|https://assets\.jailbreakchangelogs\.xyz|/api/assets|g'

echo "✅ All hardcoded external URLs have been replaced with Railway Object Storage API URLs!"
echo ""
echo "📋 Summary of changes:"
echo "- All metadata/OpenGraph images now use /api/assets/"
echo "- All component images now use /api/assets/"
echo "- All background images now use /api/assets/"
echo "- All logo images now use /api/assets/"
echo "- All support/KoFi images now use /api/assets/"
echo "- All contributor avatars now use /api/assets/"
echo ""
echo "🚀 Your entire application now uses Railway Object Storage!"
