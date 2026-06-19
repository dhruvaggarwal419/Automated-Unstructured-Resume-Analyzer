# Resume World - New Frontend Implementation

## Overview
Resume World has been completely redesigned with a role-based multi-user system featuring three distinct user types: Resume Users, Recruiters, and Admins.

## Architecture

### User Roles

#### 1. Resume User (Job Seekers)
**Purpose**: Upload and optimize resumes with AI-powered analysis

**Flow**:
1. Select "Resume User" from landing page
2. Login/Signup
3. Experience Questions:
   - "Do you have work experience?" (Yes/No)
   - If Yes: "Are you looking for a job switch?" with options:
     - Yes, looking for a job switch
     - No, just optimizing my resume
     - Other reasons (upskilling/preparation)
   - If No: Automatically set as "Fresher"
4. Upload Resume (PDF, DOC, DOCX)
5. Share Preference: "Share with recruiters?" (Yes/No)
6. AI Analysis with detailed results:
   - Overall ATS Score
   - Keyword Match Score
   - Format Quality Score
   - Skills Match Score
   - Experience Score
   - Improvement Suggestions
7. Resume History: View all previously uploaded resumes

**Features**:
- AI-powered resume analysis
- ATS score calculation
- Detailed improvement suggestions
- Resume history tracking
- Optional sharing with recruiters

#### 2. Recruiter
**Purpose**: Find and rank candidates based on job requirements

**Flow**:
1. Select "Recruiter" from landing page
2. Login/Signup
3. Email Verification:
   - Enter company email
   - Receive verification code
   - Verify company affiliation
4. Post Job Description
5. View Ranked Candidates:
   - Candidates sorted by ATS score
   - Filter by minimum score
   - Filter by experience level
   - View detailed candidate profiles
6. Contact Candidates

**Features**:
- Company email verification
- Job description posting
- AI-powered candidate matching
- ATS score-based ranking
- Advanced filtering options
- Direct candidate contact

#### 3. Admin
**Purpose**: Manage platform users and system integrity

**Flow**:
1. Select "Admin" from landing page
2. Login (Admin credentials required)
3. Dashboard with:
   - User statistics
   - Recruiter statistics
   - Admin count
4. User Management Tabs:
   - Resume Users tab
   - Recruiters tab
   - Admins tab
5. Actions:
   - Add new admins
   - Edit user details
   - Remove users/recruiters
   - View user activity

**Features**:
- Full platform control
- User management (CRUD operations)
- Admin creation/removal
- Activity monitoring
- System statistics

## Technical Stack

### Frontend Components
```
src/
├── App.tsx                          # Main app with routing logic
├── components/
│   ├── LandingPage.tsx             # Role selection page
│   ├── AuthPage.tsx                # Login/Signup for all roles
│   ├── ResumeUserDashboard.tsx     # Resume user interface
│   ├── RecruiterDashboard.tsx      # Recruiter interface
│   └── AdminDashboard.tsx          # Admin panel
```

### Backend Models
```
server/
├── models/
│   ├── User.ts                     # User model with roles
│   └── Resume.ts                   # Resume model with sharing
```

**User Model Fields**:
- email, password, name
- role: 'user' | 'recruiter' | 'admin'
- isVerified: boolean (for recruiters)
- companyEmail: string (for recruiters)

**Resume Model Fields**:
- userId, fileName, fileData, fileType
- experienceLevel: 'fresher' | 'experienced' | 'entry' | 'mid' | 'senior'
- isJobSwitch: boolean
- jobSwitchReason: string
- shareWithRecruiters: boolean
- analysisResult: (detailed scores and suggestions)

## Key Features

### 1. Role-Based Authentication
- Users select their role before authentication
- Role-specific dashboards
- Role-based permissions

### 2. Smart Resume Analysis
- AI-powered ATS scoring
- Multi-dimensional analysis:
  - Keywords matching
  - Format quality
  - Skills assessment
  - Experience evaluation
- Actionable improvement suggestions

### 3. Recruiter Verification
- Company email verification system
- Prevents spam and ensures legitimate recruiters
- Verification code via email

### 4. Privacy Controls
- Users control resume sharing
- Recruiters only see shared resumes
- Privacy-first approach

### 5. Admin Controls
- Centralized user management
- Admin delegation
- Platform monitoring
- User activity tracking

## User Flows

### Resume User Journey
```
Landing Page → Select "Resume User" → Login/Signup → 
Experience Question → Job Switch Question (if experienced) → 
Upload Resume → Share Preference → AI Analysis → Results/History
```

### Recruiter Journey
```
Landing Page → Select "Recruiter" → Login/Signup → 
Email Verification → Post Job Description → 
View Ranked Candidates → Filter/Search → Contact Candidates
```

### Admin Journey
```
Landing Page → Select "Admin" → Login → 
Dashboard Statistics → Select User Type Tab → 
Manage Users (Add/Edit/Delete) → Monitor Activity
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account (with role)
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Resume Management
- `POST /api/resume/upload` - Upload and analyze resume
- `GET /api/resume/history` - Get user's resume history
- `GET /api/resume/:id` - Get specific resume

## Styling
- Tailwind CSS for responsive design
- Role-specific color schemes:
  - Resume User: Indigo/Blue
  - Recruiter: Green/Emerald
  - Admin: Red/Pink
- Gradient backgrounds
- Modern card-based UI
- Lucide React icons

## Future Enhancements
1. Real-time notifications
2. Advanced candidate filtering for recruiters
3. Resume templates for users
4. Analytics dashboard for admins
5. Email integration for recruiter verification
6. PDF report generation
7. Interview scheduling
8. Skill gap analysis
9. Industry-specific resume optimization
10. Multi-language support

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Start Backend Server**:
   ```bash
   npm run server
   ```

4. **Access Application**:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000

## Environment Variables
```env
VITE_API_URL=http://localhost:5000/api
JWT_SECRET=your-secret-key
MONGODB_URI=your-mongodb-connection-string
NODE_ENV=development
```

## Security Considerations
- Password hashing with bcrypt
- JWT authentication
- HttpOnly cookies
- Role-based access control
- Email verification for recruiters
- Protected admin routes

## Contributing
This is a complete redesign. All components are modular and can be extended independently.
