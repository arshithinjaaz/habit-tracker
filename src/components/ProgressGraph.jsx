import { useState, useMemo, useCallback } from 'react';
import { Box, Paper, Typography, ToggleButton, ToggleButtonGroup, Button, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DeleteIcon from '@mui/icons-material/Delete';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AssessmentIcon from '@mui/icons-material/Assessment';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ProgressGraph = ({ userName }) => {
  const [chartType, setChartType] = useState('line');
  const [timePeriod, setTimePeriod] = useState('week'); // week, 2weeks, 3weeks, month

  const getInitialProgressData = useCallback(() => {
    let data = [];
    
    try {
      const saved = localStorage.getItem(`progressData_${userName}`);
      if (saved) {
        data = JSON.parse(saved);
      }
      // Remove the sample data generation - start with empty data
    } catch (error) {
      console.error('Error loading progress data:', error);
      data = [];
    }

    // Check if we need to update today's score
    try {
      const today = new Date().toDateString();
      const savedAnswers = localStorage.getItem(`habits_${userName}_${today}`);
      if (savedAnswers) {
        const habits = JSON.parse(savedAnswers);
        const completedCount = habits.filter((h) => h.completed).length;
        const score = Math.round((completedCount / habits.length) * 100);
        
        const todayLabel = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const todayIndex = data.findIndex(d => d.date === todayLabel);
        
        if (todayIndex !== -1) {
          data[todayIndex].score = score;
        } else {
          data.push({ date: todayLabel, score });
          if (data.length > 7) data.shift();
        }
        
        localStorage.setItem(`progressData_${userName}`, JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error updating today\'s score:', error);
    }

    return data;
  }, [userName]);

  const [progressData, setProgressData] = useState(getInitialProgressData);
  const [openResetDialog, setOpenResetDialog] = useState(false);

  // Calculate weekly summary stats
  const weeklyStats = useMemo(() => {
    const lastWeek = progressData.slice(-7);
    if (lastWeek.length === 0) return null;
    
    const scores = lastWeek.map(d => d.score);
    const bestDay = lastWeek.reduce((max, d) => d.score > max.score ? d : max, lastWeek[0]);
    const worstDay = lastWeek.reduce((min, d) => d.score < min.score ? d : min, lastWeek[0]);
    const avgScore = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
    const trend = scores.length > 1 ? scores[scores.length - 1] - scores[0] : 0;
    const perfectDays = scores.filter(s => s === 100).length;
    
    return { bestDay, worstDay, avgScore, trend, perfectDays, totalDays: lastWeek.length };
  }, [progressData]);

  // Filter data based on selected time period
  const filteredData = useMemo(() => {
    const days = {
      week: 7,
      '2weeks': 14,
      '3weeks': 21,
      month: 30,
    };
    const daysToShow = days[timePeriod] || 7;
    return progressData.slice(-daysToShow);
  }, [progressData, timePeriod]);

  const handleResetData = () => {
    localStorage.removeItem(`progressData_${userName}`);
    localStorage.removeItem(`memories_${userName}`);
    // Clear habit data for this user
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(`habits_${userName}_`)) {
        localStorage.removeItem(key);
      }
    });
    setProgressData([]);
    setOpenResetDialog(false);
    window.location.reload(); // Refresh to update all components
  };

  const MotionDiv = motion.div;

  const lineChartData = useMemo(() => ({
    labels: filteredData.map((d) => d.date),
    datasets: [
      {
        label: 'Daily Habit Score (%)',
        data: filteredData.map((d) => d.score),
        borderColor: '#ff6347',
        backgroundColor: 'rgba(255, 99, 71, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  }), [filteredData]);

  const barChartData = useMemo(() => ({
    labels: filteredData.map((d) => d.date),
    datasets: [
      {
        label: 'Daily Habit Score (%)',
        data: filteredData.map((d) => d.score),
        backgroundColor: filteredData.map((d) =>
          d.score >= 70
            ? 'rgba(75, 192, 192, 0.6)'
            : d.score >= 40
            ? 'rgba(255, 206, 86, 0.6)'
            : 'rgba(255, 99, 132, 0.6)'
        ),
        borderColor: filteredData.map((d) =>
          d.score >= 70
            ? 'rgba(75, 192, 192, 1)'
            : d.score >= 40
            ? 'rgba(255, 206, 86, 1)'
            : 'rgba(255, 99, 132, 1)'
        ),
        borderWidth: 2,
      },
    ],
  }), [filteredData]);

  const avgScore = filteredData.length > 0 
    ? Math.round(filteredData.reduce((sum, d) => sum + d.score, 0) / filteredData.length)
    : 0;

  const doughnutData = useMemo(() => ({
    labels: ['Completed', 'Remaining'],
    datasets: [
      {
        data: [avgScore, 100 - avgScore],
        backgroundColor: ['rgba(102, 126, 234, 0.8)', 'rgba(200, 200, 200, 0.3)'],
        borderColor: ['rgb(102, 126, 234)', 'rgb(200, 200, 200)'],
        borderWidth: 2,
      },
    ],
  }), [avgScore]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: chartType !== 'doughnut' ? {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value) => value + '%',
        },
      },
    } : undefined,
  };

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      {/* Weekly Summary Stats */}
      {weeklyStats && (
        <Paper
          elevation={8}
          sx={{
            p: { xs: 2, sm: 3 },
            mb: 3,
            borderRadius: { xs: 3, md: 4 },
            background: 'linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%)',
            border: '1px solid rgba(255, 99, 71, 0.2)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, #ff6347, #ff8570, #ffa07a)',
            },
          }}
        >
          <Box display="flex" alignItems="center" gap={1} mb={3}>
            <AssessmentIcon sx={{ fontSize: { xs: 28, md: 32 }, color: '#ff6347' }} />
            <Typography 
              variant="h5" 
              fontWeight="bold"
              sx={{
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                color: '#ff6347',
                letterSpacing: '-0.02em'
              }}
            >
              Weekly Summary
            </Typography>
          </Box>
          <Grid container spacing={{ xs: 1.5, sm: 2 }}>
            <Grid item xs={4}>
              <Paper sx={{ 
                p: { xs: 1.5, sm: 2 }, 
                textAlign: 'center', 
                background: 'rgba(255, 99, 71, 0.15)',
                border: '1px solid rgba(255, 99, 71, 0.3)',
                borderRadius: 2,
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 24px rgba(255, 99, 71, 0.2)'
                }
              }}>
                <Typography variant="h4" fontWeight="bold" sx={{ 
                  fontSize: { xs: '1.5rem', sm: '2rem' },
                  color: '#ff6347'
                }}>
                  {weeklyStats.avgScore}%
                </Typography>
                <Typography variant="body2" sx={{ 
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontWeight: 500
                }}>
                  Average
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper sx={{ 
                p: { xs: 1.5, sm: 2 }, 
                textAlign: 'center', 
                background: 'rgba(255, 99, 71, 0.15)',
                border: '1px solid rgba(255, 99, 71, 0.3)',
                borderRadius: 2,
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 24px rgba(255, 99, 71, 0.2)'
                }
              }}>
                <Typography variant="h4" fontWeight="bold" sx={{ 
                  fontSize: { xs: '1.5rem', sm: '2rem' },
                  color: '#ff6347'
                }}>
                  {weeklyStats.perfectDays}
                </Typography>
                <Typography variant="body2" sx={{ 
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontWeight: 500
                }}>
                  Perfect Days
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper sx={{ 
                p: { xs: 1.5, sm: 2 }, 
                textAlign: 'center', 
                background: 'rgba(255, 99, 71, 0.15)',
                border: '1px solid rgba(255, 99, 71, 0.3)',
                borderRadius: 2,
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 24px rgba(255, 99, 71, 0.2)'
                }
              }}>
                <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                  <Typography variant="h4" fontWeight="bold" sx={{ 
                    fontSize: { xs: '1.5rem', sm: '2rem' },
                    color: '#ff6347'
                  }}>
                    {Math.abs(weeklyStats.trend)}%
                  </Typography>
                  {weeklyStats.trend >= 0 ? 
                    <TrendingUpIcon sx={{ color: '#4caf50', fontSize: { xs: 20, sm: 24 } }} /> : 
                    <TrendingDownIcon sx={{ color: '#f44336', fontSize: { xs: 20, sm: 24 } }} />
                  }
                </Box>
                <Typography variant="body2" sx={{ 
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontWeight: 500
                }}>
                  Trend
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Chip 
                icon={<EmojiEventsIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />}
                label={`Best: ${weeklyStats.bestDay.date} (${weeklyStats.bestDay.score}%)`}
                sx={{ 
                  width: '100%', 
                  minHeight: { xs: 44, sm: 40 },
                  bgcolor: 'rgba(76, 175, 80, 0.9)', 
                  color: 'white', 
                  fontWeight: 'bold',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  borderRadius: 2,
                  '& .MuiChip-label': {
                    px: 2
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Chip 
                label={`Needs Work: ${weeklyStats.worstDay.date} (${weeklyStats.worstDay.score}%)`}
                sx={{ 
                  width: '100%', 
                  minHeight: { xs: 44, sm: 40 },
                  bgcolor: 'rgba(244, 67, 54, 0.9)', 
                  color: 'white', 
                  fontWeight: 'bold',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  borderRadius: 2,
                  '& .MuiChip-label': {
                    px: 2
                  }
                }}
              />
            </Grid>
          </Grid>
        </Paper>
      )}

      <Paper
        elevation={8}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        }}
      >
        {/* Progress Insights Header */}
        <Box sx={{ mb: 3 }}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <TrendingUpIcon color="primary" sx={{ fontSize: { xs: 28, md: 32 } }} />
            <Typography 
              variant="h5" 
              fontWeight="bold"
              sx={{ 
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                color: '#ff6347',
                letterSpacing: '-0.02em'
              }}
            >
              Progress Insights
            </Typography>
          </Box>

          {/* Mobile-First Controls Layout */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: 2,
          }}>
            {/* Time Period Selector */}
            <Box>
              <Typography 
                variant="caption" 
                sx={{ 
                  display: 'block',
                  mb: 1,
                  color: 'text.secondary',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontSize: '0.75rem'
                }}
              >
                Time Period
              </Typography>
              <ToggleButtonGroup
                value={timePeriod}
                exclusive
                onChange={(e, newPeriod) => newPeriod && setTimePeriod(newPeriod)}
                size="small"
                aria-label="time period"
                sx={{
                  display: 'flex',
                  width: '100%',
                  '& .MuiToggleButton-root': {
                    flex: 1,
                    minHeight: { xs: 44, sm: 40 },
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    fontWeight: 600,
                    border: '1px solid rgba(255, 99, 71, 0.3)',
                    color: 'rgba(255, 255, 255, 0.7)',
                    borderRadius: '8px',
                    mx: 0.25,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:first-of-type': {
                      ml: 0,
                      borderTopLeftRadius: '12px',
                      borderBottomLeftRadius: '12px',
                    },
                    '&:last-of-type': {
                      mr: 0,
                      borderTopRightRadius: '12px',
                      borderBottomRightRadius: '12px',
                    },
                    '&.Mui-selected': {
                      backgroundColor: '#ff6347',
                      color: 'white',
                      borderColor: '#ff6347',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(255, 99, 71, 0.3)',
                      '&:hover': {
                        backgroundColor: '#ff6347',
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 99, 71, 0.1)',
                      borderColor: 'rgba(255, 99, 71, 0.5)',
                    },
                  },
                }}
              >
                <ToggleButton value="week" aria-label="1 week">
                  1 WEEK
                </ToggleButton>
                <ToggleButton value="2weeks" aria-label="2 weeks">
                  2 WEEKS
                </ToggleButton>
                <ToggleButton value="3weeks" aria-label="3 weeks">
                  3 WEEKS
                </ToggleButton>
                <ToggleButton value="month" aria-label="1 month">
                  MONTH
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
            
            {/* Chart Type & Reset Controls */}
            <Box sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              alignItems: { xs: 'stretch', sm: 'flex-end' },
              justifyContent: 'space-between'
            }}>
              {/* Chart Type Selector */}
              <Box sx={{ flex: { sm: 1 } }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block',
                    mb: 1,
                    color: 'text.secondary',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontSize: '0.75rem'
                  }}
                >
                  Chart Type
                </Typography>
                <ToggleButtonGroup
                  value={chartType}
                  exclusive
                  onChange={(e, newType) => newType && setChartType(newType)}
                  size="small"
                  aria-label="chart type"
                  sx={{
                    display: 'flex',
                    width: { xs: '100%', sm: 'auto' },
                    '& .MuiToggleButton-root': {
                      flex: { xs: 1, sm: 'none' },
                      minHeight: { xs: 44, sm: 40 },
                      minWidth: { sm: 80 },
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      fontWeight: 600,
                      border: '1px solid rgba(255, 99, 71, 0.3)',
                      color: 'rgba(255, 255, 255, 0.7)',
                      borderRadius: '8px',
                      mx: 0.25,
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:first-of-type': {
                        ml: 0,
                        borderTopLeftRadius: '12px',
                        borderBottomLeftRadius: '12px',
                      },
                      '&:last-of-type': {
                        mr: 0,
                        borderTopRightRadius: '12px',
                        borderBottomRightRadius: '12px',
                      },
                      '&.Mui-selected': {
                        backgroundColor: '#ff6347',
                        color: 'white',
                        borderColor: '#ff6347',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(255, 99, 71, 0.3)',
                        '&:hover': {
                          backgroundColor: '#ff6347',
                        },
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(255, 99, 71, 0.1)',
                        borderColor: 'rgba(255, 99, 71, 0.5)',
                      },
                    },
                  }}
                >
                  <ToggleButton value="line" aria-label="line chart">
                    LINE
                  </ToggleButton>
                  <ToggleButton value="bar" aria-label="bar chart">
                    BAR
                  </ToggleButton>
                  <ToggleButton value="doughnut" aria-label="doughnut chart">
                    AVERAGE
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
              
              {/* Reset Button */}
              <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<DeleteIcon sx={{ fontSize: 18 }} />}
                  onClick={() => setOpenResetDialog(true)}
                  sx={{
                    minHeight: { xs: 44, sm: 40 },
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    fontWeight: 600,
                    borderRadius: '12px',
                    border: '2px solid',
                    borderColor: 'error.main',
                    color: 'error.main',
                    px: { xs: 2, sm: 3 },
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      backgroundColor: 'error.main',
                      color: 'white',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 6px 16px rgba(244, 67, 54, 0.3)',
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                    },
                  }}
                >
                  Reset All Data
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>

        {filteredData.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: 'center',
              background: '#2a2a2a',
              borderRadius: 2,
              minHeight: 300,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Typography variant="h2" sx={{ mb: 2 }}>
              
            </Typography>
            <Typography variant="h6" color="text.primary" gutterBottom>
              No Data Yet
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Start checking off your daily habits to see your progress here!
            </Typography>
          </Paper>
        ) : (
          <>
            <Box sx={{ height: 300, mb: 2 }}>
              {chartType === 'line' && <Line data={lineChartData} options={chartOptions} />}
              {chartType === 'bar' && <Bar data={barChartData} options={chartOptions} />}
              {chartType === 'doughnut' && (
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%">
                  <Box sx={{ width: 250, height: 250 }}>
                    <Doughnut data={doughnutData} options={{ ...chartOptions, cutout: '70%' }} />
                  </Box>
                  <Typography variant="h4" sx={{ mt: 2 }}>
                    {avgScore}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    7-Day Average Score
                  </Typography>
                </Box>
              )}
            </Box>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-around',
                mt: 3,
                p: 2,
                bgcolor: 'background.default',
                borderRadius: 2,
              }}
            >
              <Box textAlign="center">
                <Typography variant="h6" color="primary">
                  {avgScore}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Average
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h6" color="success.main">
                  {filteredData.length > 0 ? Math.max(...filteredData.map((d) => d.score)) : 0}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Best Day
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h6" color="info.main">
                  {filteredData.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Days Tracked
                </Typography>
              </Box>
            </Box>
          </>
        )}
      </Paper>

      {/* Reset Confirmation Dialog */}
      <Dialog open={openResetDialog} onClose={() => setOpenResetDialog(false)}>
        <DialogTitle>Reset All Data?</DialogTitle>
        <DialogContent>
          <Typography>
            This will permanently delete all your habits, memories, and progress data. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenResetDialog(false)}>Cancel</Button>
          <Button onClick={handleResetData} color="error" variant="contained">
            Reset Everything
          </Button>
        </DialogActions>
      </Dialog>
    </MotionDiv>
  );
};

export default ProgressGraph;
