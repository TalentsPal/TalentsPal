import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User';
import Company from './models/Company';
import Exam from './models/Exam';
import CvSubmission from './models/CvSubmission';
import Interview from './models/Interview';
import bcrypt from 'bcryptjs';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/talentspal');
    console.log('MongoDB Connected');

    // Clear existing data
    await User.deleteMany({});
    await Company.deleteMany({});
    await Exam.deleteMany({});
    await CvSubmission.deleteMany({});
    await Interview.deleteMany({});

    // Create Users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin'
    });

    const user = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: hashedPassword,
      role: 'user'
    });

    console.log('Users Created');

    // Create Companies
    await Company.create([
      {
        name: 'TechCorp',
        description: 'Leading provider of AI solutions.',
        industry: 'Technology',
        location: 'San Francisco, CA',
        website: 'https://techcorp.example.com'
      },
      {
        name: 'FinanceFlow',
        description: 'Global financial services firm.',
        industry: 'Finance',
        location: 'New York, NY',
        website: 'https://financeflow.example.com'
      }
    ]);

    console.log('Companies Created');

    // Create Exams
    await Exam.create([
      {
        title: 'Frontend Basics',
        description: 'Test your knowledge of HTML, CSS, and JavaScript.',
        category: 'Development',
        durationMinutes: 30,
        questions: [
          {
            questionText: 'What does HTML stand for?',
            options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Hyper Transfer Mark Language'],
            correctOptionIndex: 0
          },
          {
            questionText: 'Which CSS property changes text color?',
            options: ['text-color', 'color', 'font-color'],
            correctOptionIndex: 1
          }
        ]
      },
      {
        title: 'React Fundamentals',
        description: 'Core concepts of React.js.',
        category: 'Development',
        durationMinutes: 45,
        questions: [
          {
            questionText: 'What is a Hook?',
            options: ['A fishing tool', 'A special function to use state', 'A class component'],
            correctOptionIndex: 1
          }
        ]
      }
    ]);

    console.log('Exams Created');

    // Create CV Submissions
    await CvSubmission.create({
      user: user._id,
      cvText: 'Experienced Full Stack Developer with a passion for AI...',
      analysis: {
        score: 85,
        summary: 'Strong technical skills, but could improve on soft skills description.',
        strengths: ['Node.js', 'React', 'TypeScript'],
        weaknesses: ['Project management examples missing'],
        suggestions: ['Add more details about leadership roles']
      }
    });
    console.log('CV Submissions Created');

    // Create Interviews
    await Interview.create({
      user: user._id,
      topic: 'Behavioral Interview',
      history: [
        {
          question: 'Tell me about a time you failed.',
          answer: 'I once missed a deadline because...',
          feedback: 'Good honesty, but focus more on what you learned.',
          score: 8
        }
      ]
    });
    console.log('Interviews Created');

    console.log('Data Seeded Successfully');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
