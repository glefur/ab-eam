import { User } from '../../../src/models/user.js';
import { UserRole, UserStatus, CreateUserRequest } from '../../../src/types/user.js';

describe('User Model', () => {
  const validUserData = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: UserRole.PRODUCT_PEOPLE,
    status: UserStatus.ACTIVE,
    createdAt: new Date('2023-01-01T00:00:00Z'),
    updatedAt: new Date('2023-01-01T00:00:00Z'),
  };

  describe('Constructor', () => {
    it('should create a valid user instance', () => {
      const user = new User(validUserData);
      expect(user.id).toBe(validUserData.id);
      expect(user.email).toBe(validUserData.email);
      expect(user.firstName).toBe(validUserData.firstName);
      expect(user.lastName).toBe(validUserData.lastName);
      expect(user.role).toBe(validUserData.role);
      expect(user.status).toBe(validUserData.status);
    });
  });

  describe('Validation', () => {
    it('should validate a correct user', () => {
      const user = new User(validUserData);
      expect(() => user.validate()).not.toThrow();
    });

    it('should throw error for invalid email', () => {
      const invalidUser = new User({
        ...validUserData,
        email: 'invalid-email',
      });
      expect(() => invalidUser.validate()).toThrow('email must be a valid email address');
    });

    it('should throw error for empty firstName', () => {
      const invalidUser = new User({
        ...validUserData,
        firstName: '',
      });
      expect(() => invalidUser.validate()).toThrow('firstName is required and must be a non-empty string');
    });
  });

  describe('Static create method', () => {
    it('should create a new user with pending status', () => {
      const createData: CreateUserRequest = {
        email: 'new@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        role: UserRole.CLIENT_MANAGER,
      };

      const user = User.create(createData);

      expect(user.email).toBe(createData.email);
      expect(user.firstName).toBe(createData.firstName);
      expect(user.lastName).toBe(createData.lastName);
      expect(user.role).toBe(createData.role);
      expect(user.status).toBe(UserStatus.PENDING);
      expect(user.id).toBeDefined();
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Utility methods', () => {
    it('should return full name', () => {
      const user = new User(validUserData);
      expect(user.getFullName()).toBe('John Doe');
    });

    it('should check if user is active', () => {
      const activeUser = new User(validUserData);
      const inactiveUser = new User({
        ...validUserData,
        status: UserStatus.INACTIVE,
      });

      expect(activeUser.isActive()).toBe(true);
      expect(inactiveUser.isActive()).toBe(false);
    });
  });
}); 