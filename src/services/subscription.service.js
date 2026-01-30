/**
 * Subscription Manager Service
 * Handles user subscriptions, plans, and usage tracking
 */

import {
  AVAILABLE_PLANS,
  FREE_PLAN,
  SubscriptionPlanSchema,
  UserSubscriptionSchema,
  SubscriptionUsageSchema,
} from '../schemas/subscription.schema.js';

const STORAGE_KEY = 'habitTracker_subscriptions';
const USAGE_KEY = 'habitTracker_subscriptions_usage';

class SubscriptionManager {
  /**
   * Get user's current subscription
   */
  static getUserSubscription(userId) {
    try {
      const subscriptions = this.getAllSubscriptions();
      const userSub = subscriptions.find(
        (sub) => sub.userId === userId && sub.status === 'active'
      );
      
      if (!userSub) {
        return { ...FREE_PLAN, userId, status: 'free' };
      }

      return userSub;
    } catch (error) {
      console.error('Error getting user subscription:', error);
      return { ...FREE_PLAN, userId, status: 'free' };
    }
  }

  /**
   * Get all subscriptions
   */
  static getAllSubscriptions() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting all subscriptions:', error);
      return [];
    }
  }

  /**
   * Subscribe user to a plan
   */
  static subscribeToPlan(userId, planId, paymentDetails = {}) {
    try {
      const plan = AVAILABLE_PLANS.find((p) => p.id === planId);
      if (!plan) throw new Error(`Plan ${planId} not found`);

      const subscriptions = this.getAllSubscriptions();
      
      // Cancel existing active subscription
      const existingIndex = subscriptions.findIndex(
        (sub) => sub.userId === userId && sub.status === 'active'
      );
      if (existingIndex !== -1) {
        subscriptions[existingIndex].status = 'cancelled';
        subscriptions[existingIndex].updatedAt = new Date();
      }

      // Create new subscription
      const subscription = {
        id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        planId,
        status: 'active',
        startDate: new Date(),
        endDate: this.calculateEndDate(plan.billingCycle),
        autoRenew: true,
        paymentMethod: paymentDetails.method || 'card',
        transactionId: paymentDetails.transactionId || `txn_${Date.now()}`,
        notes: paymentDetails.notes || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      subscriptions.push(subscription);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions));

      // Log subscription event
      console.log(`User ${userId} subscribed to ${planId}`);

      return subscription;
    } catch (error) {
      console.error('Error subscribing to plan:', error);
      throw error;
    }
  }

  /**
   * Cancel user subscription
   */
  static cancelSubscription(userId, reason = '') {
    try {
      const subscriptions = this.getAllSubscriptions();
      const subscription = subscriptions.find(
        (sub) => sub.userId === userId && sub.status === 'active'
      );

      if (!subscription) {
        throw new Error(`No active subscription found for user ${userId}`);
      }

      subscription.status = 'cancelled';
      subscription.notes = reason || 'User requested cancellation';
      subscription.updatedAt = new Date();

      localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions));
      return subscription;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  }

  /**
   * Get subscription plan details
   */
  static getPlan(planId) {
    return AVAILABLE_PLANS.find((p) => p.id === planId) || FREE_PLAN;
  }

  /**
   * Get all available plans
   */
  static getAvailablePlans() {
    return AVAILABLE_PLANS;
  }

  /**
   * Update user usage
   */
  static updateUsage(userId, habitCount, memoryCount, storageUsed = 0) {
    try {
      let usageData = this.getUsage(userId);

      usageData = {
        ...usageData,
        userId,
        habitCount,
        memoryCount,
        storageUsed,
        lastUpdated: new Date(),
      };

      const allUsage = this.getAllUsage();
      const existingIndex = allUsage.findIndex((u) => u.userId === userId);

      if (existingIndex !== -1) {
        allUsage[existingIndex] = usageData;
      } else {
        allUsage.push(usageData);
      }

      localStorage.setItem(USAGE_KEY, JSON.stringify(allUsage));
      return usageData;
    } catch (error) {
      console.error('Error updating usage:', error);
      throw error;
    }
  }

  /**
   * Get user usage
   */
  static getUsage(userId) {
    try {
      const allUsage = this.getAllUsage();
      return (
        allUsage.find((u) => u.userId === userId) || {
          id: `usage_${userId}`,
          userId,
          habitCount: 0,
          memoryCount: 0,
          storageUsed: 0,
          lastUpdated: new Date(),
        }
      );
    } catch (error) {
      console.error('Error getting usage:', error);
      return {
        id: `usage_${userId}`,
        userId,
        habitCount: 0,
        memoryCount: 0,
        storageUsed: 0,
        lastUpdated: new Date(),
      };
    }
  }

  /**
   * Get all usage data
   */
  static getAllUsage() {
    try {
      const data = localStorage.getItem(USAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting all usage:', error);
      return [];
    }
  }

  /**
   * Check if user has reached limits
   */
  static checkLimits(userId) {
    try {
      const subscription = this.getUserSubscription(userId);
      const plan = this.getPlan(subscription.planId);
      const usage = this.getUsage(userId);

      return {
        habitLimit: {
          current: usage.habitCount,
          max: plan.maxHabits,
          reached: usage.habitCount >= plan.maxHabits,
        },
        memoryLimit: {
          current: usage.memoryCount,
          max: plan.maxMemories,
          reached: usage.memoryCount >= plan.maxMemories,
        },
      };
    } catch (error) {
      console.error('Error checking limits:', error);
      return {
        habitLimit: { current: 0, max: 5, reached: false },
        memoryLimit: { current: 0, max: 100, reached: false },
      };
    }
  }

  /**
   * Calculate plan end date
   */
  static calculateEndDate(billingCycle) {
    const endDate = new Date();
    if (billingCycle === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (billingCycle === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }
    return endDate;
  }

  /**
   * Check if subscription is valid
   */
  static isSubscriptionValid(userId) {
    try {
      const subscription = this.getUserSubscription(userId);
      
      if (subscription.status === 'free') {
        return true;
      }

      if (!subscription.endDate) return false;
      
      const now = new Date();
      const isValid = subscription.status === 'active' && new Date(subscription.endDate) > now;
      
      if (!isValid && subscription.status === 'active') {
        subscription.status = 'expired';
      }

      return isValid;
    } catch (error) {
      console.error('Error checking subscription validity:', error);
      return false;
    }
  }

  /**
   * Get subscription analytics
   */
  static getAnalytics() {
    try {
      const subscriptions = this.getAllSubscriptions();
      const activeCount = subscriptions.filter((s) => s.status === 'active').length;
      const totalRevenue = subscriptions
        .filter((s) => s.status === 'active')
        .reduce((sum, s) => {
          const plan = this.getPlan(s.planId);
          return sum + plan.price;
        }, 0);

      const planBreakdown = {};
      subscriptions
        .filter((s) => s.status === 'active')
        .forEach((s) => {
          planBreakdown[s.planId] = (planBreakdown[s.planId] || 0) + 1;
        });

      return {
        activeSubscriptions: activeCount,
        totalRevenue: totalRevenue.toFixed(2),
        planBreakdown,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error('Error getting analytics:', error);
      return {
        activeSubscriptions: 0,
        totalRevenue: '0.00',
        planBreakdown: {},
        lastUpdated: new Date(),
      };
    }
  }
}

export default SubscriptionManager;
