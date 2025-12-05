// // const express = require('express');
// // const cors = require('cors');
// // const dotenv = require('dotenv');
// // const connectDB = require('./config/db');
// // const cron = require('node-cron');
// // const { checkDueServices } = require('./utils/scheduler');

// // // Load environment variables
// // dotenv.config();

// // // Initialize Express app
// // const app = express();

// // // Connect to MongoDB
// // connectDB();

// // const mongoose = require('mongoose');

// // const connectDB = async () => {
// //   try {
// //     const conn = await mongoose.connect(process.env.MONGODB_URI, {
// //       useNewUrlParser: true,
// //       useUnifiedTopology: true,
// //     });

// //     console.log(`MongoDB Connected: ${conn.connection.host}`);
// //   } catch (error) {
// //     console.error(`Error: ${error.message}`);
// //     process.exit(1);
// //   }
// // };

// // module.exports = connectDB;


// // // Middleware
// // app.use(cors({
// //   origin: process.env.CLIENT_URL || 'http://localhost:3000',
// //   credentials: true
// // }));
// // app.use(express.json());
// // app.use(express.urlencoded({ extended: true }));

// // // Routes
// // app.use('/api/auth', require('./routes/auth'));
// // app.use('/api/customers', require('./routes/customers'));
// // app.use('/api/records', require('./routes/records'));
// // app.use('/api/upload', require('./routes/upload'));
// // app.use('/api/notifications', require('./routes/notifications'));
// // app.use('/api/sync', require('./routes/sync'));

// // // Health check
// // app.get('/api/health', (req, res) => {
// //   res.json({ status: 'OK', message: 'Server is running' });
// // });

// // // Cron job - Check for due services every day at 8 AM
// // cron.schedule('0 8 * * *', async () => {
// //   console.log('Running scheduled notification check...');
// //   await checkDueServices();
// // });

// // // Error handling middleware
// // app.use((err, req, res, next) => {
// //   console.error(err.stack);
// //   res.status(err.status || 500).json({
// //     success: false,
// //     message: err.message || 'Internal Server Error'
// //   });
// // });

// // // Start server
// // const PORT = process.env.PORT || 5000;
// // app.listen(PORT, () => {
// //   console.log(`Server running on port ${PORT}`);
// //   console.log(`Environment: ${process.env.NODE_ENV}`);
// // });


// const express = require('express');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const cron = require('node-cron');
// const connectDB = require('./config/db');
// const { checkDueServices } = require('./utils/scheduler');

// // Load environment variables
// dotenv.config();

// // Initialize app
// const app = express();

// // Connect MongoDB
// connectDB();

// // Middlewares
// app.use(cors({
//   origin: process.env.CLIENT_URL || "http://localhost:3000",
//   credentials: true
// }));

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Routes
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/customers', require('./routes/customers'));
// app.use('/api/records', require('./routes/records'));
// app.use('/api/upload', require('./routes/upload'));
// app.use('/api/notifications', require('./routes/notifications'));
// app.use('/api/sync', require('./routes/sync'));

// // Health Check
// app.get('/api/health', (req, res) => {
//   res.json({ status: "OK", message: "Server Running" });
// });

// // Cron: Run every day at 8 AM
// cron.schedule("0 8 * * *", async () => {
//   console.log("🔔 Running Scheduled Service Check...");
//   await checkDueServices();
// });

// // Global Error Handler
// app.use((err, req, res, next) => {
//   console.error("❌ Error:", err.stack);
//   res.status(err.status || 500).json({
//     success: false,
//     message: err.message || "Internal Server Error"
//   });
// });

// // Start server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
//   console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
// });


const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const cron = require('node-cron');
const { checkDueServices } = require('./utils/scheduler');

// Load environment variables
dotenv.config();
console.log(process.env.PORT, "???????????");

// Initialize Express app
const app = express();

// --------------------------
//  DATABASE CONFIG (INLINE)
// --------------------------
connectDB();

// --------------------------
//  MIDDLEWARES
// --------------------------
app.use(cors({
  // origin: "http://localhost:3000", // Local development
  origin: process.env.CLIENT_URL || "https://namma-kadai-pi.vercel.app", // Production
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --------------------------
//  ROUTES
// --------------------------
app.use('/api/auth', require('./routes/auth'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/records', require('./routes/records'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/sync', require('./routes/sync'));

// Test routes (development only)
if (process.env.NODE_ENV === 'development') {
  app.use('/api/test', require('./routes/test'));
  console.log('🧪 Test routes enabled (development mode)');
}

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// --------------------------
//  CRON JOB (DAILY 8AM)
// --------------------------
cron.schedule("0 8 * * *", async () => {
  console.log("🔔 Checking for upcoming service reminders...");
  await checkDueServices();
});

// --------------------------
//  GLOBAL ERROR HANDLER
// --------------------------
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

// --------------------------
//  START SERVER (Local only)
// --------------------------
const PORT = process.env.PORT || 5000;

// Only start server if not in Vercel environment
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  });
}

// Export for Vercel serverless
module.exports = app;
