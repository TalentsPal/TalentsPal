import express from 'express';
import { submitCv, getMyCvs } from '../controllers/cvController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/analyze', protect, submitCv);
router.get('/my-cvs', protect, getMyCvs);

export default router;
