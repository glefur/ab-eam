import { BaseModel } from './base.js';
import {
  RegistrationRequest as RegistrationRequestInterface,
  RegistrationRequestStatus,
  UserRole,
  CreateRegistrationRequestRequest,
  ApproveRegistrationRequestRequest,
  RegistrationRequestDatabase,
} from '../types/user.js';

/**
 * Registration request model with validation
 */
export class RegistrationRequest extends BaseModel implements RegistrationRequestInterface {
  public id: string;
  public email: string;
  public firstName: string;
  public lastName: string;
  public requestedRole: UserRole;
  public status: RegistrationRequestStatus;
  public createdAt: Date;
  public updatedAt: Date;
  public approvedBy: string | undefined;
  public approvedAt: Date | undefined;
  public rejectionReason: string | undefined;

  constructor(data: RegistrationRequestInterface) {
    super();
    this.id = data.id;
    this.email = data.email;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.requestedRole = data.requestedRole;
    this.status = data.status;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.approvedBy = data.approvedBy;
    this.approvedAt = data.approvedAt;
    this.rejectionReason = data.rejectionReason;
  }

  /**
   * Validate registration request data
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

    // Validate requestedRole
    this.validateEnum(this.requestedRole, UserRole, 'requestedRole');

    // Validate status
    this.validateEnum(this.status, RegistrationRequestStatus, 'status');

    // Validate dates
    this.validateDate(this.createdAt, 'createdAt');
    this.validateDate(this.updatedAt, 'updatedAt');

    // Validate optional fields
    this.validateOptional(this.approvedBy, (value) => this.validateUUID(value, 'approvedBy'));
    this.validateOptional(this.approvedAt, (value) => this.validateDate(value, 'approvedAt'));
    this.validateOptional(this.rejectionReason, (value) => {
      this.validateRequiredString(value, 'rejectionReason');
      this.validateStringLength(value, 'rejectionReason', 1, 500);
    });

    // Validate business rules
    if (this.status === RegistrationRequestStatus.APPROVED && !this.approvedBy) {
      throw new Error('approvedBy is required when status is APPROVED');
    }

    if (this.status === RegistrationRequestStatus.REJECTED && !this.rejectionReason) {
      throw new Error('rejectionReason is required when status is REJECTED');
    }

    if (this.status === RegistrationRequestStatus.REJECTED && !this.approvedBy) {
      throw new Error('approvedBy is required when status is REJECTED');
    }
  }

  /**
   * Convert to JSON object
   */
  toJSON(): RegistrationRequestInterface {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      requestedRole: this.requestedRole,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      approvedBy: this.approvedBy,
      approvedAt: this.approvedAt,
      rejectionReason: this.rejectionReason,
    };
  }

  /**
   * Create RegistrationRequest from JSON data
   */
  fromJSON(data: Record<string, any>): RegistrationRequest {
    return new RegistrationRequest({
      id: data['id'],
      email: data['email'],
      firstName: data['firstName'],
      lastName: data['lastName'],
      requestedRole: data['requestedRole'] as UserRole,
      status: data['status'] as RegistrationRequestStatus,
      createdAt: new Date(data['createdAt']),
      updatedAt: new Date(data['updatedAt']),
      approvedBy: data['approvedBy'],
      approvedAt: data['approvedAt'] ? new Date(data['approvedAt']) : undefined,
      rejectionReason: data['rejectionReason'],
    });
  }

  /**
   * Create RegistrationRequest from database record
   */
  static fromDatabase(data: RegistrationRequestDatabase): RegistrationRequest {
    return new RegistrationRequest({
      id: data.id,
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      requestedRole: data.requested_role as UserRole,
      status: data.status as RegistrationRequestStatus,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      approvedBy: data.approved_by,
      approvedAt: data.approved_at ? new Date(data.approved_at) : undefined,
      rejectionReason: data.rejection_reason,
    });
  }

  /**
   * Convert to database record
   */
  toDatabase(): RegistrationRequestDatabase {
    return {
      id: this.id,
      email: this.email,
      first_name: this.firstName,
      last_name: this.lastName,
      requested_role: this.requestedRole,
      status: this.status,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString(),
      approved_by: this.approvedBy,
      approved_at: this.approvedAt?.toISOString(),
      rejection_reason: this.rejectionReason,
    };
  }

  /**
   * Create new RegistrationRequest instance
   */
  static create(data: CreateRegistrationRequestRequest): RegistrationRequest {
    const now = new Date();
    const request = new RegistrationRequest({
      id: crypto.randomUUID(),
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      requestedRole: data.requestedRole,
      status: RegistrationRequestStatus.PENDING,
      createdAt: now,
      updatedAt: now,
    });
    request.validate();
    return request;
  }

  /**
   * Approve or reject the registration request
   */
  process(approvalData: ApproveRegistrationRequestRequest, approvedBy: string): void {
    const now = new Date();
    this.approvedBy = approvedBy;
    this.approvedAt = now;
    this.updatedAt = now;

    if (approvalData.approved) {
      this.status = RegistrationRequestStatus.APPROVED;
    } else {
      this.status = RegistrationRequestStatus.REJECTED;
      this.rejectionReason = approvalData.rejectionReason;
    }

    this.validate();
  }

  /**
   * Get full name
   */
  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  /**
   * Check if request is pending
   */
  isPending(): boolean {
    return this.status === RegistrationRequestStatus.PENDING;
  }

  /**
   * Check if request is approved
   */
  isApproved(): boolean {
    return this.status === RegistrationRequestStatus.APPROVED;
  }

  /**
   * Check if request is rejected
   */
  isRejected(): boolean {
    return this.status === RegistrationRequestStatus.REJECTED;
  }

  /**
   * Check if request can be processed
   */
  canBeProcessed(): boolean {
    return this.status === RegistrationRequestStatus.PENDING;
  }
} 