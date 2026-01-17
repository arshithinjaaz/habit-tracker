/**
 * Cryptographic utility functions for secure PIN storage
 * Uses Web Crypto API for SHA-256 hashing
 */

/**
 * Hash a PIN using SHA-256
 * @param {string} pin - The PIN to hash
 * @returns {Promise<string>} - The hashed PIN as a hex string
 */
export const hashPin = async (pin) => {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(pin);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  } catch (error) {
    console.error('Error hashing PIN:', error);
    throw new Error('Failed to hash PIN');
  }
};

/**
 * Verify a PIN against a hashed PIN
 * @param {string} pin - The PIN to verify
 * @param {string} hashedPin - The hashed PIN to compare against
 * @returns {Promise<boolean>} - True if the PIN matches, false otherwise
 */
export const verifyPin = async (pin, hashedPin) => {
  try {
    const newHash = await hashPin(pin);
    return newHash === hashedPin;
  } catch (error) {
    console.error('Error verifying PIN:', error);
    return false;
  }
};

/**
 * Migrate plain-text PIN to hashed version
 * @param {string} userName - The user name
 * @returns {Promise<boolean>} - True if migration was performed
 */
export const migratePlainTextPin = async (userName) => {
  try {
    const pinKey = `habitTracker_pin_${userName}`;
    const pin = localStorage.getItem(pinKey);
    
    if (!pin) return false;
    
    // Check if already hashed (hashed PINs are 64 characters long)
    if (pin.length === 64 && /^[a-f0-9]+$/.test(pin)) {
      return false; // Already hashed
    }
    
    // Hash the plain-text PIN
    const hashedPin = await hashPin(pin);
    localStorage.setItem(pinKey, hashedPin);
    
    console.log('PIN migration completed for user:', userName);
    return true;
  } catch (error) {
    console.error('Error migrating PIN:', error);
    return false;
  }
};
