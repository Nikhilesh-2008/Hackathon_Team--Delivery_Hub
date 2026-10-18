import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_URI = 'mongodb://127.0.0.1:27017/hackhub';

export const connectDatabase = async (customUri = null) => {
  const uri = customUri || process.env.MONGODB_URI || DEFAULT_URI;

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true, // Build indexes in development/testing
    });
    console.log(`[Database] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);

    // Drop stale legacy indexes if left over from previous schema versions
    try {
      const collections = await conn.connection.db.listCollections().toArray();
      const colNames = collections.map((c) => c.name);
      if (colNames.includes('profiles')) {
        const profileIndexes = await conn.connection.db.collection('profiles').indexes();
        if (profileIndexes.some((idx) => idx.name === 'user_1')) {
          await conn.connection.db.collection('profiles').dropIndex('user_1');
          console.log('[Database] Cleaned up legacy index user_1 from profiles');
        }
      }
      if (colNames.includes('submissions')) {
        const subIndexes = await conn.connection.db.collection('submissions').indexes();
        if (subIndexes.some((idx) => idx.name === 'team_1')) {
          await conn.connection.db.collection('submissions').dropIndex('team_1');
          console.log('[Database] Cleaned up legacy index team_1 from submissions');
        }
      }
    } catch (cleanupErr) {
      console.warn('[Database] Legacy index cleanup note:', cleanupErr.message);
    }

    return conn.connection;
  } catch (error) {
    console.error(`[Database] Connection error: ${error.message}`);
    throw error;
  }
};

export const disconnectDatabase = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('[Database] MongoDB disconnected cleanly.');
  }
};

export default { connectDatabase, disconnectDatabase };
