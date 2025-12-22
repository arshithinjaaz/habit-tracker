# Render Deployment Configuration

## Build Command
```
npm install && npm run build
```

## Start Command
```
npx serve -s dist -l 10000
```

## Environment Variables (Optional)
```
NODE_VERSION=20
```

## Deploy to Render

1. **Push to GitHub**
   - Make sure your code is pushed to GitHub
   - Commit all changes: `git add . && git commit -m "Ready for deployment" && git push`

2. **Create New Web Service on Render**
   - Go to https://render.com/
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

3. **Configure Service**
   - **Name**: habit-tracker
   - **Region**: Select closest to you
   - **Branch**: main (or your branch name)
   - **Root Directory**: Leave blank
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx serve -s dist -l 10000`
   - **Plan**: Free

4. **Deploy**
   - Click "Create Web Service"
   - Wait for build to complete
   - Your app will be live at: `https://habit-tracker-xxxxx.onrender.com`

## Important Notes

- ✅ Build command installs dependencies and creates production bundle
- ✅ Serve command serves static files from `dist` folder
- ✅ Port 10000 is Render's default port
- ⚠️ First build may take 3-5 minutes
- 💡 Free tier apps sleep after inactivity (takes ~30s to wake up)

## Troubleshooting

If you see plain HTML instead of the React app:

1. **Check Build Logs** - Look for errors in Render dashboard
2. **Verify Commands** - Ensure build and start commands are exactly as shown above
3. **Check dist folder** - Make sure `npm run build` creates a `dist` folder locally
4. **Clear Cache** - In Render dashboard, try "Clear build cache & deploy"

## Alternative: Deploy to Netlify (Simpler)

If Render gives issues, Netlify is easier for static sites:

1. Go to https://netlify.com/
2. Drag and drop your `dist` folder
3. Done! Instant deployment

Or use Netlify CLI:
```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod
```
