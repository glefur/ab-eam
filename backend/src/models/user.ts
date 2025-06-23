import { BaseModel } from './base.js';
import { User as UserInterface, UserRole, UserStatus, CreateUserRequest, UpdateUserRequest, UserDatabase } from '../types/user.js';

/**
 * User model with validation
 */
export class User extends BaseModel implements UserInterface {
  public id: string;
  public email: string;
  public firstName: string;
  public lastName: string;
  public role: UserRole;
  public status: UserStatus;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(data: UserInterface) {
    super();
    this.id = data.id;
    this.email = data.email;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.role = data.role;
    this.status = data.status;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Validate user data
   */
  validate(): void {
    // Validate ID
    this.validateUUID(this.id, 'id');

    // Validate email
    this.validateRequiredString(this.email, 'email');
    if (!this.validateEmail(this.email)) {
      throw new Error('email must be a valid email address');
    }
    this.validateStringLength(this.email, 'email', 3, 255);

    // Validate firstName
    this.validateRequiredString(this.firstName, 'firstName');
    this.validateStringLength(this.firstName, 'firstName', 1, 100);

    // Validate lastName
    this.validateRequiredString(this.lastName, 'lastName');
    this.validateStringLength(this.lastName, 'lastName', 1, 100);

    // Validate role
    this.validateEnum(this.role, UserRole, 'role');

    // Validate status
    this.validateEnum(this.status, UserStatus, 'status');

    // Validate dates
    this.validateDate(this.createdAt, 'createdAt');
    this.validateDate(this.updatedAt, 'updatedAt');
  }

  /**
   * Convert to JSON object
   */
  toJSON(): UserInterface {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      role: this.role,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Create User from JSON data
   */
  fromJSON(data: Record<string, any>): User {
    return new User({
      id: data['id'],
      email: data['email'],
      firstName: data['firstName'],
      lastName: data['lastName'],
      role: data['role'] as UserRole,
      status: data['status'] as UserStatus,
      createdAt: new Date(data['createdAt']),
      updatedAt: new Date(data['updatedAt']),
    });
  }

  /**
   * Create User from database record
   */
  static fromDatabase(data: UserDatabase): User {
    return new User({
      id: data.id,
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      role: data.role as UserRole,
      status: data.status as UserStatus,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    });
  }

  /**
   * Convert to database record
   */
  toDatabase(): UserDatabase {
    return {
      id: this.id,
      email: this.email,
      first_name: this.firstName,
      last_name: this.lastName,
      role: this.role,
      status: this.status,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString(),
    };
  }

  /**
   * Create new User instance
   */
  static create(data: CreateUserRequest): User {
    const now = new Date();
    const user = new User({
      id: crypto.randomUUID(),
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      status: UserStatus.PENDING,
      createdAt: now,
      updatedAt: now,
    });
    user.validate();
    return user;
  }

  /**
   * Update user with new data
   */
  update(data: UpdateUserRequest): void {
    if (data.email !== undefined) {
      this.email = data.email;
    }
    if (data.firstName !== undefined) {
      this.firstName = data.firstName;
    }
    if (data.lastName !== undefined) {
      this.lastName = data.lastName;
    }
    if (data.role !== undefined) {
      this.role = data.role;
    }
    if (data.status !== undefined) {
      this.status = data.status;
    }
    this.updatedAt = new Date();
    this.validate();
  }

  /**
   * Get full name
   */
  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  /**
   * Check if user is active
   */
  isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }

  /**
   * Check if user is Product People
   */
  isProductPeople(): boolean {
    return this.role === UserRole.PRODUCT_PEOPLE;
  }

  /**
   * Check if user is Client Manager
   */
  isClientManager(): boolean {
    return this.role === UserRole.CLIENT_MANAGER;
  }

  /**
   * Activate user
   */
  activate(): void {
    this.status = UserStatus.ACTIVE;
    this.updatedAt = new Date();
  }

  /**
   * Deactivate user
   */
  deactivate(): void {
    this.status = UserStatus.INACTIVE;
    this.updatedAt = new Date();
  }
} 