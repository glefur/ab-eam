/**
 * User role enumeration
 */
export enum UserRole {
  PRODUCT_PEOPLE = 'PRODUCT_PEOPLE',
  CLIENT_MANAGER = 'CLIENT_MANAGER'
}

/**
 * User status enumeration
 */
export enum UserStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

/**
 * Registration request status enumeration
 */
export enum RegistrationRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

/**
 * User interface
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User creation interface (without id and timestamps)
 */
export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

/**
 * User update interface (all fields optional except id)
 */
export interface UpdateUserRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  status?: UserStatus;
}

/**
 * Registration request interface
 */
export interface RegistrationRequest {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  requestedRole: UserRole;
  status: RegistrationRequestStatus;
  createdAt: Date;
  updatedAt: Date;
  approvedBy?: string | undefined; // User ID who approved/rejected
  approvedAt?: Date | undefined;
  rejectionReason?: string | undefined;
}

/**
 * Registration request creation interface
 */
export interface CreateRegistrationRequestRequest {
  email: string;
  firstName: string;
  lastName: string;
  requestedRole: UserRole;
}

/**
 * Registration request approval interface
 */
export interface ApproveRegistrationRequestRequest {
  approved: boolean;
  assignedRole?: UserRole;
  rejectionReason?: string;
}

/**
 * User database interface (for repository layer)
 */
export interface UserDatabase {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
}

/**
 * Registration request database interface
 */
export interface RegistrationRequestDatabase {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  requested_role: string;
  status: string;
  created_at: string;
  updated_at: string;
  approved_by?: string | undefined;
  approved_at?: string | undefined;
  rejection_reason?: string | undefined;
}

/**
 * User query filters
 */
export interface UserFilters {
  role?: UserRole;
  status?: UserStatus;
  email?: string;
  search?: string; // Search in firstName, lastName, email
}

/**
 * Registration request query filters
 */
export interface RegistrationRequestFilters {
  status?: RegistrationRequestStatus;
  requestedRole?: UserRole;
  email?: string;
  search?: string;
}

/**
 * Pagination interface
 */
export interface PaginationOptions {
  page: number;
  limit: number;
}

/**
 * Paginated response interface
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
} 