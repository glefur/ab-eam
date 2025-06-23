import { Request, Response, NextFunction } from 'express';
import { validationResult, body, param } from 'express-validator';

/**
 * Middleware to handle validation errors
 */
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: errors.array().map(error => ({
        field: error.type === 'field' ? error.path : error.type,
        message: error.msg,
        value: error.type === 'field' ? error.value : undefined
      }))
    });
    return;
  }
  
  next();
};

/**
 * Validate UUID format
 */
export const validateUUID = (field: string) => {
  return body(field).optional().isUUID().withMessage(`${field} must be a valid UUID`);
};

/**
 * Validate UUID in params
 */
export const validateUUIDParam = (field: string) => {
  return param(field).isUUID().withMessage(`${field} must be a valid UUID`);
};

/**
 * Validate email format
 */
export const validateEmail = (field: string) => {
  return body(field).optional().isEmail().withMessage(`${field} must be a valid email address`);
};

/**
 * Validate required fields
 */
export const validateRequired = (field: string) => {
  return body(field).notEmpty().withMessage(`${field} is required`);
};

/**
 * Validate enum values
 */
export const validateEnum = (field: string, allowedValues: string[]) => {
  return body(field).optional().isIn(allowedValues).withMessage(`${field} must be one of: ${allowedValues.join(', ')}`);
};

/**
 * Validate date format
 */
export const validateDate = (field: string) => {
  return body(field).optional().isISO8601().withMessage(`${field} must be a valid date`);
};

/**
 * Validate array of strings
 */
export const validateStringArray = (field: string) => {
  return body(field).optional().isArray().withMessage(`${field} must be an array`);
}; 