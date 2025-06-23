# AB-EAM Architecture (Early Adopter Management)

## Overview

AB-EAM is a web application designed to simplify the management of Early Adopter programs within the company. The architecture follows a modular approach with clear separation between backend and frontend.

## General Architecture

### Technical Stack
- **Backend**: Node.js with Express.js
- **Frontend**: React with TypeScript
- **Database**: SQLite (embedded)
- **Containerization**: Docker
- **Modules**: ES6 modules
- **API**: RESTful API

### Layered Architecture

```
┌─────────────────────────────────────┐
│           Frontend (React)          │
├─────────────────────────────────────┤
│         API Gateway (Express)       │
├─────────────────────────────────────┤
│        Service Layer (Business)     │
├─────────────────────────────────────┤
│        Data Access Layer (DAO)      │
├─────────────────────────────────────┤
│         Database (SQLite)           │
└─────────────────────────────────────┘
```

## Design Patterns

### Backend

#### 1. Repository Pattern
- Data access layer abstraction
- Common interface for all entities
- Facilitates unit testing and database switching

#### 2. Service Layer Pattern
- Centralized business logic
- Data validation
- Complex operation orchestration

#### 3. Controller Pattern
- HTTP request handling
- Input parameter validation
- Response transformation

#### 4. Middleware Pattern
- Authentication and authorization
- JWT token validation
- Logging and monitoring

#### 5. Factory Pattern
- Service instance creation
- Dependency injection
- Centralized configuration

### Frontend

#### 1. Component Pattern
- Reusable components
- Separation of concerns
- Props and state management

#### 2. Container/Presentational Pattern
- Containers for business logic
- Presentational components for UI
- Clear separation of concerns

#### 3. Context Pattern (React)
- Global state management
- Authentication and authorization
- Theme and configuration

## Database Management

### Migration System
The application implements a robust migration system for database schema management:

#### Migration Manager (`MigrationManager`)
- **Version Control**: Tracks migration versions in a dedicated `migrations` table
- **Automatic Execution**: Applies pending migrations on application startup
- **Rollback Support**: Supports rolling back the last applied migration
- **Transaction Safety**: Each migration runs within a database transaction
- **Status Tracking**: Provides migration status and pending count

#### Migration Structure
```typescript
interface Migration {
  version: number;      // Sequential version number
  name: string;         // Descriptive migration name
  up: string;          // SQL to apply the migration
  down?: string;       // SQL to rollback the migration (optional)
}
```

#### Migration Features
- **Automatic Initialization**: Creates migrations table if it doesn't exist
- **Version Sorting**: Automatically sorts migrations by version number
- **Error Handling**: Rollback on migration failure
- **Logging**: Detailed logging of migration operations
- **Status Queries**: Get current version and pending migrations

#### Migration Commands
- `migrate()`: Apply all pending migrations
- `rollback()`: Rollback the last migration
- `getStatus()`: Get current migration status
- `getCurrentVersion()`: Get current database version
- `getPendingMigrations()`: Get list of pending migrations

### Database Schema

The following tables and relations are implemented in the database schema:

### users
- `id` (TEXT, PRIMARY KEY): Unique user ID (UUID)
- `email` (TEXT, UNIQUE, NOT NULL): User email
- `first_name` (TEXT, NOT NULL): First name
- `last_name` (TEXT, NOT NULL): Last name
- `role` (TEXT, NOT NULL): 'PRODUCT_PEOPLE' or 'CLIENT_MANAGER'
- `status` (TEXT, NOT NULL, default 'PENDING'): 'PENDING', 'ACTIVE', 'INACTIVE'
- `created_at` (DATETIME): Creation date
- `updated_at` (DATETIME): Update date

### programs
- `id` (TEXT, PRIMARY KEY): Program ID (UUID)
- `title` (TEXT, NOT NULL): Program title
- `description` (TEXT): Program description
- `creator_id` (TEXT, NOT NULL): FK to `users(id)`
- `stakeholders` (TEXT): JSON array of user IDs
- `start_date` (DATETIME): Estimated start date
- `end_date` (DATETIME): Estimated end date
- `status` (TEXT, NOT NULL, default 'PENDING'): 'PENDING', 'LIVE', 'STOPPED', 'ARCHIVED'
- `created_at` (DATETIME): Creation date
- `updated_at` (DATETIME): Update date

### contact_users
- `id` (TEXT, PRIMARY KEY): Contact user ID (UUID)
- `first_name` (TEXT, NOT NULL): First name
- `last_name` (TEXT, NOT NULL): Last name
- `email` (TEXT, NOT NULL): Email
- `created_at` (DATETIME): Creation date

