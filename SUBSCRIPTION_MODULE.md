# Subscription Manager Module Documentation

## Overview

The Subscription Manager is a comprehensive module designed to manage user subscriptions, plans, and usage tracking for the Habit Tracker application. It enables monetization through tiered subscription plans with different features and limits.

## Features

### Core Features
- **Multiple Subscription Plans**: Free, Basic, Pro, and Premium tiers
- **Usage Tracking**: Monitor user habits and memories usage
- **Plan Limits**: Configurable limits per plan for habits and memories
- **Subscription Management**: Easy upgrade, downgrade, and cancellation
- **Analytics**: Track active subscriptions and revenue
- **Mobile-Optimized**: Full responsive design for mobile devices

### Available Plans

#### Free Plan
- **Price**: $0/month
- **Max Habits**: 5
- **Max Memories**: 100
- **Features**: Track habits, store memories, daily quotes
- **Analytics**: Not included
- **Support**: Community support

#### Basic Plan
- **Price**: $2.99/month
- **Max Habits**: 15
- **Max Memories**: 500
- **Features**: Everything in Free + Advanced analytics, custom themes
- **Support**: Standard support

#### Pro Plan
- **Price**: $9.99/month
- **Max Habits**: Unlimited
- **Max Memories**: Unlimited
- **Features**: Everything in Basic + Priority support, data export
- **Support**: Priority email support

#### Premium Plan
- **Price**: $19.99/month
- **Max Habits**: Unlimited
- **Max Memories**: Unlimited
- **Features**: Everything in Pro + AI recommendations, team collaboration, API access
- **Support**: Priority 24/7 support

## Architecture

### Service Layer: `subscription.service.js`

The `SubscriptionManager` class provides static methods for all subscription operations.

#### Key Methods

```javascript
// Get user's current subscription
SubscriptionManager.getUserSubscription(userId)

// Subscribe user to a plan
SubscriptionManager.subscribeToPlan(userId, planId, paymentDetails)

// Cancel subscription
SubscriptionManager.cancelSubscription(userId, reason)

// Update user usage
SubscriptionManager.updateUsage(userId, habitCount, memoryCount, storageUsed)

// Check plan limits
SubscriptionManager.checkLimits(userId)

// Get subscription analytics
SubscriptionManager.getAnalytics()

// Check subscription validity
SubscriptionManager.isSubscriptionValid(userId)

// Get available plans
SubscriptionManager.getAvailablePlans()
```

### Data Storage

All subscription data is stored in browser's localStorage with the following keys:
- `habitTracker_subscriptions`: User subscriptions array
- `habitTracker_subscriptions_usage`: User usage data array

### Schemas

#### SubscriptionPlanSchema
```javascript
{
  id: string,
  name: string,
  price: number,
  currency: string,
  billingCycle: 'monthly' | 'yearly',
  features: string[],
  maxHabits: number,
  maxMemories: number,
  analyticsAccess: boolean,
  customization: boolean,
  priority_support: boolean,
  isActive: boolean,
  createdAt: Date,
}
```

#### UserSubscriptionSchema
```javascript
{
  id: string,
  userId: string,
  planId: string,
  status: 'active' | 'cancelled' | 'expired' | 'pending',
  startDate: Date,
  endDate: Date,
  autoRenew: boolean,
  paymentMethod: string,
  transactionId: string,
  notes: string,
  createdAt: Date,
  updatedAt: Date,
}
```

## UI Components

### SubscriptionViewer Component

User-facing component that displays current subscription details and allows plan upgrades.

**Location**: `src/components/SubscriptionViewer.jsx`

**Props**:
- `userName` (string): Current user's name

**Features**:
- Display current plan details
- Show usage statistics with progress bars
- List plan features
- Plan upgrade dialog with all available plans
- Cancel subscription option
- Mobile-responsive design

**Usage**:
```jsx
import SubscriptionViewer from './components/SubscriptionViewer';

<SubscriptionViewer userName={currentUser} />
```

### AdminSubscriptions Component

Admin management interface for viewing and managing all user subscriptions.

**Location**: `src/components/admin/AdminSubscriptions.jsx`

**Features**:
- View all subscriptions
- Subscription analytics (active count, revenue, plan breakdown)
- Edit subscription details
- Delete subscriptions
- Filter and search capabilities
- Mobile-responsive table

