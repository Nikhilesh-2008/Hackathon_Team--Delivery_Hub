import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hackhub';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (error) {
    console.warn(`[MongoDB] Connection notice: Unable to connect to ${uri}. Error: ${error.message}`);
    console.warn(`[MongoDB] Operating in flexible mode. Server will remain responsive.`);
    return false;
  }
};
