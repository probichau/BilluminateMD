# Quick Start Guide - BilluminateMD

## Prerequisites
Before you begin, make sure you have:
1. ✅ Node.js installed (v18 or higher) - See `00-SETUP-GUIDE.md`
2. ✅ A code editor (VS Code recommended)

## Initial Setup

### Step 1: Install Dependencies

Open Terminal in the project root directory and run:

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

This will take 2-3 minutes to complete.

### Step 2: Set Up Environment Variables

#### Backend Environment
```bash
cd backend
cp .env.example .env
```

Now open `backend/.env` in your code editor and fill in:
- Leave most values as-is for now
- Set `USE_LOCAL_STORAGE=true` (to avoid setting up S3 immediately)
- We'll add API keys in Phase 2

#### Frontend Environment
```bash
cd frontend
cp .env.example .env
```

The default values should work for local development.

### Step 3: Run the Application

You'll need two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
You should see: `🚀 Server running on port 3001`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
You should see: `Local: http://localhost:5173/`

### Step 4: Open the App

Open your browser and go to: `http://localhost:5173`

You should see the BilluminateMD homepage with the "Audit My Bill" upload area.

---

## What Works Now (Without API Keys)

Currently, without API keys configured:
- ✅ Frontend UI is fully functional
- ✅ File upload interface works
- ❌ AI bill analysis won't work yet (needs Anthropic API key)
- ❌ Database storage won't work yet (needs PostgreSQL)
- ❌ Payment processing won't work yet (needs Stripe keys)

---

## Next Steps

### To Enable AI Bill Analysis (Phase 2)
1. Sign up for Anthropic API: https://console.anthropic.com/
2. Get your API key (starts with `sk-ant-`)
3. Add it to `backend/.env`:
   ```
   ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
   ```
4. Restart the backend server

### To Enable Database Storage (Phase 2)
1. Sign up for Supabase: https://supabase.com/
2. Create a new project
3. Copy the database connection string
4. Add it to `backend/.env`:
   ```
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres
   ```
5. Run the database initialization:
   ```bash
   cd backend
   node -e "import('./services/databaseService.js').then(m => m.initializeDatabase())"
   ```

### To Enable Payments (Phase 4)
1. Sign up for Stripe: https://stripe.com/
2. Get your test API keys
3. Add them to both `.env` files (see `00-SETUP-GUIDE.md` for details)

---

## Troubleshooting

### "npm: command not found"
- Node.js is not installed. See `00-SETUP-GUIDE.md` Step 1

### Port already in use
- Backend: Change `PORT=3001` to `PORT=3002` in `backend/.env`
- Frontend: The dev server will automatically try port 5174

### Frontend can't connect to backend
- Make sure backend is running on port 3001
- Check that `VITE_API_URL` in `frontend/.env` matches your backend port

---

## Development Workflow

1. Start both servers (backend and frontend)
2. Make code changes
3. Changes auto-reload (no need to restart)
4. Check browser console for errors
5. Check terminal output for backend logs

---

## Project Structure Overview

```
BilluminateMD/
├── frontend/               # React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Main pages (Home, Results)
│   │   └── services/      # API communication
│   └── package.json
│
├── backend/               # Node.js API
│   ├── controllers/      # Request handlers
│   ├── services/         # Business logic
│   │   ├── aiService.js           # Claude Vision integration
│   │   ├── errorDetectionService.js  # Bill error detection
│   │   ├── databaseService.js     # PostgreSQL operations
│   │   └── storageService.js      # File storage (S3/local)
│   ├── routes/           # API endpoints
│   └── server.js         # Main server file
│
└── docs/                 # Documentation
    ├── 00-SETUP-GUIDE.md
    └── 01-QUICK-START.md (you are here)
```

---

## Ready for Phase 2?

Once you have the app running locally and you're ready to enable the AI features, proceed to:
- Set up Anthropic API (see `00-SETUP-GUIDE.md` - Service 1)
- Set up Database (see `00-SETUP-GUIDE.md` - Service 3)

Then test with a real medical bill image!
