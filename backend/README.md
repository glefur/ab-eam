# AB-EAM Backend

Backend API for the AB-EAM (Early Adopter Management) application.

## Features

- User management with role-based access control
- Early Adopter program management
- Client enrollment request handling
- JWT authentication and authorization
- SQLite database with embedded storage
- RESTful API design
- Comprehensive testing with TDD approach

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: SQLite
- **Authentication**: JWT
- **Testing**: Jest + Supertest
- **Linting**: ESLint + Prettier

## Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0

## Installation

1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create environment file:
   ```bash
   cp .env.example .env
   ```

5. Configure environment variables in `.env`

## Development

### Start development server
```bash
npm run dev
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

### Build for production
```bash
npm run build
```

### Start production server
```bash
npm start
```

## Testing

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

## Code Quality

### Linting
```bash
# Check for linting issues
npm run lint

# Fix linting issues automatically
npm run lint:fix
```

### Formatting
```bash
# Format code
npm run format

# Check formatting
npm run format:check
```

## Project Structure

```
backend/
├── src/
│   ├── controllers/     # API controllers
│   ├── services/        # Business logic
│   ├── repositories/    # Data access layer
│   ├── models/          # Data models
│   ├── middleware/      # Express middlewares
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript type definitions
│   ├── config/          # Configuration files
│   └── index.ts         # Application entry point
├── tests/               # Test files
├── migrations/          # Database migrations
├── dist/                # Compiled JavaScript (generated)
└── package.json
```

## API Documentation

The API follows RESTful conventions:

- `GET /api/users` - List users
- `POST /api/users` - Create user
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Authentication

All protected endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Response Format

All API responses follow this format:
```json
{
  "success": true,
  "data": {},
  "message": "Success message"
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## Environment Variables

Create a `.env` file with the following variables:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_PATH=./data/ab-eam.db

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=info
```

## Database

The application uses SQLite as an embedded database. The database file will be created automatically in the specified path.

### Migrations

Database migrations are stored in the `migrations/` directory and are automatically applied when the application starts.

## Contributing

1. Follow the TDD approach - write tests first
2. Ensure all tests pass
3. Follow the coding standards (ESLint + Prettier)
4. Maintain 80%+ test coverage
5. Use conventional commits

## License

ISC 