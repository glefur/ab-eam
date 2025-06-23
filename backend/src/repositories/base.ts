import { PaginationOptions, PaginatedResponse } from '../types/index.js';

/**
 * Base repository interface for all data access operations
 */
export interface Repository<T> {
  /**
   * Find all entities with optional pagination
   */
  findAll(options?: PaginationOptions): Promise<PaginatedResponse<T>>;

  /**
   * Find entity by ID
   */
  findById(id: string): Promise<T | null>;

  /**
   * Find entity by email (for users)
   */
  findByEmail?(email: string): Promise<T | null>;

  /**
   * Create new entity
   */
  create(entity: T): Promise<T>;

  /**
   * Update existing entity
   */
  update(id: string, entity: Partial<T>): Promise<T | null>;

  /**
   * Delete entity by ID
   */
  delete(id: string): Promise<boolean>;

  /**
   * Count total entities
   */
  count(): Promise<number>;

  /**
   * Check if entity exists by ID
   */
  exists(id: string): Promise<boolean>;
}

/**
 * Base repository implementation with common SQLite operations
 */
export abstract class BaseRepository<T> implements Repository<T> {
  protected db: any; // SQLite database instance
  protected tableName: string;

  constructor(db: any, tableName: string) {
    this.db = db;
    this.tableName = tableName;
  }

  /**
   * Find all entities with pagination
   */
  async findAll(options?: PaginationOptions): Promise<PaginatedResponse<T>> {
    const { page = 1, limit = 10 } = options || {};
    const offset = (page - 1) * limit;

    const countQuery = `SELECT COUNT(*) as total FROM ${this.tableName}`;
    const dataQuery = `SELECT * FROM ${this.tableName} ORDER BY created_at DESC LIMIT ? OFFSET ?`;

    const [countResult, dataResult] = await Promise.all([
      this.db.get(countQuery),
      this.db.all(dataQuery, [limit, offset])
    ]);

    const total = countResult.total;
    const pages = Math.ceil(total / limit);

    return {
      data: dataResult.map((row: any) => this.mapToEntity(row)),
      pagination: {
        page,
        limit,
        total,
        pages
      }
    };
  }

  /**
   * Find entity by ID
   */
  async findById(id: string): Promise<T | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE id = ?`;
    const result = await this.db.get(query, [id]);
    return result ? this.mapToEntity(result) : null;
  }

  /**
   * Create new entity
   */
  async create(entity: T): Promise<T> {
    const data = this.mapToDatabase(entity);
    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);

    const query = `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders})`;
    await this.db.run(query, values);

    return entity;
  }

  /**
   * Update existing entity
   */
  async update(id: string, entity: Partial<T>): Promise<T | null> {
    const data = this.mapToDatabase(entity);
    const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), id];

    const query = `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`;
    const result = await this.db.run(query, values);

    if (result.changes === 0) {
      return null;
    }

    return this.findById(id);
  }

  /**
   * Delete entity by ID
   */
  async delete(id: string): Promise<boolean> {
    const query = `DELETE FROM ${this.tableName} WHERE id = ?`;
    const result = await this.db.run(query, [id]);
    return result.changes > 0;
  }

  /**
   * Count total entities
   */
  async count(): Promise<number> {
    const query = `SELECT COUNT(*) as total FROM ${this.tableName}`;
    const result = await this.db.get(query);
    return result.total;
  }

  /**
   * Check if entity exists by ID
   */
  async exists(id: string): Promise<boolean> {
    const query = `SELECT COUNT(*) as count FROM ${this.tableName} WHERE id = ?`;
    const result = await this.db.get(query, [id]);
    return result.count > 0;
  }

  /**
   * Map database row to entity
   */
  protected abstract mapToEntity(row: any): T;

  /**
   * Map entity to database format
   */
  protected abstract mapToDatabase(entity: T | Partial<T>): Record<string, any>;
} 