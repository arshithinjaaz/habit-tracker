/**
 * Simple Admin Authentication
 * Uses environment variable for password
 */

const ADMIN_SESSION_KEY = 'admin_session';
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
const SESSION_DURATION = 60 * 60 * 1000; // 1 hour

// Warn if using default password
if (ADMIN_PASSWORD === 'admin123') {
  console.warn('⚠️ WARNING: Using default admin password. Please set VITE_ADMIN_PASSWORD environment variable for production.');
}

export const checkAdminPassword = (password) => {
  return password === ADMIN_PASSWORD;
};

export const createAdminSession = () => {
  const session = {
    authenticated: true,
    timestamp: Date.now(),
  };
  sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
};

export const isAdminAuthenticated = () => {
  const sessionData = sessionStorage.getItem(ADMIN_SESSION_KEY);
  
  if (!sessionData) return false;
  
  try {
    const session = JSON.parse(sessionData);
    const now = Date.now();
    
    if (now - session.timestamp > SESSION_DURATION) {
      clearAdminSession();
      return false;
    }
    
    return session.authenticated === true;
  } catch {
    return false;
  }
};

export const clearAdminSession = () => {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
};
