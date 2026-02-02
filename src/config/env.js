require('dotenv').config();

// Validate required environment variables
if (!process.env.MONGO_URI) {
  console.error('❌ FATAL ERROR: MONGO_URI environment variable is not defined');
  console.error('Please set MONGO_URI in your .env file or environment variables');
  process.exit(1);
}

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI,
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
  },
};
