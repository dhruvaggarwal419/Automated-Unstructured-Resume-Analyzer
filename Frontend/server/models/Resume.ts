import mongoose, { Document, Schema } from 'mongoose';

export interface IResume extends Document {
  userId: mongoose.Types.ObjectId;
  fileName: string;
  fileData: string; // Base64 encoded file data
  fileType: string;
  experienceLevel: string;
  isJobSwitch: boolean;
  jobSwitchReason?: string;
  shareWithRecruiters: boolean;
  moderationStatus?: 'pending' | 'approved' | 'rejected';
  moderationNote?: string;
  moderatedBy?: mongoose.Types.ObjectId;
  moderatedAt?: Date;
  analysisResult?: {
    keywords: string[];
    matches: Array<{ keyword: string; count: number }>;
    missing: string[];
    coverageScore: number;
    actionVerbCount: number;
    quantifiedBulletCount: number;
    sectionsPresent: string[];
    atsTips: string[];
    overallScore: number;
    keywordScore?: number;
    formatScore?: number;
    skillsScore?: number;
    experienceScore?: number;
    suggestions?: string[];
  };
  jobDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const resumeSchema = new Schema<IResume>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileData: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  experienceLevel: {
    type: String,
    required: true,
    enum: ['fresher', 'experienced', 'entry', 'mid', 'senior']
  },
  isJobSwitch: {
    type: Boolean,
    default: false
  },
  jobSwitchReason: {
    type: String
  },
  shareWithRecruiters: {
    type: Boolean,
    default: false
  },
  moderationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  moderationNote: {
    type: String
  },
  moderatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: {
    type: Date
  },
  analysisResult: {
    keywords: [String],
    matches: [{
      keyword: String,
      count: Number
    }],
    missing: [String],
    coverageScore: Number,
    actionVerbCount: Number,
    quantifiedBulletCount: Number,
    sectionsPresent: [String],
    atsTips: [String],
    overallScore: Number,
    keywordScore: Number,
    formatScore: Number,
    skillsScore: Number,
    experienceScore: Number,
    suggestions: [String]
  },
  jobDescription: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
resumeSchema.pre('save', function() {
  this.updatedAt = new Date();
});

export default mongoose.model<IResume>('Resume', resumeSchema);
