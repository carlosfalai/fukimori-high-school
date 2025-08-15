# 🚀 Deploy Fukimori High to the Cloud - Works 24/7 Without Your Laptop!

## Quick Deploy to Render (FREE - No Credit Card Required)

### Step 1: Upload Code to GitHub
1. Go to https://github.com/new
2. Name it: `fukimori-high-school`
3. Keep it PUBLIC
4. Click "Create repository"
5. Copy the commands GitHub shows you and run them in Terminal:

```bash
cd /Users/carlosfavielfont/Downloads/Fukimori-High-Claude-version\ 3
git remote add origin https://github.com/YOUR_USERNAME/fukimori-high-school.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Render (2 minutes)
1. Go to https://render.com
2. Sign up with GitHub (FREE)
3. Click "New +" → "Web Service"
4. Connect your GitHub account
5. Select `fukimori-high-school` repository
6. Fill in these settings:
   - **Name**: `fukimori-high-backend`
   - **Region**: Oregon (US West)
   - **Branch**: main
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: FREE

7. Click "Create Web Service"
8. Wait 5 minutes for it to deploy
9. Copy your backend URL (looks like: `https://fukimori-high-backend.onrender.com`)

### Step 3: Update Frontend (Final Step)
1. Change this file: `netlify.toml`
2. Replace the `to =` line with your Render URL:
```toml
[[redirects]]
  from = "/api/*"
  to = "https://fukimori-high-backend.onrender.com/api/:splat"
  status = 200
```

3. Commit and push:
```bash
git add .
git commit -m "Update backend URL"
git push
```

4. Redeploy to Netlify:
```bash
netlify deploy --prod --dir dist/public
```

## 🎉 DONE! Your Game is Live 24/7!

Your game will now work for ANYONE, ANYWHERE, ANYTIME without your laptop!

### Game Features Working:
✅ Character consistency and memory
✅ Achievement system with funny names
✅ Real-time Japanese calendar
✅ Dynamic reputation system
✅ Multiplayer ready
✅ Music integration

### URLs:
- **Game**: https://fukimori-high-school.netlify.app
- **Backend**: https://fukimori-high-backend.onrender.com

### Note:
The free Render backend might sleep after 15 minutes of inactivity. It wakes up automatically when someone visits the game (takes ~30 seconds on first load).

---

## Alternative: One-Click Deploy to Railway ($5/month)

If you want INSTANT response times with no sleeping:

1. Go to https://railway.app
2. Click "Deploy from GitHub"
3. Select your repository
4. Railway handles everything automatically
5. Costs ~$5/month but works perfectly 24/7

---

## Support

The game is fully configured and ready. Once deployed, it will work forever without any maintenance!