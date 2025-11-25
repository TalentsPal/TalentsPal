# TalentsPal Backend - API Testing Guide

## Server Status
✅ Server is running on: http://localhost:5000
✅ MongoDB Connected Successfully

## Test the API Endpoints

### 1. Health Check
```bash
curl http://localhost:5000/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-11-25T06:42:45.000Z"
}
```

---

### 2. Sign Up (Register New User)

**Endpoint:** `POST /api/auth/signup`

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "password": "SecurePass123!",
    "role": "student",
    "phoneNumber": "+1234567890"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "...",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "student",
      "phoneNumber": "+1234567890",
      "isEmailVerified": false,
      "profileImage": null,
      "createdAt": "...",
      "updatedAt": "..."
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 3. Login

**Endpoint:** `POST /api/auth/login`

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!"
  }'
```

**Expected Response:**
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

---

### 4. Get Current User Profile (Protected Route)

**Endpoint:** `GET /api/auth/me`

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "student",
      ...
    }
  }
}
```

---

### 5. Update Profile (Protected Route)

**Endpoint:** `PUT /api/auth/update-profile`

```bash
curl -X PUT http://localhost:5000/api/auth/update-profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "firstName": "John",
    "lastName": "Smith",
    "phoneNumber": "+9876543210"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": { ... }
  }
}
```

---

### 6. Change Password (Protected Route)

**Endpoint:** `PUT /api/auth/change-password`

```bash
curl -X PUT http://localhost:5000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "currentPassword": "SecurePass123!",
    "newPassword": "NewSecurePass456!"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "Please provide all required fields"
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "message": "No token provided. Please authenticate."
}
```

### Email Already Exists (409)
```json
{
  "success": false,
  "message": "Email already registered"
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Route /api/unknown not found"
}
```

---

## Password Requirements

✅ Minimum 8 characters
✅ At least one uppercase letter
✅ At least one lowercase letter
✅ At least one number
✅ At least one special character

---

## User Roles

- `student` - Default role for students
- `company` - For company accounts
- `admin` - For administrators

---

## Using with Frontend

### Example: Login from Frontend

```javascript
const login = async (email, password) => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success) {
      // Store tokens
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      
      return data.data.user;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};
```

### Example: Making Authenticated Requests

```javascript
const getProfile = async () => {
  const token = localStorage.getItem('accessToken');

  const response = await fetch('http://localhost:5000/api/auth/me', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  return data.data.user;
};
```

---

## Next Steps

1. ✅ Test all endpoints with Postman or Thunder Client
2. ✅ Integrate with your frontend login/signup pages
3. ⏳ Add email verification
4. ⏳ Add password reset functionality
5. ⏳ Add rate limiting
6. ⏳ Add API documentation (Swagger)

---

**Backend is ready for frontend integration!** 🚀
