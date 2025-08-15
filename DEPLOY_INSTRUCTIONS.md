# 🎵 Fukimori High School - Deployment Guide

## Quick Deploy (Drag & Drop)

1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Click "Add new site" → "Deploy manually" 
3. Drag the `dist/public` folder to the deployment area
4. Your musical high school life simulation will be live!

## GitHub + Netlify Deploy (Recommended)

```bash
# 1. Create a new GitHub repository at github.com
# 2. Add the remote repository
git remote add origin https://github.com/YOUR_USERNAME/fukimori-high.git

# 3. Push to GitHub
git push -u origin main

# 4. Connect to Netlify
# - Go to netlify.com → New site from Git
# - Connect your GitHub repo
# - Build settings are already configured in netlify.toml
```

## Environment Variables (Important!)

After deployment, add these environment variables in Netlify:

1. Go to Site settings → Environment variables
2. Add:
   - `DEEPSEEK_API_KEY` = your_deepseek_api_key
   - `NODE_ENV` = production

## Backend Deployment

Your frontend will be on Netlify, but you'll need to deploy the backend separately:

**Recommended services:**
- **Railway** (easy): railway.app
- **Render** (free tier): render.com  
- **Vercel** (serverless): vercel.com

Update the API URL in `netlify.toml` after backend deployment:
```toml
[[redirects]]
  from = "/api/*"
  to = "https://your-backend-url.com/api/:splat"
  status = 200
```

## Features Ready to Test:

🎵 **Music System:**
- Location-based soundtracks
- Character interaction music
- Seasonal and mood-based playlists
- Spotify integration

🎮 **Game Features:**
- Character consistency across interactions
- Player progression with XP and skills
- Relationship memory system
- Pre-loaded teachers and school locations

🎯 **Next Steps:**
- Add "Buy Time" system for after-school exploration
- Implement secret locations unlocking
- Add more character interactions and storylines

Enjoy your immersive musical high school life at Fukimori High! 🌸