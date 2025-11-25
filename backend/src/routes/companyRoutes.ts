
import express from 'express';
import { getCompanies, getCompany } from '../controllers/companyController';

const router = express.Router();

router.route('/').get(getCompanies);
router.route('/:id').get(getCompany);

export default router;
