import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Attempt DB Connection
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`========================================`);
    console.log(`🚀 HackHub Express API Server running on port ${PORT}`);
    console.log(`📡 Health endpoint: http://localhost:${PORT}/api/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`========================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[Server Error] Port ${PORT} is already occupied by another process.`);
      console.error(`Tip: Close other terminals running the backend or change PORT in backend/.env`);
    } else {
      console.error(`[Server Error]:`, err.message);
    }
  });
};

startServer();
