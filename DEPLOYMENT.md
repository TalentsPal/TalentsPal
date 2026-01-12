# 🚀 TalentsPal Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ Environment Variables
- [ ] Copy `.env.example` to `.env` for both backend and frontend
- [ ] Generate strong JWT secrets (use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- [ ] Set `NODE_ENV=production` in backend
- [ ] Update `FRONTEND_URL` and `BACKEND_URL` with production URLs
- [ ] Configure OAuth callbacks with production URLs
- [ ] Set up MongoDB Atlas with proper access controls
- [ ] Configure Cloudinary for production

### 🔒 Security Checks
- [ ] All `.env` files are in `.gitignore`
- [ ] No hardcoded secrets in code
- [ ] Rate limiting is enabled
- [ ] CORS is configured for production origin only
- [ ] MongoDB connection uses SSL/TLS
- [ ] Cloudinary credentials are secure

### 📊 Database
- [ ] Create database indexes (run on first deployment)
- [ ] Set up automated backups in MongoDB Atlas
- [ ] Configure database connection pooling
- [ ] Review and optimize queries

### 🎯 Performance
- [ ] Enable GZIP compression (already configured)
- [ ] Add caching to metadata routes (already configured)
- [ ] Optimize images in Cloudinary
- [ ] Enable CDN for static assets

---

## 🌐 Deployment Options

### Option 1: Vercel (Frontend) + Render (Backend) ⭐ Recommended

#### Frontend (Vercel)
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy from frontend directory
cd frontend
vercel

# 3. Set environment variables in Vercel dashboard
# - NEXT_PUBLIC_API_URL = your-backend-url
# - NEXT_PUBLIC_ENV = production
```

#### Backend (Render)
1. Go to [render.com](https://render.com)
2. Create new **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Environment**: Node
5. Add environment variables from `.env.example`
6. Deploy!

**Render Free Tier Benefits:**
- Free SSL certificate
- Auto-deploy from GitHub
- Easy scaling
- Built-in monitoring

---

### Option 2: Railway (Full Stack)

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Initialize project
railway init

# 4. Deploy backend
cd backend
railway up

# 5. Deploy frontend
cd ../frontend
railway up

# 6. Set environment variables
railway variables set NODE_ENV=production
railway variables set MONGODB_URI=your-mongodb-uri
# ... add all other variables
```

**Railway Benefits:**
- Deploy both frontend and backend
- Free tier: $5 credit/month
- Easy database integration
- Automatic HTTPS

---

### Option 3: DigitalOcean App Platform

1. Create account at [digitalocean.com](https://www.digitalocean.com)
2. Go to **App Platform**
3. Connect GitHub repository
4. Configure components:
   - **Backend**: Node.js service
   - **Frontend**: Static site (Next.js)
5. Add environment variables
6. Deploy!

**DigitalOcean Benefits:**
- $200 free credit for 60 days
- Professional infrastructure
- Built-in monitoring and logs
- Automatic scaling

---

## 📦 Docker Deployment (Optional)

### Backend Dockerfile
```dockerfile
# Already created at backend/Dockerfile
# Build: docker build -t talentspal-backend ./backend
# Run: docker run -p 5000:5000 --env-file backend/.env talentspal-backend
```

### Frontend Dockerfile
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    env_file:
      - ./backend/.env
    depends_on:
      - mongo
  
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:5000
  
  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

---

## 🔧 Production Configuration

### Backend Environment Variables
```env
NODE_ENV=production
PORT=5000
BACKEND_URL=https://your-backend.com
FRONTEND_URL=https://your-frontend.com

MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/talentspal?retryWrites=true&w=majority

JWT_ACCESS_SECRET=<generate-strong-secret>
JWT_REFRESH_SECRET=<generate-strong-secret>

EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-backend.com/api/auth/google/callback

CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
```

### Frontend Environment Variables
```env
NEXT_PUBLIC_API_URL=https://your-backend.com
NEXT_PUBLIC_ENV=production
```

---

## 📊 Monitoring & Logging

### Recommended Services

1. **Error Tracking**: [Sentry](https://sentry.io)
   ```bash
   npm install @sentry/node @sentry/react
   ```

2. **Performance Monitoring**: [LogRocket](https://logrocket.com)
   ```bash
   npm install logrocket
   ```

3. **Uptime Monitoring**: [UptimeRobot](https://uptimerobot.com) (Free)

---

## 🗄️ Database Backup Strategy

### MongoDB Atlas Automated Backups
1. Go to MongoDB Atlas Dashboard
2. Select your cluster
3. Click **Backup** tab
4. Enable **Continuous Backup**
5. Configure retention policy (recommended: 7 days)

### Manual Backup Script
```bash
# backup-db.sh
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="$MONGODB_URI" --out="./backups/backup_$DATE"
echo "Backup completed: backup_$DATE"
```

---

## 🚦 Health Checks

### Backend Health Endpoint
Already configured at: `GET /health`

Response:
```json
{
  "uptime": 12345,
  "message": "OK",
  "timestamp": 1234567890,
  "environment": "production"
}
```

### Monitoring Setup
Add these URLs to your monitoring service:
- Backend: `https://your-backend.com/health`
- Frontend: `https://your-frontend.com`

---

## 📈 Performance Optimization

### Already Implemented ✅
- GZIP compression
- Request/Response caching
- Database indexes
- Rate limiting
- MongoDB query optimization

### Additional Recommendations
1. **CDN for Static Assets**
   - Use Cloudinary CDN for images
   - Use Vercel Edge Network for frontend

2. **Database Query Optimization**
   - Use `.lean()` for read-only queries
   - Use `.select()` to limit fields
   - Paginate large result sets

3. **API Response Optimization**
   - Compress large payloads
   - Use ETags for caching
   - Implement GraphQL for flexible queries

---

## 🔐 SSL/TLS Certificates

All recommended platforms provide **free SSL certificates**:
- Vercel: Automatic SSL
- Render: Automatic SSL
- Railway: Automatic SSL
- DigitalOcean: Let's Encrypt integration

---

## 🚀 CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd backend && npm ci
      - run: cd backend && npm run build
      - run: cd backend && npm test
      # Add deployment step based on your platform

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd frontend && npm ci
      - run: cd frontend && npm run build
      # Add deployment step based on your platform
```

---

## 📞 Post-Deployment Checklist

- [ ] Test all authentication flows (email, Google, LinkedIn)
- [ ] Verify email sending works
- [ ] Test file uploads to Cloudinary
- [ ] Check all API endpoints
- [ ] Verify database connections
- [ ] Test OAuth callbacks
- [ ] Check error logging
- [ ] Set up monitoring alerts
- [ ] Configure automated backups
- [ ] Test rate limiting
- [ ] Verify CORS settings
- [ ] Test mobile responsiveness

---

## 🆘 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check `FRONTEND_URL` in backend `.env`
   - Verify CORS configuration in `server.ts`

2. **OAuth Not Working**
   - Update callback URLs in Google/LinkedIn console
   - Verify `BACKEND_URL` has no trailing slash

3. **Database Connection Failed**
   - Check MongoDB Atlas IP whitelist (add `0.0.0.0/0` for production)
   - Verify connection string format

4. **Images Not Uploading**
   - Check Cloudinary credentials
   - Verify file size limits

---

## 📚 Additional Resources

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [MongoDB Atlas Guide](https://www.mongodb.com/docs/atlas/)
- [Node.js Production Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)

---

## 💡 Cost Estimation

### Free Tier Options
- **Frontend**: Vercel Free (Unlimited bandwidth)
- **Backend**: Render Free (750 hours/month)
- **Database**: MongoDB Atlas Free (512MB)
- **Storage**: Cloudinary Free (25GB)
- **Monitoring**: UptimeRobot Free

**Total Cost**: $0/month for small to medium traffic

### Recommended Paid Plan (For Growth)
- **Frontend**: Vercel Pro ($20/month)
- **Backend**: Render Starter ($7/month)
- **Database**: MongoDB Atlas M10 ($57/month)
- **Storage**: Cloudinary Plus ($99/month)

**Total Cost**: ~$183/month for production-ready setup

---

**Good Luck with your deployment! 🚀**
