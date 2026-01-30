/**
 * Subscription Tracker Service
 * Manages personal subscriptions (Netflix, Spotify, etc.)
 */

import { SubscriptionSchema } from '../schemas/subscriptionTracker.schema.js';

const STORAGE_KEY = 'habitTracker_subscriptionTracker';

class SubscriptionTrackerService {
  /**
   * Get all subscriptions for a user
   */
  static getSubscriptions(userId) {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const allSubs = data ? JSON.parse(data) : [];
      return allSubs.filter((sub) => sub.userId === userId);
    } catch (error) {
      console.error('Error getting subscriptions:', error);
      return [];
    }
  }

  /**
   * Add a new subscription
   */
  static addSubscription(userId, subscriptionData) {
    try {
      // Validate data
      const subscription = {
        ...subscriptionData,
        id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        startDate: new Date(subscriptionData.startDate),
        renewalDate: new Date(subscriptionData.renewalDate),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Validate with schema
      const validated = SubscriptionSchema.parse(subscription);

      // Get all and add new
      const allSubs = this._getAllSubscriptions();
      allSubs.push(validated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allSubs));

      return validated;
    } catch (error) {
      console.error('Error adding subscription:', error);
      throw error;
    }
  }

  /**
   * Update a subscription
   */
  static updateSubscription(id, subscriptionData) {
    try {
      const allSubs = this._getAllSubscriptions();
      const index = allSubs.findIndex((sub) => sub.id === id);

      if (index === -1) {
        throw new Error(`Subscription ${id} not found`);
      }

      const updated = {
        ...allSubs[index],
        ...subscriptionData,
        startDate: new Date(subscriptionData.startDate),
        renewalDate: new Date(subscriptionData.renewalDate),
        updatedAt: new Date(),
      };

      // Validate with schema
      const validated = SubscriptionSchema.parse(updated);
      allSubs[index] = validated;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allSubs));

      return validated;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }

  /**
   * Delete a subscription
   */
  static deleteSubscription(id) {
    try {
      const allSubs = this._getAllSubscriptions();
      const filtered = allSubs.filter((sub) => sub.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting subscription:', error);
      throw error;
    }
  }

  /**
   * Get a single subscription by ID
   */
  static getSubscription(id) {
    try {
      const allSubs = this._getAllSubscriptions();
      return allSubs.find((sub) => sub.id === id);
    } catch (error) {
      console.error('Error getting subscription:', error);
      return null;
    }
  }

  /**
   * Get subscriptions expiring within X days
   */
  static getExpiringSubscriptions(userId, daysThreshold = 7) {
    try {
      const subscriptions = this.getSubscriptions(userId);
      const now = new Date();
      const futureDate = new Date(now.getTime() + daysThreshold * 24 * 60 * 60 * 1000);

      return subscriptions.filter((sub) => {
        if (sub.status !== 'active') return false;
        const renewalDate = new Date(sub.renewalDate);
        return renewalDate >= now && renewalDate <= futureDate;
      });
    } catch (error) {
      console.error('Error getting expiring subscriptions:', error);
      return [];
    }
  }

  /**
   * Get already expired subscriptions
   */
  static getExpiredSubscriptions(userId) {
    try {
      const subscriptions = this.getSubscriptions(userId);
      const now = new Date();

      return subscriptions.filter((sub) => {
        if (sub.status === 'cancelled' || sub.status === 'paused') return false;
        const renewalDate = new Date(sub.renewalDate);
        return renewalDate < now && sub.status === 'active';
      });
    } catch (error) {
      console.error('Error getting expired subscriptions:', error);
      return [];
    }
  }

  /**
   * Get total monthly spend
   */
  static getTotalMonthlySpend(userId) {
    try {
      const subscriptions = this.getSubscriptions(userId);
      return subscriptions
        .filter((sub) => sub.status === 'active')
        .reduce((total, sub) => {
          if (sub.billingCycle === 'monthly') {
            return total + sub.price;
          } else if (sub.billingCycle === 'yearly') {
            return total + sub.price / 12;
          } else if (sub.billingCycle === 'weekly') {
            return total + (sub.price * 52) / 12;
          } else if (sub.billingCycle === 'daily') {
            return total + sub.price * 30;
          }
          return total;
        }, 0);
    } catch (error) {
      console.error('Error calculating monthly spend:', error);
      return 0;
    }
  }

  /**
   * Get total yearly spend
   */
  static getTotalYearlySpend(userId) {
    try {
      const subscriptions = this.getSubscriptions(userId);
      return subscriptions
        .filter((sub) => sub.status === 'active')
        .reduce((total, sub) => {
          if (sub.billingCycle === 'monthly') {
            return total + sub.price * 12;
          } else if (sub.billingCycle === 'yearly') {
            return total + sub.price;
          } else if (sub.billingCycle === 'weekly') {
            return total + sub.price * 52;
          } else if (sub.billingCycle === 'daily') {
            return total + sub.price * 365;
          }
          return total;
        }, 0);
    } catch (error) {
      console.error('Error calculating yearly spend:', error);
      return 0;
    }
  }

  /**
   * Get breakdown by category
   */
  static getBreakdownByCategory(userId) {
    try {
      const subscriptions = this.getSubscriptions(userId);
      const breakdown = {};

      subscriptions.forEach((sub) => {
        if (sub.status !== 'active') return;
        if (!breakdown[sub.category]) {
          breakdown[sub.category] = {
            count: 0,
            monthlyTotal: 0,
            yearlyTotal: 0,
            subscriptions: [],
          };
        }

        breakdown[sub.category].count += 1;
        breakdown[sub.category].subscriptions.push(sub.name);

        if (sub.billingCycle === 'monthly') {
          breakdown[sub.category].monthlyTotal += sub.price;
          breakdown[sub.category].yearlyTotal += sub.price * 12;
        } else if (sub.billingCycle === 'yearly') {
          breakdown[sub.category].yearlyTotal += sub.price;
          breakdown[sub.category].monthlyTotal += sub.price / 12;
        } else if (sub.billingCycle === 'weekly') {
          breakdown[sub.category].monthlyTotal += (sub.price * 52) / 12;
          breakdown[sub.category].yearlyTotal += sub.price * 52;
        } else if (sub.billingCycle === 'daily') {
          breakdown[sub.category].monthlyTotal += sub.price * 30;
          breakdown[sub.category].yearlyTotal += sub.price * 365;
        }
      });

      return breakdown;
    } catch (error) {
      console.error('Error getting category breakdown:', error);
      return {};
    }
  }

  /**
   * Get analytics
   */
  static getAnalytics(userId) {
    try {
      const subscriptions = this.getSubscriptions(userId);
      const activeCount = subscriptions.filter((s) => s.status === 'active').length;
      const expiredCount = this.getExpiredSubscriptions(userId).length;
      const expiringCount = this.getExpiringSubscriptions(userId).length;
      const monthlySpend = this.getTotalMonthlySpend(userId);
      const yearlySpend = this.getTotalYearlySpend(userId);

      return {
        totalCount: subscriptions.length,
        activeCount,
        expiredCount,
        expiringCount,
        monthlySpend: monthlySpend.toFixed(2),
        yearlySpend: yearlySpend.toFixed(2),
      };
    } catch (error) {
      console.error('Error getting analytics:', error);
      return {
        totalCount: 0,
        activeCount: 0,
        expiredCount: 0,
        expiringCount: 0,
        monthlySpend: '0.00',
        yearlySpend: '0.00',
      };
    }
  }

  /**
   * Pause a subscription
   */
  static pauseSubscription(id) {
    try {
      const sub = this.getSubscription(id);
      if (!sub) throw new Error('Subscription not found');
      return this.updateSubscription(id, { status: 'paused' });
    } catch (error) {
      console.error('Error pausing subscription:', error);
      throw error;
    }
  }

  /**
   * Resume a subscription
   */
  static resumeSubscription(id) {
    try {
      const sub = this.getSubscription(id);
      if (!sub) throw new Error('Subscription not found');
      return this.updateSubscription(id, { status: 'active' });
    } catch (error) {
      console.error('Error resuming subscription:', error);
      throw error;
    }
  }

  /**
   * Cancel a subscription
   */
  static cancelSubscription(id) {
    try {
      const sub = this.getSubscription(id);
      if (!sub) throw new Error('Subscription not found');
      return this.updateSubscription(id, { status: 'cancelled' });
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  }

  /**
   * Get all subscriptions (internal)
   */
  static _getAllSubscriptions() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting all subscriptions:', error);
      return [];
    }
  }

  /**
   * Format date for display
   */
  static formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  /**
   * Get days until renewal
   */
  static getDaysUntilRenewal(renewalDate) {
    const today = new Date();
    const renewal = new Date(renewalDate);
    const diffTime = renewal - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
}

export default SubscriptionTrackerService;
