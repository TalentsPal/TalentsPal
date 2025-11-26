# 🎓 TalentsPal

**Empowering Palestinian Tech Talent Through Career Development**

TalentsPal is a comprehensive career development platform designed specifically for Palestinian students and tech professionals. Connect with companies, prepare for interviews, take assessments, and analyze your professional profiles—all in one place.

---

## 🌟 Features

### For Students
- **🔐 Secure Authentication** - Sign up with email or continue with Google/LinkedIn OAuth
- **📊 Profile Analysis** - Get AI-powered feedback on your LinkedIn profile and CV
- **💼 Company Directory** - Explore tech companies and opportunities in Palestine
- **📝 Practice Exams** - Take company-specific assessments to prepare for interviews
- **🎯 Interview Questions** - Access a database of real interview questions
- **📈 Progress Tracking** - Monitor your exam scores and career development

### For Companies
- **👥 Talent Discovery** - Find qualified tech professionals
- **📋 Custom Assessments** - Create exams to evaluate candidates
- **🏢 Company Profile** - Showcase your organization and opportunities
- **📊 Analytics** - Track candidate performance and engagement

### For Admins
- **👨‍💼 User Management** - Manage students, companies, and content
- **📈 Platform Analytics** - Monitor platform usage and trends
- **🎓 Content Management** - Manage universities, majors, and industries
- **🔧 System Configuration** - Configure platform settings

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 16 (React 19) with TypeScript
- **Styling:** Tailwind CSS with custom design system
- **State Management:** React Hooks & Context API
- **Animations:** Framer Motion
- **HTTP Client:** Axios
- **Forms:** Custom validation utilities

### Backend
- **Runtime:** Node.js with Express.js
- **Language:** TypeScript
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT + Passport.js (Google & LinkedIn OAuth)
- **Security:** Helmet, bcrypt, CORS
- **Environment:** dotenv for configuration

---

## 📁 Project Structure

```
TalentsPal/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # App router pages
│   │   │   ├── login/       # Login page
│   │   │   ├── signup/      # Signup page
│   │   │   ├── complete-profile/  # OAuth profile completion
│   │   │   ├── student/     # Student dashboard
│   │   │   ├── company/     # Company dashboard
│   │   │   └── admin/       # Admin dashboard
│   │   ├── components/      # Reusable UI components
│   │   │   └── ui/          # Base UI components (Button, Input, Select, etc.)
│   │   ├── services/        # API service functions
│   │   ├── types/           # TypeScript type definitions
│   │   ├── utils/           # Utility functions
│   │   └── contexts/        # React context providers
│   └── public/              # Static assets
│
└── backend/                  # Express.js backend application
    ├── src/
    │   ├── config/          # Configuration files (DB, Passport)
    │   ├── controllers/     # Request handlers
    │   ├── models/          # MongoDB models
    │   │   ├── User.ts      # User model with OAuth support
    │   │   ├── University.ts
    │   │   ├── Major.ts
    │   │   └── Industry.ts
    │   ├── routes/          # API routes
    │   ├── middleware/      # Custom middleware
    │   ├── utils/           # Utility functions
    │   ├── scripts/         # Database seed scripts
    │   └── server.ts        # Application entry point
    └── .env                 # Environment variables
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account or local MongoDB
- Google Cloud Console account (for OAuth)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/TalentsPal/TalentsPal.git
   cd TalentsPal
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Configure environment variables**

   **Backend** (`backend/.env`):
   ```env
   # Server
   PORT=5000
   NODE_ENV=development
   BACKEND_URL=http://localhost:5000

   # Database
   MONGO_URI=your_mongodb_connection_string

   # JWT
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRES_IN=7d
   JWT_REFRESH_EXPIRES_IN=30d

   # Frontend URL
   FRONTEND_URL=http://localhost:3000

   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   # LinkedIn OAuth
   LINKEDIN_CLIENT_ID=your_linkedin_client_id
   LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
   ```

   **Frontend** (`frontend/.env.local`):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. **Seed the database**
   ```bash
   cd backend
   npm run seed:metadata
   ```

5. **Start the development servers**

   **Backend:**
   ```bash
   cd backend
   npm run dev
   ```

   **Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

---

## 🔐 OAuth Setup

### Google OAuth Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - **Authorized JavaScript origins:** `http://localhost:3000`, `http://localhost:5000`
   - **Authorized redirect URIs:** `http://localhost:5000/api/auth/google/callback`
