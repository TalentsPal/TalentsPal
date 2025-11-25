# 🚀 Quick Start - TalentsPal Integration

## ⚡ 3-Step Setup

### 1️⃣ Start Backend
```bash
cd backend
npm run dev
```
✅ Running on `http://localhost:5000`

### 2️⃣ Configure Frontend
Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3️⃣ Start Frontend
```bash
cd frontend
npm run dev
```
✅ Running on `http://localhost:3000`

---

## 🧪 Quick Test

1. Open `http://localhost:3000/signup`
2. Fill the form
3. Click "Create Account"
4. Should redirect to dashboard
5. Try logging in!

---

## 📊 What Changed?

### Backend (`User.ts`)
- `firstName` + `lastName` → `fullName`
- `phoneNumber` → `phone`
- Added: `city`, `university`
- Added: Student fields (linkedInUrl, major, graduationYear, interests)
- Added: Company fields (companyName, companyEmail, companyLocation, industry, description)

### Frontend
- Created `config/api.ts` - API endpoints
- Created `services/authService.ts` - API calls
- Updated `signup/page.tsx` - Real API integration
- Updated `login/page.tsx` - Real API integration

---

## 🔐 API Endpoints

- `POST /api/auth/signup` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get profile (requires token)

---

## ✅ Status

**COMPLETE** - Frontend and backend are fully connected!

---

**Need help?** Check `INTEGRATION-GUIDE.md` or `COMPLETE-SUMMARY.md`
