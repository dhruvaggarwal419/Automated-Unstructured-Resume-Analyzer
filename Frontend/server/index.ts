import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth';
import resumeRoutes from './routes/resume';
import adminRoutes from './routes/admin';
import User from './models/User';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/admin', adminRoutes);

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/resume-boost');
    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    process.exit(1);
  }
};

const seedAdmin = async () => {
  const name = process.env.ADMIN_SEED_NAME;
  const email = process.env.ADMIN_SEED_EMAIL;
  const password = process.env.ADMIN_SEED_PASSWORD;
  const forceReset = process.env.ADMIN_SEED_RESET === 'true';

  if (!name || !email || !password) {
    return;
  }

  const existingAdmin = await User.findOne({ role: 'admin' });
  if (existingAdmin && !forceReset) {
    return;
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    existingUser.role = 'admin';
    existingUser.isVerified = true;
    if (forceReset) {
      existingUser.password = password;
    }
    await existingUser.save();
    console.log(forceReset ? 'Seed admin reset from existing user.' : 'Seed admin promoted from existing user.');
    return;
  }

  await User.create({
    name,
    email,
    password,
    role: 'admin',
    isVerified: true
  });
  console.log('Seed admin created.');
};

const startServer = async () => {
  await connectDB();
  await seedAdmin();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();

export default app;
