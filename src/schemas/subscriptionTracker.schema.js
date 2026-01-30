import { z } from 'zod';

/**
 * Subscription Tracker Schema
 * For tracking personal subscriptions (Netflix, Spotify, etc.)
 */

// Individual subscription schema
export const SubscriptionSchema = z.object({
  id: z.string().default(() => `sub_${Date.now()}`),
  userId: z.string(),
  name: z.string().min(1, 'Subscription name is required'),
  description: z.string().optional().default(''),
  category: z.enum([
    'streaming',
    'music',
    'software',
    'cloud',
    'productivity',
    'gaming',
    'news',
    'health',
    'other',
  ]).default('other'),
  price: z.number().min(0, 'Price must be positive'),
  currency: z.string().default('USD'),
  billingCycle: z.enum(['monthly', 'yearly', 'weekly', 'daily']).default('monthly'),
  startDate: z.date(),
  renewalDate: z.date(),
  autoRenew: z.boolean().default(true),
  status: z.enum(['active', 'paused', 'cancelled', 'expired']).default('active'),
  notificationDays: z.number().default(7), // Notify X days before expiry
  notes: z.string().optional().default(''),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

// Subscription list schema
export const SubscriptionsListSchema = z.array(SubscriptionSchema);

// Category colors
export const CATEGORY_COLORS = {
  streaming: '#E50914', // Netflix red
  music: '#1DB954',     // Spotify green
  software: '#0078D4',  // Microsoft blue
  cloud: '#FF9900',     // AWS orange
  productivity: '#4285F4', // Google blue
  gaming: '#9146FF',    // Twitch purple
  news: '#1B1B1B',      // Dark
  health: '#00C9A7',    // Health green
  other: '#757575',     // Gray
};

// Category icons mapping
export const CATEGORY_ICONS = {
  streaming: '🎬',
  music: '🎵',
  software: '💻',
  cloud: '☁️',
  productivity: '📊',
  gaming: '🎮',
  news: '📰',
  health: '💪',
  other: '📦',
};

// Billing cycle display names
export const BILLING_CYCLE_DISPLAY = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

// Default categories list
export const SUBSCRIPTION_CATEGORIES = [
  { id: 'streaming', label: 'Streaming', icon: '🎬', color: CATEGORY_COLORS.streaming },
  { id: 'music', label: 'Music', icon: '🎵', color: CATEGORY_COLORS.music },
  { id: 'software', label: 'Software', icon: '💻', color: CATEGORY_COLORS.software },
  { id: 'cloud', label: 'Cloud Storage', icon: '☁️', color: CATEGORY_COLORS.cloud },
  { id: 'productivity', label: 'Productivity', icon: '📊', color: CATEGORY_COLORS.productivity },
  { id: 'gaming', label: 'Gaming', icon: '🎮', color: CATEGORY_COLORS.gaming },
  { id: 'news', label: 'News', icon: '📰', color: CATEGORY_COLORS.news },
  { id: 'health', label: 'Health & Fitness', icon: '💪', color: CATEGORY_COLORS.health },
  { id: 'other', label: 'Other', icon: '📦', color: CATEGORY_COLORS.other },
];

export default {
  SubscriptionSchema,
  SubscriptionsListSchema,
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  BILLING_CYCLE_DISPLAY,
  SUBSCRIPTION_CATEGORIES,
};
