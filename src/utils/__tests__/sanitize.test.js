/**
 * Tests for sanitization utilities
 */

import { describe, it, expect } from 'vitest';
import { sanitizeText, sanitizeHabitLabel, sanitizeMemory, sanitizeUserName } from '../sanitize';

describe('sanitize utilities', () => {
  describe('sanitizeText', () => {
    it('should remove HTML tags', () => {
      const input = '<script>alert("xss")</script>Hello';
      const output = sanitizeText(input);
      
      expect(output).toBe('Hello');
      expect(output).not.toContain('<script>');
    });

    it('should handle empty strings', () => {
      expect(sanitizeText('')).toBe('');
    });

    it('should handle non-string input', () => {
      expect(sanitizeText(null)).toBe('');
      expect(sanitizeText(undefined)).toBe('');
      expect(sanitizeText(123)).toBe('');
    });
  });

  describe('sanitizeHabitLabel', () => {
    it('should trim whitespace', () => {
      const input = '  Exercise  ';
      const output = sanitizeHabitLabel(input);
      
      expect(output).toBe('Exercise');
    });

    it('should limit length to 100 characters', () => {
      const input = 'a'.repeat(150);
      const output = sanitizeHabitLabel(input);
      
      expect(output.length).toBe(100);
    });

    it('should remove HTML tags', () => {
      const input = '<b>Exercise</b>';
      const output = sanitizeHabitLabel(input);
      
      expect(output).toBe('Exercise');
    });
  });

  describe('sanitizeMemory', () => {
    it('should trim whitespace', () => {
      const input = '  Today was a good day  ';
      const output = sanitizeMemory(input);
      
      expect(output).toBe('Today was a good day');
    });

    it('should limit length to 5000 characters', () => {
      const input = 'a'.repeat(6000);
      const output = sanitizeMemory(input);
      
      expect(output.length).toBe(5000);
    });
  });

  describe('sanitizeUserName', () => {
    it('should trim whitespace', () => {
      const input = '  john_doe  ';
      const output = sanitizeUserName(input);
      
      expect(output).toBe('john_doe');
    });

    it('should limit length to 50 characters', () => {
      const input = 'a'.repeat(100);
      const output = sanitizeUserName(input);
      
      expect(output.length).toBe(50);
    });

    it('should remove HTML tags', () => {
      const input = '<script>evil</script>john';
      const output = sanitizeUserName(input);
      
      expect(output).toBe('john');
    });
  });
});
