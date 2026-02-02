# Backend API Documentation

## Overview

RESTful API for Ad Campaign Management Platform built with Node.js, Express, and MongoDB.

## Base URL

```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

## Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "...",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user"
    },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your_refresh_token"
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### Campaigns

#### Get All Campaigns
```http
GET /api/campaigns?page=1&limit=10&status=active&search=summer
Authorization: Bearer <token>
```

Query Parameters:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status
- `search` (optional): Search by name

#### Get Campaign by ID
```http
GET /api/campaigns/:id
Authorization: Bearer <token>
```

#### Create Campaign
```http
POST /api/campaigns
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Summer Sale 2024",
  "status": "draft",
  "budget": 5000,
  "startDate": "2024-06-01T00:00:00.000Z",
  "endDate": "2024-06-30T23:59:59.999Z",
  "description": "Summer promotional campaign"
}
```

#### Update Campaign
```http
PUT /api/campaigns/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Campaign Name",
  "status": "active",
  "budget": 7500
}
```

#### Delete Campaign
```http
DELETE /api/campaigns/:id
Authorization: Bearer <token>
```

#### Get Campaign Stats
```http
GET /api/campaigns/stats
Authorization: Bearer <token>
```

#### Create Creative
```http
POST /api/campaigns/:id/creatives
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Banner Ad 1",
  "type": "image",
  "mediaUrl": "https://example.com/ad-banner.jpg",
  "headline": "Summer Sale - 50% Off!",
  "description": "Limited time offer",
  "callToAction": "shop_now",
  "destinationUrl": "https://example.com/sale"
}
```

### Analytics

#### Get Analytics Overview
```http
GET /api/analytics/overview?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <token>
```

Query Parameters:
- `startDate` (optional): Filter start date
- `endDate` (optional): Filter end date

#### Get Campaign Analytics
```http
GET /api/analytics/campaigns/:id?startDate=2024-01-01&endDate=2024-12-31&groupBy=day
Authorization: Bearer <token>
```

Query Parameters:
- `startDate` (optional): Filter start date
- `endDate` (optional): Filter end date
- `groupBy` (optional): hour, day, week, month

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "impressions": 150000,
      "clicks": 4500,
      "conversions": 225,
      "views": 120000,
      "ctr": "3.00",
      "conversionRate": "5.00",
      "totalValue": 11250
    },
    "timeSeries": [
      {
        "date": "2024-06-01",
        "impressions": 5000,
        "clicks": 150,
        "conversions": 8
      }
    ],
    "deviceBreakdown": [
      {
        "_id": "mobile",
        "impressions": 75000,
        "clicks": 2250,
        "conversions": 112
      }
    ],
    "locationBreakdown": [
      {
        "_id": "USA",
        "impressions": 100000,
        "clicks": 3000,
        "conversions": 150
      }
    ]
  }
}
```

#### Create Analytics Event
```http
POST /api/analytics/events
Authorization: Bearer <token>
Content-Type: application/json

{
  "campaign": "campaign_id",
  "eventType": "click",
  "metadata": {
    "deviceType": "mobile",
    "location": {
      "country": "USA",
      "city": "New York"
    }
  }
}
```

#### Generate Simulated Analytics Data
```http
POST /api/analytics/campaigns/:id/simulate
Authorization: Bearer <token>
Content-Type: application/json

{
  "days": 7
}
```

### Users (Admin Only)

#### Get All Users
```http
GET /api/users?page=1&limit=10&role=user&search=john
Authorization: Bearer <token>
```

#### Get User by ID
```http
GET /api/users/:id
Authorization: Bearer <token>
```

#### Update User
```http
PUT /api/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com"
}
```

#### Delete User
```http
DELETE /api/users/:id
Authorization: Bearer <token>
```

## Error Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid or missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

Currently no rate limiting is implemented. In production, consider adding rate limiting middleware.

## Pagination

Paginated endpoints return:
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10
    }
  }
}
```

## Testing with cURL

### Complete Workflow Example

```bash
# 1. Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'

# 2. Login (save the token)
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }' | jq -r '.data.accessToken')

# 3. Create Campaign
CAMPAIGN_ID=$(curl -X POST http://localhost:5000/api/campaigns \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Campaign",
    "status": "active",
    "budget": 1000,
    "startDate": "2024-06-01",
    "endDate": "2024-06-30"
  }' | jq -r '.data.campaign.id')

# 4. Generate Analytics Data
curl -X POST http://localhost:5000/api/analytics/campaigns/$CAMPAIGN_ID/simulate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"days": 7}'

# 5. Get Analytics
curl -X GET "http://localhost:5000/api/analytics/campaigns/$CAMPAIGN_ID" \
  -H "Authorization: Bearer $TOKEN"
```
