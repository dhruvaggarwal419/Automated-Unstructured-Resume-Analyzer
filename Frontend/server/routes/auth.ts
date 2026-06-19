import express, { Request, Response } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Settings from '../models/Settings';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { sendVerificationEmail } from '../lib/email';

const router = express.Router();

const getSettings = async () => {
  const settings = await Settings.findOne();
  return {
    maintenanceMode: settings?.maintenanceMode ?? false,
    allowUserSignup: settings?.allowUserSignup ?? true,
    allowRecruiterSignup: settings?.allowRecruiterSignup ?? true
  };
};

// Signup
router.post('/signup', async (req: Request, res: Response) => {
  try {
    console.log('Signup request received:', req.body);
    const { email, password, name, role } = req.body;
    const normalizedRole = role || 'user';
    const settings = await getSettings();

    if (settings.maintenanceMode) {
      return res.status(503).json({ message: 'Maintenance mode is active. Please try again later.' });
    }

    if (normalizedRole === 'user' && !settings.allowUserSignup) {
      return res.status(403).json({ message: 'User signup is currently disabled' });
    }

    if (normalizedRole === 'recruiter' && !settings.allowRecruiterSignup) {
      return res.status(403).json({ message: 'Recruiter signup is currently disabled' });
    }

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (normalizedRole === 'recruiter' && !email) {
      return res.status(400).json({ message: 'Company email is required for recruiters' });
    }

    if (normalizedRole === 'admin') {
      return res.status(403).json({ message: 'Admin signup is disabled. Ask an admin to create your account.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create new user
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex');

    const user = new User({
      email,
      password,
      name,
      role: normalizedRole,
      isVerified: false,
      companyEmail: normalizedRole === 'recruiter' ? email : undefined,
      emailVerificationToken: verificationTokenHash,
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
    await user.save();

    await sendVerificationEmail({
      to: email,
      name,
      token: verificationToken
    });
    res.status(201).json({
      message: 'Verification email sent. Please verify to login.',
      verificationRequired: true
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const settings = await getSettings();
    if (settings.maintenanceMode && user.role !== 'admin') {
      return res.status(503).json({ message: 'Maintenance mode is active. Please try again later.' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
        companyName: user.companyName,
        companyEmail: user.companyEmail,
        designation: user.designation
      },
      token
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify email
router.get('/verify-email', async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ message: 'Invalid verification token' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      emailVerificationToken: tokenHash,
      emailVerificationExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Verification link is invalid or expired' });
    }

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Logout
router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ message: 'Logout successful' });
});

// Get current user
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
        companyName: user.companyName,
        companyEmail: user.companyEmail,
        designation: user.designation
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update profile details
router.put('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { companyName, companyEmail, designation } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'recruiter') {
      if (!companyName || !companyEmail || !designation) {
        return res.status(400).json({ message: 'Company name, company email, and designation are required' });
      }
    }

    user.companyName = companyName || user.companyName;
    user.companyEmail = companyEmail || user.companyEmail;
    user.designation = designation || user.designation;
    await user.save();

    res.json({
      message: 'Profile updated',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
        companyName: user.companyName,
        companyEmail: user.companyEmail,
        designation: user.designation
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin routes - Get all users
router.get('/admin/users', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { role } = req.query;
    const query: any = {};
    if (role) {
      query.role = role;
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json({ users, count: users.length });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin routes - Delete user
router.delete('/admin/users/:userId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { userId } = req.params;
    
    // Prevent admin from deleting themselves
    if (userId === req.userId) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await User.findByIdAndDelete(userId);
    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin routes - Update user
router.put('/admin/users/:userId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { userId } = req.params;
    const { name, email, role, isVerified } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email, role, isVerified },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: updatedUser, message: 'User updated successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
