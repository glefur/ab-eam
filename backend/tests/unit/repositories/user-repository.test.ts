import { UserRepository } from '../../../src/repositories/user-repository.js';
import { User } from '../../../src/models/user.js';
import { UserRole, UserStatus, CreateUserRequest } from '../../../src/types/user.js';

describe('UserRepository', () => {
  let repository: UserRepository;
  let db: any;

  beforeEach(async () => {
    jest.clearAllMocks && jest.clearAllMocks();
    db = {
      get: jest.fn(),
      all: jest.fn(),
      run: jest.fn(),
      exec: jest.fn()
    };
    repository = new UserRepository(db);
  });

  describe('CRUD operations', () => {
    it('should create a user', async () => {
      const createData: CreateUserRequest = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.PRODUCT_PEOPLE
      };

      const user = User.create(createData);
      
      // Mock the database response
      db.run.mockResolvedValue({ changes: 1 });
      
      const createdUser = await repository.create(user);

      expect(createdUser.id).toBe(user.id);
      expect(createdUser.email).toBe(user.email);
      expect(createdUser.firstName).toBe(user.firstName);
      expect(createdUser.lastName).toBe(user.lastName);
      expect(createdUser.role).toBe(user.role);
    });

    it('should find user by ID', async () => {
      const user = User.create({
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.PRODUCT_PEOPLE
      });

      // Mock the database response
      db.get.mockResolvedValue({
        id: user.id,
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        role: user.role,
        status: user.status,
        created_at: user.createdAt.toISOString(),
        updated_at: user.updatedAt.toISOString()
      });

      const foundUser = await repository.findById(user.id);

      expect(foundUser).not.toBeNull();
      expect(foundUser?.id).toBe(user.id);
      expect(foundUser?.email).toBe(user.email);
    });

    it('should find user by email', async () => {
      const user = User.create({
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.PRODUCT_PEOPLE
      });

      // Mock the database response
      db.get.mockResolvedValue({
        id: user.id,
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        role: user.role,
        status: user.status,
        created_at: user.createdAt.toISOString(),
        updated_at: user.updatedAt.toISOString()
      });

      const foundUser = await repository.findByEmail('test@example.com');

      expect(foundUser).not.toBeNull();
      expect(foundUser?.email).toBe('test@example.com');
    });

    it('should check if email exists', async () => {
      // Mock the database response
      db.get.mockResolvedValue({ count: 1 });

      const exists = await repository.emailExists('test@example.com');

      expect(exists).toBe(true);
    });

    it('should check if user exists', async () => {
      // Mock the database response
      db.get.mockResolvedValue({ count: 1 });

      const exists = await repository.exists('test-id');

      expect(exists).toBe(true);
    });

    it('should count users', async () => {
      // Mock the database response
      db.get.mockResolvedValue({ total: 5 });

      const count = await repository.count();

      expect(count).toBe(5);
    });
  });

  describe('Query operations', () => {
    beforeEach(async () => {
      // Create test users
      const users = [
        User.create({
          email: 'product1@example.com',
          firstName: 'Product',
          lastName: 'One',
          role: UserRole.PRODUCT_PEOPLE
        }),
        User.create({
          email: 'client1@example.com',
          firstName: 'Client',
          lastName: 'One',
          role: UserRole.CLIENT_MANAGER
        }),
        User.create({
          email: 'product2@example.com',
          firstName: 'Product',
          lastName: 'Two',
          role: UserRole.PRODUCT_PEOPLE
        })
      ];

      for (const user of users) {
        await repository.create(user);
      }
    });

    it('should find all users with pagination', async () => {
      db.get.mockResolvedValueOnce({ total: 3 });
      db.all.mockResolvedValueOnce([
        {
          id: '1', email: 'a@a.com', first_name: 'A', last_name: 'A', role: UserRole.PRODUCT_PEOPLE, status: UserStatus.ACTIVE, created_at: new Date().toISOString(), updated_at: new Date().toISOString()
        },
        {
          id: '2', email: 'b@b.com', first_name: 'B', last_name: 'B', role: UserRole.CLIENT_MANAGER, status: UserStatus.PENDING, created_at: new Date().toISOString(), updated_at: new Date().toISOString()
        }
      ]);
      const result = await repository.findAll({ page: 1, limit: 2 });
      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(3);
      expect(result.pagination.pages).toBe(2);
    });

    it('should find users by role', async () => {
      db.all.mockResolvedValueOnce([
        {
          id: '1', email: 'a@a.com', first_name: 'A', last_name: 'A', role: UserRole.PRODUCT_PEOPLE, status: UserStatus.ACTIVE, created_at: new Date().toISOString(), updated_at: new Date().toISOString()
        },
        {
          id: '2', email: 'b@b.com', first_name: 'B', last_name: 'B', role: UserRole.PRODUCT_PEOPLE, status: UserStatus.PENDING, created_at: new Date().toISOString(), updated_at: new Date().toISOString()
        }
      ]);
      const productPeople = await repository.findByRole(UserRole.PRODUCT_PEOPLE);
      expect(productPeople).toHaveLength(2);
      expect(productPeople.every(user => user.role === UserRole.PRODUCT_PEOPLE)).toBe(true);
    });

    it('should find active users', async () => {
      db.all.mockResolvedValueOnce([
        {
          id: '1', email: 'a@a.com', first_name: 'A', last_name: 'A', role: UserRole.PRODUCT_PEOPLE, status: UserStatus.ACTIVE, created_at: new Date().toISOString(), updated_at: new Date().toISOString()
        }
      ]);
      const activeUsers = await repository.findActiveUsers();
      expect(activeUsers).toHaveLength(1);
      expect(activeUsers[0]?.status).toBe(UserStatus.ACTIVE);
    });

    it('should find users with filters', async () => {
      db.get.mockResolvedValueOnce({ total: 2 });
      db.all.mockResolvedValueOnce([
        {
          id: '1', email: 'a@a.com', first_name: 'A', last_name: 'A', role: UserRole.PRODUCT_PEOPLE, status: UserStatus.ACTIVE, created_at: new Date().toISOString(), updated_at: new Date().toISOString()
        },
        {
          id: '2', email: 'b@b.com', first_name: 'B', last_name: 'B', role: UserRole.PRODUCT_PEOPLE, status: UserStatus.PENDING, created_at: new Date().toISOString(), updated_at: new Date().toISOString()
        }
      ]);
      const result = await repository.findWithFilters({ role: UserRole.PRODUCT_PEOPLE });
      expect(result.data).toHaveLength(2);
      expect(result.data.every(user => user.role === UserRole.PRODUCT_PEOPLE)).toBe(true);
    });

    it('should search users by name or email', async () => {
      db.get.mockResolvedValueOnce({ total: 2 });
      db.all.mockResolvedValueOnce([
        {
          id: '1', email: 'product1@a.com', first_name: 'Product', last_name: 'One', role: UserRole.PRODUCT_PEOPLE, status: UserStatus.ACTIVE, created_at: new Date().toISOString(), updated_at: new Date().toISOString()
        },
        {
          id: '2', email: 'product2@b.com', first_name: 'Product', last_name: 'Two', role: UserRole.PRODUCT_PEOPLE, status: UserStatus.PENDING, created_at: new Date().toISOString(), updated_at: new Date().toISOString()
        }
      ]);
      const result = await repository.findWithFilters({ search: 'Product' });
      expect(result.data).toHaveLength(2);
      expect(result.data.every(user => user.firstName.includes('Product') || user.lastName.includes('Product') || user.email.includes('product'))).toBe(true);
    });
  });

  describe('Utility operations', () => {
    it('should update user', async () => {
      const user = User.create({
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.PRODUCT_PEOPLE
      });
      db.run.mockResolvedValueOnce({ changes: 1 });
      db.get.mockResolvedValueOnce({
        id: user.id,
        email: user.email,
        first_name: 'Jane',
        last_name: user.lastName,
        role: user.role,
        status: UserStatus.ACTIVE,
        created_at: user.createdAt.toISOString(),
        updated_at: new Date().toISOString()
      });
      const updatedUser = await repository.update(user.id, { firstName: 'Jane', status: UserStatus.ACTIVE });
      expect(updatedUser).not.toBeNull();
      expect(updatedUser?.firstName).toBe('Jane');
      expect(updatedUser?.status).toBe(UserStatus.ACTIVE);
    });

    it('should delete user', async () => {
      const user = User.create({
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.PRODUCT_PEOPLE
      });
      db.run.mockResolvedValueOnce({ changes: 1 });
      db.get.mockResolvedValueOnce(null);
      const deleted = await repository.delete(user.id);
      expect(deleted).toBe(true);
      const foundUser = await repository.findById(user.id);
      expect(foundUser).toBeNull();
    });
  });
}); 