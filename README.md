# Ad Campaign Management Platform - Backend API

Production-ready REST API for ad campaign management and analytics, built with Node.js, Express, and MongoDB.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with refresh tokens, role-based access control
- **Campaign Management**: Full CRUD operations for ad campaigns with budget tracking
- **Creative Management**: Upload and manage ad creatives (images, videos)
- **Analytics Engine**: Real-time analytics tracking and aggregated metrics
- **Security**: Helmet.js, CORS, input validation, password hashing
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **API Documentation**: Complete API reference in [API.md](./API.md)

## 📋 Prerequisites

- **Node.js**: v18.x or higher
- **MongoDB**: v7.x or higher
- **npm**: v9.x or higher

## 🛠️ Installation

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ads-platform-backend.git
   cd ads-platform-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/ads-platform
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
   CLIENT_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:7.0
   
   # Or use local MongoDB installation
   mongod
   ```

5. **Start the development server**
   ```bash
   node src/server.js
   ```

   The API will be available at `http://localhost:5000/api`

## 🐳 Docker Deployment

### Build the Docker image

```bash
docker build -t ads-platform-backend .
```

### Run with Docker

```bash
docker run -d \
  -p 5000:5000 \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/ads-platform \
  -e JWT_SECRET=your-secret-key \
  -e JWT_REFRESH_SECRET=your-refresh-secret \
  -e CLIENT_URL=https://yourdomain.com \
  --name ads-backend \
  ads-platform-backend
```

### Production Deployment with Docker Compose

Create a `docker-compose.yml`:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    restart: always
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_DATABASE: ads-platform

  backend:
    build: .
    restart: always
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: production
      MONGODB_URI: mongodb://mongodb:27017/ads-platform
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      CLIENT_URL: ${CLIENT_URL}
    depends_on:
      - mongodb

volumes:
  mongodb_data:
```

Run with:
```bash
docker-compose up -d
```

## 🌍 Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | `5000` | No |
| `NODE_ENV` | Environment (development/production) | `development` | No |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/ads-platform` | Yes |
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `JWT_REFRESH_SECRET` | Refresh token signing secret | - | Yes |
| `JWT_EXPIRES_IN` | Access token expiration | `1h` | No |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration | `7d` | No |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:3000` | Yes |

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Users (Protected)
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin only)

### Campaigns (Protected)
- `GET /api/campaigns` - Get all campaigns
- `POST /api/campaigns` - Create campaign
- `GET /api/campaigns/:id` - Get campaign by ID
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign
- `GET /api/campaigns/:id/stats` - Get campaign statistics

### Analytics (Protected)
- `GET /api/analytics/overview` - Get analytics overview
- `GET /api/analytics/campaigns/:id` - Get campaign analytics
- `POST /api/analytics/simulate` - Simulate analytics data (Dev only)

### Health Check
- `GET /health` - Server health status

For detailed API documentation with request/response examples, see [API.md](./API.md)

## 🏗️ Project Structure

```
ads-platform-backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── env.js        # Environment variables
│   │   └── database.js   # MongoDB connection
│   ├── controllers/      # Request handlers
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── campaignController.js
│   │   └── analyticsController.js
│   ├── middleware/       # Custom middleware
│   │   ├── auth.js       # JWT authentication
│   │   ├── validator.js  # Input validation
│   │   └── errorHandler.js
│   ├── models/           # Mongoose schemas
│   │   ├── User.js
│   │   ├── Campaign.js
│   │   ├── Creative.js
│   │   └── AnalyticsEvent.js
│   ├── routes/           # API routes
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── campaigns.js
│   │   └── analytics.js
│   ├── utils/            # Utility functions
│   │   └── tokenUtils.js
│   └── server.js         # Application entry point
├── .env.example          # Environment variables template
├── .gitignore
├── Dockerfile            # Docker configuration
├── package.json
└── README.md
```

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Access and refresh token mechanism
- **Helmet.js**: Security headers
- **CORS**: Configurable origin
- **Input Validation**: Express-validator
- **Role-Based Access**: Admin and user roles
- **Error Sanitization**: No stack traces in production

## 🧪 Testing

Create test user via API:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "admin123",
    "role": "admin"
  }'
```

Login:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

## 🚀 Deployment

### Platform-Specific Guides

#### AWS EC2
1. Launch Ubuntu EC2 instance
2. Install Node.js and MongoDB
3. Clone repository
4. Set environment variables
5. Use PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start src/server.js --name ads-backend
   pm2 save
   pm2 startup
   ```

#### DigitalOcean
1. Create Droplet with Node.js
2. Setup MongoDB (managed or self-hosted)
3. Configure firewall rules
4. Deploy using Docker or PM2

#### Heroku
1. Create new Heroku app
2. Add MongoDB Atlas add-on or use external MongoDB
3. Set environment variables in Heroku dashboard
4. Deploy:
   ```bash
   git push heroku main
   ```

#### Railway/Render
1. Connect GitHub repository
2. Set environment variables
3. Configure MongoDB connection
4. Deploy automatically on push

## 📊 Monitoring

Health check endpoint:
```bash
curl http://localhost:5000/health
```

Response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-02-02T10:30:00.000Z"
}
```

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Verify MongoDB is running: `docker ps` or `systemctl status mongod`
- Check connection string format
- Ensure firewall allows port 27017

### JWT Token Errors
- Verify JWT_SECRET is set and matches across deployments
- Check token expiration settings
- Clear old tokens and re-authenticate

### CORS Errors
- Set CLIENT_URL to match your frontend domain
- Include protocol (http/https) in CLIENT_URL
- Check credentials flag in CORS configuration

## 📝 License

MIT

## 👥 Support

For issues and questions:
- Open an issue on GitHub
- Check [API.md](./API.md) for API documentation
- Review deployment guides above

---

Built with ❤️ using Node.js, Express, and MongoDB
