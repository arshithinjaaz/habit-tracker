/**
 * localStorage quota management utility
 * Handles storage limits, auto-pruning, and quota checks
 */

/**
 * Get the current storage usage and quota
 * @returns {Promise<{usage: number, quota: number, percentage: number}>}
 */
export const getStorageInfo = async () => {
  if (navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 5242880; // Default 5MB
      const percentage = Math.round((usage / quota) * 100);
      
      return { usage, quota, percentage };
    } catch (error) {
      console.error('Error getting storage estimate:', error);
    }
  }
  
  // Fallback: calculate localStorage size
  let size = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      size += localStorage[key].length + key.length;
    }
  }
  
  return {
    usage: size,
    quota: 5242880, // 5MB estimate
    percentage: Math.round((size / 5242880) * 100),
  };
};

/**
 * Check if storage is near the quota limit
 * @param {number} threshold - Percentage threshold (default 80%)
 * @returns {Promise<boolean>}
 */
export const isStorageNearLimit = async (threshold = 80) => {
  const { percentage } = await getStorageInfo();
  return percentage >= threshold;
};

/**
 * Prune old data to free up space
 * Removes oldest habit and memory entries
 * @param {string} userName - The user name
 * @param {number} daysToKeep - Number of days of data to keep (default 90)
 */
export const pruneOldData = (userName, daysToKeep = 90) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  const cutoffTime = cutoffDate.getTime();
  
  let removedCount = 0;
  
  // Prune old habit data
  for (let key in localStorage) {
    if (key.startsWith(`habits_${userName}_`)) {
      try {
        const dateStr = key.split('_').pop();
        const date = new Date(dateStr);
        if (date.getTime() < cutoffTime) {
          localStorage.removeItem(key);
          removedCount++;
        }
      } catch (error) {
        console.error('Error pruning habit data:', error);
      }
    }
  }
  
  // Prune old memories
  try {
    const memoriesKey = `memories_${userName}`;
    const memoriesData = localStorage.getItem(memoriesKey);
    if (memoriesData) {
      const memories = JSON.parse(memoriesData);
      const filteredMemories = memories.filter(memory => {
        const memoryDate = new Date(memory.timestamp);
        return memoryDate.getTime() >= cutoffTime;
      });
      
      if (filteredMemories.length < memories.length) {
        localStorage.setItem(memoriesKey, JSON.stringify(filteredMemories));
        removedCount += memories.length - filteredMemories.length;
      }
    }
  } catch (error) {
    console.error('Error pruning memory data:', error);
  }
  
  return removedCount;
};

/**
 * Show a warning to the user about storage limits
 * @returns {string} - Warning message
 */
export const getStorageWarningMessage = async () => {
  const { percentage, usage, quota } = await getStorageInfo();
  
  if (percentage >= 90) {
    return `Storage is ${percentage}% full (${formatBytes(usage)} of ${formatBytes(quota)}). Consider exporting and deleting old data.`;
  } else if (percentage >= 80) {
    return `Storage is ${percentage}% full. Some old data may be automatically pruned.`;
  }
  
  return null;
};

/**
 * Format bytes to human-readable format
 * @param {number} bytes - Number of bytes
 * @returns {string} - Formatted string
 */
export const formatBytes = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
};

/**
 * Monitor storage and auto-prune if necessary
 * @param {string} userName - The user name
 */
export const monitorStorage = async (userName) => {
  const isNearLimit = await isStorageNearLimit(80);
  
  if (isNearLimit) {
    console.warn('Storage near limit, pruning old data...');
    const removed = pruneOldData(userName, 90);
    console.log(`Pruned ${removed} old entries`);
    
    // Check again after pruning
    const stillNearLimit = await isStorageNearLimit(80);
    if (stillNearLimit) {
      const message = await getStorageWarningMessage();
      if (message) {
        // Could trigger a UI notification here
        console.warn(message);
      }
    }
  }
};
