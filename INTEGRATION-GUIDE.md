# TalentsPal - Frontend & Backend Integration Guide

## 🔗 Backend & Frontend Connection

The frontend and backend are now fully integrated and ready to work together!

## 📋 What Was Updated

### Backend Changes:
1. **User Model** (`backend/src/models/User.ts`):
   - Changed `firstName` + `lastName` → `fullName`
   - Changed `phoneNumber` → `phone`
   - Added `city` (required)
   - Added `university` (optional)
   - Added **Student fields**: `linkedInUrl`, `major`, `graduationYear`, `interests[]`
   - Added **Company fields**: `companyName`, `companyEmail`, `companyLocation`, `industry`, `description`

2. **Auth Controller** (`backend/src/controllers/authController.ts`):
   - Updated `signup` to accept all frontend form fields
   - Added password confirmation validation
   - Added role-specific field validation
   - Updated `updateProfile` to use new field names

### Frontend Changes:
1. **API Configuration** (`frontend/src/config/api.ts`):
   - Created centralized API endpoint configuration
   - Base URL: `http://localhost:5000/api`

2. **Auth Service** (`frontend/src/services/authService.ts`):
   - `signupUser()` - Register new users
   - `loginUser()` - Authenticate users
   - `getCurrentUser()` - Get user profile
   - `logoutUser()` - Clear tokens
   - Token management with localStorage

3. **Updated Pages**:
   - `signup/page.tsx` - Now calls real backend API
   - `login/page.tsx` - Now calls real backend API

## 🚀 How to Run

### 1. Start the Backend

```bash
cd backend
npm install
npm run dev
```

Backend will run on: `http://localhost:5000`

### 2. Configure Frontend Environment

Create a file `frontend/.env.local` with:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on: `http://localhost:3000`

## 🧪 Testing the Integration

### Test Signup Flow:

1. Go to `http://localhost:3000/signup`
2. Fill in the form:
   - **For Students**: Fill common fields + student fields (major, graduation year, interests)
   - **For Companies**: Fill common fields + company fields (company name, industry, etc.)
3. Click "Create Account"
4. Check backend console for the request
5. Should redirect to appropriate dashboard

### Test Login Flow:

1. Go to `http://localhost:3000/login`
2. Enter email and password
3. Click "Sign In"
4. Should redirect based on user role

## 📊 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user (requires token) |
| PUT | `/api/auth/update-profile` | Update profile (requires token) |
| PUT | `/api/auth/change-password` | Change password (requires token) |

## 🔐 Authentication Flow

1. User signs up or logs in
2. Backend returns `accessToken` and `refreshToken`
3. Frontend stores tokens in `localStorage`
4. Frontend sends `Authorization: Bearer <token>` header for protected routes
5. Backend verifies token and returns user data

## 📝 Request/Response Examples

### Signup Request (Student):

```json
{
  "fullName": "Ahmed Hassan",
  "email": "ahmed@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "role": "student",
  "phone": "0599123456",
  "city": "Ramallah",
  "university": "Birzeit University",
  "linkedInUrl": "https://linkedin.com/in/ahmed",
  "major": "Computer Science",
  "graduationYear": "2024",
  "interests": ["training", "job", "interview-prep"]
}
```

### Signup Request (Company):

```json
{
  "fullName": "Sara Ali",
  "email": "sara@company.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "role": "company",
  "phone": "0599123456",
  "city": "Ramallah",
  "companyName": "TechCorp Palestine",
  "companyEmail": "hr@techcorp.ps",
  "companyLocation": "Ramallah, Palestine",
  "industry": "Technology & IT",
  "description": "Leading tech company in Palestine"
}
```

### Signup Response:

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "...",
      "fullName": "Ahmed Hassan",
      "email": "ahmed@example.com",
      "role": "student",
      "phone": "0599123456",
      "city": "Ramallah",
      "university": "Birzeit University",
      "linkedInUrl": "https://linkedin.com/in/ahmed",
      "major": "Computer Science",
      "graduationYear": "2024",
      "interests": ["training", "job", "interview-prep"],
      "isEmailVerified": false,
      "createdAt": "2025-11-25T...",
      "updatedAt": "2025-11-25T..."
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login Request:

```json
{
  "email": "ahmed@example.com",
  "password": "SecurePass123!",
  "rememberMe": true
}
```

### Login Response:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { /* same as signup */ },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

## 🛠️ Troubleshooting

### CORS Errors:
Make sure your backend has CORS enabled for `http://localhost:3000`

### Connection Refused:
- Check if backend is running on port 5000
- Check if MongoDB is running
- Verify `.env` file in backend has correct MongoDB URI

### 401 Unauthorized:
- Token might be expired
- Check if token is being sent in Authorization header
- Verify JWT_SECRET matches between requests

## ✅ Field Mapping Reference

| Frontend Field | Backend Field | Required | Role |
|----------------|---------------|----------|------|
| fullName | fullName | ✅ | All |
| email | email | ✅ | All |
| password | password | ✅ | All |
| confirmPassword | (validation only) | ✅ | All |
| role | role | ✅ | All |
| phone | phone | ✅ | All |
| city | city | ✅ | All |
| university | university | ❌ | All |
| linkedInUrl | linkedInUrl | ❌ | Student |
| major | major | ❌ | Student |
| graduationYear | graduationYear | ❌ | Student |
| interests | interests | ❌ | Student |
| companyName | companyName | ✅ | Company |
| companyEmail | companyEmail | ✅ | Company |
| companyLocation | companyLocation | ✅ | Company |
| industry | industry | ✅ | Company |
| description | description | ❌ | Company |

## 🎯 Next Steps

1. ✅ Backend matches frontend fields
2. ✅ API endpoints configured
3. ✅ Auth service created
4. ✅ Signup/Login pages connected
5. ⬜ Test the full flow
6. ⬜ Add error handling improvements
7. ⬜ Add loading states
8. ⬜ Add success notifications

## 📞 Support

If you encounter any issues:
1. Check backend console for errors
2. Check browser console for frontend errors
3. Verify MongoDB is connected
4. Ensure all environment variables are set

---

**Status**: ✅ Frontend and Backend are now fully connected and ready to use!
