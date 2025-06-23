import { migrationManager } from './migration.js';
import { database } from './database.js';

// Import migration directly
const initialSchemaMigration = {
  version: 1,
  name: 'initial_schema',
  up: `
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('PRODUCT_PEOPLE', 'CLIENT_MANAGER')),
      status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACTIVE', 'INACTIVE')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Programs table
    CREATE TABLE IF NOT EXISTS programs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      creator_id TEXT NOT NULL,
      stakeholders TEXT, -- JSON array of user IDs
      start_date DATETIME,
      end_date DATETIME,
      status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'LIVE', 'STOPPED', 'ARCHIVED')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (creator_id) REFERENCES users (id) ON DELETE CASCADE
    );

    -- Contact users table
    CREATE TABLE IF NOT EXISTS contact_users (
      id TEXT PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Enrollment requests table
    CREATE TABLE IF NOT EXISTS enrollment_requests (
      id TEXT PRIMARY KEY,
      program_id TEXT NOT NULL,
      client_name TEXT NOT NULL,
      account_ids TEXT, -- JSON array of account IDs
      motivation TEXT,
      status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
      requested_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (program_id) REFERENCES programs (id) ON DELETE CASCADE,
      FOREIGN KEY (requested_by) REFERENCES users (id) ON DELETE CASCADE
    );

    -- Enrollment request contact users junction table
    CREATE TABLE IF NOT EXISTS enrollment_request_contact_users (
      enrollment_request_id TEXT NOT NULL,
      contact_user_id TEXT NOT NULL,
      PRIMARY KEY (enrollment_request_id, contact_user_id),
      FOREIGN KEY (enrollment_request_id) REFERENCES enrollment_requests (id) ON DELETE CASCADE,
      FOREIGN KEY (contact_user_id) REFERENCES contact_users (id) ON DELETE CASCADE
    );

    -- Clients table
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      program_id TEXT NOT NULL,
      enrollment_request_id TEXT NOT NULL,
      account_ids TEXT, -- JSON array of account IDs
      is_active BOOLEAN NOT NULL DEFAULT 1,
      enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (program_id) REFERENCES programs (id) ON DELETE CASCADE,
      FOREIGN KEY (enrollment_request_id) REFERENCES enrollment_requests (id) ON DELETE CASCADE
    );

    -- Client contact users junction table
    CREATE TABLE IF NOT EXISTS client_contact_users (
      client_id TEXT NOT NULL,
      contact_user_id TEXT NOT NULL,
      PRIMARY KEY (client_id, contact_user_id),
      FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE,
      FOREIGN KEY (contact_user_id) REFERENCES contact_users (id) ON DELETE CASCADE
    );

    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
    CREATE INDEX IF NOT EXISTS idx_users_status ON users (status);
    
    CREATE INDEX IF NOT EXISTS idx_programs_creator_id ON programs (creator_id);
    CREATE INDEX IF NOT EXISTS idx_programs_status ON programs (status);
    CREATE INDEX IF NOT EXISTS idx_programs_start_date ON programs (start_date);
    CREATE INDEX IF NOT EXISTS idx_programs_end_date ON programs (end_date);
    
    CREATE INDEX IF NOT EXISTS idx_enrollment_requests_program_id ON enrollment_requests (program_id);
    CREATE INDEX IF NOT EXISTS idx_enrollment_requests_requested_by ON enrollment_requests (requested_by);
    CREATE INDEX IF NOT EXISTS idx_enrollment_requests_status ON enrollment_requests (status);
    
    CREATE INDEX IF NOT EXISTS idx_clients_program_id ON clients (program_id);
    CREATE INDEX IF NOT EXISTS idx_clients_enrollment_request_id ON clients (enrollment_request_id);
    CREATE INDEX IF NOT EXISTS idx_clients_is_active ON clients (is_active);
    
    CREATE INDEX IF NOT EXISTS idx_contact_users_email ON contact_users (email);
  `,
  down: `
    -- Drop indexes
    DROP INDEX IF EXISTS idx_users_email;
    DROP INDEX IF EXISTS idx_users_role;
    DROP INDEX IF EXISTS idx_users_status;
    DROP INDEX IF EXISTS idx_programs_creator_id;
    DROP INDEX IF EXISTS idx_programs_status;
    DROP INDEX IF EXISTS idx_programs_start_date;
    DROP INDEX IF EXISTS idx_programs_end_date;
    DROP INDEX IF EXISTS idx_enrollment_requests_program_id;
    DROP INDEX IF EXISTS idx_enrollment_requests_requested_by;
    DROP INDEX IF EXISTS idx_enrollment_requests_status;
    DROP INDEX IF EXISTS idx_clients_program_id;
    DROP INDEX IF EXISTS idx_clients_enrollment_request_id;
    DROP INDEX IF EXISTS idx_clients_is_active;
    DROP INDEX IF EXISTS idx_contact_users_email;

    -- Drop tables
    DROP TABLE IF EXISTS client_contact_users;
    DROP TABLE IF EXISTS clients;
    DROP TABLE IF EXISTS enrollment_request_contact_users;
    DROP TABLE IF EXISTS enrollment_requests;
    DROP TABLE IF EXISTS contact_users;
    DROP TABLE IF EXISTS programs;
    DROP TABLE IF EXISTS users;
  `
};

/**
 * Register all migrations
 */
export function registerMigrations(): void {
  // Register initial schema migration
  migrationManager.addMigration(initialSchemaMigration);
  
  // Add future migrations here
  // migrationManager.addMigration(secondMigration);
  // migrationManager.addMigration(thirdMigration);
}

/**
 * Initialize database and run migrations
 */
export async function initializeDatabase(): Promise<void> {
  try {
    // Connect to database
    await database.connect();
    
    // Register migrations
    registerMigrations();
    
    // Run migrations
    await migrationManager.migrate();
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

/**
 * Get migration status
 */
export async function getMigrationStatus(): Promise<{
  currentVersion: number;
  pendingCount: number;
  totalMigrations: number;
}> {
  return await migrationManager.getStatus();
} 