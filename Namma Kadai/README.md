# RO Maintenance Service - Full Stack MERN Application

A comprehensive **MERN stack** application for managing RO (Reverse Osmosis) water purifier maintenance services, customer records, automated notifications, and Google Sheets synchronization.

## 🚀 Features

### Backend (Express.js + MongoDB)
- ✅ **User Authentication** - JWT-based auth with bcrypt password hashing
- ✅ **Customer Management** - CRUD operations with search and pagination
- ✅ **Service Records** - Track service history, parts replaced, and next service dates
- ✅ **Automated Notifications** - SMS (Twilio) and Email (SendGrid/SMTP) for upcoming services
- ✅ **Scheduler** - node-cron for checking services due in 2-3 days
- ✅ **File Uploads** - Cloudinary integration for customer/service images
- ✅ **Google Sheets Sync** - Auto-sync customer and service data to Google Sheets
- ✅ **RESTful API** - Well-structured API with validation and error handling

### Frontend (React + Vite)
- ✅ **Modern UI** - Clean, responsive design with gradient accents
- ✅ **Dashboard** - Stats cards and upcoming services overview
- ✅ **Customer Management** - List, search, view details, and service history
- ✅ **Notifications Log** - View all sent notifications with status
- ✅ **Authentication** - Login/Signup with persistent sessions
- ✅ **Protected Routes** - Role-based access control

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (Atlas account or local installation)
- **Cloudinary** account (for image uploads)
- **Twilio** account (optional, for SMS)
- **SendGrid** or Gmail SMTP (for email notifications)
- **Google Cloud Platform** account (for Google Sheets API)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Namma Kadai"
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create `.env` file in `server/` directory:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ro_service

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Google Sheets
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SPREADSHEET_ID=your-spreadsheet-id

# Twilio (SMS)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Email
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@yourdomain.com

# OR use Gmail SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Technician Contact
TECH_PHONE=+919876543210
TECH_EMAIL=technician@yourdomain.com

# Frontend URL
CLIENT_URL=http://localhost:3000
```

### 3. Frontend Setup

```bash
cd ../client
npm install
```

Create `.env` file in `client/` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Seed Database with Dummy Data

```bash
cd ../server
npm run seed
```

This creates:
- 2 users (admin and technician)
- 5 customers with realistic data
- 5 service records with various due dates
- 1 sample notification

**Demo Login Credentials:**
- Admin: `admin@ro-service.com` / `admin123`
- Technician: `suresh@ro-service.com` / `tech123`

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```
Server runs on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```
Frontend runs on `http://localhost:3000`

### Production Build

**Backend:**
```bash
cd server
npm start
```

**Frontend:**
```bash
cd client
npm run build
npm run preview
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### Customers
- `GET /api/customers` - Get all customers (with pagination & search)
- `GET /api/customers/:id` - Get single customer
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer
- `GET /api/customers/:id/records` - Get customer's service records
- `POST /api/customers/:id/records` - Create service record

### Service Records
- `GET /api/records/:id` - Get single record
- `PUT /api/records/:id` - Update record
- `DELETE /api/records/:id` - Delete record
- `GET /api/records/upcoming/all` - Get upcoming services

### Notifications
- `GET /api/notifications` - Get notification history

### Upload
- `POST /api/upload` - Upload image to Cloudinary

### Sync
- `POST /api/sync/manual` - Manually trigger Google Sheets sync

## ⏰ Scheduler

The backend runs a cron job **daily at 8 AM** to check for services due in 2-3 days and sends notifications via SMS and email.

To manually trigger the scheduler:
```bash
curl http://localhost:5000/api/cron/check-due
```

## 🔧 Third-Party Service Setup

### MongoDB Atlas
1. Create account at [mongodb.com](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get connection string and add to `MONGODB_URI`

### Cloudinary
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get Cloud Name, API Key, and API Secret from dashboard
3. Add to `.env`

### Twilio (SMS)
1. Create account at [twilio.com](https://www.twilio.com)
2. Get Account SID, Auth Token, and Phone Number
3. Add to `.env`

### SendGrid (Email)
1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Create API key
3. Add to `.env`

### Google Sheets API
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project
3. Enable Google Sheets API
4. Create Service Account
5. Download JSON key file
6. Extract `client_email` and `private_key`
7. Create a Google Sheet and share it with the service account email
8. Add credentials to `.env`

## 📁 Project Structure

```
Namma Kadai/
├── server/                 # Backend (Express.js)
│   ├── config/            # Database configuration
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── middleware/        # Auth middleware
│   ├── utils/             # Utilities (JWT, notifications, sheets, scheduler)
│   ├── scripts/           # Seed script
│   └── server.js          # Entry point
│
├── client/                # Frontend (React + Vite)
│   ├── src/
│   │   ├── api/          # API client
│   │   ├── components/   # Reusable components
│   │   ├── context/      # Auth context
│   │   ├── hooks/        # Custom hooks
│   │   ├── pages/        # Page components
│   │   ├── App.jsx       # Main app component
│   │   ├── main.jsx      # Entry point
│   │   └── index.css     # Global styles
│   └── index.html
│
└── README.md
```

## 🚢 Deployment

### Backend (Render / Railway / DigitalOcean)

**Render:**
1. Create account at [render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub repository
4. Set build command: `cd server && npm install`
5. Set start command: `cd server && npm start`
6. Add environment variables from `.env`

**Railway:**
1. Create account at [railway.app](https://railway.app)
2. Create new project from GitHub
3. Set root directory to `server`
4. Add environment variables

### Frontend (Vercel / Netlify)

**Vercel:**
1. Create account at [vercel.com](https://vercel.com)
2. Import GitHub repository
3. Set root directory to `client`
4. Set build command: `npm run build`
5. Set output directory: `dist`
6. Add environment variable: `VITE_API_URL=<your-backend-url>/api`

**Netlify:**
1. Create account at [netlify.com](https://netlify.com)
2. Import repository
3. Set base directory to `client`
4. Set build command: `npm run build`
5. Set publish directory: `dist`
6. Add environment variable

## 🧪 Testing

### Test Backend API
```bash
# Health check
curl http://localhost:5000/api/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ro-service.com","password":"admin123"}'

# Get customers (with token)
curl http://localhost:5000/api/customers \
  -H "Authorization: Bearer <your-token>"
```

### Test Scheduler
```bash
curl http://localhost:5000/api/cron/check-due
```

## 🐛 Troubleshooting

### MongoDB Connection Error
- Check `MONGODB_URI` is correct
- Ensure IP address is whitelisted in MongoDB Atlas
- Verify network access settings

### Cloudinary Upload Fails
- Verify API credentials
- Check file size (max 5MB)
- Ensure file is an image

### Notifications Not Sending
- Check Twilio/SendGrid credentials
- Verify phone numbers are in correct format (+country code)
- Check `TECH_PHONE` and `TECH_EMAIL` are set

### Google Sheets Sync Fails
- Verify service account email has access to the sheet
- Check `GOOGLE_SPREADSHEET_ID` is correct
- Ensure private key is properly formatted (with `\n` for newlines)

## 📝 License

MIT

## 👥 Support

For issues or questions, please create an issue in the repository.

---

**Built with ❤️ using MERN Stack**
