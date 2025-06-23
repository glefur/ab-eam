import { BaseRepository } from './base.js';
import { RegistrationRequest } from '../models/registration-request.js';
import { RegistrationRequestFilters, RegistrationRequestStatus } from '../types/user.js';

/**
 * Registration request repository for database operations
 */
export class RegistrationRequestRepository extends BaseRepository<RegistrationRequest> {
  constructor(db: any) {
    super(db, 'registration_requests');
  }

  /**
   * Find registration request by email
   */
  async findByEmail(email: string): Promise<RegistrationRequest | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE email = ?`;
    const result = await this.db.get(query, [email]);
    return result ? this.mapToEntity(result) : null;
  }

  /**
   * Find registration requests with filters
   */
  async findWithFilters(filters: RegistrationRequestFilters, options?: { page?: number; limit?: number }): Promise<{ data: RegistrationRequest[]; pagination: { page: number; limit: number; total: number; pages: number } }> {
    const { page = 1, limit = 10 } = options || {};
    const offset = (page - 1) * limit;

    let whereConditions: string[] = [];
    let params: any[] = [];

    if (filters.status) {
      whereConditions.push('status = ?');
      params.push(filters.status);
    }

    if (filters.requestedRole) {
      whereConditions.push('requested_role = ?');
      params.push(filters.requestedRole);
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
   * Find pending registration requests
   */
  async findPendingRequests(): Promise<RegistrationRequest[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE status = ? ORDER BY created_at ASC`;
    const result = await this.db.all(query, [RegistrationRequestStatus.PENDING]);
    return result.map((row: any) => this.mapToEntity(row));
  }

  /**
   * Find approved registration requests
   */
  async findApprovedRequests(): Promise<RegistrationRequest[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE status = ? ORDER BY approved_at DESC`;
    const result = await this.db.all(query, [RegistrationRequestStatus.APPROVED]);
    return result.map((row: any) => this.mapToEntity(row));
  }

  /**
   * Find rejected registration requests
   */
  async findRejectedRequests(): Promise<RegistrationRequest[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE status = ? ORDER BY approved_at DESC`;
    const result = await this.db.all(query, [RegistrationRequestStatus.REJECTED]);
    return result.map((row: any) => this.mapToEntity(row));
  }

  /**
   * Find requests by requested role
   */
  async findByRequestedRole(role: string): Promise<RegistrationRequest[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE requested_role = ? ORDER BY created_at DESC`;
    const result = await this.db.all(query, [role]);
    return result.map((row: any) => this.mapToEntity(row));
  }

  /**
   * Check if email has pending request
   */
  async hasPendingRequest(email: string): Promise<boolean> {
    const query = `SELECT COUNT(*) as count FROM ${this.tableName} WHERE email = ? AND status = ?`;
    const result = await this.db.get(query, [email, RegistrationRequestStatus.PENDING]);
    return result.count > 0;
  }

  /**
   * Check if email has any request
   */
  async emailExists(email: string): Promise<boolean> {
    const query = `SELECT COUNT(*) as count FROM ${this.tableName} WHERE email = ?`;
    const result = await this.db.get(query, [email]);
    return result.count > 0;
  }

  /**
   * Map database row to RegistrationRequest entity
   */
  protected mapToEntity(row: any): RegistrationRequest {
    return RegistrationRequest.fromDatabase(row);
  }

  /**
   * Map RegistrationRequest entity to database format
   */
  protected mapToDatabase(entity: RegistrationRequest | Partial<RegistrationRequest>): Record<string, any> {
    if (entity instanceof RegistrationRequest) {
      return entity.toDatabase();
    }

    // Handle partial updates
    const data: Record<string, any> = {};
    
    if ('email' in entity) data['email'] = entity.email;
    if ('firstName' in entity) data['first_name'] = entity.firstName;
    if ('lastName' in entity) data['last_name'] = entity.lastName;
    if ('requestedRole' in entity) data['requested_role'] = entity.requestedRole;
    if ('status' in entity) data['status'] = entity.status;
    if ('approvedBy' in entity) data['approved_by'] = entity.approvedBy;
    if ('approvedAt' in entity) data['approved_at'] = entity.approvedAt?.toISOString();
    if ('rejectionReason' in entity) data['rejection_reason'] = entity.rejectionReason;
    if ('updatedAt' in entity) data['updated_at'] = entity.updatedAt?.toISOString();

    return data;
  }
} 