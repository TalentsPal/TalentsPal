# TalentsPal - Career Preparation Platform MVP

## Project Overview
TalentsPal is a comprehensive career preparation platform designed to help users prepare for exams, analyze their CVs, and simulate interviews using AI.

## Tech Stack
- **Frontend:** Next.js 14 (App Router), TypeScript, TailwindCSS
- **Backend:** Node.js, Express, TypeScript, MongoDB
- **Authentication:** JWT (JSON Web Tokens)

## Project Structure
- `/frontend`: Next.js application
- `/backend`: Express.js API server

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (Local or Atlas URI)

### Setup Instructions

#### 1. Backend Setup
```bash
cd backend
npm install

# Configure Environment Variables
# A .env file has been created with the MongoDB Atlas connection string.
# If you need to reset it, copy .env.example to .env and update the values.
# cp .env.example .env

# Seed Initial Data (Users, Companies, Exams, CVs, Interviews)
npm run seed

# Start the Server
npm run dev
```

#### 2. Frontend Setup
```bash
cd frontend
npm install

# Start the Development Server
npm run dev
```

The frontend will be available at `http://localhost:3000`.

### Default Login Credentials
- **Email:** `john@example.com`
- **Password:** `password123`

### Features Implemented
- **Landing Page:** Modern, animated introduction to the platform.
- **Authentication:** Login and Register with JWT handling.
- **Dashboard:** Personalized user overview.
- **Exams:** Browse and view available exams.
- **Companies:** Explore top companies.
- **CV Analyzer:** AI-powered CV text analysis with visual scoring.
- **AI Interview:** Interactive chat interface for interview practice.


## Features (MVP)
- **Auth:** User registration and login
- **Dashboard:** User overview
- **Exams:** Browse and take practice exams
- **Companies:** View company profiles
- **CV Analyzer:** AI-powered CV analysis (Placeholder)
- **Interview:** AI interview simulation (Placeholder)
