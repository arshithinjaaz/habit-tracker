import { useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import WavingHandIcon from '@mui/icons-material/WavingHand';

const Greeting = () => {
  const currentHour = new Date().getHours();
  const userName = 'Friend';
  
  const getGreeting = () => {
    if (currentHour < 12) return 'Good Morning';
    if (currentHour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Use useState to store the random quote on mount
  const [motivationalQuote] = useState(() => {
    const quotes = [
      "Start your day with purpose and intention.",
      "Every day is a new opportunity to build better habits.",
      "Small steps lead to big changes.",
      "Consistency is the key to success.",
      "You're doing great! Keep going!"
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  });

  const MotionDiv = motion.div;

  return (
    <MotionDiv
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mb: 3,
          background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
          color: 'white',
          borderRadius: 3,
          border: '1px solid #3a3a3a',
        }}
      >
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <MotionDiv
            animate={{ rotate: [0, 14, -8, 14, 0] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 2,
            }}
          >
            <WavingHandIcon sx={{ fontSize: 48 }} />
          </MotionDiv>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {getGreeting()}, {userName}!
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              {motivationalQuote}
            </Typography>
          </Box>
        </Box>
        <Typography variant="body1" sx={{ mt: 2, opacity: 0.85 }}>
          Track your habits, celebrate your progress, and build the life you want.
        </Typography>
      </Paper>
    </MotionDiv>
  );
};

export default Greeting;
