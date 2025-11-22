import { Request, Response } from 'express';
import Company from '../models/Company';

export const getCompanies = async (req: Request, res: Response) => {
  try {
    const companies = await Company.find({});
    res.json(companies);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createCompany = async (req: Request, res: Response) => {
  const { name, description, industry, location, website } = req.body;

  try {
    const company = new Company({
      name,
      description,
      industry,
      location,
      website
    });

    const createdCompany = await company.save();
    res.status(201).json(createdCompany);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
