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
        backgroundColor: ['rgba(255, 99, 71, 0.8)', 'rgba(42, 42, 42, 0.5)'],
        borderColor: ['#ff6347', '#2a2a2a'],
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
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            background: '#1e1e1e',
            border: '1px solid #2a2a2a',
            color: '#e0e0e0',
          }}
        >
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <AssessmentIcon sx={{ fontSize: 32, color: '#ff6347' }} />
            <Typography variant="h5" fontWeight={600} color="#e0e0e0">
              Weekly Summary
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={4}>
              <Paper sx={{ p: 2, textAlign: 'center', background: '#242424', border: '1px solid #2a2a2a' }}>
                <Typography variant="h4" fontWeight={600} color="#ff6347">{weeklyStats.avgScore}%</Typography>
                <Typography variant="body2" color="#9e9e9e">Average</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Paper sx={{ p: 2, textAlign: 'center', background: '#242424', border: '1px solid #2a2a2a' }}>
                <Typography variant="h4" fontWeight={600} color="#ff6347">{weeklyStats.perfectDays}</Typography>
                <Typography variant="body2" color="#9e9e9e">Perfect Days</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Paper sx={{ p: 2, textAlign: 'center', background: '#242424', border: '1px solid #2a2a2a' }}>
                <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                  <Typography variant="h4" fontWeight={600} color="#ff6347">{Math.abs(weeklyStats.trend)}%</Typography>
                  {weeklyStats.trend >= 0 ? <TrendingUpIcon sx={{ color: '#4caf50' }} /> : <TrendingDownIcon sx={{ color: '#f44336' }} />}
                </Box>
                <Typography variant="body2" color="#9e9e9e">Trend</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Chip 
                label={`Best: ${weeklyStats.bestDay.date} (${weeklyStats.bestDay.score}%)`}
                sx={{ 
                  width: '100%', 
                  bgcolor: 'rgba(76, 175, 80, 0.2)', 
                  color: '#4caf50', 
                  fontWeight: 600,
                  border: '1px solid rgba(76, 175, 80, 0.3)',
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <Chip 
                label={`Needs Work: ${weeklyStats.worstDay.date} (${weeklyStats.worstDay.score}%)`}
                sx={{ 
                  width: '100%', 
                  bgcolor: 'rgba(244, 67, 54, 0.2)', 
                  color: '#f44336', 
                  fontWeight: 600,
                  border: '1px solid rgba(244, 67, 54, 0.3)',
                }}
              />
            </Grid>
          </Grid>
        </Paper>
      )}

      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          background: '#1e1e1e',
          border: '1px solid #2a2a2a',
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3} flexWrap="wrap" gap={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <TrendingUpIcon sx={{ fontSize: 32, color: '#ff6347' }} />
            <Typography variant="h5" fontWeight={600} color="#e0e0e0">
              Progress Insights
            </Typography>
          </Box>

          <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
            <ToggleButtonGroup
              value={timePeriod}
              exclusive
              onChange={(e, newPeriod) => newPeriod && setTimePeriod(newPeriod)}
              size="small"
              aria-label="time period"
            >
              <ToggleButton value="week" aria-label="1 week">
                1 Week
              </ToggleButton>
              <ToggleButton value="2weeks" aria-label="2 weeks">
                2 Weeks
              </ToggleButton>
              <ToggleButton value="3weeks" aria-label="3 weeks">
                3 Weeks
              </ToggleButton>
              <ToggleButton value="month" aria-label="1 month">
                Month
              </ToggleButton>
            </ToggleButtonGroup>
            
            <ToggleButtonGroup
              value={chartType}
              exclusive
              onChange={(e, newType) => newType && setChartType(newType)}
              size="small"
              aria-label="chart type"
            >
              <ToggleButton value="line" aria-label="line chart">
                Line
              </ToggleButton>
              <ToggleButton value="bar" aria-label="bar chart">
                Bar
              </ToggleButton>
              <ToggleButton value="doughnut" aria-label="doughnut chart">
                Average
              </ToggleButton>
            </ToggleButtonGroup>
            
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<DeleteIcon />}
              onClick={() => setOpenResetDialog(true)}
            >
              Reset All Data
            </Button>
          </Box>
        </Box>

        {filteredData.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: 'center',
              background: '#242424',
              border: '1px solid #2a2a2a',
              borderRadius: 2,
              minHeight: 300,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <AssessmentIcon sx={{ fontSize: 64, color: '#9e9e9e', mb: 2 }} />
            <Typography variant="h6" color="#e0e0e0" gutterBottom>
              No Data Yet
            </Typography>
            <Typography variant="body1" color="#9e9e9e">
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
                bgcolor: '#242424',
                borderRadius: 2,
                border: '1px solid #2a2a2a',
              }}
            >
              <Box textAlign="center">
                <Typography variant="h6" color="#ff6347">
                  {avgScore}%
                </Typography>
                <Typography variant="caption" color="#9e9e9e">
                  Average
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h6" color="#4caf50">
                  {filteredData.length > 0 ? Math.max(...filteredData.map((d) => d.score)) : 0}%
                </Typography>
                <Typography variant="caption" color="#9e9e9e">
                  Best Day
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h6" color="#2196f3">
                  {filteredData.length}
                </Typography>
                <Typography variant="caption" color="#9e9e9e">
                  Days Tracked
                </Typography>
              </Box>
            </Box>
          </>
        )}
      </Paper>

      {/* Reset Confirmation Dialog */}
      <Dialog 
        open={openResetDialog} 
        onClose={() => setOpenResetDialog(false)}
        PaperProps={{
          sx: {
            background: '#1e1e1e',
            border: '1px solid #2a2a2a',
          }
        }}
      >
        <DialogTitle sx={{ color: '#e0e0e0' }}>Reset All Data?</DialogTitle>
        <DialogContent>
          <Typography color="#9e9e9e">
            This will permanently delete all your habits, memories, and progress data. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenResetDialog(false)} sx={{ color: '#9e9e9e' }}>Cancel</Button>
          <Button 
            onClick={handleResetData} 
            variant="contained" 
            sx={{ 
              bgcolor: '#f44336',
              '&:hover': {
                bgcolor: '#d32f2f',
              },
            }}
          >
            Reset Everything
          </Button>
        </DialogActions>
      </Dialog>
    </MotionDiv>
  );
};

export default ProgressGraph;
