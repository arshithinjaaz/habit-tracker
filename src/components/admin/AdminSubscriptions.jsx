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
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
  LinearProgress,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import SubscriptionManager from '../../services/subscription.service';

const AdminSubscriptions = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [subscriptions, setSubscriptions] = useState([]);
  const [usage, setUsage] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSub, setSelectedSub] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      setLoading(true);
      const subs = SubscriptionManager.getAllSubscriptions();
      const analyticsData = SubscriptionManager.getAnalytics();
      setSubscriptions(subs);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubscription = (subId) => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      const updated = subscriptions.filter((s) => s.id !== subId);
      setSubscriptions(updated);
      localStorage.setItem('habitTracker_subscriptions', JSON.stringify(updated));
      alert('Subscription deleted');
    }
  };

  const handleEditSubscription = (sub) => {
    setSelectedSub(sub);
    setOpenDialog(true);
  };

  const handleSaveSubscription = () => {
    if (selectedSub) {
      const index = subscriptions.findIndex((s) => s.id === selectedSub.id);
      const updated = [...subscriptions];
      updated[index] = selectedSub;
      setSubscriptions(updated);
      localStorage.setItem('habitTracker_subscriptions', JSON.stringify(updated));
      setOpenDialog(false);
      alert('Subscription updated');
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Subscription Management
        </Typography>
      </Box>

      {/* Analytics Cards */}
      {analytics && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                background: 'linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%)',
                border: '1px solid rgba(255, 99, 71, 0.1)',
              }}
            >
              <CardContent>
                <Typography color="text.secondary" variant="body2">
                  Active Subscriptions
                </Typography>
                <Typography variant="h5" sx={{ color: '#ff6347', fontWeight: 700 }}>
                  {analytics.activeSubscriptions}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                background: 'linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%)',
                border: '1px solid rgba(255, 99, 71, 0.1)',
              }}
            >
              <CardContent>
                <Typography color="text.secondary" variant="body2">
                  Monthly Revenue
                </Typography>
                <Typography variant="h5" sx={{ color: '#ff6347', fontWeight: 700 }}>
                  ${analytics.totalRevenue}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                background: 'linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%)',
                border: '1px solid rgba(255, 99, 71, 0.1)',
              }}
            >
              <CardContent>
                <Typography color="text.secondary" variant="body2">
                  Total Users
                </Typography>
                <Typography variant="h5" sx={{ color: '#ff6347', fontWeight: 700 }}>
                  {subscriptions.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Subscriptions Table */}
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
              <TableCell sx={{ fontWeight: 700, color: '#ff6347' }}>User ID</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#ff6347' }}>Plan</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#ff6347' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#ff6347' }}>Start Date</TableCell>
              {!isMobile && <TableCell sx={{ fontWeight: 700, color: '#ff6347' }}>End Date</TableCell>}
              <TableCell sx={{ fontWeight: 700, color: '#ff6347' }} align="right">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subscriptions.map((sub) => (
              <TableRow
                key={sub.id}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255, 99, 71, 0.05)',
                  },
                  borderBottom: '1px solid rgba(255, 99, 71, 0.1)',
                }}
              >
                <TableCell sx={{ fontSize: { xs: '0.8rem', md: '0.9rem' } }}>
                  {sub.userId.substring(0, 8)}...
                </TableCell>
                <TableCell sx={{ fontSize: { xs: '0.8rem', md: '0.9rem' } }}>
                  {sub.planId.toUpperCase()}
                </TableCell>
                <TableCell>
                  <Chip
                    label={sub.status}
                    size="small"
                    color={sub.status === 'active' ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell sx={{ fontSize: { xs: '0.75rem', md: '0.9rem' } }}>
                  {new Date(sub.startDate).toLocaleDateString()}
                </TableCell>
                {!isMobile && (
                  <TableCell sx={{ fontSize: { xs: '0.75rem', md: '0.9rem' } }}>
                    {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : '-'}
                  </TableCell>
                )}
                <TableCell align="right">
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleEditSubscription(sub)}
                    sx={{ mr: 1, fontSize: { xs: '0.7rem', md: '0.8rem' } }}
                  >
                    {isMobile ? '' : 'Edit'}
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteSubscription(sub.id)}
                    sx={{ fontSize: { xs: '0.7rem', md: '0.8rem' } }}
                  >
                    {isMobile ? '' : 'Delete'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Subscription</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedSub && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="User ID"
                value={selectedSub.userId}
                disabled
              />
              <TextField
                fullWidth
                label="Plan ID"
                value={selectedSub.planId}
                onChange={(e) =>
                  setSelectedSub({ ...selectedSub, planId: e.target.value })
                }
              />
              <TextField
                fullWidth
                select
                label="Status"
                value={selectedSub.status}
                onChange={(e) =>
                  setSelectedSub({ ...selectedSub, status: e.target.value })
                }
                SelectProps={{
                  native: true,
                }}
              >
                <option value="active">Active</option>
                <option value="cancelled">Cancelled</option>
                <option value="expired">Expired</option>
                <option value="pending">Pending</option>
              </TextField>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={selectedSub.notes || ''}
                onChange={(e) =>
                  setSelectedSub({ ...selectedSub, notes: e.target.value })
                }
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveSubscription} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminSubscriptions;
