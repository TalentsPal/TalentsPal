# TalentsPal - Career Platform for Palestinian Students

A comprehensive web platform designed to help students and graduates in Palestine explore companies, prepare for interviews, solve exams, and analyze their CVs and LinkedIn profiles.

## 🚀 Features

### For Students
- ✅ **Signup & Login** with role-based authentication
- 🏢 **Explore Companies** in Palestine
- 📝 **Practice Exams** for training and employment
- 💬 **Interview Questions** from real companies
- 📄 **CV Analysis** with AI-powered feedback
- 💼 **LinkedIn Profile Analysis**
- 📊 **Progress Tracking** dashboard

### For Companies
- ✅ **Company Profile** management
- 👥 **View Applicants** who took your exams
- 📝 **Create Exams** for candidates
- 📊 **Analytics Dashboard**

### For Admins
- ✅ **User Management** (students, companies)
- 🏢 **Company Database** management
- 📝 **Exam Management**
- 💬 **Interview Questions** moderation
- 📊 **Platform Analytics**

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS v4
- **Animations**: Framer Motion
- **Icons**: React Icons
- **State Management**: React Context API
- **HTTP Client**: Axios

### Backend (To be implemented)
- Node.js + Express
- MongoDB
- JWT Authentication
- AI Integration (CV & LinkedIn Analysis)

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── page.tsx             # Homepage
│   │   ├── layout.tsx           # Root layout
│   │   ├── globals.css          # Global styles
│   │   ├── login/               # Login page
│   │   ├── signup/              # Signup page
│   │   ├── student/             # Student pages
│   │   │   └── dashboard/       # Student dashboard
│   │   ├── admin/               # Admin pages
│   │   │   └── dashboard/       # Admin dashboard
│   │   └── company/             # Company pages
│   │       └── dashboard/       # Company dashboard
│   ├── components/              # Reusable components
│   │   └── ui/                  # UI components
│   │       ├── Input.tsx        # Input component
│   │       ├── Select.tsx       # Select component
│   │       ├── Button.tsx       # Button component
│   │       └── MultiSelect.tsx  # Multi-select component
│   ├── contexts/                # React contexts
│   │   └── ThemeContext.tsx    # Theme provider
│   ├── types/                   # TypeScript types
│   │   └── index.ts            # All type definitions
│   └── utils/                   # Utility functions
│       ├── validation.ts        # Form validation
│       └── cn.ts               # Class name utility
├── tailwind.config.ts          # Tailwind configuration
├── package.json                # Dependencies
└── tsconfig.json              # TypeScript config
```

## 🎨 Design System

### Colors
- **Primary**: Blue shades (for main actions)
- **Secondary**: Purple shades (for accents)
- **Success**: Green shades
- **Warning**: Yellow/Orange shades
- **Danger**: Red shades
- **Dark**: Slate shades (for text and backgrounds)

### Components
- **Buttons**: Primary, Secondary, Outline, Ghost variants
- **Inputs**: With icons, validation, password toggle
- **Select**: Dropdown with validation
- **MultiSelect**: Tag-based multi-selection
- **Cards**: With hover effects and shadows
- **Badges**: Status indicators

### Features
- ✅ **Dark Mode** support
- ✅ **Responsive Design** (mobile-first)
- ✅ **Smooth Animations** with Framer Motion
- ✅ **Form Validation** with real-time feedback
- ✅ **Password Strength** indicator
- ✅ **Accessibility** features

## 🚦 Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Run development server**
```bash
npm run dev
```

4. **Open in browser**
```
http://localhost:3000
```

## 📝 Pages Implemented

### ✅ Completed
1. **Homepage** (`/`)
   - Hero section with stats
   - Features showcase
   - Call-to-action

2. **Signup Page** (`/signup`)
   - Role selection (Student/Company/Admin)
   - Conditional fields based on role
   - Form validation
   - Password strength indicator
   - Student fields: LinkedIn, Major, Graduation Year, Interests
   - Company fields: Company Name, Email, Location, Industry

3. **Login Page** (`/login`)
   - Email & Password
   - Show/Hide password
   - Remember me
   - Forgot password link
   - Role-based redirect

4. **Student Dashboard** (`/student/dashboard`)
   - Stats overview
   - Recent activity
   - Recommended companies

5. **Admin Dashboard** (`/admin/dashboard`)
   - Platform statistics
   - Recent signups
   - Exam analytics

6. **Company Dashboard** (`/company/dashboard`)
   - Profile views
   - Recent applicants
   - Exam performance

## 🔐 Authentication Flow

1. User signs up with role selection
2. Form validates all fields
3. API creates user account
4. User logs in with email/password
5. System redirects based on role:
   - Student → `/student/dashboard`
   - Admin → `/admin/dashboard`
   - Company → `/company/dashboard`

## 📋 Form Validations

### Signup
- Full name (min 3 characters)
- Valid email format
- Strong password (8+ chars, uppercase, lowercase, number)
- Password confirmation match
- Palestinian phone number format
- City selection
- Role-specific fields validation

### Login
- Valid email format
- Password required

## 🎯 Next Steps

### High Priority
1. **Backend API Integration**
   - Auth endpoints (signup, login, logout)
   - User management
   - Company CRUD
   - Exam system

2. **Student Features**
   - Companies browsing page
   - Company details page
   - Exams listing & taking
   - Interview questions library
   - CV upload & analysis
   - LinkedIn analysis

3. **Admin Features**
   - User management interface
   - Company management
   - Exam creation & editing
   - Interview questions moderation
   - Analytics dashboard

4. **Company Features**
   - Profile editing
   - Exam creation
   - Applicant viewing
   - Analytics

### Medium Priority
- Email verification
- Password reset functionality
- Profile editing
- Notifications system
- Search & filtering
- Advanced analytics

### Low Priority
- Social login (Google, LinkedIn)
- Mobile app
- Export features
- Advanced AI features

## 🤝 Contributing

This is a private project. For questions or suggestions, contact the development team.

## 📄 License

Proprietary - All rights reserved

## 👥 Team

TalentsPal Development Team

---

**Built with ❤️ for Palestinian Students**
