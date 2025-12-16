import { useState, useMemo, useCallback } from 'react';
import { Box, Paper, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';
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

const ProgressGraph = () => {
  const [chartType, setChartType] = useState('line');

  const getInitialProgressData = useCallback(() => {
    let data = [];
    
    try {
      const saved = localStorage.getItem('progressData');
      if (saved) {
        data = JSON.parse(saved);
      } else {
        // Generate sample data for the last 7 days
        data = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return {
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            score: Math.floor(Math.random() * 40) + 40, // 40-80% range
          };
        });
      }
    } catch (error) {
      console.error('Error loading progress data:', error);
      // Generate default data if parsing fails
      data = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          score: Math.floor(Math.random() * 40) + 40,
        };
      });
    }

    // Check if we need to update today's score
    try {
      const today = new Date().toDateString();
      const savedAnswers = localStorage.getItem(`questionnaire_${today}`);
      if (savedAnswers) {
        const answers = JSON.parse(savedAnswers);
        const yesCount = answers.filter((a) => a.answer === 'yes').length;
        const score = Math.round((yesCount / 8) * 100);
        
        const todayLabel = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const todayIndex = data.findIndex(d => d.date === todayLabel);
        
        if (todayIndex !== -1) {
          data[todayIndex].score = score;
        } else {
          data.push({ date: todayLabel, score });
          if (data.length > 7) data.shift();
        }
        
        localStorage.setItem('progressData', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error updating today\'s score:', error);
    }

    return data;
  }, []);

  const [progressData] = useState(getInitialProgressData);

  const MotionDiv = motion.div;

  const lineChartData = useMemo(() => ({
    labels: progressData.map((d) => d.date),
    datasets: [
      {
        label: 'Daily Habit Score (%)',
        data: progressData.map((d) => d.score),
        borderColor: 'rgb(102, 126, 234)',
        backgroundColor: 'rgba(102, 126, 234, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  }), [progressData]);

  const barChartData = useMemo(() => ({
    labels: progressData.map((d) => d.date),
    datasets: [
      {
        label: 'Daily Habit Score (%)',
        data: progressData.map((d) => d.score),
        backgroundColor: progressData.map((d) =>
          d.score >= 70
            ? 'rgba(75, 192, 192, 0.6)'
            : d.score >= 40
            ? 'rgba(255, 206, 86, 0.6)'
            : 'rgba(255, 99, 132, 0.6)'
        ),
        borderColor: progressData.map((d) =>
          d.score >= 70
            ? 'rgba(75, 192, 192, 1)'
            : d.score >= 40
            ? 'rgba(255, 206, 86, 1)'
            : 'rgba(255, 99, 132, 1)'
        ),
        borderWidth: 2,
      },
    ],
  }), [progressData]);

  const avgScore = progressData.length > 0 
    ? Math.round(progressData.reduce((sum, d) => sum + d.score, 0) / progressData.length)
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
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3} flexWrap="wrap" gap={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <TrendingUpIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h5" fontWeight="bold">
              Progress Insights
            </Typography>
          </Box>

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
        </Box>

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
              {Math.max(...progressData.map((d) => d.score))}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Best Day
            </Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="h6" color="info.main">
              {progressData.length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Days Tracked
            </Typography>
          </Box>
        </Box>
      </Paper>
    </MotionDiv>
  );
};

export default ProgressGraph;
