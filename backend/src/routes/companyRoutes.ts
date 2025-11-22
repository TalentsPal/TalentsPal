import express from 'express';
import { getCompanies, createCompany } from '../controllers/companyController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', getCompanies);
router.post('/', protect, createCompany); // Protected, maybe admin only in future

export default router;
