/**
 * Subscription utility functions
 * Helper functions for subscription management
 */

import SubscriptionManager from '../services/subscription.service';

/**
 * Format currency value
 */
export const formatPrice = (price, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price);
};

/**
 * Format date for display
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Get plan color based on tier
 */
export const getPlanColor = (planId) => {
  const colors = {
    free: '#808080',
    basic: '#4CAF50',
    pro: '#FF9800',
    premium: '#9C27B0',
  };
  return colors[planId] || '#757575';
};

/**
 * Get plan badge text
 */
export const getPlanBadge = (planId) => {
  const badges = {
    free: 'FREE',
    basic: 'STARTER',
    pro: 'PROFESSIONAL',
    premium: 'ENTERPRISE',
  };
  return badges[planId] || 'PLAN';
};

/**
 * Check if user can add more habits
 */
export const canAddMoreHabits = (userId) => {
  try {
    const limits = SubscriptionManager.checkLimits(userId);
    return !limits.habitLimit.reached;
  } catch (error) {
    console.error('Error checking habit limits:', error);
    return false;
  }
};

/**
 * Check if user can add more memories
 */
export const canAddMoreMemories = (userId) => {
  try {
    const limits = SubscriptionManager.checkLimits(userId);
    return !limits.memoryLimit.reached;
  } catch (error) {
    console.error('Error checking memory limits:', error);
    return false;
  }
};

/**
 * Get remaining quota for habits
 */
export const getHabitQuotaRemaining = (userId) => {
  try {
    const limits = SubscriptionManager.checkLimits(userId);
    return limits.habitLimit.max - limits.habitLimit.current;
  } catch (error) {
    console.error('Error getting habit quota:', error);
    return 0;
  }
};

/**
 * Get remaining quota for memories
 */
export const getMemoryQuotaRemaining = (userId) => {
  try {
    const limits = SubscriptionManager.checkLimits(userId);
    return limits.memoryLimit.max - limits.memoryLimit.current;
  } catch (error) {
    console.error('Error getting memory quota:', error);
    return 0;
  }
};

/**
 * Get quota usage percentage
 */
export const getQuotaPercentage = (current, max) => {
  if (max === 999 || max === 999999) return 0; // Unlimited
  return Math.round((current / max) * 100);
};

/**
 * Check if user is on free plan
 */
export const isFreePlan = (userId) => {
  try {
    const subscription = SubscriptionManager.getUserSubscription(userId);
    return subscription.status === 'free' || subscription.planId === 'free';
  } catch (error) {
    console.error('Error checking plan type:', error);
    return true;
  }
};

/**
 * Check if user is on premium plan
 */
export const isPremiumPlan = (userId) => {
  try {
    const subscription = SubscriptionManager.getUserSubscription(userId);
    return subscription.planId === 'premium';
  } catch (error) {
    console.error('Error checking plan type:', error);
    return false;
  }
};

/**
 * Get days until subscription renewal
 */
export const getDaysUntilRenewal = (userId) => {
  try {
    const subscription = SubscriptionManager.getUserSubscription(userId);
    
    if (!subscription.endDate || subscription.status === 'free') {
      return null;
    }

    const endDate = new Date(subscription.endDate);
    const today = new Date();
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  } catch (error) {
    console.error('Error calculating renewal days:', error);
    return null;
  }
};

/**
 * Get subscription status message
 */
export const getStatusMessage = (userId) => {
  try {
    const subscription = SubscriptionManager.getUserSubscription(userId);
    
    if (subscription.status === 'free') {
      return 'You are on the Free plan';
    }

    const daysLeft = getDaysUntilRenewal(userId);
    
    if (daysLeft === null) {
      return `Your ${subscription.planId} plan is ${subscription.status}`;
    }

    if (daysLeft === 0) {
      return 'Your subscription has expired';
    }

    if (daysLeft === 1) {
      return 'Your subscription renews tomorrow';
    }

    return `Your subscription renews in ${daysLeft} days`;
  } catch (error) {
    console.error('Error getting status message:', error);
    return 'Subscription status unknown';
  }
};

/**
 * Get plan comparison data
 */
export const getPlanComparison = () => {
  const plans = SubscriptionManager.getAvailablePlans();
  
  return plans.map((plan) => ({
    ...plan,
    price: formatPrice(plan.price),
    color: getPlanColor(plan.id),
    badge: getPlanBadge(plan.id),
  }));
};

/**
 * Export subscription data
 */
export const exportSubscriptionData = (userId) => {
  try {
    const subscription = SubscriptionManager.getUserSubscription(userId);
    const usage = SubscriptionManager.getUsage(userId);
    const limits = SubscriptionManager.checkLimits(userId);

    const data = {
      subscription,
      usage,
      limits,
      exportDate: new Date().toISOString(),
    };

    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('Error exporting subscription data:', error);
    return null;
  }
};

/**
 * Validate subscription data
 */
export const validateSubscriptionData = (userId) => {
  try {
    const subscription = SubscriptionManager.getUserSubscription(userId);
    const isValid = SubscriptionManager.isSubscriptionValid(userId);
    const limits = SubscriptionManager.checkLimits(userId);

    return {
      isValid,
      subscription,
      limits,
      canUseFeatures: isValid,
    };
  } catch (error) {
    console.error('Error validating subscription:', error);
    return {
      isValid: false,
      subscription: null,
      limits: null,
      canUseFeatures: false,
    };
  }
};

/**
 * Get recommended plan upgrade
 */
export const getRecommendedUpgrade = (userId) => {
  try {
    const subscription = SubscriptionManager.getUserSubscription(userId);
    const limits = SubscriptionManager.checkLimits(userId);

    // If free plan and over 50% usage
    if (subscription.planId === 'free') {
      const habitUsage = limits.habitLimit.current / limits.habitLimit.max;
      const memoryUsage = limits.memoryLimit.current / limits.memoryLimit.max;

      if (habitUsage > 0.5 || memoryUsage > 0.5) {
        return 'basic';
      }
    }

    // If basic plan and over 80% usage
    if (subscription.planId === 'basic') {
      const habitUsage = limits.habitLimit.current / limits.habitLimit.max;
      const memoryUsage = limits.memoryLimit.current / limits.memoryLimit.max;

      if (habitUsage > 0.8 || memoryUsage > 0.8) {
        return 'pro';
      }
    }

    // If pro plan, suggest premium
    if (subscription.planId === 'pro') {
      return 'premium';
    }

    return null;
  } catch (error) {
    console.error('Error getting recommended upgrade:', error);
    return null;
  }
};

export default {
  formatPrice,
  formatDate,
  getPlanColor,
  getPlanBadge,
  canAddMoreHabits,
  canAddMoreMemories,
  getHabitQuotaRemaining,
  getMemoryQuotaRemaining,
  getQuotaPercentage,
  isFreePlan,
  isPremiumPlan,
  getDaysUntilRenewal,
  getStatusMessage,
  getPlanComparison,
  exportSubscriptionData,
  validateSubscriptionData,
  getRecommendedUpgrade,
};
