# Resume World - MongoDB Setup & Quick Start Guide

## ✅ MongoDB Connection Status
Your application is now **fully connected to MongoDB** and ready to use!

## 🗄️ Database Structure

### Database Name: `resume-world`
Located at: `mongodb://localhost:27017/resume-world`

### Collections:

#### 1. **users** Collection
Stores all user accounts (Resume Users, Recruiters, and Admins)
- Fields: name, email, password (hashed), role, isVerified, companyEmail, createdAt
- Indexes: email (unique)

#### 2. **resumes** Collection  
Stores all uploaded resumes with analysis results
- Fields: userId, fileName, fileData (base64), fileType, experienceLevel, isJobSwitch, jobSwitchReason, shareWithRecruiters, analysisResult, createdAt, updatedAt
- Indexes: userId, shareWithRecruiters

## 🚀 How It Works

### User Authentication Flow:
1. **Signup**: User data is saved to MongoDB `users` collection
2. **Login**: Credentials are verified against MongoDB
3. **Session**: JWT token is issued and stored in httpOnly cookie
4. **No signup = No login**: Only registered users can access the system

### Resume Upload Flow:
1. User uploads resume (PDF/DOC/DOCX)
2. File is converted to base64 and stored in MongoDB
3. AI analysis is performed immediately
4. Resume + analysis is **permanently saved** in `resumes` collection
5. User can view their resumes anytime from history

### Data Persistence:
- ✅ All user accounts are permanently stored
- ✅ All resumes are permanently stored
- ✅ All analysis results are permanently stored
- ✅ Resume sharing preferences are saved
- ✅ Users can access their history anytime

## 📊 Current Setup

### Environment Variables (.env):
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/resume-boost
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Server Status:
- ✅ Frontend: http://localhost:5173
- ✅ Backend: http://localhost:5000
- ✅ MongoDB: Connected Successfully
- ✅ API Endpoints: Active

## 🎯 Using the Application

### 1. Create Your First Admin Account
1. Go to http://localhost:5173
2. Click "Admin" role
3. Click "Sign Up" (top right)
4. Enter your details
5. You're now the admin!

### 2. Create Resume User Account
1. Go back to landing page
2. Click "Resume User" role
3. Sign up with your details
4. Follow the experience questions
5. Upload your resume
6. Get instant AI analysis
7. View your resume history anytime

### 3. Create Recruiter Account
1. Go back to landing page
2. Click "Recruiter" role
3. Sign up with company email
4. System auto-verifies for now
5. Post job description
6. View ranked candidates who shared their resumes

## 🔐 Security Features

### Authentication:
- ✅ Password hashing with bcrypt
- ✅ JWT tokens with 7-day expiry
- ✅ HttpOnly cookies (XSS protection)
- ✅ CORS enabled for localhost

### Authorization:
- ✅ Role-based access control (user/recruiter/admin)
- ✅ Protected routes with authentication middleware
- ✅ Admin-only endpoints for user management

### Data Privacy:
- ✅ Resumes only visible to owner and recruiters (if shared)
- ✅ User passwords never exposed in API responses
- ✅ File data excluded from list views for performance

## 📁 API Endpoints

### Authentication (`/api/auth`)
- `POST /signup` - Create new account (any role)
- `POST /login` - User login
- `POST /logout` - User logout
- `GET /me` - Get current user info

### Admin Only (`/api/auth/admin`)
- `GET /users?role=user|recruiter|admin` - Get users by role
- `DELETE /users/:userId` - Delete user
- `PUT /users/:userId` - Update user

### Resumes (`/api/resume`)
- `POST /upload` - Upload resume (FormData with file)
- `GET /history` - Get user's resume history
- `GET /:resumeId` - Get specific resume
- `DELETE /:resumeId` - Delete resume
- `POST /recruiter/search` - Search candidates (recruiters only)

## 💾 Data Storage Details

### Resume Storage:
- Files are stored as **base64 strings** in MongoDB
- Max file size: **10MB**
- Supported formats: PDF, DOC, DOCX
- Files are **never deleted** unless user explicitly removes them

### Analysis Storage:
- Analysis results stored with each resume
- Includes: scores, keywords, suggestions
- Permanently linked to resume document
- Accessible anytime via history

### User Data:
- All user accounts stored permanently
- Passwords hashed (never stored in plain text)
- Email used as unique identifier
- Role determines access level

## 🔄 Running the Application

### Start Both Servers:
```bash
cd resume-boost
npm run dev:all
```

This runs:
- Frontend (Vite): http://localhost:5173
- Backend (Express): http://localhost:5000
- MongoDB: localhost:27017

### Individual Commands:
```bash
# Frontend only
npm run dev

# Backend only
npm run dev:server
```

## 🛠️ Database Management

### View Your Data:
You can use MongoDB Compass or command line:
```bash
mongosh
use resume-world
db.users.find()
db.resumes.find()
```

### Clear Data (if needed):
```bash
mongosh
use resume-world
db.users.deleteMany({})
db.resumes.deleteMany({})
```

## ✨ Features Confirmed Working

✅ User signup with role selection
✅ User login with validation
✅ MongoDB persistent storage
✅ Resume upload with file handling
✅ AI-powered resume analysis
✅ Resume history tracking
✅ Resume sharing with recruiters
✅ Recruiter candidate search
✅ Admin user management
✅ Role-based dashboards
✅ Session management with JWT

## 🎉 Ready to Use!

Your application is fully functional with:
- MongoDB database connected
- All user roles working
- Resume upload and analysis operational
- Permanent data storage
- Secure authentication

Just open http://localhost:5173 and start using Resume World!
