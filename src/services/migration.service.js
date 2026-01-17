/**
 * Data migration service for handling schema changes
 * Ensures backward compatibility when updating data structures
 */

const DATA_VERSION_KEY = 'habitTracker_dataVersion';
const CURRENT_VERSION = '1.0.0';

/**
 * Migration functions for each version
 */
const migrations = {
  /**
   * Version 1.0.0: Initial migration
   * - Ensures all PINs are hashed
   * - Adds version tracking
   */
  '1.0.0': async () => {
    console.log('Running migration to v1.0.0');
    
    // Import crypto utils
    const { migratePlainTextPin } = await import('../utils/crypto.js');
    
    // Migrate all user PINs
    const users = [];
    for (let key in localStorage) {
      if (key.startsWith('habitTracker_pin_')) {
        const userName = key.replace('habitTracker_pin_', '');
        users.push(userName);
      }
    }
    
    for (const user of users) {
      await migratePlainTextPin(user);
    }
    
    console.log(`Migrated ${users.length} user PINs to v1.0.0`);
    return true;
  },
};

/**
 * Compare version strings
 * @param {string} v1 - First version
 * @param {string} v2 - Second version
 * @returns {number} - -1 if v1 < v2, 0 if equal, 1 if v1 > v2
 */
const compareVersions = (v1, v2) => {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < 3; i++) {
    if (parts1[i] > parts2[i]) return 1;
    if (parts1[i] < parts2[i]) return -1;
  }
  
  return 0;
};

/**
 * Get the current data version
 * @returns {string} - Current version string
 */
export const getCurrentDataVersion = () => {
  return localStorage.getItem(DATA_VERSION_KEY) || '0.0.0';
};

/**
 * Set the data version
 * @param {string} version - Version string to set
 */
export const setDataVersion = (version) => {
  localStorage.setItem(DATA_VERSION_KEY, version);
};

/**
 * Run all necessary migrations
 * @returns {Promise<boolean>} - Success status
 */
export const runMigrations = async () => {
  try {
    const currentVersion = getCurrentDataVersion();
    
    console.log(`Current data version: ${currentVersion}`);
    console.log(`Target version: ${CURRENT_VERSION}`);
    
    // If already at current version, no migration needed
    if (compareVersions(currentVersion, CURRENT_VERSION) >= 0) {
      console.log('Data is up to date, no migration needed');
      return true;
    }
    
    // Run migrations in order
    const versionKeys = Object.keys(migrations).sort(compareVersions);
    
    for (const version of versionKeys) {
      // Only run migrations newer than current version
      if (compareVersions(version, currentVersion) > 0) {
        console.log(`Running migration to ${version}...`);
        
        try {
          await migrations[version]();
          setDataVersion(version);
          console.log(`✓ Migration to ${version} completed`);
        } catch (error) {
          console.error(`✗ Migration to ${version} failed:`, error);
          return false;
        }
      }
    }
    
    console.log('All migrations completed successfully');
    return true;
  } catch (error) {
    console.error('Error running migrations:', error);
    return false;
  }
};

/**
 * Check if migration is needed
 * @returns {boolean} - True if migration is needed
 */
export const needsMigration = () => {
  const currentVersion = getCurrentDataVersion();
  return compareVersions(currentVersion, CURRENT_VERSION) < 0;
};

/**
 * Get migration status
 * @returns {Object} - Migration status info
 */
export const getMigrationStatus = () => {
  const currentVersion = getCurrentDataVersion();
  const isUpToDate = compareVersions(currentVersion, CURRENT_VERSION) >= 0;
  
  return {
    currentVersion,
    targetVersion: CURRENT_VERSION,
    isUpToDate,
    needsMigration: !isUpToDate,
  };
};
