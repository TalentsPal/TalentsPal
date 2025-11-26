import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import University from '../models/University';
import Major from '../models/Major';
import Industry from '../models/Industry';
import City from '../models/City';

const UNIVERSITIES = [
  { name: 'Birzeit University', country: 'Palestine', city: 'Ramallah' },
  { name: 'An-Najah National University', country: 'Palestine', city: 'Nablus' },
  { name: 'Bethlehem University', country: 'Palestine', city: 'Bethlehem' },
  { name: 'Hebron University', country: 'Palestine', city: 'Hebron' },
  { name: 'Palestine Polytechnic University', country: 'Palestine', city: 'Hebron' },
  { name: 'Palestine Technical University', country: 'Palestine', city: 'Tulkarm' },
  { name: 'Al-Quds University', country: 'Palestine', city: 'Jerusalem' },
  { name: 'Islamic University of Gaza', country: 'Palestine', city: 'Gaza' },
  { name: 'Al-Azhar University', country: 'Palestine', city: 'Gaza' },
  { name: 'University College of Applied Sciences', country: 'Palestine', city: 'Gaza' },
  { name: 'Arab American University', country: 'Palestine', city: 'Jenin' },
  { name: 'Other', country: 'Palestine' },
];

const MAJORS = [
  { name: 'Computer Science', category: 'IT & Computer Science' },
  { name: 'Software Engineering', category: 'IT & Computer Science' },
  { name: 'Computer Engineering', category: 'IT & Computer Science' },
  { name: 'Information Technology', category: 'IT & Computer Science' },
  { name: 'Information Systems', category: 'IT & Computer Science' },
  { name: 'Cybersecurity', category: 'IT & Computer Science' },
  { name: 'Data Science', category: 'IT & Computer Science' },
  { name: 'Artificial Intelligence', category: 'IT & Computer Science' },
  { name: 'Machine Learning', category: 'IT & Computer Science' },
  { name: 'Web Development', category: 'IT & Computer Science' },
  { name: 'Mobile App Development', category: 'IT & Computer Science' },
  { name: 'Computer Networks', category: 'IT & Computer Science' },
  { name: 'Cloud Computing', category: 'IT & Computer Science' },
  { name: 'Database Management', category: 'IT & Computer Science' },
  { name: 'DevOps Engineering', category: 'IT & Computer Science' },
  { name: 'Game Development', category: 'IT & Computer Science' },
  { name: 'Computer Graphics', category: 'IT & Computer Science' },
  { name: 'Computer Science Apprenticeship', category: 'IT & Computer Science' },
  { name: 'IT Support & Administration', category: 'IT & Computer Science' },
  { name: 'Network Engineering', category: 'IT & Computer Science' },
  { name: 'Software Testing & QA', category: 'IT & Computer Science' },
  { name: 'Blockchain Development', category: 'IT & Computer Science' },
  { name: 'IoT (Internet of Things)', category: 'IT & Computer Science' },
  { name: 'Embedded Systems', category: 'IT & Computer Science' },
  { name: 'UI/UX Design', category: 'IT & Computer Science' },
  { name: 'Other', category: 'Other' },
];

const INDUSTRIES = [
  { name: 'Technology & IT' },
  { name: 'Finance & Banking' },
  { name: 'Healthcare' },
  { name: 'Education' },
  { name: 'Manufacturing' },
  { name: 'Retail' },
  { name: 'Construction' },
  { name: 'Telecommunications' },
  { name: 'Tourism & Hospitality' },
  { name: 'Agriculture' },
  { name: 'Media & Marketing' },
  { name: 'NGO & Development' },
  { name: 'Other' },
];

const CITIES = [
  { name: 'Ramallah', country: 'Palestine' },
  { name: 'Jerusalem', country: 'Palestine' },
  { name: 'Bethlehem', country: 'Palestine' },
  { name: 'Nablus', country: 'Palestine' },
  { name: 'Hebron', country: 'Palestine' },
  { name: 'Jenin', country: 'Palestine' },
  { name: 'Tulkarm', country: 'Palestine' },
  { name: 'Qalqilya', country: 'Palestine' },
  { name: 'Gaza', country: 'Palestine' },
  { name: 'Other', country: 'Palestine' },
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/talentspal');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await University.deleteMany({});
    await Major.deleteMany({});
    await Industry.deleteMany({});
    await City.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Insert universities
    await University.insertMany(UNIVERSITIES);
    console.log(`✅ Inserted ${UNIVERSITIES.length} universities`);

    // Insert majors
    await Major.insertMany(MAJORS);
    console.log(`✅ Inserted ${MAJORS.length} majors (programming-related only)`);

    // Insert industries
    await Industry.insertMany(INDUSTRIES);
    console.log(`✅ Inserted ${INDUSTRIES.length} industries`);

    // Insert cities
    await City.insertMany(CITIES);
    console.log(`✅ Inserted ${CITIES.length} cities`);

    console.log('🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
