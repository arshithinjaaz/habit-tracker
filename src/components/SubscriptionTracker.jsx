import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  LinearProgress,
  IconButton,
  useMediaQuery,
  useTheme,
  Alert,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SubscriptionTrackerService from '../services/subscriptionTracker.service';
import { SUBSCRIPTION_CATEGORIES, BILLING_CYCLE_DISPLAY } from '../schemas/subscriptionTracker.schema';

const SubscriptionTracker = ({ userName }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [subscriptions, setSubscriptions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'other',
    price: '',
    currency: 'USD',
    billingCycle: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    renewalDate: new Date().toISOString().split('T')[0],
    autoRenew: true,
    notificationDays: 7,
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, [userName]);

  const loadData = () => {
    const subs = SubscriptionTrackerService.getSubscriptions(userName);
    const analyticsData = SubscriptionTrackerService.getAnalytics(userName);
    setSubscriptions(subs);
    setAnalytics(analyticsData);
  };

  const handleOpenDialog = (subscription = null) => {
    if (subscription) {
      setEditingId(subscription.id);
      setFormData({
        name: subscription.name,
        description: subscription.description,
        category: subscription.category,
        price: subscription.price.toString(),
        currency: subscription.currency,
        billingCycle: subscription.billingCycle,
        startDate: new Date(subscription.startDate).toISOString().split('T')[0],
        renewalDate: new Date(subscription.renewalDate).toISOString().split('T')[0],
        autoRenew: subscription.autoRenew,
        notificationDays: subscription.notificationDays,
        notes: subscription.notes,
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        description: '',
        category: 'other',
        price: '',
        currency: 'USD',
        billingCycle: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        renewalDate: new Date().toISOString().split('T')[0],
        autoRenew: true,
        notificationDays: 7,
        notes: '',
      });
    }
    setOpenDialog(true);
  };

  const handleSaveSubscription = async () => {
    try {
      if (!formData.name || !formData.price) {
        alert('Please fill in required fields');
        return;
      }

      const data = {
        ...formData,
        price: parseFloat(formData.price),
        notificationDays: parseInt(formData.notificationDays),
      };

      if (editingId) {
        SubscriptionTrackerService.updateSubscription(editingId, data);
      } else {
        SubscriptionTrackerService.addSubscription(userName, data);
      }

      loadData();
      setOpenDialog(false);
      alert('Subscription saved successfully!');
    } catch (error) {
      console.error('Error saving subscription:', error);
      alert('Error saving subscription: ' + error.message);
    }
  };

  const handleDeleteSubscription = (id) => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      SubscriptionTrackerService.deleteSubscription(id);
      loadData();
    }
  };

  const handlePauseSubscription = (id) => {
    SubscriptionTrackerService.pauseSubscription(id);
    loadData();
  };

  const handleResumeSubscription = (id) => {
    SubscriptionTrackerService.resumeSubscription(id);
    loadData();
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'success',
      paused: 'warning',
      cancelled: 'error',
      expired: 'error',
    };
    return colors[status] || 'default';
  };

  const getCategoryLabel = (categoryId) => {
    const category = SUBSCRIPTION_CATEGORIES.find((c) => c.id === categoryId);
    return category ? `${category.icon} ${category.label}` : categoryId;
  };

  const getExpiringSubscriptions = () => {
    return SubscriptionTrackerService.getExpiringSubscriptions(userName, 7);
  };

  const getExpiredSubscriptions = () => {
    return SubscriptionTrackerService.getExpiredSubscriptions(userName);
  };

  const expiring = getExpiringSubscriptions();
  const expired = getExpiredSubscriptions();

  return (
    <Box sx={{ width: '100%' }}>
      {/* Alerts */}
      {expired.length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          ⚠️ You have {expired.length} expired subscription{expired.length > 1 ? 's' : ''}
        </Alert>
      )}
      {expiring.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          📅 {expiring.length} subscription{expiring.length > 1 ? 's' : ''} expiring soon!
        </Alert>
      )}

      {/* Analytics Cards */}
      {analytics && (
        <Grid container spacing={{ xs: 1, md: 2 }} sx={{ mb: 2 }}>
          <Grid item xs={6} sm={6} md={3}>
            <Card
              sx={{
                background: 'linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%)',
                border: '1px solid rgba(255, 99, 71, 0.1)',
              }}
            >
              <CardContent sx={{ p: { xs: 1, md: 1.5 } }}>
                <Typography color="text.secondary" variant="body2" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                  Active
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ color: '#ff6347', fontWeight: 700, fontSize: { xs: '1.25rem', md: '1.5rem' } }}
                >
                  {analytics.activeCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={6} md={3}>
            <Card
              sx={{
                background: 'linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%)',
                border: '1px solid rgba(255, 99, 71, 0.1)',
              }}
            >
              <CardContent sx={{ p: { xs: 1, md: 1.5 } }}>
                <Typography color="text.secondary" variant="body2" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                  Monthly
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ color: '#ff6347', fontWeight: 700, fontSize: { xs: '1.25rem', md: '1.5rem' } }}
                >
                  ${analytics.monthlySpend}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={6} md={3}>
            <Card
              sx={{
                background: 'linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%)',
                border: '1px solid rgba(255, 99, 71, 0.1)',
              }}
            >
              <CardContent sx={{ p: { xs: 1, md: 1.5 } }}>
                <Typography color="text.secondary" variant="body2" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                  Yearly
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ color: '#ff6347', fontWeight: 700, fontSize: { xs: '1.25rem', md: '1.5rem' } }}
                >
                  ${analytics.yearlySpend}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={6} md={3}>
            <Card
              sx={{
                background: 'linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%)',
                border: '1px solid rgba(255, 99, 71, 0.1)',
              }}
            >
              <CardContent sx={{ p: { xs: 1, md: 1.5 } }}>
                <Typography color="text.secondary" variant="body2" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                  Expiring
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: expiring.length > 0 ? '#FFA500' : '#4CAF50',
                    fontWeight: 700,
                    fontSize: { xs: '1.25rem', md: '1.5rem' },
                  }}
                >
                  {analytics.expiringCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Add Button */}
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => handleOpenDialog()}
        sx={{
          mb: 2,
          background: 'linear-gradient(135deg, #ff6347 0%, #ff8570 100%)',
          fontWeight: 600,
          textTransform: 'none',
          fontSize: { xs: '0.875rem', md: '1rem' },
        }}
      >
        Add Subscription
      </Button>

      {/* Subscriptions Table */}
      {subscriptions.length === 0 ? (
        <Paper
          sx={{
            p: 3,
            textAlign: 'center',
            background: 'linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%)',
            border: '1px solid rgba(255, 99, 71, 0.1)',
            borderRadius: 2,
          }}
        >
          <Typography color="text.secondary">No subscriptions yet. Click "Add Subscription" to get started!</Typography>
        </Paper>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            background: 'linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%)',
            border: '1px solid rgba(255, 99, 71, 0.1)',
            borderRadius: 2,
            overflowX: 'auto',
          }}
        >
          <Table size={isMobile ? 'small' : 'medium'}>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'rgba(255, 99, 71, 0.05)' }}>
                <TableCell sx={{ fontWeight: 700, color: '#ff6347', fontSize: { xs: '0.75rem', md: '0.9rem' } }}>
                  Name
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#ff6347', fontSize: { xs: '0.75rem', md: '0.9rem' } }}>
                  Category
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#ff6347', fontSize: { xs: '0.75rem', md: '0.9rem' } }} align="right">
                  Price
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#ff6347', fontSize: { xs: '0.75rem', md: '0.9rem' } }}>
                  Renews
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#ff6347', fontSize: { xs: '0.75rem', md: '0.9rem' } }}>
                  Status
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#ff6347', fontSize: { xs: '0.75rem', md: '0.9rem' } }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {subscriptions.map((sub) => {
                const daysLeft = SubscriptionTrackerService.getDaysUntilRenewal(sub.renewalDate);
                return (
                  <TableRow
                    key={sub.id}
                    sx={{
                      '&:hover': { backgroundColor: 'rgba(255, 99, 71, 0.05)' },
                      borderBottom: '1px solid rgba(255, 99, 71, 0.1)',
                    }}
                  >
                    <TableCell sx={{ fontSize: { xs: '0.8rem', md: '0.9rem' } }}>{sub.name}</TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.8rem', md: '0.9rem' } }}>
                      {getCategoryLabel(sub.category)}
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.8rem', md: '0.9rem' } }} align="right">
                      ${sub.price.toFixed(2)} / {BILLING_CYCLE_DISPLAY[sub.billingCycle]}
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.75rem', md: '0.9rem' } }}>
                      <Box>
                        <div>{SubscriptionTrackerService.formatDate(sub.renewalDate)}</div>
                        <Typography
                          variant="caption"
                          sx={{
                            color:
                              daysLeft < 0
                                ? '#F44336'
                                : daysLeft <= 7
                                  ? '#FFA500'
                                  : '#4CAF50',
                            fontWeight: 600,
                            fontSize: { xs: '0.65rem', md: '0.75rem' },
                          }}
                        >
                          {daysLeft < 0 ? '⚠️ Expired' : daysLeft === 0 ? '📅 Today' : `📅 ${daysLeft} days`}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={sub.status.toUpperCase()}
                        size="small"
                        color={getStatusColor(sub.status)}
                        sx={{ fontSize: { xs: '0.65rem', md: '0.75rem' } }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(sub)}
                          title="Edit"
                        >
                          <EditIcon sx={{ fontSize: { xs: 16, md: 20 } }} />
                        </IconButton>
                        {sub.status === 'active' ? (
                          <IconButton
                            size="small"
                            onClick={() => handlePauseSubscription(sub.id)}
                            title="Pause"
                          >
                            <PauseIcon sx={{ fontSize: { xs: 16, md: 20 } }} />
                          </IconButton>
                        ) : sub.status === 'paused' ? (
                          <IconButton
                            size="small"
                            onClick={() => handleResumeSubscription(sub.id)}
                            title="Resume"
                          >
                            <PlayArrowIcon sx={{ fontSize: { xs: 16, md: 20 } }} />
                          </IconButton>
                        ) : null}
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteSubscription(sub.id)}
                          title="Delete"
                        >
                          <DeleteIcon sx={{ fontSize: { xs: 16, md: 20 }, color: '#F44336' }} />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2, backgroundColor: '#1e1e1e' },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingId ? 'Edit Subscription' : 'Add New Subscription'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Subscription Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Netflix"
              required
            />

            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g., Premium Plan"
              multiline
              rows={2}
            />

            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                label="Category"
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {SUBSCRIPTION_CATEGORIES.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.icon} {cat.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                type="number"
                label="Price"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
                required
              />
              <FormControl fullWidth>
                <InputLabel>Billing Cycle</InputLabel>
                <Select
                  value={formData.billingCycle}
                  label="Billing Cycle"
                  onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                >
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                type="date"
                label="Start Date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                type="date"
                label="Renewal Date"
                value={formData.renewalDate}
                onChange={(e) => setFormData({ ...formData, renewalDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Box>

            <TextField
              type="number"
              label="Notify Before (days)"
              value={formData.notificationDays}
              onChange={(e) => setFormData({ ...formData, notificationDays: e.target.value })}
              helperText="Days before renewal to get notification"
            />

            <TextField
              fullWidth
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes"
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveSubscription} variant="contained">
            {editingId ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubscriptionTracker;
