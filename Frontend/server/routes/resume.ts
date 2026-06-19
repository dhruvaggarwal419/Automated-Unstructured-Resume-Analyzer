import express, { Request, Response } from 'express';
import multer from 'multer';
import Resume from '../models/Resume';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { analyzeResume } from '../lib/analyzer';

const router = express.Router();

// Configure multer for file uploads (store in memory)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'));
    }
  }
});

// All routes require authentication
router.use(authenticateToken);

// Create/Upload new resume with FormData
router.post('/upload', upload.single('resume'), async (req: AuthRequest, res: Response) => {
  try {
    const file = req.file;
    const { experienceLevel, isJobSwitch, jobSwitchReason, shareWithRecruiters } = req.body;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    if (!experienceLevel) {
      return res.status(400).json({ message: 'Experience level is required' });
    }

    // Convert file buffer to base64
    const fileData = file.buffer.toString('base64');

    // Perform analysis
    const analysisResult = await analyzeResume(fileData, file.mimetype, experienceLevel);

    // Create resume document
    const shareFlag = shareWithRecruiters === 'true';
    const resume = new Resume({
      userId: req.userId,
      fileName: file.originalname,
      fileData,
      fileType: file.mimetype,
      experienceLevel,
      isJobSwitch: isJobSwitch === 'true',
      jobSwitchReason,
      shareWithRecruiters: shareFlag,
      moderationStatus: shareFlag ? 'pending' : 'approved',
      analysisResult
    });

    await resume.save();

    res.status(201).json({
      message: 'Resume uploaded and analyzed successfully',
      resume: {
        id: resume._id,
        fileName: resume.fileName,
        experienceLevel: resume.experienceLevel,
        createdAt: resume.createdAt
      },
      analysis: analysisResult
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update resume with analysis result
router.put('/:resumeId/analysis', async (req: AuthRequest, res: Response) => {
  try {
    const { resumeId } = req.params;
    const { analysisResult } = req.body;

    const resume = await Resume.findOne({ _id: resumeId, userId: req.userId });
    
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    resume.analysisResult = analysisResult;
    await resume.save();

    res.json({
      message: 'Analysis saved successfully',
      resume
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all resumes for current user
router.get('/history', async (req: AuthRequest, res: Response) => {
  try {
    const resumes = await Resume.find({ userId: req.userId })
      .select('-fileData') // Exclude large file data from list
      .sort({ createdAt: -1 });

    res.json({ resumes });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get specific resume by ID
router.get('/:resumeId', async (req: AuthRequest, res: Response) => {
  try {
    const { resumeId } = req.params;
    
    const resume = await Resume.findOne({ _id: resumeId, userId: req.userId });
    
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    res.json({ resume });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete resume
router.delete('/:resumeId', async (req: AuthRequest, res: Response) => {
  try {
    const { resumeId } = req.params;
    
    const resume = await Resume.findOneAndDelete({ _id: resumeId, userId: req.userId });
    
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    res.json({ message: 'Resume deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get shared resumes for recruiters (filtered by job description)
router.post('/recruiter/search', async (req: AuthRequest, res: Response) => {
  try {
    const { jobDescription, minScore, experienceLevel } = req.body;

    // Build query for resumes shared with recruiters
    const query: any = { shareWithRecruiters: true };
    query.$or = [{ moderationStatus: 'approved' }, { moderationStatus: { $exists: false } }];
    
    if (experienceLevel && experienceLevel !== 'all') {
      query.experienceLevel = experienceLevel;
    }

    if (minScore) {
      query['analysisResult.overallScore'] = { $gte: minScore };
    }

    const resumes = await Resume.find(query)
      .select('-fileData') // Exclude file data for performance
      .populate('userId', 'name email')
      .sort({ 'analysisResult.overallScore': -1 })
      .limit(50);

    res.json({ resumes, count: resumes.length });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
