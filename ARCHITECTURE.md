# Habit Tracker Architecture

## Overview

This document provides a comprehensive overview of the Habit Tracker application architecture, design patterns, and best practices.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Core Architecture](#core-architecture)
3. [State Management](#state-management)
4. [Data Persistence](#data-persistence)
5. [Security](#security)
6. [Testing](#testing)
7. [Performance](#performance)

## Project Structure

```
habit-tracker/
├── src/
│   ├── components/          # React components
│   │   ├── admin/          # Admin panel components
│   │   └── Skeleton/       # Loading skeleton components
│   ├── constants/          # Application constants
│   │   ├── habits.js       # Habit-related constants
│   │   └── theme.js        # Theme and styling constants
│   ├── context/            # React Context providers (planned)
│   ├── hooks/              # Custom React hooks
│   │   └── useLocalStorage.js
│   ├── schemas/            # Zod validation schemas
│   │   ├── habit.schema.js
│   │   ├── memory.schema.js
│   │   └── user.schema.js
│   ├── services/           # Business logic services
│   │   ├── storage.service.js
│   │   └── migration.service.js
│   ├── utils/              # Utility functions
│   │   ├── crypto.js       # PIN hashing
│   │   ├── sanitize.js     # XSS prevention
│   │   ├── date.js         # Date utilities
│   │   ├── debounce.js     # Debouncing utilities
│   │   └── storageManager.js
│   ├── App.jsx             # Main application component
│   └── main.jsx            # Application entry point
├── public/                 # Static assets
├── tests/                  # Test files
└── package.json
```

## Core Architecture

### Design Patterns

1. **Service Layer Pattern**
   - All data operations go through service layer
   - Centralized business logic
   - Easy to test and maintain

2. **Custom Hooks Pattern**
   - Encapsulate reusable logic
   - Hooks for localStorage, habits, memories
   - Automatic debouncing and synchronization

3. **Schema Validation**
   - Zod schemas for all data types
   - Validation before save/load operations
   - Type safety and error handling

### Component Structure

```javascript
// Example component structure
import { useLocalStorage } from '../hooks/useLocalStorage';
import { storageService } from '../services/storage.service';
import { validateHabit } from '../schemas/habit.schema';

const Component = () => {
  // Custom hooks for state
  const [habits, setHabits] = useLocalStorage('habits', []);
  
  // Service layer for complex operations
  const loadData = () => {
    const data = storageService.getHabits(userName, date);
    // ... handle data
  };
  
  return (/* JSX */);
};
```

## State Management

### Current Implementation

- **Local State**: `useState` for component-specific state
- **localStorage**: Custom hooks for persistence
- **Props**: Parent-to-child communication

### Planned Improvements

- **Context API**: Global state for user, theme, settings
- **Reducer Pattern**: Complex state updates
- **State Colocation**: Keep state close to where it's used

## Data Persistence

### Storage Service

The `storage.service.js` provides a centralized interface for all data operations:

```javascript
// Example usage
import { storageService } from '../services/storage.service';

// Get habits
const habits = storageService.getHabits(userName, date);

// Save habits
storageService.saveHabits(userName, date, habits);

// Get memories
const memories = storageService.getMemories(userName);

// Export all data
const exportData = storageService.exportAllData(userName);
```

### Data Migration

Version-based migration system:

```javascript
// migrations run automatically on app start
const migrations = {
  '1.0.0': async () => {
    // Migrate PINs to hashed versions
  },
  '2.0.0': async () => {
    // Future migration
  },
};
```

### Storage Quota Management

Automatic monitoring and pruning:

```javascript
import { monitorStorage, getStorageInfo } from '../utils/storageManager';

// Check storage status
const { usage, quota, percentage } = await getStorageInfo();

// Auto-prune if near limit
await monitorStorage(userName);
```

## Security

### PIN Hashing

All PINs are hashed using SHA-256:

```javascript
import { hashPin, verifyPin } from '../utils/crypto';

// Hash PIN before storing
const hashedPin = await hashPin('1234');

// Verify PIN
const isValid = await verifyPin('1234', hashedPin);
```

### XSS Prevention

All user input is sanitized:

```javascript
import { sanitizeText, sanitizeHabitLabel } from '../utils/sanitize';

// Sanitize user input
const clean = sanitizeText(userInput);
const cleanLabel = sanitizeHabitLabel(habitLabel);
```

### Data Validation

Zod schemas validate all data:

```javascript
import { validateHabit } from '../schemas/habit.schema';

const validation = validateHabit(habitData);
if (validation.success) {
  // Data is valid
} else {
  console.error(validation.error);
}
```

## Testing

### Test Structure

```
src/
├── utils/
│   ├── crypto.js
│   └── __tests__/
│       └── crypto.test.js
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm test -- --watch
```

### Test Coverage

- **crypto.js**: 100% coverage (5 tests)
- **sanitize.js**: 100% coverage (11 tests)
- **date.js**: 100% coverage (10 tests)

## Performance

### Optimization Strategies

1. **Debounced localStorage Writes**
   - Batch writes to reduce I/O
   - Configurable delay (default 300ms)

2. **Memoization** (planned)
   - `useMemo` for expensive calculations
   - `useCallback` for event handlers
   - `React.memo` for components

3. **Code Splitting** (planned)
   - Lazy load admin panel
   - Dynamic imports for heavy libraries

4. **Skeleton Loading**
   - Show loading states immediately
   - Improve perceived performance

### Bundle Optimization

Current bundle size: ~1.05MB
- Main bundle: 1.05MB (332KB gzipped)
- Chunk splitting recommended for production

## Best Practices

### Code Style

1. **Use constants instead of magic strings**
   ```javascript
   import { CATEGORIES } from '../constants/habits';
   ```

2. **Validate all inputs**
   ```javascript
   const validation = validateUserName(name);
   if (!validation.success) return;
   ```

3. **Handle errors gracefully**
   ```javascript
   try {
     // ... operation
   } catch (error) {
     console.error('Specific error:', error);
     // Show user-friendly message
   }
   ```

4. **Use service layer for data operations**
   ```javascript
   // Good
   const data = storageService.getHabits(userName, date);
   
   // Avoid
   const data = JSON.parse(localStorage.getItem('habits'));
   ```

### Error Handling

1. **Error Boundaries**
   - Wrap app in ErrorBoundary
   - Show fallback UI on errors
   - Log errors for debugging

2. **Validation**
   - Validate before saving
   - Validate after loading
   - Show validation errors to user

3. **Sanitization**
   - Sanitize all user input
   - Prevent XSS attacks
   - Limit input length

## Future Improvements

1. **Context API Implementation**
   - Global state management
   - Reduce prop drilling
   - Better state organization

2. **TypeScript Migration**
   - Add type safety throughout
   - Better IDE support
   - Catch errors at compile time

3. **PWA Features**
   - Offline support
   - Service worker
   - Push notifications

4. **Firebase Integration**
   - Cloud sync across devices
   - Real-time updates
   - User authentication

## Contributing

When adding new features:

1. Follow existing patterns
2. Add tests for new code
3. Update documentation
4. Use TypeScript when possible
5. Validate and sanitize user input
6. Handle errors gracefully

## Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Zod Documentation](https://zod.dev)
- [Vitest Documentation](https://vitest.dev)
