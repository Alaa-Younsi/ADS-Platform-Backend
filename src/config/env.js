require('dotenv').config();

// Validate required environment variables
if (!process.env.MONGO_URI) {
  console.error('❌ FATAL ERROR: MONGO_URI environment variable is not defined');
  console.error('Please set MONGO_URI in your .env file or environment variables');
  process.exit(1);
}

// Warn about missing JWT_SECRET in production
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.warn('⚠️  WARNING: JWT_SECRET not set in production. Using default (not recommended).');
}

// Parse CORS origins - supports multiple comma-separated URLs
const getAllowedOrigins = () => {
  const clientUrl = process.env.CLIENT_URL;
  
  if (!clientUrl) {
    // Default for local development
    return ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'];
  }
  
  // Support comma-separated list of origins
  return clientUrl.split(',').map(url => url.trim());
};

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
    origins: getAllowedOrigins(),
  },
};
