import { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  LinearProgress,
  Grid,
  Chip,
} from '@mui/material';
import { motion } from 'framer-motion';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import QuizIcon from '@mui/icons-material/Quiz';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const Questionnaire = ({ onComplete }) => {
  const questions = useMemo(() => [
    { id: 1, text: 'Did you exercise today?', category: 'Health' },
    { id: 2, text: 'Did you drink enough water?', category: 'Health' },
    { id: 3, text: 'Did you read for at least 15 minutes?', category: 'Learning' },
    { id: 4, text: 'Did you meditate or practice mindfulness?', category: 'Wellness' },
    { id: 5, text: 'Did you complete your priority tasks?', category: 'Productivity' },
    { id: 6, text: 'Did you connect with friends or family?', category: 'Social' },
    { id: 7, text: 'Did you practice gratitude?', category: 'Wellness' },
    { id: 8, text: 'Did you get enough sleep last night?', category: 'Health' },
  ], []);

  const [currentQuestion, setCurrentQuestion] = useState(() => {
    try {
      const today = new Date().toDateString();
      const savedAnswers = localStorage.getItem(`questionnaire_${today}`);
      return savedAnswers ? questions.length : 0;
    } catch (error) {
      console.error('Error loading questionnaire state:', error);
      return 0;
    }
  });

  const [answers, setAnswers] = useState(() => {
    try {
      const today = new Date().toDateString();
      const savedAnswers = localStorage.getItem(`questionnaire_${today}`);
      return savedAnswers ? JSON.parse(savedAnswers) : [];
    } catch (error) {
      console.error('Error loading saved answers:', error);
      return [];
    }
  });

  const [isComplete, setIsComplete] = useState(() => {
    try {
      const today = new Date().toDateString();
      return !!localStorage.getItem(`questionnaire_${today}`);
    } catch (error) {
      console.error('Error checking completion state:', error);
      return false;
    }
  });

  const MotionDiv = motion.div;

  const handleAnswer = (answer) => {
    const newAnswers = [...answers, { questionId: questions[currentQuestion].id, answer }];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsComplete(true);
      const today = new Date().toDateString();
      localStorage.setItem(`questionnaire_${today}`, JSON.stringify(newAnswers));
      if (onComplete) {
        onComplete(newAnswers);
      }
    }
  };

  const progress = ((currentQuestion + (isComplete ? 1 : 0)) / questions.length) * 100;
  const yesCount = answers.filter((a) => a.answer === 'yes').length;
  const score = Math.round((yesCount / questions.length) * 100);

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
        }}
      >
        <Box display="flex" alignItems="center" gap={1} mb={3}>
          <QuizIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h5" fontWeight="bold">
            Daily Habits Check-in
          </Typography>
        </Box>

        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ mb: 3, height: 8, borderRadius: 4 }}
        />

        {!isComplete ? (
          <MotionDiv
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Box textAlign="center" py={4}>
              <Chip
                label={questions[currentQuestion].category}
                color="primary"
                sx={{ mb: 2 }}
              />
              <Typography variant="h6" gutterBottom sx={{ mb: 4, minHeight: 60 }}>
                {questions[currentQuestion].text}
              </Typography>

              <Grid container spacing={2} justifyContent="center">
                <Grid item xs={12} sm={5}>
                  <MotionDiv whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="success"
                      size="large"
                      onClick={() => handleAnswer('yes')}
                      startIcon={<CheckCircleIcon />}
                      aria-label="Answer Yes"
                      sx={{ py: 2 }}
                    >
                      Yes
                    </Button>
                  </MotionDiv>
                </Grid>
                <Grid item xs={12} sm={5}>
                  <MotionDiv whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="error"
                      size="large"
                      onClick={() => handleAnswer('no')}
                      startIcon={<CancelIcon />}
                      aria-label="Answer No"
                      sx={{ py: 2 }}
                    >
                      No
                    </Button>
                  </MotionDiv>
                </Grid>
              </Grid>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
                Question {currentQuestion + 1} of {questions.length}
              </Typography>
            </Box>
          </MotionDiv>
        ) : (
          <MotionDiv
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Box textAlign="center" py={4}>
              <EmojiEventsIcon
                sx={{
                  fontSize: 80,
                  color: score >= 70 ? 'success.main' : score >= 40 ? 'warning.main' : 'error.main',
                  mb: 2,
                }}
              />
              <Typography variant="h4" gutterBottom>
                Great Job!
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                You completed {yesCount} out of {questions.length} habits today
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  mt: 2,
                  color: score >= 70 ? 'success.main' : score >= 40 ? 'warning.main' : 'error.main',
                }}
              >
                {score}%
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                {score >= 70
                  ? '🎉 Excellent! You\'re building amazing habits!'
                  : score >= 40
                  ? '💪 Good effort! Keep pushing forward!'
                  : '🌱 Every day is a new opportunity to grow!'}
              </Typography>
              <Button
                variant="outlined"
                onClick={() => {
                  setCurrentQuestion(0);
                  setAnswers([]);
                  setIsComplete(false);
                  const today = new Date().toDateString();
                  localStorage.removeItem(`questionnaire_${today}`);
                }}
                sx={{ mt: 3 }}
              >
                Retake Questionnaire
              </Button>
            </Box>
          </MotionDiv>
        )}
      </Paper>
    </MotionDiv>
  );
};

export default Questionnaire;
