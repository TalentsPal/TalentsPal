import { Request, Response } from 'express';
import University from '../models/University';
import Major from '../models/Major';
import Industry from '../models/Industry';
import City from '../models/City';

/**
 * Get all universities
 */
export const getUniversities = async (req: Request, res: Response) => {
  try {
    const universities = await University.find({ isActive: true })
      .select('name country city')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: universities,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Failed to fetch universities',
      error: message,
    });
  }
};

/**
 * Get all majors
 */
export const getMajors = async (req: Request, res: Response) => {
  try {
    const majors = await Major.find({ isActive: true })
      .select('name category')
      .sort({ category: 1, name: 1 });

    res.status(200).json({
      success: true,
      data: majors,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Failed to fetch majors',
      error: message,
    });
  }
};

/**
 * Get all industries
 */
export const getIndustries = async (req: Request, res: Response) => {
  try {
    const industries = await Industry.find({ isActive: true })
      .select('name')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: industries,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Failed to fetch industries',
      error: message,
    });
  }
};

/**
 * Get Palestinian cities
 */
export const getCities = async (req: Request, res: Response) => {
  try {
    const cities = await City.find({ isActive: true })
      .select('name country')
      .sort({ name: 1 });

    // Return just the city names as an array
    const cityNames = cities.map((city) => city.name);

    res.status(200).json({
      success: true,
      data: cityNames,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cities',
      error: message,
    });
  }
};
