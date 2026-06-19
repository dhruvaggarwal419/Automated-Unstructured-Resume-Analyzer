import express, { Request, Response } from 'express';
import User from '../models/User';
import Resume from '../models/Resume';
import Settings from '../models/Settings';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

const requireAdmin = async (req: AuthRequest, res: Response, next: () => void) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getSettingsDoc = async () => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  return settings;
};

router.use(requireAdmin);

router.get('/users', async (req: AuthRequest, res: Response) => {
  try {
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

router.post('/admins', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      existingUser.role = 'admin';
      existingUser.isVerified = true;
      if (name) {
        existingUser.name = name;
      }
      if (password) {
        existingUser.password = password;
      }
      await existingUser.save();
      return res.json({ message: 'Admin access granted to existing user', user: existingUser });
    }

    if (!name || !password) {
      return res.status(400).json({ message: 'Name and password are required for new admins' });
    }

    const newAdmin = await User.create({
      name,
      email,
      password,
      role: 'admin',
      isVerified: true
    });

    res.status(201).json({ message: 'Admin created successfully', user: newAdmin });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/users/:userId', async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { name, email, role, isVerified } = req.body;

    if (userId === req.userId && role && role !== 'admin') {
      return res.status(400).json({ message: 'Cannot remove your own admin role' });
    }

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

router.delete('/users/:userId', async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    if (userId === req.userId) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await User.findByIdAndDelete(userId);
    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/resumes', async (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;
    const query: any = {};

    if (status && status !== 'all') {
      if (status === 'pending') {
        query.$or = [{ moderationStatus: 'pending' }, { moderationStatus: { $exists: false } }];
      } else {
        query.moderationStatus = status;
      }
    }

    if (search && typeof search === 'string') {
      query.fileName = { $regex: search, $options: 'i' };
    }

    const resumes = await Resume.find(query)
      .select('-fileData')
      .populate('userId', 'name email role isVerified')
      .sort({ createdAt: -1 });

    res.json({ resumes, count: resumes.length });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.patch('/resumes/:resumeId/moderation', async (req: Request, res: Response) => {
  try {
    const { resumeId } = req.params;
    const { status, note } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid moderation status' });
    }

    const resume = await Resume.findByIdAndUpdate(
      resumeId,
      {
        moderationStatus: status,
        moderationNote: note || undefined,
        moderatedBy: (req as AuthRequest).userId,
        moderatedAt: new Date()
      },
      { new: true }
    ).select('-fileData');

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    res.json({ resume, message: 'Moderation status updated' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/resumes/:resumeId', async (req: Request, res: Response) => {
  try {
    const { resumeId } = req.params;

    const resume = await Resume.findByIdAndDelete(resumeId);
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    res.json({ message: 'Resume deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/overview', async (req: Request, res: Response) => {
  try {
    const [totalUsers, totalRecruiters, totalAdmins, totalResumes, verifiedUsers] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'recruiter' }),
      User.countDocuments({ role: 'admin' }),
      Resume.countDocuments({}),
      User.countDocuments({ isVerified: true })
    ]);

    const [pendingResumes, approvedResumes, rejectedResumes] = await Promise.all([
      Resume.countDocuments({ $or: [{ moderationStatus: 'pending' }, { moderationStatus: { $exists: false } }] }),
      Resume.countDocuments({ moderationStatus: 'approved' }),
      Resume.countDocuments({ moderationStatus: 'rejected' })
    ]);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);

    const [userDaily, resumeDaily] = await Promise.all([
      User.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        }
      ]),
      Resume.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const buildDailySeries = (rows: Array<{ _id: string; count: number }>) => {
      const map = new Map(rows.map((row) => [row._id, row.count]));
      const series: Array<{ date: string; count: number }> = [];
      const cursor = new Date(startDate);
      for (let i = 0; i < 7; i++) {
        const key = cursor.toISOString().slice(0, 10);
        series.push({ date: key, count: map.get(key) || 0 });
        cursor.setDate(cursor.getDate() + 1);
      }
      return series;
    };

    res.json({
      totals: {
        users: totalUsers,
        recruiters: totalRecruiters,
        admins: totalAdmins,
        resumes: totalResumes,
        verifiedUsers
      },
      moderation: {
        pending: pendingResumes,
        approved: approvedResumes,
        rejected: rejectedResumes
      },
      trends: {
        users: buildDailySeries(userDaily),
        resumes: buildDailySeries(resumeDaily)
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/settings', async (req: Request, res: Response) => {
  try {
    const settings = await getSettingsDoc();
    res.json({ settings });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/settings', async (req: Request, res: Response) => {
  try {
    const { maintenanceMode, allowUserSignup, allowRecruiterSignup } = req.body;
    const settings = await getSettingsDoc();

    if (typeof maintenanceMode === 'boolean') {
      settings.maintenanceMode = maintenanceMode;
    }
    if (typeof allowUserSignup === 'boolean') {
      settings.allowUserSignup = allowUserSignup;
    }
    if (typeof allowRecruiterSignup === 'boolean') {
      settings.allowRecruiterSignup = allowRecruiterSignup;
    }

    await settings.save();

    res.json({ message: 'Settings updated', settings });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
