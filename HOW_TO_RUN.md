# 🚀 How to Run the Habit Tracker Application

## Prerequisites

Make sure you have the following installed:
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** (comes with Node.js)
- **Git** (optional, for cloning)

**Check if installed**:
```bash
node --version    # Should show v16+
npm --version     # Should show 8+
```

---

## 🎯 Quick Start (3 Steps)

### Step 1: Install Dependencies
```bash
cd d:\habit-tracker
npm install
```
This downloads all required packages (~500MB, takes 2-5 minutes).

### Step 2: Start Development Server
```bash
npm run dev
```

### Step 3: Open in Browser
Open your browser and go to:
```
http://localhost:5173
```

**That's it!** The app is now running.

---

## 📱 Development Commands

### Start Development Server
```bash
npm run dev
```
- Hot reload enabled (changes show instantly)
- Runs on `http://localhost:5173`
- See console for detailed logs
- Press `q` to stop

### Build for Production
```bash
npm run build
```
- Creates optimized production build
- Output in `dist/` folder
- Ready to deploy

### Run Production Build Locally
```bash
npm run preview
```
- Preview the built production version
- Runs on `http://localhost:4173`

### Run Production Server
```bash
npm run start
```
- Runs the Express.js server
- Uses files from `dist/` folder
- Runs on `http://localhost:3000`

### Run Tests
```bash
npm test              # Run all tests
npm run test:coverage # Run with coverage report
```

### Lint Code
```bash
npm run lint
```
- Check for code quality issues
- Uses ESLint configuration

---

## 📂 Directory Structure

```
d:\habit-tracker/
├── src/                    # Source code
│   ├── components/         # React components
│   ├── services/           # Business logic
│   ├── utils/              # Helper functions
│   ├── App.jsx             # Main app component
│   └── main.jsx            # Entry point
├── public/                 # Static assets
├── dist/                   # Production build (created by build)
├── package.json            # Dependencies & scripts
├── vite.config.js          # Vite configuration
└── server.js               # Production server
```

---

## 🌐 Access Points

### Development
```
App URL:           http://localhost:5173
Admin Panel:       http://localhost:5173/admin
Subscriptions:     http://localhost:5173/admin/subscriptions
```

### Production
```
App URL:           http://localhost:3000
Admin Panel:       http://localhost:3000/admin
Subscriptions:     http://localhost:3000/admin/subscriptions
```

---

## 🔐 Admin Login

### Default Admin Credentials
```
Username: admin
Password: admin123
```

**Note**: This is for demo/development only. Change before production!

### Access Admin Panel
1. Go to `/admin` route
2. Log in with credentials above
3. View dashboard, habits, memories, subscriptions, settings

---

## 📊 Subscription Features (No Setup Required)

The subscription system uses **browser localStorage** - no database setup needed!

### Test Subscription Features
1. Log in as a regular user
2. View "Subscription" card on dashboard
3. Click "Change Plan" to upgrade
4. See usage stats with progress bars
5. Go to `/admin/subscriptions` to manage (as admin)

**Data stored in**: `habitTracker_subscriptions` (localStorage)

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5173 (Windows)
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Or use different port
npm run dev -- --port 3000
```

### Dependencies Not Installing
```bash
# Clear cache and reinstall
rm package-lock.json
npm install
```

### Vite Error / Hot Reload Not Working
```bash
# Hard refresh browser
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

### Port Conflicts
Check what's using the port:
```bash
netstat -ano | findstr :5173
```

### Clear Browser Cache
```bash
# Hard clear browser cache
Ctrl + Shift + Delete (Windows)
Cmd + Shift + Delete (Mac)
```

---

## 💾 Database & Storage

### Current Setup (Development)
- **LocalStorage API** for data persistence
- Data stored in browser
- No external database needed
- Perfect for testing

### Data Locations
- User habits: `habitTracker_habits_{username}`
- Memories: `habitTracker_memories_{username}`
- Subscriptions: `habitTracker_subscriptions`
- Usage: `habitTracker_subscriptions_usage`

### Clear All Data (If Needed)
Open browser console (F12) and run:
```javascript
// Clear specific user's data
localStorage.removeItem('habitTracker_habits_john');
localStorage.removeItem('habitTracker_memories_john');

// Clear subscription data
localStorage.removeItem('habitTracker_subscriptions');
localStorage.removeItem('habitTracker_subscriptions_usage');

// Clear all data
localStorage.clear();
```

