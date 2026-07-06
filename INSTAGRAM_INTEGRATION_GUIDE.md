# Instagram Integration Setup Guide

This guide explains how to set up and use the Instagram-to-Events integration for Peter Easton's Pub website.

## Overview

The Instagram integration allows you to:
1. **Manually fetch** Instagram posts by hashtag and convert them to events
2. **Automatically sync** Instagram posts on a daily schedule
3. **Manage settings** through an admin dashboard
4. **Store credentials securely** in Firestore (encrypted at rest)

## Prerequisites

Before you can use this feature, you need:

1. **Instagram Business or Creator Account**
   - Convert your personal Instagram account to a Business or Creator account
   - Link it to a Facebook Page

2. **Meta Developer Account**
   - Create an account at [Meta Developers](https://developers.facebook.com/)
   - Create a new app
   - Add "Instagram Graph API" product

3. **Long-Lived Access Token**
   - Generate from Meta App Dashboard → Tools → Graph API Explorer
   - Request permissions: `instagram_basic` and `instagram_manage_insights`
   - The token lasts approximately 60 days

## Setup Steps

### Step 1: Get Your Instagram Business Account ID

1. Go to [Meta App Dashboard](https://developers.facebook.com/apps/)
2. Select your app
3. Go to Tools → Graph API Explorer
4. Select your Instagram Business Account from the dropdown
5. Run this query: `GET /me?fields=id`
6. Copy the returned `id` value

### Step 2: Generate Long-Lived Access Token

1. In Graph API Explorer, select your Instagram Business Account
2. Click "Generate Access Token"
3. Select the token and copy it
4. **IMPORTANT**: This token is sensitive - keep it secure!

### Step 3: Add Credentials to Settings

1. Log in to the admin dashboard
2. Navigate to **Settings** (gear icon)
3. Fill in:
   - **Instagram Business Account ID**: Paste your account ID
   - **Instagram Access Token**: Paste your long-lived token
   - **Default Hashtag**: Enter the hashtag you want to track (e.g., `petereastonpub`)
4. Click **Save Settings**

### Step 4: Configure Auto-Creation (Optional)

In the Settings page, you can configure:

- **Enable Auto-Creation**: Turn on automatic event creation
- **Auto-Approve Events**: Automatically publish events without review
- **Default Start Time**: Time events start (e.g., 19:00)
- **Default End Time**: Time events end (e.g., 23:00)
- **Mark as Recurring**: Auto-mark events as recurring
- **Mark as Archived**: Auto-archive events
- **Sync Frequency**: Choose between Manual, Daily, or Weekly

## Usage

### Manual Sync (One-Click)

1. Go to **Edit Events** in the admin dashboard
2. Click the **📷 Instagram** button
3. Enter a hashtag (or use the default from settings)
4. Review the fetched posts
5. Select which posts to convert to events
6. Click **Create Events**

### Auto-Create from Settings

1. Go to **Edit Events** in the admin dashboard
2. Click the **⚡ Auto-Create** button
3. Confirm the action
4. Events will be created based on your settings

### Automatic Daily Sync (CRON)

The system is configured to automatically sync Instagram posts daily at midnight UTC.

**How it works:**
- Vercel calls `/api/cron/instagram-sync` every day at 00:00 UTC
- Only creates events if auto-creation is enabled in settings
- Skips posts that have already been added as events
- Updates the "Last Sync" timestamp in settings

**To disable daily sync:**
1. Go to Settings
2. Change "Sync Frequency" to "Manual"
3. The CRON job will still run, but won't create events

## Data Mapping

When Instagram posts are converted to events:

| Instagram Field | Event Field | Notes |
| --- | --- | --- |
| Caption | Title & Description | First sentence becomes title, full caption becomes description |
| Image URL | Image URL | Used directly from Instagram |
| Timestamp | Date | Converted to YYYY-MM-DD format |
| Permalink | Instagram Permalink | Stored for reference |
| Post ID | Instagram Post ID | Prevents duplicate event creation |

## Security

- **Credentials are stored in Firestore** and encrypted at rest by Google Cloud
- **API tokens are never exposed to the browser** - only used server-side
- **Admin authentication required** for all operations
- **CRON requests are verified** with a secret token (set in Vercel environment)

## Troubleshooting

### "Instagram credentials not configured"
- Go to Settings and add your access token and business account ID
- Make sure the token hasn't expired (they last ~60 days)

### "Hashtag not found"
- Verify the hashtag exists on Instagram
- Make sure your Instagram account has posted with this hashtag
- Check that your account has permission to access this hashtag

### "No new Instagram posts found"
- The hashtag may have no recent posts
- Check that posts are using the exact hashtag you're searching for
- Note: Instagram API only returns recent media (typically last 50 posts)

### CRON job not running
- Check Vercel dashboard → Settings → Cron Jobs
- Ensure `vercel.json` is in the root directory with correct configuration
- Verify `CRON_SECRET` environment variable is set in Vercel

## Rate Limits

**Instagram Graph API Limits:**
- Maximum 30 unique hashtag searches per Instagram account per 7 days
- This is a hard limit from Instagram - plan your hashtag usage accordingly

**Vercel CRON Limits:**
- Free tier: 1 CRON job per day
- Pro tier: Unlimited CRON jobs
- If you need more frequent syncs, consider moving to a dedicated server

## Future Server Migration

When you move to a dedicated server, you can:

1. **Keep the same database** - Firestore will continue to work
2. **Use the same API routes** - They're standard Next.js routes
3. **Set up more frequent CRON jobs** - No Vercel limitations
4. **Use different schedulers** - cron, node-schedule, bull, etc.

The code is designed to be portable and doesn't depend on Vercel-specific features (except the CRON configuration).

## API Endpoints

### Manual Instagram Sync
```
POST /api/instagram-sync
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "hashtag": "petereastonpub"
}
```

### Auto-Create Events
```
POST /api/instagram-auto-create
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "hashtag": "petereastonpub"  // Optional, uses default if not provided
}
```

### Daily CRON Sync
```
GET /api/cron/instagram-sync
Authorization: Bearer <CRON_SECRET>
```

### Get/Update Settings
```
GET /api/settings
POST /api/settings
Authorization: Bearer <admin_token>
Content-Type: application/json
```

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Firestore logs in Google Cloud Console
3. Check Vercel deployment logs
4. Review browser console for client-side errors

## Resources

- [Instagram Graph API Documentation](https://developers.facebook.com/docs/instagram-platform/instagram-graph-api)
- [Meta Developer Portal](https://developers.facebook.com/)
- [Vercel CRON Documentation](https://vercel.com/docs/cron-jobs)
- [Firebase Firestore Documentation](https://firebase.google.com/docs/firestore)
