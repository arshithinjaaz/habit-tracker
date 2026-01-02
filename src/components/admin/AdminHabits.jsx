import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  Grid,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

const AdminHabits = () => {
  const [habitStats, setHabitStats] = useState([]);
  const [overallStats, setOverallStats] = useState({
    totalHabits: 0,
    averageCompletion: 0,
    bestStreak: 0,
  });

  const loadHabitStats = () => {
    const allKeys = Object.keys(localStorage);
    
    // Get all habit data for the last 30 days
    const habitData = {};
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Collect habit completions from all users
    allKeys
      .filter((key) => key.includes('habits_'))
      .forEach((key) => {
        try {
          const habits = JSON.parse(localStorage.getItem(key) || '[]');
          
          // Extract date from key - format is typically "habits_userName_dateString"
          const keyParts = key.split('_');
          if (keyParts.length > 2) {
            const dateString = keyParts.slice(2).join('_');
            const habitDate = new Date(dateString);
            
            // Validate the date - must be valid, not in the future, and within 30 days
            if (!isNaN(habitDate.getTime()) && 
                habitDate <= now && 
                habitDate >= thirtyDaysAgo) {
              habits.forEach((habit) => {
                if (!habitData[habit.id]) {
                  habitData[habit.id] = {
                    label: habit.label,
                    category: habit.category,
                    completions: 0,
                    total: 0,
                  };
                }
                habitData[habit.id].total++;
                if (habit.completed) {
                  habitData[habit.id].completions++;
                }
              });
            }
          }
        } catch (error) {
          console.error('Error parsing habit data:', error);
        }
      });

    // Convert to array and calculate percentages
    const stats = Object.entries(habitData).map(([id, data]) => ({
      id,
      label: data.label,
      category: data.category,
      completions: data.completions,
      total: data.total,
      percentage: Math.round((data.completions / data.total) * 100),
    }));

    // Sort by completion percentage
    stats.sort((a, b) => b.percentage - a.percentage);

    // Calculate overall stats
    const totalHabits = stats.length;
    const averageCompletion = totalHabits > 0
      ? Math.round(stats.reduce((sum, stat) => sum + stat.percentage, 0) / totalHabits)
      : 0;
    
    // Calculate best streak (simplified - just use highest completion rate)
    const bestStreak = stats.length > 0 ? stats[0].percentage : 0;

    setHabitStats(stats);
    setOverallStats({
      totalHabits,
      averageCompletion,
      bestStreak,
    });
  };

  useEffect(() => {
    loadHabitStats();
  }, []);

  const getPerformanceColor = (percentage) => {
    if (percentage >= 80) return '#4caf50'; // Green
    if (percentage >= 60) return '#ff9800'; // Orange
    return '#f44336'; // Red
  };

  const getPerformanceLabel = (percentage) => {
    if (percentage >= 80) return 'Excellent';
    if (percentage >= 60) return 'Good';
    if (percentage >= 40) return 'Fair';
    return 'Needs Work';
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Habits Analytics
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        30-day habit completion statistics
      </Typography>

      {/* Overall Stats */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={4}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircleIcon sx={{ color: '#667eea', mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  Total Habits
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold" color="#667eea">
                {overallStats.totalHabits}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon sx={{ color: '#4caf50', mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  Avg Completion
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold" color="#4caf50">
                {overallStats.averageCompletion}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon sx={{ color: '#ff9800', mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  Best Performance
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold" color="#ff9800">
                {overallStats.bestStreak}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Individual Habit Stats */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" mb={3}>
          Habit Performance (Last 30 Days)
        </Typography>

        {habitStats.length === 0 ? (
          <Typography color="text.secondary">
            No habit data available for the last 30 days
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {habitStats.map((habit) => (
              <Grid item xs={12} key={habit.id}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateX(4px)',
                      boxShadow: 2,
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                      <Typography variant="body1" fontWeight="bold">
                        {habit.label}
                      </Typography>
                      <Chip
                        label={habit.category}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Chip
                        label={getPerformanceLabel(habit.percentage)}
                        size="small"
                        sx={{
                          bgcolor: getPerformanceColor(habit.percentage),
                          color: 'white',
                          fontWeight: 'bold',
                        }}
                      />
                      <Typography variant="h6" fontWeight="bold" color={getPerformanceColor(habit.percentage)}>
                        {habit.percentage}%
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={habit.percentage}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        bgcolor: 'rgba(0,0,0,0.1)',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: getPerformanceColor(habit.percentage),
                          borderRadius: 5,
                        },
                      }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {habit.completions} / {habit.total} days completed
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Box>
  );
};

export default AdminHabits;
