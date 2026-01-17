/**
 * Zod schemas for memory data validation
 */

import { z } from 'zod';

/**
 * Schema for a single memory entry
 */
export const memorySchema = z.object({
  id: z.string().min(1, 'Memory ID is required'),
  text: z.string()
    .min(1, 'Memory text is required')
    .max(5000, 'Memory text must be less than 5000 characters'),
  timestamp: z.string().datetime(),
  userName: z.string().min(1, 'User name is required'),
});

/**
 * Schema for an array of memories
 */
export const memoriesArraySchema = z.array(memorySchema);

/**
 * Validate memory data
 * @param {unknown} data - Data to validate
 * @returns {{success: boolean, data?: any, error?: string}}
 */
export const validateMemory = (data) => {
  try {
    const validated = memorySchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Validate memories array
 * @param {unknown} data - Data to validate
 * @returns {{success: boolean, data?: any, error?: string}}
 */
export const validateMemoriesArray = (data) => {
  try {
    const validated = memoriesArraySchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