5. Add test users in OAuth consent screen
6. Copy Client ID and Secret to `.env`

### LinkedIn OAuth Configuration

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Create a new app
3. Configure OAuth 2.0 settings:
   - **Redirect URLs:** `http://localhost:5000/api/auth/linkedin/callback`
4. Request access to required scopes
5. Copy Client ID and Secret to `.env`

---

## 📊 Database Schema

### Collections

- **users** - User accounts (students, companies, admins) with OAuth support
- **universities** - Palestinian universities
- **majors** - Programming and tech-related majors
- **industries** - Company industries
- **companies** - Company profiles and opportunities
- **exams** - Assessment questions and tests
- **examresults** - Student exam submissions and scores

---

## 🎨 Design System

### Colors
- **Primary:** Blue gradient (`#0ea5e9` to `#0284c7`)
- **Secondary:** Purple gradient (`#d946ef` to `#c026d3`)
- **Success:** Green (`#22c55e`)
- **Warning:** Orange (`#f59e0b`)
- **Danger:** Red (`#ef4444`)
- **Dark:** Slate shades (50-950)

### Components
- Consistent spacing (Tailwind scale)
- Rounded corners (`rounded-xl`)
- Smooth transitions and animations
- Dark mode support
- Responsive design (mobile-first)

---

## 🔒 Security Features

- ✅ Password hashing with bcrypt (12 rounds)
- ✅ JWT-based authentication
- ✅ OAuth 2.0 integration (Google & LinkedIn)
- ✅ Helmet.js for security headers
- ✅ CORS configuration
- ✅ Input validation and sanitization
- ✅ MongoDB injection prevention
- ✅ Rate limiting (planned)

---

## 📝 API Documentation

### Authentication Endpoints

```
POST   /api/auth/signup              - Register new user
POST   /api/auth/login               - Login with credentials
GET    /api/auth/google              - Initiate Google OAuth
GET    /api/auth/google/callback     - Google OAuth callback
GET    /api/auth/linkedin            - Initiate LinkedIn OAuth
GET    /api/auth/linkedin/callback   - LinkedIn OAuth callback
PUT    /api/auth/update-profile      - Complete OAuth profile
```

### Metadata Endpoints

```
GET    /api/metadata/universities    - Get all universities
GET    /api/metadata/majors          - Get all majors
GET    /api/metadata/industries      - Get all industries
GET    /api/metadata/cities          - Get all cities
```

### Company Endpoints

```
GET    /api/companies                - Get all companies
GET    /api/companies/:id            - Get company by ID
POST   /api/companies                - Create company (admin)
PUT    /api/companies/:id            - Update company
DELETE /api/companies/:id            - Delete company (admin)
```

---

## 🧪 Testing

```bash
# Backend tests (to be implemented)
cd backend
npm test

# Frontend tests (to be implemented)
cd frontend
npm test
```

---

## 📦 Deployment

### Backend Deployment (Railway/Render/Heroku)

1. Set environment variables in platform dashboard
2. Update `BACKEND_URL` and `FRONTEND_URL`
3. Configure OAuth redirect URIs for production
4. Deploy with: `npm run build && npm start`

### Frontend Deployment (Vercel/Netlify)

1. Connect GitHub repository
2. Set `NEXT_PUBLIC_API_URL` environment variable
3. Deploy automatically on push to main branch

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**TalentsPal Development Team**

---

## 📞 Support

For support, email support@talentspal.com or join our Slack channel.

---

## 🙏 Acknowledgments

- Palestinian tech community
- All contributing universities
- Partner companies
- Open source community

---

**Built with ❤️ for Palestinian Tech Talent**
