import mongoose from 'mongoose';

export const checkHealth = async () => {
  const isConnected = mongoose.connection.readyState === 1;
  return {
    success: true,
    service: 'hackhub-api',
    database: isConnected ? 'connected' : 'disconnected',
  };
};

export default {
  checkHealth,
};
