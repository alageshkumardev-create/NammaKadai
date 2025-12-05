# Quick Start Guide

## Prerequisites
- Node.js v16+
- MongoDB Atlas account (or local MongoDB)

## Setup (5 minutes)

### 1. Install Dependencies
```bash
# Backend
cd server
npm install

# Frontend (in new terminal)
cd client
npm install
```

### 2. Configure Backend Environment
Create `server/.env`:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_here
CLIENT_URL=http://localhost:3000

# Optional (for full features)
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
TECH_PHONE=+919876543210
TECH_EMAIL=tech@example.com
```

### 3. Configure Frontend Environment
Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Seed Database
```bash
cd server
npm run seed
```

### 5. Run Application
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

### 6. Access Application
- Open browser: `http://localhost:3000`
- Login with: `admin@ro-service.com` / `admin123`

## Test Features

1. **Dashboard** - View upcoming services
2. **Customers** - Browse and search customers
3. **Customer Detail** - View service history
4. **Notifications** - Check notification log

## Test Scheduler
```bash
curl http://localhost:5000/api/cron/check-due
```

## Troubleshooting

**MongoDB Connection Error?**
- Verify `MONGODB_URI` in `server/.env`
- Check MongoDB Atlas IP whitelist

**Frontend Can't Connect?**
- Ensure backend is running on port 5000
- Check `VITE_API_URL` in `client/.env`

**Seed Script Fails?**
- Ensure MongoDB is connected
- Check database permissions

---

**Need Help?** Check [README.md](file:///g:/Namma%20Kadai/README.md) for detailed documentation.
