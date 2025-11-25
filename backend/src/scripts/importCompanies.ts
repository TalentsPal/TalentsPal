
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import * as XLSX from 'xlsx';
import path from 'path';
import Company from '../models/Company';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/talentspal';

const files = [
  { name: 'IT Companies - Nablus.xlsx', city: 'Nablus' },
  { name: 'IT Companies - Ramallah.xlsx', city: 'Ramallah' }
];

const baseDir = 'c:\\Users\\fadih\\TalentsPal';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const importData = async () => {
  await connectDB();

  try {
    // Clear existing companies to avoid duplicates (optional, but good for clean slate)
    // await Company.deleteMany({});
    // console.log('Cleared existing companies');

    for (const fileInfo of files) {
      const filePath = path.join(baseDir, fileInfo.name);
      console.log(`Processing ${fileInfo.name}...`);

      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data: any[] = XLSX.utils.sheet_to_json(sheet);

      let count = 0;
      for (const row of data) {
        // Normalize keys to lowercase for easier access
        const normalizedRow: any = {};
        Object.keys(row).forEach(key => {
          normalizedRow[key.toLowerCase().trim()] = row[key];
        });

        const companyData = {
          name: normalizedRow['company name'],
          city: fileInfo.city,
          address: normalizedRow['address'],
          email: normalizedRow['email'],
          phone: normalizedRow['phone'],
          website: normalizedRow['jobs website'] || normalizedRow['jobswebsite'], // handle potential variations
          linkedIn: normalizedRow['linkedin profile'] || normalizedRow['linkedinprofile'],
          notes: normalizedRow['notes'],
          sourceFile: fileInfo.name
        };

        if (companyData.name) {
          // Update if exists, otherwise insert
          await Company.findOneAndUpdate(
            { name: companyData.name, city: companyData.city },
            companyData,
            { upsert: true, new: true }
          );
          count++;
        }
      }
      console.log(`Imported/Updated ${count} companies from ${fileInfo.city}`);
    }

    console.log('Import completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Import error:', error);
    process.exit(1);
  }
};

importData();
