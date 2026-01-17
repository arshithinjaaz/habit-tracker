/**
 * Habit-related constants
 * Centralized configuration for habits
 */

export const DEFAULT_HABITS = [
  { id: 'exercise', label: '🏃‍♀️ Exercise (30 min)', category: 'Health' },
  { id: 'water', label: '💧 Drink 8 glasses of water', category: 'Health' },
  { id: 'reading', label: '📚 Read for 20 minutes', category: 'Learning' },
  { id: 'meditation', label: '🧘‍♀️ Meditate (10 min)', category: 'Wellness' },
  { id: 'sleep', label: '😴 Sleep 7-8 hours', category: 'Health' },
  { id: 'gratitude', label: '🙏 Practice gratitude', category: 'Wellness' },
  { id: 'healthy-meal', label: '🥗 Eat healthy meals', category: 'Health' },
  { id: 'social', label: '👥 Connect with loved ones', category: 'Social' },
  { id: 'learn', label: '💡 Learn something new', category: 'Learning' },
  { id: 'organize', label: '📝 Organize workspace', category: 'Productivity' },
];

export const CATEGORIES = [
  'Health',
  'Wellness',
  'Learning',
  'Productivity',
  'Social',
];

export const CATEGORY_COLORS = {
  Health: '#4caf50',
  Wellness: '#9c27b0',
  Learning: '#2196f3',
  Productivity: '#ff9800',
  Social: '#e91e63',
};

export const HABIT_ICONS = {
  Health: '💪',
  Wellness: '🧘',
  Learning: '📚',
  Productivity: '🎯',
  Social: '👥',
};

export const STREAK_THRESHOLDS = {
  bronze: 7,
  silver: 30,
  gold: 90,
  platinum: 365,
};

export const COMPLETION_MESSAGES = {
  0: "Let's get started! You can do this!",
  25: "Good start! Keep going!",
  50: "Halfway there! You're doing great!",
  75: "Almost done! Just a little more!",
  100: "🎉 Amazing! You completed everything!",
};
