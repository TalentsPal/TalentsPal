import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import authRoutes from './routes/authRoutes';
import companyRoutes from './routes/companyRoutes';
import examRoutes from './routes/examRoutes';
import cvRoutes from './routes/cvRoutes';
import interviewRoutes from './routes/interviewRoutes';

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/cv', cvRoutes);
app.use('/api/interview', interviewRoutes);

app.get('/', (req, res) => {
  res.send('TalentsPal API is running');
});

export default app;
