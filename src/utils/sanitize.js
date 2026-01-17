/**
 * Input sanitization utilities to prevent XSS attacks
 * Uses DOMPurify for sanitizing HTML/text content
 */

import DOMPurify from 'dompurify';

/**
 * Sanitize text content to prevent XSS attacks
 * @param {string} text - The text to sanitize
 * @returns {string} - The sanitized text
 */
export const sanitizeText = (text) => {
  if (typeof text !== 'string') return '';
  return DOMPurify.sanitize(text, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });
};

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param {string} html - The HTML to sanitize
 * @returns {string} - The sanitized HTML
 */
export const sanitizeHtml = (html) => {
  if (typeof html !== 'string') return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href'],
  });
};

/**
 * Sanitize user input for habit labels
 * @param {string} label - The habit label to sanitize
 * @returns {string} - The sanitized label
 */
export const sanitizeHabitLabel = (label) => {
  return sanitizeText(label).trim().slice(0, 100);
};

/**
 * Sanitize memory text content
 * @param {string} memory - The memory text to sanitize
 * @returns {string} - The sanitized memory
 */
export const sanitizeMemory = (memory) => {
  return sanitizeText(memory).trim().slice(0, 5000);
};

/**
 * Sanitize user name
 * @param {string} userName - The user name to sanitize
 * @returns {string} - The sanitized user name
 */
export const sanitizeUserName = (userName) => {
  return sanitizeText(userName).trim().slice(0, 50);
};
