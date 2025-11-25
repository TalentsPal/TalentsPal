
import { Request, Response, NextFunction } from 'express';
import Company from '../models/Company';

/**
 * @desc    Get all companies
 * @route   GET /api/companies
 * @access  Public
 */
export const getCompanies = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { city, search } = req.query;

    let query: any = {};

    // Filter by city if provided
    if (city) {
      query.city = city;
    }

    // Search by name if provided
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const companies = await Company.find(query).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: companies.length,
      data: companies,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single company
 * @route   GET /api/companies/:id
 * @access  Public
 */
export const getCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    res.status(200).json({
      success: true,
      data: company,
    });
  } catch (error) {
    next(error);
  }
};
