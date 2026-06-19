# 🚀 Quick Start - Resume Boost with MongoDB

## ⚡ Start in 3 Steps

### 1️⃣ Install & Setup MongoDB

**Windows:**
```bash
# Download from: https://www.mongodb.com/try/download/community
# After installation:
net start MongoDB
```

**macOS:**
```bash
brew install mongodb-community
brew services start mongodb-community
```

**Or use MongoDB Atlas (Cloud - Free):**
- Sign up at https://www.mongodb.com/atlas
- Create cluster → Get connection string → Update `.env`

### 2️⃣ Verify Environment Variables

Check [.env](server\.env) file exists with:
```env
MONGODB_URI=mongodb://localhost:27017/resume-boost
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
```

### 3️⃣ Run Application

```bash
npm run dev:all
```

Visit: **http://localhost:5173** 🎉

---

## 📋 Complete Command Reference

```bash
# Install dependencies (first time only)
npm install

# Run both frontend + backend
npm run dev:all

# Run separately
npm run dev              # Frontend only (port 5173)
npm run dev:server       # Backend only (port 5000)

# Build for production
npm run build            # Build frontend
npm run build:server     # Build backend
npm run start:server     # Start production server
```

---

## 🗂️ What Was Created

### Backend Files
```
server/
├── index.ts                    # Express server
├── models/
│   ├── User.ts                 # User authentication
│   └── Resume.ts               # Resume storage
├── routes/
│   ├── auth.ts                 # /api/auth/* endpoints
│   └── resume.ts               # /api/resume/* endpoints
└── middleware/
    └── auth.ts                 # JWT verification
```

### Frontend Updates
```
src/
├── App.tsx                     # Updated with API calls
└── lib/
    └── api.ts                  # API client functions
```

### Configuration
```
.env                            # Backend config
.env.local                      # Frontend config
tsconfig.server.json            # Server TypeScript config
```

---

## 🎯 Features Working Now

✅ User Signup/Login  
✅ Secure Password Storage (bcrypt hashing)  
✅ JWT Token Authentication  
✅ Resume Upload to MongoDB  
✅ Resume History Tracking  
✅ Previous Resume Viewing  
✅ Analysis Storage  
✅ Automatic Session Persistence  

---

## 🔍 Quick Test

1. **Signup:** Open app → Click "Sign up" → Enter details
2. **Upload:** Dashboard → "Analyze New Resume" → Select level → Upload file
3. **History:** View previous resumes on dashboard
4. **Database:** Check MongoDB Compass at `mongodb://localhost:27017`

---

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Current user |
| POST | `/api/resume/upload` | Upload resume |
| GET | `/api/resume/history` | All resumes |
| GET | `/api/resume/:id` | Single resume |
| PUT | `/api/resume/:id/analysis` | Save analysis |
| DELETE | `/api/resume/:id` | Delete resume |

---

## 🐛 Troubleshooting

**MongoDB won't start?**
```bash
# Check if running
mongosh

# Restart
net restart MongoDB    # Windows
brew services restart mongodb-community    # macOS
```

**Port 5000 busy?**
Edit `.env`: `PORT=5001`  
Edit `.env.local`: `VITE_API_URL=http://localhost:5001/api`

**Login not working?**
- Clear browser cookies
- Check MongoDB is running
- Verify JWT_SECRET in `.env`

**Resume not uploading?**
- Check file size < 10MB
- Use PDF, DOC, or DOCX formats
- Verify backend is running on port 5000

---

## 📚 Documentation Files

- **[README.md](README.md)** - Complete documentation
- **[MONGODB_SETUP.md](MONGODB_SETUP.md)** - Detailed MongoDB setup
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - What was built
- **[.env.example](.env.example)** - Environment template

---

## 🎓 Database Schema

**Users:**
```javascript
{
  email: "user@example.com",
  password: "hashed_with_bcrypt",
  name: "User Name",
  createdAt: Date
}
```

**Resumes:**
```javascript
{
  userId: ObjectId,           // Links to user
  fileName: "resume.pdf",
  fileData: "base64_string",  // File content
  fileType: "application/pdf",
  experienceLevel: "mid",     // entry/mid/senior
  analysisResult: {...},      // Analysis data
  createdAt: Date,
  updatedAt: Date
}
```

---

## ✨ Next Steps

1. **Try it:** Run `npm run dev:all` and create an account
2. **Upload:** Test resume upload functionality
3. **Verify:** Check MongoDB for stored data
4. **Customize:** Enhance analysis algorithm
5. **Deploy:** Consider MongoDB Atlas + Vercel/Heroku

---

## 💡 Pro Tips

- Keep MongoDB running while developing
- Use MongoDB Compass for visual database browsing
- Check browser console for API errors
- Environment variables never go in git (already in .gitignore)
- For production: use MongoDB Atlas, strong JWT secret, HTTPS

---

**Ready to go!** 🚀 Run `npm run dev:all` and visit http://localhost:5173

For help, check the documentation files or open an issue.
