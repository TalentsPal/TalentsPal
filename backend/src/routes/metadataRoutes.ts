import express from 'express';
import {
  getUniversities,
  getMajors,
  getIndustries,
  getCities,
} from '../controllers/metadataController';
import { metadataCache, cacheMiddleware } from '../utils/cache';

const router = express.Router();

// GET routes with caching
router.get('/universities', cacheMiddleware(metadataCache, 'universities'), getUniversities);
router.get('/majors', cacheMiddleware(metadataCache, 'majors'), getMajors);
router.get('/industries', cacheMiddleware(metadataCache, 'industries'), getIndustries);
router.get('/cities', cacheMiddleware(metadataCache, 'cities'), getCities);

export default router;
