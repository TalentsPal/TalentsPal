import express from 'express';
import { startInterview, submitAnswer } from '../controllers/interviewController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/start', protect, startInterview);
router.post('/answer', protect, submitAnswer);

export default router;
