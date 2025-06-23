import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { database } from '../src/config/database';
import { migrationManager } from '../src/config/migration';

describe('Database Configuration', () => {
  beforeAll(async () => {
    // Use test database
    process.env['DB_PATH'] = './data/test.db';
    await database.connect();
    await migrationManager.initializeMigrationsTable();
  });

  afterAll(async () => {
    await database.close();
  });

  test('should connect to database', async () => {
    // Connection is already established in beforeAll
    expect(database.getDatabase()).toBeDefined();
  });

  test('should create migrations table', async () => {
    const result = await database.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='migrations'"
    );
    expect(result).toBeDefined();
  });

  test('should run migrations successfully', async () => {
    // Add a test migration
    migrationManager.addMigration({
      version: 1,
      name: 'test_migration',
      up: `
        CREATE TABLE IF NOT EXISTS test_table (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL
        )
      `,
      down: 'DROP TABLE IF EXISTS test_table'
    });

    await expect(migrationManager.migrate()).resolves.not.toThrow();
  });

  test('should get migration status', async () => {
    const status = await migrationManager.getStatus();
    expect(status.currentVersion).toBeGreaterThanOrEqual(1);
    expect(status.totalMigrations).toBeGreaterThan(0);
  });
}); 