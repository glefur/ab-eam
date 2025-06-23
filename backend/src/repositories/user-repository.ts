import { BaseRepository } from './base.js';
import { User } from '../models/user.js';
import { UserFilters } from '../types/user.js';

/**
 * User repository for database operations
 */
export class UserRepository extends BaseRepository<User> {
  constructor(db: any) {
    super(db, 'users');
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE email = ?`;
    const result = await this.db.get(query, [email]);
    return result ? this.mapToEntity(result) : null;
  }

  /**
   * Find users with filters
   */
  async findWithFilters(filters: UserFilters, options?: { page?: number; limit?: number }): Promise<{ data: User[]; pagination: { page: number; limit: number; total: number; pages: number } }> {
    const { page = 1, limit = 10 } = options || {};
    const offset = (page - 1) * limit;

    let whereConditions: string[] = [];
    let params: any[] = [];

    if (filters.role) {
      whereConditions.push('role = ?');
      params.push(filters.role);
    }

    if (filters.status) {
      whereConditions.push('status = ?');
      params.push(filters.status);
    }

    if (filters.email) {
      whereConditions.push('email LIKE ?');
      params.push(`%${filters.email}%`);
    }

    if (filters.search) {
      whereConditions.push('(first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)');
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*) as total FROM ${this.tableName} ${whereClause}`;
    const dataQuery = `SELECT * FROM ${this.tableName} ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`;

    const [countResult, dataResult] = await Promise.all([
      this.db.get(countQuery, params),
      this.db.all(dataQuery, [...params, limit, offset])
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
   * Find active users
   */
  async findActiveUsers(): Promise<User[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE status = 'ACTIVE' ORDER BY created_at DESC`;
    const result = await this.db.all(query);
    return result.map((row: any) => this.mapToEntity(row));
  }

  /**
   * Find users by role
   */
  async findByRole(role: string): Promise<User[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE role = ? ORDER BY created_at DESC`;
    const result = await this.db.all(query, [role]);
    return result.map((row: any) => this.mapToEntity(row));
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    const query = `SELECT COUNT(*) as count FROM ${this.tableName} WHERE email = ?`;
    const result = await this.db.get(query, [email]);
    return result.count > 0;
  }

  /**
   * Map database row to User entity
   */
  protected mapToEntity(row: any): User {
    return User.fromDatabase(row);
  }

  /**
   * Map User entity to database format
   */
  protected mapToDatabase(entity: User | Partial<User>): Record<string, any> {
    if (entity instanceof User) {
      return entity.toDatabase();
    }

    // Handle partial updates
    const data: Record<string, any> = {};
    
    if ('email' in entity) data['email'] = entity.email;
    if ('firstName' in entity) data['first_name'] = entity.firstName;
    if ('lastName' in entity) data['last_name'] = entity.lastName;
    if ('role' in entity) data['role'] = entity.role;
    if ('status' in entity) data['status'] = entity.status;
    if ('updatedAt' in entity) data['updated_at'] = entity.updatedAt?.toISOString();

    return data;
  }
} 