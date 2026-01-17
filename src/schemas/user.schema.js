/**
 * Zod schemas for user data validation
 */

import { z } from 'zod';

/**
 * Schema for user PIN
 */
export const userPinSchema = z.string()
  .length(4, 'PIN must be exactly 4 digits')
  .regex(/^\d{4}$/, 'PIN must contain only digits');

/**
 * Schema for user name
 */
export const userNameSchema = z.string()
  .min(1, 'User name is required')
  .max(50, 'User name must be less than 50 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'User name can only contain letters, numbers, hyphens, and underscores');

/**
 * Schema for user data
 */
export const userSchema = z.object({
  userName: userNameSchema,
  hashedPin: z.string().length(64, 'Invalid hashed PIN'),
  createdAt: z.string().datetime(),
});

/**
 * Validate user PIN
 * @param {unknown} pin - PIN to validate
 * @returns {{success: boolean, data?: any, error?: string}}
 */
export const validateUserPin = (pin) => {
  try {
    const validated = userPinSchema.parse(pin);
    return { success: true, data: validated };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Validate user name
 * @param {unknown} userName - User name to validate
 * @returns {{success: boolean, data?: any, error?: string}}
 */
export const validateUserName = (userName) => {
  try {
    const validated = userNameSchema.parse(userName);
    return { success: true, data: validated };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Validate user data
 * @param {unknown} data - Data to validate
 * @returns {{success: boolean, data?: any, error?: string}}
 */
export const validateUser = (data) => {
  try {
    const validated = userSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