### enrollment_requests
- `id` (TEXT, PRIMARY KEY): Request ID (UUID)
- `program_id` (TEXT, NOT NULL): FK to `programs(id)`
- `client_name` (TEXT, NOT NULL): Client name
- `account_ids` (TEXT): JSON array of account IDs
- `motivation` (TEXT): Motivation
- `status` (TEXT, NOT NULL, default 'PENDING'): 'PENDING', 'APPROVED', 'REJECTED'
- `requested_by` (TEXT, NOT NULL): FK to `users(id)`
- `created_at` (DATETIME): Creation date
- `updated_at` (DATETIME): Update date

### enrollment_request_contact_users
- `enrollment_request_id` (TEXT, FK): FK to `enrollment_requests(id)`
- `contact_user_id` (TEXT, FK): FK to `contact_users(id)`
- PRIMARY KEY (`enrollment_request_id`, `contact_user_id`)

### clients
- `id` (TEXT, PRIMARY KEY): Client ID (UUID)
- `program_id` (TEXT, NOT NULL): FK to `programs(id)`
- `enrollment_request_id` (TEXT, NOT NULL): FK to `enrollment_requests(id)`
- `account_ids` (TEXT): JSON array of account IDs
- `is_active` (BOOLEAN, NOT NULL, default 1): Client active in the program
- `enrolled_at` (DATETIME): Enrollment date
- `updated_at` (DATETIME): Update date

### client_contact_users
- `client_id` (TEXT, FK): FK to `clients(id)`
- `contact_user_id` (TEXT, FK): FK to `contact_users(id)`
- PRIMARY KEY (`client_id`, `contact_user_id`)

### migrations
- `id` (INTEGER, PRIMARY KEY AUTOINCREMENT): Migration record ID
- `version` (INTEGER): Migration version
- `name` (TEXT): Migration name
- `applied_at` (DATETIME): When migration was applied

#### Indexes
- Indexes are created on key fields for performance (email, status, role, foreign keys, etc.)

#### Constraints
- Foreign keys with cascading deletes
- Role and status values are checked by SQL constraints
- JSON fields for arrays (account_ids, stakeholders)

## API Design

### REST Conventions
- GET /api/users - List users
- POST /api/users - Create user
- GET /api/users/:id - Get user details
- PUT /api/users/:id - Update user
- DELETE /api/users/:id - Delete user

### Response Codes
- 200: Success
- 201: Created successfully
- 400: Validation error
- 404: Resource not found
- 500: Server error

### Pagination
- Parameters: `page`, `limit`
- Response: `{ data, pagination: { page, limit, total, pages } }`

## Testing

### TDD Strategy
- Unit tests for each function
- Integration tests for APIs
- End-to-end tests for critical workflows

### Testing Tools
- **Backend**: Jest + Supertest
- **Frontend**: Jest + React Testing Library
- **Coverage**: Minimum 80%

### Test Configuration
- **Jest Configuration**: ES6 modules support with ts-jest
- **Test Environment**: Node.js environment
- **Coverage Thresholds**: 80% for branches, functions, lines, and statements
- **Test Setup**: Dedicated setup file for test environment configuration
- **Module Resolution**: Path mapping for clean imports (`@/` prefix)

### Test Structure
```
tests/
├── setup.ts              # Test environment setup
├── unit/                 # Unit tests
│   ├── services/         # Service layer tests
│   ├── repositories/     # Data access layer tests
│   └── utils/           # Utility function tests
├── integration/          # Integration tests
│   ├── api/             # API endpoint tests
│   └── database/        # Database integration tests
└── fixtures/            # Test data and fixtures
```

### Migration Testing
- **Database Setup**: In-memory SQLite for tests
- **Migration Testing**: Automatic migration application in test environment
- **Data Isolation**: Each test gets a clean database state
- **Rollback Testing**: Verify migration rollback functionality

## Performance

### Optimizations
- List pagination
- Database indexing
- Static data caching
- Component lazy loading

### Monitoring
- Structured logging
- Performance metrics
- Error alerts

## Deployment

### Docker
- Multi-stage builds
- Optimized images
- Environment variables

### Configuration
- Environment-specific configuration files
- Environment variables for secrets
- Database configuration

## Scalability

### Future Extensions
- Email notifications
- External tool integrations
- Public API for partners
- Advanced analytics and reporting

### Data Migration
- Versioned migration scripts
- Rollback capability
- Automatic backup

## Code Standards

### Backend (Node.js/Express)
- ESLint + Prettier
- TypeScript strict mode
- JSDoc for documentation
- Conventional commits

### Frontend (React)
- ESLint + Prettier
- TypeScript strict mode
- Custom hooks
- Functional components

### Database
- Versioned migrations
- Integrity constraints
- Optimized indexes
- Schema documentation 