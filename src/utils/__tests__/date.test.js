/**
 * Tests for date utilities
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  getTodayString, 
  getYesterdayString, 
  getDaysAgo,
  isToday,
  isYesterday,
  getDayOfWeek,
  getShortDayOfWeek,
} from '../date';

describe('date utilities', () => {
  beforeEach(() => {
    // Mock current date to a fixed date
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getTodayString', () => {
    it('should return today\'s date string', () => {
      const today = getTodayString();
      expect(today).toBeDefined();
      expect(typeof today).toBe('string');
    });
  });

  describe('getYesterdayString', () => {
    it('should return yesterday\'s date string', () => {
      const yesterday = getYesterdayString();
      expect(yesterday).toBeDefined();
      expect(typeof yesterday).toBe('string');
      
      // Verify it's different from today
      const today = getTodayString();
      expect(yesterday).not.toBe(today);
    });
  });

  describe('getDaysAgo', () => {
    it('should return date string from N days ago', () => {
      const daysAgo = getDaysAgo(7);
      expect(daysAgo).toBeDefined();
      expect(typeof daysAgo).toBe('string');
    });

    it('should return today for 0 days ago', () => {
      const today = getTodayString();
      const daysAgo = getDaysAgo(0);
      expect(daysAgo).toBe(today);
    });
  });

  describe('isToday', () => {
    it('should return true for today\'s date', () => {
      const today = new Date();
      expect(isToday(today)).toBe(true);
    });

    it('should return false for yesterday\'s date', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isToday(yesterday)).toBe(false);
    });
  });

  describe('isYesterday', () => {
    it('should return true for yesterday\'s date', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isYesterday(yesterday)).toBe(true);
    });

    it('should return false for today\'s date', () => {
      const today = new Date();
      expect(isYesterday(today)).toBe(false);
    });
  });

  describe('getDayOfWeek', () => {
    it('should return day of week', () => {
      const date = new Date('2024-01-15'); // Monday
      const day = getDayOfWeek(date);
      expect(day).toBe('Monday');
    });
  });

  describe('getShortDayOfWeek', () => {
    it('should return short day of week', () => {
      const date = new Date('2024-01-15'); // Monday
      const day = getShortDayOfWeek(date);
      expect(day).toBe('Mon');
    });
  });
});
