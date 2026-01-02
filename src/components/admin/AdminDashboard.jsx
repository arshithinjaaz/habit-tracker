import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  Photo as PhotoIcon,
  CheckCircle as CheckCircleIcon,
  Email as EmailIcon,
  AccountCircle as AccountCircleIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarTodayIcon,
} from '@mui/icons-material';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalMemories: 0,
    memoriesThisWeek: 0,
    memoriesThisMonth: 0,
    habitsCompletedToday: 0,
    emailBackupsSent: 0,
    accountAge: 0,
  });

  useEffect(() => {
    // Gather statistics from localStorage
    const allKeys = Object.keys(localStorage);
    
    // Count memories
    const memoryKeys = allKeys.filter(key => key.startsWith('memories_'));
    let totalMemories = 0;
    let memoriesThisWeek = 0;
    let memoriesThisMonth = 0;
    
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    memoryKeys.forEach(key => {
      try {
        const memories = JSON.parse(localStorage.getItem(key) || '[]');
        totalMemories += memories.length;
        
        memories.forEach(memory => {
          const memoryDate = new Date(memory.timestamp || memory.date);
          if (memoryDate >= oneWeekAgo) memoriesThisWeek++;
          if (memoryDate >= oneMonthAgo) memoriesThisMonth++;
        });
      } catch (error) {
        console.error('Error parsing memories:', error);
      }
    });

    // Count habits completed today
    const today = new Date().toDateString();
    const habitKeys = allKeys.filter(key => key.includes(`habits_`) && key.includes(today));
    let habitsCompletedToday = 0;
    
    habitKeys.forEach(key => {
      try {
        const habits = JSON.parse(localStorage.getItem(key) || '[]');
        habitsCompletedToday += habits.filter(h => h.completed).length;
      } catch (error) {
        console.error('Error parsing habits:', error);
      }
    });

    // Count email backups sent
    const emailSettings = allKeys.filter(key => key.includes('emailSettings'));
    let emailBackupsSent = 0;
    emailSettings.forEach(key => {
      try {
        const settings = JSON.parse(localStorage.getItem(key) || '{}');
        if (settings.autoBackup && settings.lastBackupDate) {
          emailBackupsSent++;
        }
      } catch (error) {
        console.error('Error parsing email settings:', error);
      }
    });

    // Calculate account age - show oldest account
    let accountAge = 0;
    const pinKeys = allKeys.filter(key => key.startsWith('habitTracker_pin_'));
    
    pinKeys.forEach(key => {
      try {
        const pinData = localStorage.getItem(key);
        if (pinData) {
          const { createdAt } = JSON.parse(pinData);
          if (createdAt) {
            const accountDate = new Date(createdAt);
            const age = Math.floor((now - accountDate) / (1000 * 60 * 60 * 24));
            if (age > accountAge) {
              accountAge = age;
            }
          }
        }
      } catch (error) {
        console.error('Error parsing pin data:', error);
      }
    });

    setStats({
      totalMemories,
      memoriesThisWeek,
      memoriesThisMonth,
      habitsCompletedToday,
      emailBackupsSent,
      accountAge,
    });
  }, []);

  const statCards = [
    {
      title: 'Total Memories',
      value: stats.totalMemories,
      icon: <PhotoIcon />,
      color: '#667eea',
      bgColor: 'rgba(102, 126, 234, 0.1)',
    },
    {
      title: 'Memories This Week',
      value: stats.memoriesThisWeek,
      icon: <CalendarTodayIcon />,
      color: '#4caf50',
      bgColor: 'rgba(76, 175, 80, 0.1)',
    },
    {
      title: 'Memories This Month',
      value: stats.memoriesThisMonth,
      icon: <TrendingUpIcon />,
      color: '#ff9800',
      bgColor: 'rgba(255, 152, 0, 0.1)',
    },
    {
      title: 'Habits Completed Today',
      value: stats.habitsCompletedToday,
      icon: <CheckCircleIcon />,
      color: '#2196f3',
      bgColor: 'rgba(33, 150, 243, 0.1)',
    },
    {
      title: 'Email Backups Configured',
      value: stats.emailBackupsSent,
      icon: <EmailIcon />,
      color: '#9c27b0',
      bgColor: 'rgba(156, 39, 176, 0.1)',
    },
    {
      title: 'Account Age (Days)',
      value: stats.accountAge,
      icon: <AccountCircleIcon />,
      color: '#f44336',
      bgColor: 'rgba(244, 67, 54, 0.1)',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Dashboard Overview
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        View statistics and analytics for all users
      </Typography>

      <Grid container spacing={3}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              elevation={2}
              sx={{
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                },
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: card.bgColor,
                      color: card.color,
                    }}
                  >
                    {card.icon}
                  </Box>
                </Box>
                <Typography variant="h3" fontWeight="bold" color={card.color}>
                  {card.value}
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  {card.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper elevation={2} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Recent Activity
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
          <Chip label="System Online" color="success" />
          <Chip label={`${stats.totalMemories} Total Memories`} />
          <Chip label={`${stats.habitsCompletedToday} Habits Today`} />
          <Chip label={`Account Active for ${stats.accountAge} Days`} variant="outlined" />
        </Box>
      </Paper>
    </Box>
  );
};

export default AdminDashboard;
