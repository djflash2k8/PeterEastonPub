#!/bin/bash

# Peter Easton Pub - Deployment Script
# This script handles pushing changes to GitHub for Vercel auto-deployment
# and provides a roadmap for future server migration.

echo "🚀 Starting deployment process..."

# 1. Check for Git
if ! [ -x "$(command -v git)" ]; then
  echo "❌ Error: git is not installed." >&2
  exit 1
fi

# 2. Sync with GitHub
echo "📦 Syncing changes with GitHub..."
git add .
git commit -m "Cleaned project and finalized Instagram integration"
git push origin root

if [ $? -eq 0 ]; then
  echo "✅ Changes pushed to GitHub successfully!"
  echo "🌐 Vercel will now start the automatic deployment."
else
  echo "❌ Error: Failed to push changes to GitHub."
  exit 1
fi

# 3. Reminder for Vercel Settings
echo ""
echo "--------------------------------------------------"
echo "⚠️  REMINDER: Vercel Configuration"
echo "--------------------------------------------------"
echo "To ensure the daily Instagram sync works, please verify:"
echo "1. CRON_SECRET is set in Vercel Environment Variables."
echo "2. Your Instagram credentials are saved in the Admin Settings panel."
echo "--------------------------------------------------"

# 4. Future Server Migration Guide
echo ""
echo "📝 FUTURE SERVER MIGRATION NOTE:"
echo "When you move to a dedicated server, you can run this project using:"
echo "  1. npm install"
echo "  2. npm run build"
echo "  3. npm start"
echo ""
echo "For the CRON job on a dedicated server, you can use a standard crontab:"
echo "  0 0 * * * curl -X GET https://your-domain.com/api/cron/instagram-sync -H 'Authorization: Bearer YOUR_CRON_SECRET'"
echo ""

echo "✨ Deployment script finished!"
