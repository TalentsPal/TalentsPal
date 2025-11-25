# Frontend Environment Setup

## Create .env.local file

In the `frontend` directory, create a file named `.env.local` with the following content:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

This file is gitignored and won't be committed to version control.

## Why this is needed

The frontend needs to know where the backend API is located. This environment variable tells the frontend to connect to the backend running on `http://localhost:5000`.

## For Production

When deploying to production, update this value to your production backend URL:

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
```
