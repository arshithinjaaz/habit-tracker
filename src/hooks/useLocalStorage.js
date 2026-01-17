/**
 * Custom hook for localStorage with error handling and auto-sync
 */

import { useState, useEffect, useCallback } from 'react';
import { debounce } from '../utils/debounce';
import { monitorStorage } from '../utils/storageManager';

/**
 * Custom hook for localStorage with validation and debouncing
 * @param {string} key - The localStorage key
 * @param {any} initialValue - The initial value if key doesn't exist
 * @param {Object} options - Configuration options
 * @returns {[any, Function, Function]} - [value, setValue, removeValue]
 */
export const useLocalStorage = (key, initialValue, options = {}) => {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    debounceMs = 300,
    userName = null,
  } = options;

  // State to store our value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? deserialize(item) : initialValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return initialValue;
    }
  });

  // Debounced save function
  const debouncedSave = useCallback(
    debounce((key, value) => {
      try {
        window.localStorage.setItem(key, serialize(value));
        
        // Monitor storage if userName is provided
        if (userName) {
          monitorStorage(userName);
        }
      } catch (error) {
        if (error.name === 'QuotaExceededError') {
          console.error('localStorage quota exceeded');
          // Could trigger a UI notification here
        } else {
          console.error(`Error saving ${key} to localStorage:`, error);
        }
      }
    }, debounceMs),
    [key, serialize, debounceMs, userName]
  );

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback(
    (value) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        
        // Save state
        setStoredValue(valueToStore);
        
        // Save to localStorage (debounced)
        debouncedSave(key, valueToStore);
      } catch (error) {
        console.error(`Error in setValue for ${key}:`, error);
      }
    },
    [key, storedValue, debouncedSave]
  );

  // Function to remove the value from localStorage
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
    }
  }, [key, initialValue]);

  // Listen for changes to this localStorage key from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(deserialize(e.newValue));
        } catch (error) {
          console.error(`Error handling storage change for ${key}:`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, deserialize]);

  return [storedValue, setValue, removeValue];
};

/**
 * Hook for managing habits in localStorage
 * @param {string} userName - The user name
 * @param {string} date - The date string
 * @returns {[Array, Function]} - [habits, setHabits]
 */
export const useHabits = (userName, date) => {
  return useLocalStorage(
    `habits_${userName}_${date}`,
    [],
    { userName }
  );
};

/**
 * Hook for managing memories in localStorage
 * @param {string} userName - The user name
 * @returns {[Array, Function]} - [memories, setMemories]
 */
export const useMemories = (userName) => {
  return useLocalStorage(
    `memories_${userName}`,
    [],
    { userName }
  );
};

/**
 * Hook for managing custom habits in localStorage
 * @param {string} userName - The user name
 * @returns {[Array, Function]} - [customHabits, setCustomHabits]
 */
export const useCustomHabits = (userName) => {
  return useLocalStorage(
    `customHabits_${userName}`,
    null,
    { userName }
  );
};

/**
 * Hook for managing streak in localStorage
 * @param {string} userName - The user name
 * @returns {[Object, Function]} - [streak, setStreak]
 */
export const useStreak = (userName) => {
  return useLocalStorage(
    `streak_${userName}`,
    { lastDate: null, count: 0 },
    { userName }
  );
};
