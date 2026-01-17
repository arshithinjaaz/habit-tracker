/**
 * Zod schemas for habit data validation
 */

import { z } from 'zod';

/**
 * Schema for a single habit
 */
export const habitSchema = z.object({
  id: z.string().min(1, 'Habit ID is required'),
  label: z.string()
    .min(1, 'Habit label is required')
    .max(100, 'Habit label must be less than 100 characters'),
  category: z.enum(['Health', 'Wellness', 'Learning', 'Productivity', 'Social'], {
    errorMap: () => ({ message: 'Invalid category' })
  }),
  completed: z.boolean(),
});

/**
 * Schema for an array of habits
 */
export const habitsArraySchema = z.array(habitSchema);

/**
 * Schema for custom habit (without completed field)
 */
export const customHabitSchema = z.object({
  id: z.string().min(1, 'Habit ID is required'),
  label: z.string()
    .min(1, 'Habit label is required')
    .max(100, 'Habit label must be less than 100 characters'),
  category: z.enum(['Health', 'Wellness', 'Learning', 'Productivity', 'Social']),
});

/**
 * Schema for habit progress data
 */
export const habitProgressSchema = z.object({
  date: z.string(),
  percentage: z.number().min(0).max(100),
  completedCount: z.number().min(0),
  totalCount: z.number().min(0),
});

/**
 * Schema for streak data
 */
export const streakSchema = z.object({
  lastDate: z.string(),
  count: z.number().min(0),
});

/**
 * Validate habit data
 * @param {unknown} data - Data to validate
 * @returns {{success: boolean, data?: any, error?: string}}
 */
export const validateHabit = (data) => {
  try {
    const validated = habitSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Validate habits array
 * @param {unknown} data - Data to validate
 * @returns {{success: boolean, data?: any, error?: string}}
 */
export const validateHabitsArray = (data) => {
  try {
    const validated = habitsArraySchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
