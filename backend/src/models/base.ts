/**
 * Base model class with validation capabilities
 */
export abstract class BaseModel {
  /**
   * Validate the model data
   * @throws {Error} If validation fails
   */
  abstract validate(): void;

  /**
   * Convert model to plain object
   */
  abstract toJSON(): Record<string, any>;

  /**
   * Create model from plain object
   */
  abstract fromJSON(data: Record<string, any>): BaseModel;

  /**
   * Validate email format
   */
  protected validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate required string field
   */
  protected validateRequiredString(value: string, fieldName: string): void {
    if (!value || typeof value !== 'string' || value.trim().length === 0) {
      throw new Error(`${fieldName} is required and must be a non-empty string`);
    }
  }

  /**
   * Validate string length
   */
  protected validateStringLength(value: string, fieldName: string, minLength: number, maxLength: number): void {
    if (value.length < minLength || value.length > maxLength) {
      throw new Error(`${fieldName} must be between ${minLength} and ${maxLength} characters`);
    }
  }

  /**
   * Validate enum value
   */
  protected validateEnum<T extends Record<string, string>>(value: string, enumObj: T, fieldName: string): void {
    const validValues = Object.values(enumObj);
    if (!validValues.includes(value)) {
      throw new Error(`${fieldName} must be one of: ${validValues.join(', ')}`);
    }
  }

  /**
   * Validate UUID format
   */
  protected validateUUID(value: string, fieldName: string): void {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      throw new Error(`${fieldName} must be a valid UUID`);
    }
  }

  /**
   * Validate date
   */
  protected validateDate(value: Date | string, fieldName: string): void {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new Error(`${fieldName} must be a valid date`);
    }
  }

  /**
   * Validate optional field
   */
  protected validateOptional<T>(value: T | undefined, validator: (value: T) => void): void {
    if (value !== undefined) {
      validator(value);
    }
  }
} 