**Usage**:
```jsx
import AdminSubscriptions from './components/admin/AdminSubscriptions';

<AdminSubscriptions />
```

## Integration with Main App

### In App.jsx

1. **Import the components**:
```javascript
import SubscriptionViewer from './components/SubscriptionViewer';
import AdminSubscriptions from './components/admin/AdminSubscriptions';
```

2. **Add to main app layout**:
```javascript
<Box sx={{ /* styles */ }}>
  <SubscriptionViewer userName={currentUser} />
</Box>
```

3. **Add admin route**:
```javascript
<Route path="subscriptions" element={<AdminSubscriptions />} />
```

## Usage Examples

### Get User's Current Subscription
```javascript
const subscription = SubscriptionManager.getUserSubscription('user123');
console.log(subscription.planId); // 'free', 'basic', 'pro', or 'premium'
```

### Subscribe User to Plan
```javascript
SubscriptionManager.subscribeToPlan('user123', 'pro', {
  method: 'card',
  transactionId: 'txn_123456'
});
```

### Check Usage Limits
```javascript
const limits = SubscriptionManager.checkLimits('user123');
console.log(limits.habitLimit); // { current: 3, max: 5, reached: false }
```

### Update User Usage
```javascript
SubscriptionManager.updateUsage('user123', 5, 25, 10); // 5 habits, 25 memories, 10MB
```

### Get Analytics
```javascript
const analytics = SubscriptionManager.getAnalytics();
console.log(analytics.activeSubscriptions);
console.log(analytics.totalRevenue);
```

## Mobile Optimizations

### CSS Enhancements
- **Larger tap targets**: 48x48px minimum for buttons (WCAG AA compliant)
- **Safe area support**: Handles notched devices with CSS `env(safe-area-inset-*)`
- **Touch-friendly interactions**: Optimized for touch devices
- **Responsive typography**: Font sizes scale with viewport
- **Mobile dialogs**: Full-width modals on mobile devices

### Component Responsive Design
- Single column layout on mobile (xs breakpoint)
- Two column layout on tablets and larger (md and up)
- Touch-optimized button sizes
- Reduced padding on mobile for better space usage
- Icons only on mobile where space is limited

## Future Enhancements

1. **Payment Integration**:
   - Stripe/PayPal integration for real payments
   - Subscription webhook handling
   - Invoice generation and email

2. **Advanced Features**:
   - Promo code/discount system
   - Trial periods for paid plans
   - Plan downgrade protection
   - Billing history and management

3. **Analytics**:
   - MRR (Monthly Recurring Revenue) tracking
   - Churn analysis
   - Plan conversion funnel
   - User retention metrics

4. **Localization**:
   - Multi-currency support
   - Localized plan pricing
   - Multi-language support

## Development Notes

### LocalStorage vs Backend
Currently, the subscription system uses localStorage for simplicity. For production:
1. Move all data to a backend database
2. Implement proper authentication and authorization
3. Add server-side validation
4. Implement proper payment processing

### Testing
When testing subscriptions:
1. Use browser DevTools to inspect localStorage
2. Check console for error messages
3. Test plan upgrades/downgrades
4. Verify usage limits are enforced
5. Test on actual mobile devices

### Debugging
```javascript
// View all subscriptions in console
const subs = SubscriptionManager.getAllSubscriptions();
console.table(subs);

// View specific user subscription
const sub = SubscriptionManager.getUserSubscription('userName');
console.log(sub);

// View usage data
const usage = SubscriptionManager.getUsage('userName');
console.log(usage);
```

## Mobile Performance Tips

1. **Lazy load dialogs**: Plans dialog only renders when needed
2. **Optimize re-renders**: Use proper React hooks and memoization
3. **Reduce bundle size**: Subscription module is lightweight
4. **Cache data**: Usage stats cached in component state
5. **Debounce updates**: Batch updates when possible

## Accessibility Considerations

- ✅ WCAG 2.1 AA compliant tap targets (48x48px)
- ✅ Proper heading hierarchy
- ✅ Color contrast ratios meet standards
- ✅ Focus indicators visible
- ✅ Keyboard navigation support
- ✅ Screen reader friendly labels
- ✅ Touch-friendly interactive elements

## Support & Contact

For issues, feature requests, or questions about the subscription module, please contact the development team or create an issue in the repository.
