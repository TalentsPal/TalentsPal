import express from 'express';
import { getExams, createExam, getExamById } from '../controllers/examController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', getExams);
router.get('/:id', getExamById);
router.post('/', protect, createExam);

export default router;
