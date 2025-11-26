import express from 'express';
import {
  getUniversities,
  getMajors,
  getIndustries,
  getCities,
} from '../controllers/metadataController';

const router = express.Router();

// GET routes
router.get('/universities', getUniversities);
router.get('/majors', getMajors);
router.get('/industries', getIndustries);
router.get('/cities', getCities);

export default router;
