# Resume World - Testing Guide

## Test the Setup

### 1. Check if servers are running:
Open your browser and check:
- Frontend: http://localhost:5173 (should show Resume World landing page)
- Backend: http://localhost:5000/api/auth/me (should return JSON)

### 2. Test User Signup

#### Create an Admin:
1. Go to http://localhost:5173
2. Click "Admin" card
3. Click "Sign Up" (top right)
4. Fill in:
   - Name: Test Admin
   - Email: admin@test.com
   - Password: admin123
5. Click "Sign Up"
6. You should be logged in to the Admin Dashboard

#### Create a Resume User:
1. Logout or open incognito window
2. Go to http://localhost:5173
3. Click "Resume User" card
4. Sign up with your details
5. Answer experience questions
6. Upload a resume (any PDF/DOC file)
7. Choose sharing preference
8. View your analysis results

#### Create a Recruiter:
1. Logout or open incognito window
2. Go to http://localhost:5173  
3. Click "Recruiter" card
4. Sign up with your details
5. Skip verification for now (auto-verified)
6. Post a job description
7. Search for candidates

### 3. Verify MongoDB Storage

#### Check using MongoDB Compass:
1. Open MongoDB Compass
2. Connect to: mongodb://localhost:27017
3. Open database: resume-world
4. Check collections: users, resumes

#### Or use command line:
```bash
mongosh
use resume-world
db.users.find().pretty()
db.resumes.find().pretty()
```

### 4. Test Resume Upload
1. Login as Resume User
2. Upload any PDF/DOC file
3. Wait for analysis (should take 1-2 seconds)
4. View results
5. Logout and login again
6. Click "History" - your resume should still be there!

### 5. Test Admin Functions
1. Login as Admin
2. View statistics at top
3. Switch between tabs (Users, Recruiters, Admins)
4. See all registered users
5. Try searching for users

## Troubleshooting

### "Failed to fetch" error:
**Solution**: Make sure both servers are running:
```bash
cd resume-boost
npm run dev:all
```

### MongoDB connection error:
**Solution**: Make sure MongoDB is running:
```bash
# Check MongoDB status
mongosh
```

### Can't login after signup:
**Solution**: Check browser console for errors. Make sure cookies are enabled.

### Resume upload fails:
**Solution**: 
- Check file size (max 10MB)
- Use PDF, DOC, or DOCX format only
- Check browser console for errors

## Expected Behavior

### After Signup:
✅ User is automatically logged in
✅ Redirected to role-specific dashboard
✅ User data saved in MongoDB

### After Resume Upload:
✅ File uploaded successfully
✅ Analysis performed immediately
✅ Results displayed
✅ Resume saved permanently in MongoDB
✅ Can view in history anytime

### After Login:
✅ Session persists
✅ Can navigate between pages
✅ Can access history
✅ Data loads from MongoDB

## MongoDB Collections Structure

### users collection:
```json
{
  "_id": ObjectId("..."),
  "name": "John Doe",
  "email": "john@example.com",
  "password": "$2a$10$..." (hashed),
  "role": "user",
  "isVerified": true,
  "createdAt": ISODate("2026-02-03...")
}
```

### resumes collection:
```json
{
  "_id": ObjectId("..."),
  "userId": ObjectId("..."),
  "fileName": "resume.pdf",
  "fileData": "base64string...",
  "fileType": "application/pdf",
  "experienceLevel": "experienced",
  "isJobSwitch": true,
  "shareWithRecruiters": true,
  "analysisResult": {
    "overallScore": 85,
    "keywordScore": 90,
    "formatScore": 80,
    "skillsScore": 85,
    "experienceScore": 88,
    "suggestions": [...]
  },
  "createdAt": ISODate("..."),
  "updatedAt": ISODate("...")
}
```

## Success Indicators

When everything is working correctly, you should see:
1. ✅ "MongoDB Connected Successfully" in terminal
2. ✅ "Server running on port 5000" in terminal  
3. ✅ Vite server running on port 5173
4. ✅ Landing page loads without errors
5. ✅ Can signup/login successfully
6. ✅ Can upload resumes
7. ✅ Can view history
8. ✅ Data persists after logout/login

All data is now permanently stored in MongoDB! 🎉
