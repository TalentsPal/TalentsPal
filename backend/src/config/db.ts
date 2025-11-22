import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Connect to MongoDB using the URI from environment variables
    // If MONGO_URI is not defined, it falls back to a local instance (useful for dev without .env)
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/talentspal');

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    // Log the error and exit the process with failure
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
