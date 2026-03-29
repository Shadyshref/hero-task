## Deployment Guide for Hero-Task Monorepo

Your project consists of **two separate applications**:

- **Frontend**: React app built with Vite (static files)
- **Backend**: Express server (dynamic API endpoints)

Each needs to be deployed separately to different platforms.

---

## **DEPLOYMENT STRATEGY**

### **Frontend → Vercel**

Vercel is ideal for static sites and client-side apps.

### **Backend → Railway** (Recommended)

Railway is perfect for Node.js/Express servers.

---

## **Step-by-Step Deployment**

### **1. Deploy Frontend to Vercel**

```bash
git push origin main  # Push to GitHub
```

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Select your GitHub repository
4. **Root Directory**: `./client`
5. **Build Command**: `npm run build`
6. **Output Directory**: `dist`
7. **Environment Variables**: Add
   - `VITE_API_URL`: `https://your-server-will-be-here.railway.app`
8. Deploy!

**Note**: After deploying the backend, come back and update `VITE_API_URL` with the actual server URL.

---

### **2. Deploy Backend to Railway**

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Navigate to the `server` directory (it might auto-detect it)
5. Add Environment Variables:
   ```
   PORT=3000
   NODE_ENV=production
   DATABASE_URL=postgresql://user:password@host/database
   CLIENT_ORIGIN=https://your-vercel-frontend.vercel.app
   ```
6. Deploy!

You'll get a URL like: `https://hieroglyph-server-production.railway.app`

---

### **3. Update Vercel Frontend with Backend URL**

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Update `VITE_API_URL` to your Railway server URL
4. Redeploy the frontend

---

## **Troubleshooting the 404 Error**

| Issue                      | Cause                                          | Solution                                  |
| -------------------------- | ---------------------------------------------- | ----------------------------------------- |
| 404 on `/api/projects`     | Frontend requesting API but server not running | Deploy backend to Railway                 |
| Frontend loads but no data | `VITE_API_URL` not set correctly               | Update `.env.production` and redeploy     |
| CORS errors                | Server rejecting requests from frontend origin | Update `CLIENT_ORIGIN` in server env vars |
| Static pages show 404      | SPA routing not configured                     | Already handled by Vite                   |

---

## **Local Development**

```bash
# Terminal 1: Start Backend
cd server
npm install
npm run dev

# Terminal 2: Start Frontend
cd client
npm install
npm run dev
```

Frontend will be at: `http://localhost:5173`
Backend will be at: `http://localhost:3001`

Both use correct URLs in `.env` files automatically.

---

## **Why This Architecture?**

| Component    | Why Separate?                                                |
| ------------ | ------------------------------------------------------------ |
| **Frontend** | Static files don't need compute; Vercel's global CDN is fast |
| **Backend**  | Needs persistent server; Railway keeps Node.js running 24/7  |
| **Database** | Can be anywhere (Railway has PostgreSQL add-ons)             |

---

## **Cost Estimates**

- **Vercel**: Free tier supports your frontend
- **Railway**: Free tier with $5/month included credit
- **Total**: ~$0-5/month for this project

---
