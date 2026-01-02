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
  Divider,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  LocalFireDepartment as FireIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';

const AdminHabits = () => {
  const [habitStats, setHabitStats] = useState([]);
  const [overallStats, setOverallStats] = useState({
    totalHabits: 0,
    averageCompletion: 0,
    bestStreak: 0,
    totalCompletions: 0,
  });
  const [streakData, setStreakData] = useState([]);
  const [trendData, setTrendData] = useState({
    labels: [],
    completionRates: [],
  });

  const loadHabitStats = () => {
    const allKeys = Object.keys(localStorage);
    
    // Get all habit data for the last 30 days
    const habitData = {};
    const streakInfo = {};
    const dailyCompletionRates = {};
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Initialize last 14 days for trend chart
    for (let i = 13; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dailyCompletionRates[dateKey] = { completed: 0, total: 0 };
    }

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
              
              const dateKey = habitDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              
              habits.forEach((habit) => {
                if (!habitData[habit.id]) {
                  habitData[habit.id] = {
                    label: habit.label,
                    category: habit.category,
                    completions: 0,
                    total: 0,
                    recentDays: [],
                  };
                  streakInfo[habit.id] = {
                    currentStreak: 0,
                    longestStreak: 0,
                    tempStreak: 0,
                  };
                }
                
                habitData[habit.id].total++;
                habitData[habit.id].recentDays.push({
                  date: habitDate,
                  completed: habit.completed,
                });
                
                if (habit.completed) {
                  habitData[habit.id].completions++;
                  
                  // Track daily completion rates for trend
                  if (dailyCompletionRates[dateKey]) {
                    dailyCompletionRates[dateKey].completed++;
                  }
                }
                
                // Track for daily total
                if (dailyCompletionRates[dateKey]) {
                  dailyCompletionRates[dateKey].total++;
                }
              });
            }
          }
        } catch (error) {
          console.error('Error parsing habit data:', error);
        }
      });

    // Calculate streaks for each habit
    Object.entries(habitData).forEach(([id, data]) => {
      // Sort by date
      data.recentDays.sort((a, b) => a.date - b.date);
      
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      
      // Calculate streaks from most recent backwards
      const reversedDays = [...data.recentDays].reverse();
      let consecutiveDays = true;
      
      for (const day of reversedDays) {
        if (day.completed && consecutiveDays) {
          currentStreak++;
        } else {
          consecutiveDays = false;
        }
        
        if (day.completed) {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 0;
        }
      }
      
      streakInfo[id] = {
        currentStreak,
        longestStreak,
      };
    });

    // Convert to array and calculate percentages
    const stats = Object.entries(habitData).map(([id, data]) => ({
      id,
      label: data.label,
      category: data.category,
      completions: data.completions,
      total: data.total,
      percentage: Math.round((data.completions / data.total) * 100),
      currentStreak: streakInfo[id].currentStreak,
      longestStreak: streakInfo[id].longestStreak,
    }));

    // Sort by completion percentage
    stats.sort((a, b) => b.percentage - a.percentage);

    // Calculate streak leaderboard
    const streakLeaderboard = [...stats]
      .filter(s => s.longestStreak > 0)
      .sort((a, b) => b.longestStreak - a.longestStreak)
      .slice(0, 5);

    // Calculate overall stats
    const totalHabits = stats.length;
    const totalCompletions = stats.reduce((sum, stat) => sum + stat.completions, 0);
    const averageCompletion = totalHabits > 0
      ? Math.round(stats.reduce((sum, stat) => sum + stat.percentage, 0) / totalHabits)
      : 0;
    
    const bestStreak = stats.length > 0 
      ? Math.max(...stats.map(s => s.longestStreak))
      : 0;

    // Calculate trend data
    const trendLabels = Object.keys(dailyCompletionRates);
    const trendRates = Object.values(dailyCompletionRates).map(day => 
      day.total > 0 ? Math.round((day.completed / day.total) * 100) : 0
    );

    setHabitStats(stats);
    setStreakData(streakLeaderboard);
    setOverallStats({
      totalHabits,
      averageCompletion,
      bestStreak,
      totalCompletions,
    });
    setTrendData({
      labels: trendLabels,
      completionRates: trendRates,
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

  const trendChartData = {
    labels: trendData.labels,
    datasets: [
      {
        label: 'Completion Rate (%)',
        data: trendData.completionRates,
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      }
    },
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Habits Analytics
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        30-day habit completion statistics and streak tracking
      </Typography>

      {/* Overall Stats */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
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
        <Grid item xs={12} sm={6} md={3}>
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
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <FireIcon sx={{ color: '#ff9800', mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  Best Streak
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold" color="#ff9800">
                {overallStats.bestStreak} days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrophyIcon sx={{ color: '#2196f3', mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  Total Completions
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold" color="#2196f3">
                {overallStats.totalCompletions}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Completion Trend Chart */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, height: 400 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Completion Rate Trend (Last 14 Days)
        </Typography>
        <Box sx={{ height: 320 }}>
          <Line data={trendChartData} options={chartOptions} />
        </Box>
      </Paper>

      {/* Streak Leaderboard */}
      {streakData.length > 0 && (
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" fontWeight="bold" mb={3}>
            🔥 Streak Leaderboard
          </Typography>
          <Grid container spacing={2}>
            {streakData.map((habit, index) => (
              <Grid item xs={12} key={habit.id}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    background: index === 0 
                      ? 'linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(255,152,0,0.1) 100%)'
                      : 'transparent',
                    border: index === 0 ? '2px solid #ffc107' : undefined,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="h4" fontWeight="bold" color="text.secondary">
                        #{index + 1}
                      </Typography>
                      <Box>
                        <Typography variant="body1" fontWeight="bold">
                          {habit.label}
                        </Typography>
                        <Chip
                          label={habit.category}
                          size="small"
                          variant="outlined"
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FireIcon sx={{ color: '#ff9800', fontSize: 32 }} />
                        <Typography variant="h4" fontWeight="bold" color="#ff9800">
                          {habit.longestStreak}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        days streak
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

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
                      flexWrap: 'wrap',
                      gap: 1,
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
                      {habit.currentStreak > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <FireIcon sx={{ color: '#ff9800', fontSize: 20 }} />
                          <Typography variant="body2" fontWeight="bold" color="#ff9800">
                            {habit.currentStreak} day{habit.currentStreak !== 1 ? 's' : ''}
                          </Typography>
                        </Box>
                      )}
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
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      {habit.completions} / {habit.total} days completed
                    </Typography>
                    {habit.longestStreak > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        Longest streak: {habit.longestStreak} day{habit.longestStreak !== 1 ? 's' : ''}
                      </Typography>
                    )}
                  </Box>
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
