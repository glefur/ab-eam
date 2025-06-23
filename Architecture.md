# AB-EAM Architecture (Early Adopter Management)

## 🏗️ Document Purpose

**This document describes the architecture and design decisions for the AB-EAM project.**

- ✅ **Allowed content**: General architecture, design patterns, architectural decisions, design principles, technical structure
- ❌ **Forbidden content**: Activity tracking, implementation details, task planning, step validation

For progress tracking and planning, refer to the `LOGBOOK.md` file.

---

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

#### 6. Model Pattern with Validation
- **Base Model Class**: Abstract base class providing common validation methods
- **Strict TypeScript**: All optional properties explicitly typed with `| undefined`
- **Business Rule Validation**: Models enforce business rules beyond simple type checking
- **Immutable Creation**: Static factory methods for creating new instances
- **Database Conversion**: Methods to convert between domain objects and database records
- **JSON Serialization**: Standardized serialization/deserialization

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

## Model Design Principles

### Validation Strategy
- **Centralized Validation**: All validation logic in model classes
- **Fail Fast**: Validation errors thrown immediately with descriptive messages
- **Business Rules**: Complex business logic enforced at model level
- **Type Safety**: Strict TypeScript configuration with `exactOptionalPropertyTypes: true`

### Model Lifecycle
- **Creation**: Static factory methods with validation
- **Updates**: Instance methods that validate after changes
- **Persistence**: Conversion methods for database/JSON formats
- **Status Management**: Helper methods for state transitions

### Type Safety Approach
- **Explicit Optionals**: All optional properties use `| undefined` type
- **Enum Usage**: Strict enums for status and role values
- **Interface Contracts**: Clear contracts between layers
- **Database Mapping**: Explicit mapping between domain and database types

## Database Management

### Migration System
The application implements a robust migration system for database schema management with version control, automatic execution, rollback support, and transaction safety.

### Database Schema

The application uses a relational database with the following main entities:

- **Users**: System users with roles (Product People, Client Manager) and status management
- **Registration Requests**: User registration workflow with approval/rejection process
- **Programs**: Early Adopter programs with lifecycle management
- **Enrollment Requests**: Client enrollment in programs
- **Clients**: Enrolled clients with activity tracking
- **Contact Users**: Client contact information

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
│   ├── models/           # Model validation tests
│   ├── repositories/     # Data access layer tests
│   ├── services/         # Service layer tests
│   └── utils/           # Utility function tests
├── integration/          # Integration tests
│   ├── api/             # API endpoint tests
│   └── database/        # Database integration tests
└── fixtures/            # Test data and fixtures
```

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