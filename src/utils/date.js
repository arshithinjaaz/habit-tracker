/**
 * Date utility functions
 * Centralized date formatting and manipulation
 */

/**
 * Format a date object to a localized string
 * @param {Date} date - Date object to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };
  
  return new Intl.DateTimeFormat('en-US', defaultOptions).format(date);
};

/**
 * Get today's date as a string
 * @returns {string} - Today's date string
 */
export const getTodayString = () => {
  return new Date().toDateString();
};

/**
 * Get yesterday's date as a string
 * @returns {string} - Yesterday's date string
 */
export const getYesterdayString = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toDateString();
};

/**
 * Get date from N days ago
 * @param {number} days - Number of days ago
 * @returns {string} - Date string
 */
export const getDaysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toDateString();
};

/**
 * Get date N days from now
 * @param {number} days - Number of days from now
 * @returns {string} - Date string
 */
export const getDaysFromNow = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toDateString();
};

/**
 * Format time ago in a human-readable format
 * @param {string|Date} timestamp - Timestamp to format
 * @returns {string} - Formatted time ago string
 */
export const formatTimeAgo = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'just now';
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
  
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
  
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? 's' : ''} ago`;
};

/**
 * Get the start of today (00:00:00)
 * @returns {Date} - Start of today
 */
export const getStartOfDay = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

/**
 * Get the end of today (23:59:59)
 * @returns {Date} - End of today
 */
export const getEndOfDay = () => {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date;
};

/**
 * Check if a date is today
 * @param {string|Date} date - Date to check
 * @returns {boolean} - True if date is today
 */
export const isToday = (date) => {
  const inputDate = new Date(date);
  const today = new Date();
  
  return inputDate.toDateString() === today.toDateString();
};

/**
 * Check if a date is yesterday
 * @param {string|Date} date - Date to check
 * @returns {boolean} - True if date is yesterday
 */
export const isYesterday = (date) => {
  const inputDate = new Date(date);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  return inputDate.toDateString() === yesterday.toDateString();
};

/**
 * Get day of week
 * @param {string|Date} date - Date to get day from
 * @returns {string} - Day of week (e.g., "Monday")
 */
export const getDayOfWeek = (date) => {
  const d = new Date(date);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[d.getDay()];
};

/**
 * Get short day of week
 * @param {string|Date} date - Date to get day from
 * @returns {string} - Short day of week (e.g., "Mon")
 */
export const getShortDayOfWeek = (date) => {
  const d = new Date(date);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[d.getDay()];
};
