import { z } from 'zod';

// Subscription plan schema
export const SubscriptionPlanSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  price: z.number().min(0),
  currency: z.string().default('USD'),
  billingCycle: z.enum(['monthly', 'yearly']).default('monthly'),
  features: z.array(z.string()),
  maxHabits: z.number().min(1).default(5),
  maxMemories: z.number().min(10).default(100),
  analyticsAccess: z.boolean().default(false),
  customization: z.boolean().default(false),
  priority_support: z.boolean().default(false),
  isActive: z.boolean().default(true),
  createdAt: z.date().default(() => new Date()),
});

// User subscription schema
export const UserSubscriptionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  planId: z.string(),
  status: z.enum(['active', 'cancelled', 'expired', 'pending']).default('pending'),
  startDate: z.date(),
  endDate: z.date().optional(),
  autoRenew: z.boolean().default(true),
  paymentMethod: z.string().optional(),
  transactionId: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

// Subscription usage schema
export const SubscriptionUsageSchema = z.object({
  id: z.string(),
  userId: z.string(),
  habitCount: z.number().min(0).default(0),
  memoryCount: z.number().min(0).default(0),
  storageUsed: z.number().min(0).default(0), // in MB
  lastUpdated: z.date().default(() => new Date()),
});

// Free plan - always available
export const FREE_PLAN = {
  id: 'free',
  name: 'Free',
  price: 0,
  currency: 'USD',
  billingCycle: 'monthly',
  features: ['Track up to 5 habits', 'Store memories', 'Daily quotes'],
  maxHabits: 5,
  maxMemories: 100,
  analyticsAccess: false,
  customization: false,
  priority_support: false,
  isActive: true,
};

// Basic plan
export const BASIC_PLAN = {
  id: 'basic',
  name: 'Basic',
  price: 2.99,
  currency: 'USD',
  billingCycle: 'monthly',
  features: [
    'Track up to 15 habits',
    'Store up to 500 memories',
    'Advanced analytics',
    'Custom themes',
  ],
  maxHabits: 15,
  maxMemories: 500,
  analyticsAccess: true,
  customization: true,
  priority_support: false,
  isActive: true,
};

// Pro plan
export const PRO_PLAN = {
  id: 'pro',
  name: 'Pro',
  price: 9.99,
  currency: 'USD',
  billingCycle: 'monthly',
  features: [
    'Unlimited habits',
    'Unlimited memories',
    'Advanced analytics & insights',
    'Full customization',
    'Priority support',
    'Export data',
  ],
  maxHabits: 999,
  maxMemories: 999999,
  analyticsAccess: true,
  customization: true,
  priority_support: true,
  isActive: true,
};

// Premium plan
export const PREMIUM_PLAN = {
  id: 'premium',
  name: 'Premium',
  price: 19.99,
  currency: 'USD',
  billingCycle: 'monthly',
  features: [
    'Everything in Pro',
    'AI-powered habit recommendations',
    'Advanced reporting',
    'Team collaboration',
    'API access',
    'White-label options',
  ],
  maxHabits: 999,
  maxMemories: 999999,
  analyticsAccess: true,
  customization: true,
  priority_support: true,
  isActive: true,
};

export const AVAILABLE_PLANS = [FREE_PLAN, BASIC_PLAN, PRO_PLAN, PREMIUM_PLAN];

// Yearly discount plans
export const getYearlyPlan = (monthlyPlan) => ({
  ...monthlyPlan,
  billingCycle: 'yearly',
  price: Math.floor(monthlyPlan.price * 12 * 0.8), // 20% discount for annual
  id: `${monthlyPlan.id}-yearly`,
});
