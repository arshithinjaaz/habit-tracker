/**
 * Tests for crypto utilities
 */

import { describe, it, expect } from 'vitest';
import { hashPin, verifyPin } from '../crypto';

describe('crypto utilities', () => {
  describe('hashPin', () => {
    it('should hash a PIN', async () => {
      const pin = '1234';
      const hashed = await hashPin(pin);
      
      expect(hashed).toBeDefined();
      expect(typeof hashed).toBe('string');
      expect(hashed.length).toBe(64); // SHA-256 produces 64 hex characters
    });

    it('should produce different hashes for different PINs', async () => {
      const pin1 = '1234';
      const pin2 = '5678';
      
      const hashed1 = await hashPin(pin1);
      const hashed2 = await hashPin(pin2);
      
      expect(hashed1).not.toBe(hashed2);
    });

    it('should produce the same hash for the same PIN', async () => {
      const pin = '1234';
      
      const hashed1 = await hashPin(pin);
      const hashed2 = await hashPin(pin);
      
      expect(hashed1).toBe(hashed2);
    });
  });

  describe('verifyPin', () => {
    it('should verify a correct PIN', async () => {
      const pin = '1234';
      const hashed = await hashPin(pin);
      
      const isValid = await verifyPin(pin, hashed);
      
      expect(isValid).toBe(true);
    });

    it('should reject an incorrect PIN', async () => {
      const pin = '1234';
      const wrongPin = '5678';
      const hashed = await hashPin(pin);
      
      const isValid = await verifyPin(wrongPin, hashed);
      
      expect(isValid).toBe(false);
    });
  });
});
