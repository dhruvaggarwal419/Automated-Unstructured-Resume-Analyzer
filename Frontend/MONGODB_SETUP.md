# Quick Start Guide for MongoDB Integration

## What's Been Set Up

Your resume-boost application now has full MongoDB integration with:
- User authentication (signup/login)
- Resume storage and history
- Secure JWT-based sessions
- Backend API server

## Files Created

### Backend Structure
```
server/
├── index.ts                    # Main Express server
├── models/
│   ├── User.ts                 # User schema & authentication
│   └── Resume.ts               # Resume storage schema
├── routes/
│   ├── auth.ts                 # Login/signup/logout endpoints
│   └── resume.ts               # Resume CRUD endpoints
└── middleware/
    └── auth.ts                 # JWT authentication middleware
```

### Frontend Integration
```
src/
└── lib/
    └── api.ts                  # API client for backend calls
```

### Configuration
- `.env` - Backend environment variables
- `.env.local` - Frontend environment variables
- `tsconfig.server.json` - TypeScript config for backend

## Quick Start

### 1. Install MongoDB

**Option A: Local MongoDB (Recommended for development)**
- Windows: Download from https://www.mongodb.com/try/download/community
- macOS: `brew install mongodb-community`
- Linux: `sudo apt-get install mongodb`

**Option B: MongoDB Atlas (Cloud - Free tier available)**
1. Go to https://www.mongodb.com/atlas
2. Create a free cluster
3. Get your connection string
4. Update `.env` with your connection string

### 2. Start MongoDB (if using local)

**Windows:**
```bash
net start MongoDB
```

**macOS/Linux:**
```bash
sudo systemctl start mongodb
# or
brew services start mongodb-community
```

### 3. Configure Environment Variables

The `.env` file is already created with defaults. Update if needed:

```env
MONGODB_URI=mongodb://localhost:27017/resume-boost
JWT_SECRET=your-super-secret-jwt-key-change-this
PORT=5000
```

For MongoDB Atlas, replace MONGODB_URI with your connection string.

### 4. Run the Application

**Option A: Run both frontend and backend together (Recommended)**
```bash
npm run dev:all
```

**Option B: Run separately**

Terminal 1 (Frontend):
```bash
npm run dev
```

Terminal 2 (Backend):
```bash
npm run dev:server
```

### 5. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Testing the Setup

1. Open http://localhost:5173
2. Click "Sign up" to create a new account
3. Fill in your name, email, and password
4. After signup, you'll be logged in automatically
5. Upload a resume to test the storage functionality
6. Check your MongoDB to see the stored data

## Verify MongoDB Connection

**Using MongoDB Compass (GUI):**
1. Download MongoDB Compass: https://www.mongodb.com/products/compass
2. Connect to: `mongodb://localhost:27017`
3. Look for `resume-boost` database
4. Check `users` and `resumes` collections

**Using MongoDB Shell:**
```bash
mongosh
use resume-boost
db.users.find()
db.resumes.find()
```

## Common Issues & Solutions

### Issue: "MongoDB connection error"
**Solution:** 
- Check if MongoDB is running: `mongosh` (should connect)
- Verify MONGODB_URI in `.env`
- For Atlas: Check IP whitelist and credentials

### Issue: "Port 5000 already in use"
**Solution:**
- Change PORT in `.env` to another port (e.g., 5001)
- Update VITE_API_URL in `.env.local` accordingly

### Issue: "CORS error"
**Solution:**
- Check FRONTEND_URL in `.env` matches your frontend URL
- Clear browser cache and restart both servers

### Issue: "JWT authentication failed"
**Solution:**
- Make sure JWT_SECRET is set in `.env`
- Clear cookies and login again

## API Testing with Postman/Thunder Client

### Test Signup
```
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Test Login
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Test Get Current User
```
GET http://localhost:5000/api/auth/me
Cookie: token=<your-jwt-token>
```

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: "user@example.com",
  password: "hashed_password",
  name: "User Name",
  createdAt: Date
}
```

### Resumes Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  fileName: "resume.pdf",
  fileData: "base64_encoded_file",
  fileType: "application/pdf",
  experienceLevel: "mid",
  analysisResult: {
    keywords: [...],
    matches: [...],
    missing: [...],
    coverageScore: 75,
    actionVerbCount: 10,
    quantifiedBulletCount: 5,
    sectionsPresent: [...],
    atsTips: [...],
    overallScore: 80
  },
  jobDescription: "optional job description",
  createdAt: Date,
  updatedAt: Date
}
```

## Next Steps

1. **Set up MongoDB** (local or Atlas)
2. **Run the application** with `npm run dev:all`
3. **Create a user account** through the UI
4. **Upload and analyze a resume**
5. **Check MongoDB** to see your data stored

## Production Deployment

When deploying to production:

1. Use MongoDB Atlas (cloud database)
2. Set strong JWT_SECRET
3. Enable HTTPS
4. Set NODE_ENV=production
5. Configure CORS properly
6. Build the application:
   ```bash
   npm run build
   npm run build:server
   npm run start:server
   ```

## Need Help?

- Check the main README.md for detailed documentation
- MongoDB docs: https://docs.mongodb.com/
- Express docs: https://expressjs.com/
- Mongoose docs: https://mongoosejs.com/

Happy coding! 🚀
