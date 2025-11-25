# 🚀 Quick Start Guide - TalentsPal Backend

## ✅ Current Status

**Server:** ✅ Running on http://localhost:5000
**Database:** ✅ MongoDB Connected
**Build:** ✅ TypeScript Compiled Successfully

---

## 🎯 Quick Test (Copy & Paste)

### 1. Test Health Check
```bash
curl http://localhost:5000/health
```

### 2. Create a Test User
```bash
curl -X POST http://localhost:5000/api/auth/signup -H "Content-Type: application/json" -d "{\"firstName\":\"Test\",\"lastName\":\"User\",\"email\":\"test@example.com\",\"password\":\"TestPass123!\",\"role\":\"student\"}"
```

### 3. Login with Test User
```bash
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"password\":\"TestPass123!\"}"
```

**Copy the `accessToken` from the response and use it below:**

### 4. Get User Profile (Replace YOUR_TOKEN)
```bash
curl -X GET http://localhost:5000/api/auth/me -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📱 Frontend Integration (3 Steps)

### Step 1: Copy the Service File
Copy `FRONTEND_INTEGRATION.ts` to your frontend project:
```
frontend/src/services/authService.ts
```

### Step 2: Use in Your Login Page
```typescript
import AuthService from '@/services/authService';

const handleLogin = async (email: string, password: string) => {
  try {
    const { user, accessToken } = await AuthService.login({ email, password });
    console.log('Logged in:', user);
    // Redirect to dashboard
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

### Step 3: Use in Your Signup Page
```typescript
import AuthService from '@/services/authService';

const handleSignup = async (data) => {
  try {
    const { user, accessToken } = await AuthService.signup({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      role: 'student',
    });
    console.log('Signed up:', user);
    // Redirect to dashboard
  } catch (error) {
    console.error('Signup failed:', error);
  }
};
```

---

## 🔑 API Endpoints Summary

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/health` | GET | ❌ | Server health check |
| `/api/auth/signup` | POST | ❌ | Register new user |
| `/api/auth/login` | POST | ❌ | Login user |
| `/api/auth/me` | GET | ✅ | Get current user |
| `/api/auth/update-profile` | PUT | ✅ | Update profile |
| `/api/auth/change-password` | PUT | ✅ | Change password |

---

## 📋 Required Fields

### Signup
```json
{
  "firstName": "string (2-50 chars)",
  "lastName": "string (2-50 chars)",
  "email": "valid email",
  "password": "string (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special)",
  "role": "student | company | admin (optional, default: student)",
  "phoneNumber": "string (optional)"
}
```

### Login
```json
{
  "email": "valid email",
  "password": "string"
}
```

---

## 🛠️ Common Commands

### Start Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Stop Server
Press `Ctrl + C` in the terminal

---

## 🔐 Environment Setup

Make sure your `.env` file has:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
FRONTEND_URL=http://localhost:3000
```

---

## 📖 Full Documentation

- **README.md** - Complete project documentation
- **API_TESTING.md** - Detailed API testing guide
- **IMPLEMENTATION_SUMMARY.md** - What was built and how
- **FRONTEND_INTEGRATION.ts** - Ready-to-use frontend service

---

## 🎉 You're All Set!

Your backend is **production-ready** and waiting for frontend integration!

**Next:** Connect your frontend login/signup pages using the AuthService.

---

**Questions?** Check the documentation files or test the API endpoints!
