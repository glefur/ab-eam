import { RegistrationRequest } from '../../../src/models/registration-request.js';
import { UserRole, RegistrationRequestStatus, CreateRegistrationRequestRequest, ApproveRegistrationRequestRequest } from '../../../src/types/user.js';

describe('RegistrationRequest Model', () => {
  const validRequestData = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    firstName: 'Alice',
    lastName: 'Martin',
    requestedRole: UserRole.CLIENT_MANAGER,
    status: RegistrationRequestStatus.PENDING,
    createdAt: new Date('2023-01-01T00:00:00Z'),
    updatedAt: new Date('2023-01-01T00:00:00Z'),
    approvedBy: undefined,
    approvedAt: undefined,
    rejectionReason: undefined,
  };

  describe('Constructor', () => {
    it('should create a valid registration request instance', () => {
      const req = new RegistrationRequest(validRequestData);
      expect(req.id).toBe(validRequestData.id);
      expect(req.email).toBe(validRequestData.email);
      expect(req.firstName).toBe(validRequestData.firstName);
      expect(req.lastName).toBe(validRequestData.lastName);
      expect(req.requestedRole).toBe(validRequestData.requestedRole);
      expect(req.status).toBe(validRequestData.status);
    });
  });

  describe('Validation', () => {
    it('should validate a correct registration request', () => {
      const req = new RegistrationRequest(validRequestData);
      expect(() => req.validate()).not.toThrow();
    });

    it('should throw error for invalid email', () => {
      const req = new RegistrationRequest({ ...validRequestData, email: 'invalid' });
      expect(() => req.validate()).toThrow('email must be a valid email address');
    });

    it('should throw error for empty firstName', () => {
      const req = new RegistrationRequest({ ...validRequestData, firstName: '' });
      expect(() => req.validate()).toThrow('firstName is required and must be a non-empty string');
    });

    it('should throw error for invalid requestedRole', () => {
      const req = new RegistrationRequest({ ...validRequestData, requestedRole: 'INVALID' as UserRole });
      expect(() => req.validate()).toThrow('requestedRole must be one of: PRODUCT_PEOPLE, CLIENT_MANAGER');
    });

    it('should throw error for invalid status', () => {
      const req = new RegistrationRequest({ ...validRequestData, status: 'INVALID' as RegistrationRequestStatus });
      expect(() => req.validate()).toThrow('status must be one of: PENDING, APPROVED, REJECTED');
    });

    it('should throw error if approved status without approvedBy', () => {
      const req = new RegistrationRequest({ ...validRequestData, status: RegistrationRequestStatus.APPROVED });
      expect(() => req.validate()).toThrow('approvedBy is required when status is APPROVED');
    });

    it('should throw error if rejected status without rejectionReason', () => {
      const req = new RegistrationRequest({ ...validRequestData, status: RegistrationRequestStatus.REJECTED, approvedBy: '123e4567-e89b-12d3-a456-426614174000' });
      expect(() => req.validate()).toThrow('rejectionReason is required when status is REJECTED');
    });

    it('should throw error if rejected status without approvedBy', () => {
      const req = new RegistrationRequest({ ...validRequestData, status: RegistrationRequestStatus.REJECTED, rejectionReason: 'Pas motivé' });
      expect(() => req.validate()).toThrow('approvedBy is required when status is REJECTED');
    });
  });

  describe('Static create method', () => {
    it('should create a new registration request with pending status', () => {
      const createData: CreateRegistrationRequestRequest = {
        email: 'new@example.com',
        firstName: 'Bob',
        lastName: 'Smith',
        requestedRole: UserRole.PRODUCT_PEOPLE,
      };
      const req = RegistrationRequest.create(createData);
      expect(req.email).toBe(createData.email);
      expect(req.firstName).toBe(createData.firstName);
      expect(req.lastName).toBe(createData.lastName);
      expect(req.requestedRole).toBe(createData.requestedRole);
      expect(req.status).toBe(RegistrationRequestStatus.PENDING);
      expect(req.id).toBeDefined();
      expect(req.createdAt).toBeInstanceOf(Date);
      expect(req.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Process method', () => {
    it('should approve a request', () => {
      const req = new RegistrationRequest(validRequestData);
      const approval: ApproveRegistrationRequestRequest = { approved: true };
      req.process(approval, '123e4567-e89b-12d3-a456-426614174000');
      expect(req.status).toBe(RegistrationRequestStatus.APPROVED);
      expect(req.approvedBy).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(req.approvedAt).toBeInstanceOf(Date);
    });
    it('should reject a request with reason', () => {
      const req = new RegistrationRequest(validRequestData);
      const approval: ApproveRegistrationRequestRequest = { approved: false, rejectionReason: 'Non éligible' };
      req.process(approval, '123e4567-e89b-12d3-a456-426614174000');
      expect(req.status).toBe(RegistrationRequestStatus.REJECTED);
      expect(req.rejectionReason).toBe('Non éligible');
      expect(req.approvedBy).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(req.approvedAt).toBeInstanceOf(Date);
    });
  });

  describe('Utility methods', () => {
    it('should return full name', () => {
      const req = new RegistrationRequest(validRequestData);
      expect(req.getFullName()).toBe('Alice Martin');
    });
    it('should check status helpers', () => {
      const pending = new RegistrationRequest(validRequestData);
      const approved = new RegistrationRequest({ ...validRequestData, status: RegistrationRequestStatus.APPROVED, approvedBy: '123e4567-e89b-12d3-a456-426614174000', approvedAt: new Date() });
      const rejected = new RegistrationRequest({ ...validRequestData, status: RegistrationRequestStatus.REJECTED, approvedBy: '123e4567-e89b-12d3-a456-426614174000', approvedAt: new Date(), rejectionReason: 'Refusé' });
      expect(pending.isPending()).toBe(true);
      expect(approved.isApproved()).toBe(true);
      expect(rejected.isRejected()).toBe(true);
      expect(pending.canBeProcessed()).toBe(true);
      expect(approved.canBeProcessed()).toBe(false);
    });
  });

  describe('Database/JSON conversion', () => {
    it('should convert to and from database format', () => {
      const dbRecord = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        first_name: 'Alice',
        last_name: 'Martin',
        requested_role: 'CLIENT_MANAGER',
        status: 'PENDING',
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z',
        approved_by: undefined,
        approved_at: undefined,
        rejection_reason: undefined,
      };
      const req = RegistrationRequest.fromDatabase(dbRecord);
      expect(req.id).toBe(dbRecord.id);
      expect(req.email).toBe(dbRecord.email);
      expect(req.firstName).toBe(dbRecord.first_name);
      expect(req.lastName).toBe(dbRecord.last_name);
      expect(req.requestedRole).toBe(UserRole.CLIENT_MANAGER);
      expect(req.status).toBe(RegistrationRequestStatus.PENDING);
      expect(req.createdAt).toEqual(new Date(dbRecord.created_at));
      expect(req.updatedAt).toEqual(new Date(dbRecord.updated_at));
    });
    it('should convert to JSON', () => {
      const req = new RegistrationRequest(validRequestData);
      const json = req.toJSON();
      expect(json.id).toBe(validRequestData.id);
      expect(json.email).toBe(validRequestData.email);
      expect(json.firstName).toBe(validRequestData.firstName);
      expect(json.lastName).toBe(validRequestData.lastName);
      expect(json.requestedRole).toBe(validRequestData.requestedRole);
      expect(json.status).toBe(validRequestData.status);
    });
    it('should create from JSON', () => {
      const jsonData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        firstName: 'Alice',
        lastName: 'Martin',
        requestedRole: 'CLIENT_MANAGER',
        status: 'PENDING',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      };
      const req = new RegistrationRequest({
        ...jsonData,
        requestedRole: UserRole.CLIENT_MANAGER,
        status: RegistrationRequestStatus.PENDING,
        createdAt: new Date(jsonData.createdAt),
        updatedAt: new Date(jsonData.updatedAt),
      });
      expect(req.id).toBe(jsonData.id);
      expect(req.email).toBe(jsonData.email);
      expect(req.firstName).toBe(jsonData.firstName);
      expect(req.lastName).toBe(jsonData.lastName);
      expect(req.requestedRole).toBe(UserRole.CLIENT_MANAGER);
      expect(req.status).toBe(RegistrationRequestStatus.PENDING);
      expect(req.createdAt).toEqual(new Date(jsonData.createdAt));
      expect(req.updatedAt).toEqual(new Date(jsonData.updatedAt));
    });
  });
}); 