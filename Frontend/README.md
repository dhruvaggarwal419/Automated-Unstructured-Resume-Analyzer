
# Resume Boost — Full-Stack with MongoDB

A full-stack resume analyzer application with MongoDB integration for user authentication and resume storage.

## Features

- 🔐 User Authentication (Signup/Login)
- 📄 Resume Upload and Analysis
- 💾 MongoDB Storage for user data and resumes
- 📊 Resume History Tracking
- 🎯 ATS Compatibility Analysis
- Keyword coverage vs JD with matched/missing tags
- Action verb and quantification checks
- Section detection (Summary, Experience, Education, Skills)
- ATS tips and optimization suggestions

## Tech Stack

### Frontend
- React 19
- TypeScript
- Tailwind CSS
- Vite
- Lucide React Icons

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas account)

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   
   Copy `.env.example` to `.env` and update with your values:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env`:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/resume-boost
   JWT_SECRET=your-super-secret-jwt-key
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

   For production, use MongoDB Atlas:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/resume-boost
   ```

3. **Start MongoDB:**
   
   If using local MongoDB:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongodb
   ```

4. **Run the application:**

   **Development mode (runs both frontend and backend):**
   ```bash
   npm run dev:all
   ```

   Or run separately:
   ```bash
   # Terminal 1 - Frontend
   npm run dev

   # Terminal 2 - Backend
   npm run dev:server
   ```

5. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Resume Management
- `POST /api/resume/upload` - Upload new resume
- `PUT /api/resume/:resumeId/analysis` - Save analysis result
- `GET /api/resume/history` - Get all user resumes
- `GET /api/resume/:resumeId` - Get specific resume
- `DELETE /api/resume/:resumeId` - Delete resume

## Database Schema

### User Model
```javascript
{
  email: String (unique),
  password: String (hashed),
  name: String,
  createdAt: Date
}
```

### Resume Model
```javascript
{
  userId: ObjectId (ref: User),
  fileName: String,
  fileData: String (base64),
  fileType: String,
  experienceLevel: String (enum: entry/mid/senior),
  analysisResult: Object,
  jobDescription: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Project Structure

```
resume-boost/
├── server/
│   ├── index.ts              # Express server setup
│   ├── models/
│   │   ├── User.ts           # User model
│   │   └── Resume.ts         # Resume model
│   ├── routes/
│   │   ├── auth.ts           # Auth endpoints
│   │   └── resume.ts         # Resume endpoints
│   └── middleware/
│       └── auth.ts           # JWT authentication
├── src/
│   ├── App.tsx               # Main React component
│   ├── lib/
│   │   ├── api.ts            # API client
│   │   ├── analyzer.ts       # Resume analyzer
│   │   └── optimizer.ts      # Resume optimizer
│   └── ...
├── .env                      # Environment variables
├── tsconfig.server.json      # TypeScript config for server
└── package.json
```

## Security Notes

- Passwords are hashed using bcryptjs
- JWT tokens are used for authentication
- HTTP-only cookies for token storage
- CORS configured for frontend-backend communication
- Always use HTTPS in production
- Never commit `.env` file to version control

## Building for Production

```bash
# Build frontend
npm run build

# Build backend
npm run build:server

# Start production server
npm run start:server
```

Notes
- All analysis uses client-side heuristics
- Keep formatting ATS-friendly: single column, simple fonts, standard headings
- Resume data is stored securely in MongoDB
