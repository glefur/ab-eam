import { database } from './database.js';

export interface Migration {
  version: number;
  name: string;
  up: string;
  down?: string;
}

export class MigrationManager {
  private migrations: Migration[] = [];
  private initialized = false;

  constructor() {}

  /**
   * Initialize migrations table (must be called after DB connect)
   */
  public async initializeMigrationsTable(): Promise<void> {
    if (this.initialized) return;
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version INTEGER NOT NULL,
        name TEXT NOT NULL,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await database.run(createTableSQL);
    this.initialized = true;
  }

  /**
   * Add a migration
   */
  public addMigration(migration: Migration): void {
    this.migrations.push(migration);
    // Sort migrations by version
    this.migrations.sort((a, b) => a.version - b.version);
  }

  /**
   * Get current database version
   */
  public async getCurrentVersion(): Promise<number> {
    const result = await database.get(
      'SELECT MAX(version) as current_version FROM migrations'
    );
    return result?.current_version || 0;
  }

  /**
   * Get pending migrations
   */
  public async getPendingMigrations(): Promise<Migration[]> {
    const currentVersion = await this.getCurrentVersion();
    return this.migrations.filter(migration => migration.version > currentVersion);
  }

  /**
   * Apply all pending migrations
   */
  public async migrate(): Promise<void> {
    const pendingMigrations = await this.getPendingMigrations();
    
    if (pendingMigrations.length === 0) {
      console.log('No pending migrations');
      return;
    }

    console.log(`Applying ${pendingMigrations.length} migrations...`);

    for (const migration of pendingMigrations) {
      await this.applyMigration(migration);
    }

    console.log('All migrations applied successfully');
  }

  /**
   * Apply a single migration
   */
  private async applyMigration(migration: Migration): Promise<void> {
    try {
      await database.beginTransaction();

      console.log(`Applying migration ${migration.version}: ${migration.name}`);

      // Execute the migration
      await database.run(migration.up);

      // Record the migration
      await database.run(
        'INSERT INTO migrations (version, name) VALUES (?, ?)',
        [migration.version, migration.name]
      );

      await database.commitTransaction();
      console.log(`Migration ${migration.version} applied successfully`);
    } catch (error) {
      await database.rollbackTransaction();
      console.error(`Failed to apply migration ${migration.version}:`, error);
      throw error;
    }
  }

  /**
   * Rollback last migration
   */
  public async rollback(): Promise<void> {
    const currentVersion = await this.getCurrentVersion();
    const lastMigration = this.migrations
      .filter(m => m.version <= currentVersion)
      .pop();

    if (!lastMigration || !lastMigration.down) {
      console.log('No migration to rollback or rollback not supported');
      return;
    }

    try {
      await database.beginTransaction();

      console.log(`Rolling back migration ${lastMigration.version}: ${lastMigration.name}`);

      // Execute the rollback
      await database.run(lastMigration.down);

      // Remove the migration record
      await database.run(
        'DELETE FROM migrations WHERE version = ?',
        [lastMigration.version]
      );

      await database.commitTransaction();
      console.log(`Migration ${lastMigration.version} rolled back successfully`);
    } catch (error) {
      await database.rollbackTransaction();
      console.error(`Failed to rollback migration ${lastMigration.version}:`, error);
      throw error;
    }
  }

  /**
   * Get migration status
   */
  public async getStatus(): Promise<{
    currentVersion: number;
    pendingCount: number;
    totalMigrations: number;
  }> {
    const currentVersion = await this.getCurrentVersion();
    const pendingMigrations = await this.getPendingMigrations();

    return {
      currentVersion,
      pendingCount: pendingMigrations.length,
      totalMigrations: this.migrations.length,
    };
  }
}

// Create and export migration manager instance
export const migrationManager = new MigrationManager();
export default migrationManager; 