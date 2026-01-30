import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
  LinearProgress,
  Alert,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import StorageIcon from '@mui/icons-material/Storage';
import SpeedIcon from '@mui/icons-material/Speed';
import SecurityIcon from '@mui/icons-material/Security';
import SubscriptionManager from '../services/subscription.service';

const SubscriptionViewer = ({ userName }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [subscription, setSubscription] = useState(null);
  const [usage, setUsage] = useState(null);
  const [limits, setLimits] = useState(null);
  const [plans, setPlans] = useState([]);
  const [openUpgrade, setOpenUpgrade] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscriptionData();
  }, [userName]);

  const loadSubscriptionData = () => {
    try {
      setLoading(true);
      const sub = SubscriptionManager.getUserSubscription(userName);
      const use = SubscriptionManager.getUsage(userName);
      const lim = SubscriptionManager.checkLimits(userName);
      const availablePlans = SubscriptionManager.getAvailablePlans();

      setSubscription(sub);
      setUsage(use);
      setLimits(lim);
      setPlans(availablePlans);
    } catch (error) {
      console.error('Error loading subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradePlan = (planId) => {
    try {
      SubscriptionManager.subscribeToPlan(userName, planId, {
        method: 'card',
        notes: 'In-app upgrade',
      });
      
      loadSubscriptionData();
      setOpenUpgrade(false);
      alert('Subscription updated successfully!');
    } catch (error) {
      console.error('Error upgrading plan:', error);
      alert('Failed to upgrade subscription');
    }
  };

  const handleCancelSubscription = () => {
    if (window.confirm('Are you sure you want to cancel your subscription?')) {
      try {
        SubscriptionManager.cancelSubscription(userName, 'User requested cancellation');
        loadSubscriptionData();
        alert('Subscription cancelled successfully');
      } catch (error) {
        console.error('Error cancelling subscription:', error);
        alert('Failed to cancel subscription');
      }
    }
  };

  if (loading || !subscription) {
    return <LinearProgress />;
  }

  const currentPlan = SubscriptionManager.getPlan(subscription.planId);
  const isFreePlan = subscription.status === 'free';

  return (
    <Box sx={{ width: '100%' }}>
      {/* Current Plan Card */}
      <Paper
        elevation={8}
        sx={{
          mb: { xs: 2, md: 3 },
          p: { xs: 1.5, md: 2.5 },
          background: 'linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%)',
          border: '1px solid rgba(255, 99, 71, 0.2)',
          borderRadius: { xs: 2, md: 3 },
        }}
      >
        <Grid container spacing={{ xs: 1.5, md: 2 }} alignItems="center">
          <Grid item xs={12} sm="auto">
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flexWrap: 'wrap',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: '#ff6347',
                  fontSize: { xs: '1rem', md: '1.25rem' },
                }}
              >
                {currentPlan.name} Plan
              </Typography>
              <Chip
                label={subscription.status.toUpperCase()}
                color="primary"
                size="small"
                sx={{
                  backgroundColor: '#ff6347',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: { xs: '0.65rem', md: '0.8rem' },
                }}
              />
            </Box>
          </Grid>

          <Grid item xs={12} sm="auto" sx={{ ml: { sm: 'auto' } }}>
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                flexWrap: 'wrap',
                justifyContent: { xs: 'flex-start', sm: 'flex-end' },
              }}
            >
              <Button
                variant="outlined"
                size="small"
                onClick={() => setOpenUpgrade(true)}
                sx={{
                  borderColor: '#ff6347',
                  color: '#ff6347',
                  fontSize: { xs: '0.75rem', md: '0.875rem' },
                  minWidth: { xs: '100px', md: 'auto' },
                  '&:hover': {
                    backgroundColor: 'rgba(255, 99, 71, 0.1)',
                  },
                }}
              >
                Change Plan
              </Button>
              {!isFreePlan && (
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  onClick={handleCancelSubscription}
                  sx={{
                    fontSize: { xs: '0.75rem', md: '0.875rem' },
                    minWidth: { xs: '100px', md: 'auto' },
                  }}
                >
                  Cancel
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Plan Price */}
        {!isFreePlan && subscription.endDate && (
          <Box sx={{ mt: 1.5 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
            >
              Renews on {new Date(subscription.endDate).toLocaleDateString()}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Usage Statistics */}
      {limits && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: { xs: 1.5, md: 2 },
            mb: { xs: 2, md: 3 },
          }}
        >
          {/* Habits Usage */}
          <Card
            sx={{
              background: 'linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%)',
              border: '1px solid rgba(255, 99, 71, 0.1)',
              borderRadius: { xs: 2, md: 2.5 },
            }}
          >
            <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <SpeedIcon sx={{ color: '#ff6347', fontSize: { xs: 20, md: 24 } }} />
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, fontSize: { xs: '0.85rem', md: '0.95rem' } }}
                >
                  Habits
                </Typography>
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: '1.25rem', md: '1.5rem' },
                  fontWeight: 700,
                  color: '#ff6347',
                  mb: 1,
                }}
              >
                {limits.habitLimit.current}/{limits.habitLimit.max}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min(
                  (limits.habitLimit.current / limits.habitLimit.max) * 100,
                  100
                )}
                sx={{
                  backgroundColor: 'rgba(255, 99, 71, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#ff6347',
                  },
                }}
              />
            </CardContent>
          </Card>

          {/* Memories Usage */}
          <Card
            sx={{
              background: 'linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%)',
              border: '1px solid rgba(255, 99, 71, 0.1)',
              borderRadius: { xs: 2, md: 2.5 },
            }}
          >
            <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <StorageIcon sx={{ color: '#ff6347', fontSize: { xs: 20, md: 24 } }} />
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, fontSize: { xs: '0.85rem', md: '0.95rem' } }}
                >
                  Memories
                </Typography>
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: '1.25rem', md: '1.5rem' },
                  fontWeight: 700,
                  color: '#ff6347',
                  mb: 1,
                }}
              >
                {limits.memoryLimit.current}/{limits.memoryLimit.max}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min(
                  (limits.memoryLimit.current / limits.memoryLimit.max) * 100,
                  100
                )}
                sx={{
                  backgroundColor: 'rgba(255, 99, 71, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#ff6347',
                  },
                }}
              />
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Plan Features */}
      <Paper
        elevation={4}
        sx={{
          p: { xs: 1.5, md: 2 },
          background: 'linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%)',
          border: '1px solid rgba(255, 99, 71, 0.1)',
          borderRadius: { xs: 2, md: 3 },
          mb: { xs: 2, md: 3 },
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            mb: 1.5,
            fontSize: { xs: '1rem', md: '1.125rem' },
          }}
        >
          Plan Features
        </Typography>
        <List sx={{ p: 0 }}>
          {currentPlan.features.map((feature, index) => (
            <ListItem
              key={index}
              sx={{
                py: { xs: 0.75, md: 1 },
                px: 0,
                borderBottom: '1px solid rgba(255, 99, 71, 0.05)',
                '&:last-child': { borderBottom: 'none' },
              }}
            >
              <ListItemIcon sx={{ minWidth: { xs: 32, md: 40 } }}>
                <CheckCircleIcon
                  sx={{ color: '#ff6347', fontSize: { xs: 20, md: 24 } }}
                />
              </ListItemIcon>
              <ListItemText
                primary={feature}
                primaryTypographyProps={{
                  sx: { fontSize: { xs: '0.85rem', md: '0.95rem' } },
                }}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Upgrade Dialog */}
      <Dialog
        open={openUpgrade}
        onClose={() => setOpenUpgrade(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: { xs: 2, md: 3 },
            backgroundColor: '#1e1e1e',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: { xs: '1rem', md: '1.25rem' } }}>
          Upgrade Your Plan
        </DialogTitle>
        <DialogContent sx={{ py: { xs: 1.5, md: 2 } }}>
          <Grid container spacing={{ xs: 1.5, md: 2 }} sx={{ mt: 1 }}>
            {plans.map((plan) => (
              <Grid item xs={12} sm={6} md={3} key={plan.id}>
                <Card
                  sx={{
                    height: '100%',
                    background:
                      subscription.planId === plan.id
                        ? 'linear-gradient(145deg, #ff6347, #ff8570)'
                        : 'linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%)',
                    border:
                      subscription.planId === plan.id
                        ? '2px solid #ff6347'
                        : '1px solid rgba(255, 99, 71, 0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(255, 99, 71, 0.2)',
                    },
                  }}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  <CardHeader
                    title={plan.name}
                    titleTypographyProps={{
                      sx: {
                        fontWeight: 700,
                        fontSize: { xs: '0.95rem', md: '1.1rem' },
                      },
                    }}
                    sx={{ p: { xs: 1, md: 1.5 }, pb: 0 }}
                  />
                  <CardContent sx={{ p: { xs: 1, md: 1.5 } }}>
                    <Typography
                      variant="h6"
                      sx={{
                        color: '#ff6347',
                        fontWeight: 700,
                        fontSize: { xs: '1.1rem', md: '1.25rem' },
                        mb: 1,
                      }}
                    >
                      ${plan.price}
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{ color: 'text.secondary', fontSize: { xs: '0.7rem', md: '0.8rem' } }}
                      >
                        /{plan.billingCycle}
                      </Typography>
                    </Typography>

                    <List sx={{ p: 0 }}>
                      {plan.features.slice(0, 3).map((feature, idx) => (
                        <ListItem
                          key={idx}
                          sx={{ py: 0.5, px: 0, display: 'flex', gap: 0.5 }}
                        >
                          <CheckCircleIcon
                            sx={{
                              color: '#ff6347',
                              fontSize: { xs: 16, md: 18 },
                              flexShrink: 0,
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{ fontSize: { xs: '0.7rem', md: '0.8rem' } }}
                          >
                            {feature}
                          </Typography>
                        </ListItem>
                      ))}
                    </List>

                    {plan.features.length > 3 && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          display: 'block',
                          mt: 1,
                          fontSize: { xs: '0.65rem', md: '0.75rem' },
                        }}
                      >
                        +{plan.features.length - 3} more features
                      </Typography>
                    )}

                    <Button
                      fullWidth
                      variant={
                        subscription.planId === plan.id ? 'contained' : 'outlined'
                      }
                      onClick={() => handleUpgradePlan(plan.id)}
                      disabled={subscription.planId === plan.id}
                      sx={{
                        mt: 1.5,
                        fontSize: { xs: '0.75rem', md: '0.85rem' },
                        py: { xs: 0.75, md: 1 },
                      }}
                    >
                      {subscription.planId === plan.id ? 'Current Plan' : 'Select'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 1.5, md: 2 } }}>
          <Button onClick={() => setOpenUpgrade(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubscriptionViewer;
