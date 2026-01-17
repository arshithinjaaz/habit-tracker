/**
 * Centralized storage service for all localStorage operations
 * Provides abstraction layer for data persistence
 */

import { validateHabitsArray } from '../schemas/habit.schema.js';
import { validateMemoriesArray } from '../schemas/memory.schema.js';
import { sanitizeText, sanitizeHabitLabel, sanitizeMemory } from '../utils/sanitize.js';

/**
 * Storage service for managing all data operations
 */
export const storageService = {
  // ==================== HABITS ====================
  
  /**
   * Get habits for a specific user and date
   * @param {string} userName - The user name
   * @param {string} date - The date string
   * @returns {Array|null} - Array of habits or null
   */
  getHabits: (userName, date) => {
    try {
      const key = `habits_${userName}_${date}`;
      const data = localStorage.getItem(key);
      if (!data) return null;
      
      const parsed = JSON.parse(data);
      const validation = validateHabitsArray(parsed);
      
      if (validation.success) {
        return validation.data;
      } else {
        console.warn('Invalid habit data:', validation.error);
        return null;
      }
    } catch (error) {
      console.error('Error getting habits:', error);
      return null;
    }
  },

  /**
   * Save habits for a specific user and date
   * @param {string} userName - The user name
   * @param {string} date - The date string
   * @param {Array} habits - Array of habits
   * @returns {boolean} - Success status
   */
  saveHabits: (userName, date, habits) => {
    try {
      const key = `habits_${userName}_${date}`;
      const validation = validateHabitsArray(habits);
      
      if (!validation.success) {
        console.error('Invalid habit data:', validation.error);
        return false;
      }
      
      localStorage.setItem(key, JSON.stringify(habits));
      return true;
    } catch (error) {
      console.error('Error saving habits:', error);
      return false;
    }
  },

  /**
   * Get custom habits for a user
   * @param {string} userName - The user name
   * @returns {Array|null} - Array of custom habits or null
   */
  getCustomHabits: (userName) => {
    try {
      const key = `customHabits_${userName}`;
      const data = localStorage.getItem(key);
      if (!data) return null;
      
      return JSON.parse(data);
    } catch (error) {
      console.error('Error getting custom habits:', error);
      return null;
    }
  },

  /**
   * Save custom habits for a user
   * @param {string} userName - The user name
   * @param {Array} customHabits - Array of custom habits
   * @returns {boolean} - Success status
   */
  saveCustomHabits: (userName, customHabits) => {
    try {
      const key = `customHabits_${userName}`;
      const sanitized = customHabits.map(habit => ({
        ...habit,
        label: sanitizeHabitLabel(habit.label),
      }));
      localStorage.setItem(key, JSON.stringify(sanitized));
      return true;
    } catch (error) {
      console.error('Error saving custom habits:', error);
      return false;
    }
  },

  // ==================== MEMORIES ====================
  
  /**
   * Get all memories for a user
   * @param {string} userName - The user name
   * @returns {Array} - Array of memories
   */
  getMemories: (userName) => {
    try {
      const key = `memories_${userName}`;
      const data = localStorage.getItem(key);
      if (!data) return [];
      
      const parsed = JSON.parse(data);
      const validation = validateMemoriesArray(parsed);
      
      if (validation.success) {
        return validation.data;
      } else {
        console.warn('Invalid memory data:', validation.error);
        return [];
      }
    } catch (error) {
      console.error('Error getting memories:', error);
      return [];
    }
  },

  /**
   * Save a memory for a user
   * @param {string} userName - The user name
   * @param {Object} memory - Memory object
   * @returns {boolean} - Success status
   */
  saveMemory: (userName, memory) => {
    try {
      const memories = storageService.getMemories(userName);
      const sanitizedMemory = {
        ...memory,
        text: sanitizeMemory(memory.text),
        userName: sanitizeText(userName),
      };
      memories.push(sanitizedMemory);
      
      const key = `memories_${userName}`;
      localStorage.setItem(key, JSON.stringify(memories));
      return true;
    } catch (error) {
      console.error('Error saving memory:', error);
      return false;
    }
  },

  /**
   * Delete a memory for a user
   * @param {string} userName - The user name
   * @param {string} memoryId - Memory ID to delete
   * @returns {boolean} - Success status
   */
  deleteMemory: (userName, memoryId) => {
    try {
      const memories = storageService.getMemories(userName);
      const filtered = memories.filter(m => m.id !== memoryId);
      
      const key = `memories_${userName}`;
      localStorage.setItem(key, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error deleting memory:', error);
      return false;
    }
  },

  // ==================== PROGRESS ====================
  
  /**
   * Get progress data for a user
   * @param {string} userName - The user name
   * @returns {Array} - Array of progress data
   */
  getProgressData: (userName) => {
    try {
      const progressData = [];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateString = date.toDateString();
        
        const habits = storageService.getHabits(userName, dateString);
        
        if (habits && habits.length > 0) {
          const completed = habits.filter(h => h.completed).length;
          const percentage = Math.round((completed / habits.length) * 100);
          
          progressData.push({
            date: dateString,
            percentage,
            completedCount: completed,
            totalCount: habits.length,
          });
        }
      }
      
      return progressData;
    } catch (error) {
      console.error('Error getting progress data:', error);
      return [];
    }
  },

  // ==================== STREAK ====================
  
  /**
   * Get streak data for a user
   * @param {string} userName - The user name
   * @returns {Object|null} - Streak data or null
   */
  getStreak: (userName) => {
    try {
      const key = `streak_${userName}`;
      const data = localStorage.getItem(key);
      if (!data) return null;
      
      return JSON.parse(data);
    } catch (error) {
      console.error('Error getting streak:', error);
      return null;
    }
  },

  /**
   * Update streak data for a user
   * @param {string} userName - The user name
   * @param {Object} streakData - Streak data object
   * @returns {boolean} - Success status
   */
  updateStreak: (userName, streakData) => {
    try {
      const key = `streak_${userName}`;
      localStorage.setItem(key, JSON.stringify(streakData));
      return true;
    } catch (error) {
      console.error('Error updating streak:', error);
      return false;
    }
  },

  // ==================== USER ====================
  
  /**
   * Get user PIN (hashed)
   * @param {string} userName - The user name
   * @returns {string|null} - Hashed PIN or null
   */
  getUserPin: (userName) => {
    try {
      const key = `habitTracker_pin_${userName}`;
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Error getting user PIN:', error);
      return null;
    }
  },

  /**
   * Save user PIN (should be hashed before calling this)
   * @param {string} userName - The user name
   * @param {string} hashedPin - The hashed PIN
   * @returns {boolean} - Success status
   */
  saveUserPin: (userName, hashedPin) => {
    try {
      const key = `habitTracker_pin_${userName}`;
      localStorage.setItem(key, hashedPin);
      return true;
    } catch (error) {
      console.error('Error saving user PIN:', error);
      return false;
    }
  },

  /**
   * Get current user
   * @returns {string|null} - Current user name or null
   */
  getCurrentUser: () => {
    try {
      return localStorage.getItem('habitTracker_currentUser');
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  /**
   * Set current user
   * @param {string} userName - The user name
   * @returns {boolean} - Success status
   */
  setCurrentUser: (userName) => {
    try {
      const sanitized = sanitizeText(userName);
      localStorage.setItem('habitTracker_currentUser', sanitized);
      return true;
    } catch (error) {
      console.error('Error setting current user:', error);
      return false;
    }
  },

  // ==================== SETTINGS ====================
  
  /**
   * Get a setting value
   * @param {string} key - Setting key
   * @returns {any|null} - Setting value or null
   */
  getSettings: (key) => {
    try {
      const data = localStorage.getItem(key);
      if (!data) return null;
      return JSON.parse(data);
    } catch (error) {
      console.error('Error getting setting:', error);
      return null;
    }
  },

  /**
   * Save a setting value
   * @param {string} key - Setting key
   * @param {any} value - Setting value
   * @returns {boolean} - Success status
   */
  saveSettings: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error saving setting:', error);
      return false;
    }
  },

  // ==================== UTILITIES ====================
  
  /**
   * Export all data for a user
   * @param {string} userName - The user name
   * @returns {Object} - Exported data object
   */
  exportAllData: (userName) => {
    try {
      const data = {
        userName,
        exportDate: new Date().toISOString(),
        habits: {},
        customHabits: storageService.getCustomHabits(userName),
        memories: storageService.getMemories(userName),
        streak: storageService.getStreak(userName),
      };
      
      // Export all habit data
      for (let key in localStorage) {
        if (key.startsWith(`habits_${userName}_`)) {
          const dateStr = key.replace(`habits_${userName}_`, '');
          data.habits[dateStr] = JSON.parse(localStorage.getItem(key));
        }
      }
      
      return data;
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  },

  /**
   * Import data for a user
   * @param {Object} data - Data object to import
   * @returns {boolean} - Success status
   */
  importData: (data) => {
    try {
      const { userName, habits, customHabits, memories, streak } = data;
      
      if (!userName) {
        console.error('Invalid import data: missing userName');
        return false;
      }
      
      // Import custom habits
      if (customHabits) {
        storageService.saveCustomHabits(userName, customHabits);
      }
      
      // Import habits
      if (habits) {
        for (let dateStr in habits) {
          storageService.saveHabits(userName, dateStr, habits[dateStr]);
        }
      }
      
      // Import memories
      if (memories) {
        const key = `memories_${userName}`;
        localStorage.setItem(key, JSON.stringify(memories));
      }
      
      // Import streak
      if (streak) {
        storageService.updateStreak(userName, streak);
      }
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  },

  /**
   * Clear all data for a user
   * @param {string} userName - The user name
   * @returns {boolean} - Success status
   */
  clearUserData: (userName) => {
    try {
      const keysToRemove = [];
      
      for (let key in localStorage) {
        if (
          key.includes(userName) ||
          key.startsWith(`habits_${userName}`) ||
          key.startsWith(`memories_${userName}`) ||
          key.startsWith(`streak_${userName}`) ||
          key.startsWith(`customHabits_${userName}`) ||
          key.startsWith(`habitTracker_pin_${userName}`)
        ) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      return true;
    } catch (error) {
      console.error('Error clearing user data:', error);
      return false;
    }
  },

  /**
   * Get storage size in bytes
   * @returns {number} - Storage size in bytes
   */
  getStorageSize: () => {
    let size = 0;
    try {
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          size += localStorage[key].length + key.length;
        }
      }
    } catch (error) {
      console.error('Error calculating storage size:', error);
    }
    return size;
  },
};
