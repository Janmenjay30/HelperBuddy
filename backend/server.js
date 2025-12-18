const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const noteRoutes = require('./routes/notes');
const reminderRoutes = require('./routes/reminders');

// Import reminder service
const { checkAndSendReminders } = require('./services/reminderService');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`);
  next();
});

const startReminderCron = () => {
  cron.schedule('* * * * *', () => {
    console.log('🔔 Checking for reminders...');
    checkAndSendReminders();
  });
};

// Connect to MongoDB
if (!process.env.MONGODB_URI) {
  console.warn('⚠️  MONGODB_URI is not set. Backend will try localhost:27017 and likely fail in Docker/EC2.');
}

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/helperbuddy')
  .then(() => {
    console.log('✅ Connected to MongoDB');
    startReminderCron();
  })
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/reminders', reminderRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'HelperBuddy API is running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
