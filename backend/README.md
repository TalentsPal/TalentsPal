# TalentsPal Backend API

Professional, clean, and scalable backend for the TalentsPal platform.

## 🚀 Features

- ✅ **Clean Architecture** - Organized folder structure with separation of concerns
- ✅ **TypeScript** - Full type safety and better developer experience
- ✅ **Authentication & Authorization** - JWT-based auth with role-based access control
- ✅ **Input Validation** - Comprehensive validation for all user inputs
- ✅ **Error Handling** - Centralized error handling with custom error classes
- ✅ **Security** - Helmet, CORS, password hashing with bcrypt
- ✅ **Database** - MongoDB with Mongoose ODM
- ✅ **Code Quality** - Professional, production-ready code

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files (database, etc.)
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Custom middleware (auth, validation)
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions (JWT, validation, error handling)
│   └── server.ts        # Application entry point
├── .env                 # Environment variables
├── .env.example         # Environment variables template
├── package.json         # Dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

## 🛠️ Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your configuration.

3. **Start MongoDB:**
   Make sure MongoDB is running on your system.

## 🚦 Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

## 📡 API Endpoints

### Authentication Routes

#### 1. **Sign Up**
- **POST** `/api/auth/signup`
- **Body:**
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "role": "student",
    "phoneNumber": "+1234567890"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "user": {
        "_id": "...",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "role": "student"
      },
      "accessToken": "...",
      "refreshToken": "..."
    }
  }
  ```

#### 2. **Login**
- **POST** `/api/auth/login`
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "SecurePass123!"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": { ... },
      "accessToken": "...",
      "refreshToken": "..."
    }
  }
  ```

#### 3. **Get Current User**
- **GET** `/api/auth/me`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "user": { ... }
    }
  }
  ```

#### 4. **Update Profile**
- **PUT** `/api/auth/update-profile`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "firstName": "John",
    "lastName": "Smith",
    "phoneNumber": "+1234567890",
    "profileImage": "https://..."
  }
  ```

#### 5. **Change Password**
- **PUT** `/api/auth/change-password`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "currentPassword": "OldPass123!",
    "newPassword": "NewPass123!"
  }
  ```

## 🔒 Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

## 🛡️ Security Features

- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **bcrypt** - Password hashing with salt rounds
- **JWT** - Secure token-based authentication
- **Input Validation** - Sanitization and validation
- **Error Handling** - No sensitive data in error responses

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/talentspal` |
| `JWT_SECRET` | JWT secret key | - |
| `JWT_EXPIRES_IN` | Access token expiry | `7d` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | `30d` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

## 🧪 Testing the API

You can test the API using:
- **Postman** - Import the endpoints
- **Thunder Client** - VS Code extension
- **cURL** - Command line

Example cURL request:
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "role": "student"
  }'
```

## 🎯 Next Steps

1. Add email verification
2. Add password reset functionality
3. Add refresh token rotation
4. Add rate limiting
5. Add API documentation (Swagger)
6. Add unit and integration tests

## 📄 License

MIT

---

Built with ❤️ for TalentsPal