---

## 📱 Mobile Testing

### Test on Mobile Device

#### Same Network
```bash
npm run dev

# On mobile browser, go to:
http://<your-computer-ip>:5173
```

Find your IP:
```bash
ipconfig | findstr "IPv4"  # Windows
ifconfig | grep inet       # Mac/Linux
```

#### Example
If your IP is `192.168.1.100`:
```
http://192.168.1.100:5173
```

### Desktop Mobile View
1. Open DevTools (F12)
2. Click mobile icon (or Ctrl+Shift+M)
3. Test responsive design

---

## 🚀 Deployment

### Deploy to Production

#### Option 1: Build & Run Locally
```bash
npm run build          # Creates dist/ folder
npm run start          # Runs on port 3000
```

#### Option 2: Deploy to Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

#### Option 3: Deploy to Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

#### Option 4: Docker (if Dockerfile exists)
```bash
docker build -t habit-tracker .
docker run -p 3000:3000 habit-tracker
```

---

## 🔗 Useful Links

### Documentation
- [QUICK_START.md](./QUICK_START.md) - Quick reference
- [SUBSCRIPTION_MODULE.md](./SUBSCRIPTION_MODULE.md) - Full subscription docs
- [README.md](./README.md) - Project overview
- [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) - Technical details

### Development Tools
- [Vite Docs](https://vitejs.dev/) - Build tool
- [React Docs](https://react.dev/) - Framework
- [Material-UI Docs](https://mui.com/) - Component library
- [Firebase Docs](https://firebase.google.com/docs) - Backend (if needed)

---

## 🎯 First Steps After Running

1. **Create an Account**
   - Enter username and PIN
   - Complete onboarding tour

2. **Add Habits**
   - Click "Add Habit" button
   - Choose category and emoji
   - Set your daily habits

3. **Check Your Subscription**
   - See subscription card on dashboard
   - View usage statistics
   - Try upgrading plan (dummy payment)

4. **Log Memories**
   - Click "Memory Logger" card
   - Write down your thoughts
   - Save memory entry

5. **View Admin Panel**
   - Go to `/admin`
   - Log in with `admin`/`admin123`
   - Explore subscriptions dashboard

---

## 📞 Quick Reference Commands

```bash
# Install dependencies
npm install

# Start development (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run production server
npm run start

# Run tests
npm test

# Check code quality
npm run lint
```

---

## ⚡ Performance Tips

### For Better Performance
1. Clear browser cache regularly
2. Use incognito/private mode for testing
3. Disable browser extensions
4. Check DevTools Network tab (F12)
5. Use Chrome for best performance

### Development Performance
- Vite compiles only what changed
- Hot Module Reload (HMR) enabled
- Sub-second refresh on save
- No full page reload needed

---

## 🆘 Getting Help

### If Something Doesn't Work

1. **Check Terminal Output**
   - Look for error messages
   - Red text shows problems
   - Copy error message

2. **Check Browser Console**
   - Press F12 → Console tab
   - Look for red errors
   - Note the error details

3. **Verify Installation**
   ```bash
   node --version      # Check Node.js
   npm --version       # Check npm
   npm list            # Check dependencies
   ```

4. **Reset Everything**
   ```bash
   # Full clean reinstall
   rm -r node_modules package-lock.json
   npm install
   npm run dev
   ```

5. **Check System Resources**
   - Ensure you have 2GB+ free RAM
   - Check CPU usage in Task Manager
   - Close other heavy applications

---

## ✅ Verification Checklist

After running, verify everything works:

- [ ] Server started without errors
- [ ] Can access http://localhost:5173
- [ ] Can log in (create or use existing account)
- [ ] Can see habits on dashboard
- [ ] Can see subscription card
- [ ] Can access admin panel (/admin)
- [ ] Subscription page works (/admin/subscriptions)
- [ ] No console errors (F12)
- [ ] Mobile layout responsive

---

## 📝 Environment Variables (Optional)

Create `.env.local` file for custom settings:

```env
# Vite settings
VITE_API_URL=http://localhost:3000

# Firebase (if needed)
VITE_FIREBASE_API_KEY=your_key_here
VITE_FIREBASE_PROJECT_ID=your_project_here

# Feature flags
VITE_ENABLE_BETA=true
```

---

**Happy Tracking! 🎯**

Questions? Check the [documentation files](./INDEX.md) for detailed guides.
