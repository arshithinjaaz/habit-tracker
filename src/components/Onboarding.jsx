import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Paper,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const Onboarding = ({ open, onClose }) => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to Habit Tracker! 🎉',
      icon: '👋',
      description: 'Build better habits, track your progress, and achieve your goals with our intuitive app.',
    },
    {
      title: 'Track Your Habits',
      icon: <CheckCircleIcon sx={{ fontSize: 64, color: '#4CAF50' }} />,
      description: 'Check off daily habits, add custom habits, and filter by category. Each completed habit brings you closer to your goals!',
    },
    {
      title: 'Build Your Streak 🔥',
      icon: <LocalFireDepartmentIcon sx={{ fontSize: 64, color: '#FF5722' }} />,
      description: 'Complete all habits daily to build a streak! The longer your streak, the more motivated you\'ll be.',
    },
    {
      title: 'Log Your Memories',
      icon: <NoteAddIcon sx={{ fontSize: 64, color: '#667eea' }} />,
      description: 'Capture daily thoughts, achievements, and reflections. Your memories are organized by month for easy browsing.',
    },
    {
      title: 'Visualize Progress',
      icon: <TrendingUpIcon sx={{ fontSize: 64, color: '#2196F3' }} />,
      description: 'View charts, weekly summaries, and insights about your habit journey. Export your data anytime!',
    },
    {
      title: 'You\'re All Set! 🚀',
      icon: '✨',
      description: 'Start your journey to better habits today. Remember: small steps lead to big changes!',
    },
  ];

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      localStorage.setItem('onboardingCompleted', 'true');
      onClose();
    } else {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSkip = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleSkip}
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        },
      }}
    >
      <DialogContent sx={{ p: 4 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((_, index) => (
            <Step key={index}>
              <StepLabel />
            </Step>
          ))}
        </Stepper>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 4,
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: 3,
                minHeight: 300,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <Box mb={2}>
                {typeof steps[activeStep].icon === 'string' ? (
                  <Typography variant="h1" sx={{ fontSize: 64 }}>
                    {steps[activeStep].icon}
                  </Typography>
                ) : (
                  steps[activeStep].icon
                )}
              </Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">
                {steps[activeStep].title}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2, lineHeight: 1.8 }}>
                {steps[activeStep].description}
              </Typography>
            </Paper>
          </motion.div>
        </AnimatePresence>
      </DialogContent>

      <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
        <Button onClick={handleSkip} sx={{ color: 'white' }}>
          Skip
        </Button>
        <Box>
          <Button 
            onClick={handleBack} 
            disabled={activeStep === 0}
            sx={{ color: 'white', mr: 1 }}
          >
            Back
          </Button>
          <Button 
            onClick={handleNext}
            variant="contained"
            sx={{
              bgcolor: 'white',
              color: '#667eea',
              '&:hover': {
                bgcolor: '#f5f5f5',
              },
            }}
          >
            {activeStep === steps.length - 1 ? 'Get Started' : 'Next'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default Onboarding;
