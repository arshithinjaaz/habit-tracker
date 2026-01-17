/**
 * Debounce utility function for batching operations
 * Delays execution until after a specified wait time has elapsed
 */

/**
 * Create a debounced function that delays invoking func until after wait milliseconds
 * @param {Function} func - The function to debounce
 * @param {number} wait - The number of milliseconds to delay
 * @returns {Function} - The debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeoutId;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeoutId);
      func(...args);
    };
    
    clearTimeout(timeoutId);
    timeoutId = setTimeout(later, wait);
  };
};

/**
 * Batch multiple localStorage writes into a single operation
 * Collects writes and executes them together after a delay
 */
class StorageWriteQueue {
  constructor(delay = 500) {
    this.queue = new Map();
    this.timeoutId = null;
    this.delay = delay;
  }

  add(key, value) {
    this.queue.set(key, value);
    this.scheduleFlush();
  }

  scheduleFlush() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    
    this.timeoutId = setTimeout(() => {
      this.flush();
    }, this.delay);
  }

  flush() {
    if (this.queue.size === 0) return;
    
    try {
      for (const [key, value] of this.queue) {
        localStorage.setItem(key, JSON.stringify(value));
      }
      this.queue.clear();
    } catch (error) {
      console.error('Error flushing storage queue:', error);
    }
  }

  clear() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.queue.clear();
  }
}

// Export a singleton instance for app-wide use
export const storageQueue = new StorageWriteQueue();
