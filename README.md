# LandVerify Backend

This is the backend server for the LandVerify application, built with Express.js and PostgreSQL.

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd landverify-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=5000
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=landverify
DB_PORT=5432
JWT_SECRET=your_jwt_secret_key
```

4. Create the PostgreSQL database:
```bash
createdb landverify
```

## Running the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication

- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user

### Land Management

- GET `/api/lands` - Get all lands
- GET `/api/lands/:id` - Get land by ID
- POST `/api/lands` - Create new land (requires authentication)
- PUT `/api/lands/:id` - Update land (requires authentication)
- DELETE `/api/lands/:id` - Delete land (requires authentication)

## API Documentation

### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login User
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Create Land
```
POST /api/lands
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Beautiful Land",
  "description": "A beautiful piece of land",
  "location": "123 Main St",
  "coordinates": {
    "latitude": 123.456,
    "longitude": 789.012
  },
  "area": 1000,
  "price": 50000
}
```

## Error Handling

The API uses standard HTTP status codes and returns errors in the following format:
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information (in development)"
}
```

## Security

- JWT authentication
- Password hashing using bcrypt
- Input validation using express-validator
- CORS enabled 