import { useMemo } from 'react';
import { Box, Typography, Paper, Chip, useTheme, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

// Curated inspirational quotes for habit building
const inspirationalQuotes = [
  {
    quote: "Excellence isn't a skill, it's an attitude.",
    author: "Ralph Marston",
    category: "Excellence"
  },
  {
    quote: "Success is the sum of small efforts repeated day in and day out.",
    author: "Robert Collier",
    category: "Success"
  },
  {
    quote: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    author: "Aristotle",
    category: "Habits"
  },
  {
    quote: "The secret of change is to focus all of your energy on building the new.",
    author: "Socrates",
    category: "Growth"
  },
  {
    quote: "Your future is created by what you do today, not tomorrow.",
    author: "Robert Kiyosaki",
    category: "Action"
  },
  {
    quote: "Progress not perfection. Small steps lead to big changes.",
    author: "Unknown",
    category: "Progress"
  },
  {
    quote: "The journey of a thousand miles begins with a single step.",
    author: "Lao Tzu",
    category: "Journey"
  },
  {
    quote: "Discipline is choosing between what you want now and what you want most.",
    author: "Abraham Lincoln",
    category: "Discipline"
  },
  {
    quote: "Champions don't become champions in the ring. They become champions in their training.",
    author: "Muhammad Ali",
    category: "Training"
  },
  {
    quote: "Success isn't about luck. It's about preparation meeting opportunity.",
    author: "Harvey Specter",
    category: "Success"
  }
];
const QuoteOfTheDay = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Select a random quote based on the day to ensure consistency throughout the day
  const todaysQuote = useMemo(() => {
    const now = new Date();
    const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    return inspirationalQuotes[dayOfYear % inspirationalQuotes.length];
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      <Paper
        elevation={4}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%)',
          border: '1px solid rgba(255, 99, 71, 0.2)',
          borderRadius: { xs: 3, md: 4 },
          p: { xs: 3, md: 4 },
          mb: { xs: 2, md: 3 },
          mx: { xs: 0.5, sm: 0 },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #ff6347, #ff8570, #ffa07a)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100px',
            height: '100px',
            background: 'radial-gradient(circle, rgba(255,99,71,0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            transform: 'translate(50%, -50%)',
          }
        }}
      >
        {/* Decorative Quote Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          style={{
            position: 'absolute',
            top: isMobile ? 16 : 20,
            right: isMobile ? 16 : 24,
            zIndex: 1,
          }}
        >
          <Box
            sx={{
              width: { xs: 40, md: 50 },
              height: { xs: 40, md: 50 },
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ff6347, #ff8570)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(255, 99, 71, 0.3)',
            }}
          >
            <FormatQuoteIcon 
              sx={{ 
                fontSize: { xs: 20, md: 24 }, 
                color: 'white',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
              }} 
            />
          </Box>
        </motion.div>

        {/* Quote Category Badge */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesomeIcon sx={{ fontSize: 16, color: '#ff6347' }} />
            <Chip
              label={todaysQuote.category}
              size="small"
              sx={{
                backgroundColor: 'rgba(255, 99, 71, 0.15)',
                color: '#ff6347',
                fontWeight: 600,
                fontSize: '0.75rem',
                borderRadius: '12px',
                border: '1px solid rgba(255, 99, 71, 0.3)',
              }}
            />
          </Box>
        </motion.div>

        {/* Quote Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Typography
            variant={isMobile ? 'h6' : 'h5'}
            sx={{
              fontStyle: 'italic',
              color: '#ffffff',
              lineHeight: { xs: 1.5, md: 1.6 },
              fontWeight: 500,
              mb: 3,
              position: 'relative',
              fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
              pr: { xs: 6, md: 8 }, // Space for floating quote icon
              '&::before': {
                content: '"\u201C"',
                position: 'absolute',
                left: -8,
                top: -4,
                fontSize: { xs: '2.5rem', md: '3rem' },
                color: '#ff6347',
                opacity: 0.7,
                fontFamily: 'serif',
              },
            }}
          >
            {todaysQuote.quote}
          </Typography>
        </motion.div>

        {/* Author & Date */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between', 
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: { xs: 1, sm: 0 },
              pt: 2,
              borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: '#ff6347',
                fontWeight: 600,
                fontSize: { xs: '0.875rem', md: '0.95rem' },
              }}
            >
              — {todaysQuote.author}
            </Typography>
            
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontStyle: 'italic',
                fontSize: { xs: '0.75rem', md: '0.8rem' },
              }}
            >
              Inspiration of the Day • {new Date().toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </Typography>
          </Box>
        </motion.div>
      </Paper>
    </motion.div>
  );
};

export default QuoteOfTheDay;
