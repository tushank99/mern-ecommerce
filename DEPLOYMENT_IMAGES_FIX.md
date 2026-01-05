# 🖼️ Fixing Images After Deployment

## Why Images Don't Work

| Environment | How Images Work |
|------------|-----------------|
| **Local (Dev)** | Saved to `uploads/` folder → Served by Express |
| **Vercel (Prod)** | ❌ `uploads/` folder is temporary/ephemeral |

## ✅ The Solution: Cloudinary (Already Set Up in Code!)

Your code already supports Cloudinary - you just need to configure it.

### Step 1: Create Cloudinary Account (Free)

1. Go to https://cloudinary.com
2. Sign up for free (10GB storage + 25GB bandwidth/month)
3. Go to Dashboard → Copy your credentials

### Step 2: Add Environment Variables to Vercel

In your Vercel project settings → Environment Variables, add:

```
CLOUDINARY_CLOUD_NAME = your_cloud_name
CLOUDINARY_API_KEY = your_api_key  
CLOUDINARY_API_SECRET = your_api_secret
```

### Step 3: Handle Existing Products

**Option A: Quick Fix (Manual)**
1. Go to MongoDB Atlas
2. Find your products collection
3. Update the `image` field to use any external URL or Cloudinary URL

**Option B: Run Migration Script**
```bash
cd backend
node scripts/migrateImages.js
```

**Option C: Re-upload via Admin Panel**
1. Deploy with Cloudinary configured
2. Go to Admin → Products
3. Edit each product and re-upload images
4. Images will now be stored in Cloudinary

### Step 4: Redeploy

After setting environment variables, redeploy your backend.

---

## 📝 Summary

```
Local Development:
[Upload Image] → [Saves to /uploads/] → [Express serves it] ✅

Production (Vercel):
[Upload Image] → [Uploads to Cloudinary] → [Returns Cloudinary URL] ✅
```

The key insight: **Serverless platforms can't persist files**. Use cloud storage like Cloudinary, AWS S3, or similar.
