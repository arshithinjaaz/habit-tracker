import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import BedtimeIcon from '@mui/icons-material/Bedtime';
import FavoriteIcon from '@mui/icons-material/Favorite';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import PeopleIcon from '@mui/icons-material/People';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import WorkIcon from '@mui/icons-material/Work';

const HabitCheckbox = ({ onProgressUpdate, userName }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const defaultHabits = [
    { id: 'exercise', label: 'Exercise (30 min)', category: 'Health', icon: 'FitnessCenter' },
    { id: 'water', label: 'Drink 8 glasses of water', category: 'Health', icon: 'WaterDrop' },
    { id: 'reading', label: 'Read for 20 minutes', category: 'Learning', icon: 'MenuBook' },
    { id: 'meditation', label: 'Meditate (10 min)', category: 'Wellness', icon: 'SelfImprovement' },
    { id: 'sleep', label: 'Sleep 7-8 hours', category: 'Health', icon: 'Bedtime' },
    { id: 'gratitude', label: 'Practice gratitude', category: 'Wellness', icon: 'Favorite' },
    { id: 'healthy-meal', label: 'Eat healthy meals', category: 'Health', icon: 'Restaurant' },
    { id: 'social', label: 'Connect with loved ones', category: 'Social', icon: 'People' },
    { id: 'learn', label: 'Learn something new', category: 'Learning', icon: 'Lightbulb' },
    { id: 'organize', label: 'Organize workspace', category: 'Productivity', icon: 'Work' },
  ];

  const [habits, setHabits] = useState(() => {
    try {
      const today = new Date().toDateString();
      const saved = localStorage.getItem(`habits_${userName}_${today}`);
      if (saved) {
        return JSON.parse(saved);
      }
      // Load custom habits if available
      const customHabits = localStorage.getItem(`customHabits_${userName}`);
      if (customHabits) {
        return JSON.parse(customHabits).map(h => ({ ...h, completed: false }));
      }
      return defaultHabits.map(h => ({ ...h, completed: false }));
    } catch (error) {
      console.error('Error loading habits:', error);
      return defaultHabits.map(h => ({ ...h, completed: false }));
    }
  });

  const [filteredCategory, setFilteredCategory] = useState('All');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [newHabit, setNewHabit] = useState({ label: '', category: 'Health', emoji: '✨' });
  const [streak, setStreak] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  const completedCount = habits.filter(h => h.completed).length;
  const totalCount = habits.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Calculate streak
  useEffect(() => {
    const calculateStreak = () => {
      const streakData = localStorage.getItem(`streak_${userName}`);
      if (!streakData) return 0;
      
      const { lastDate, count } = JSON.parse(streakData);
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      
      if (lastDate === today) return count;
      if (lastDate === yesterday && completionPercentage === 100) return count + 1;
      if (completionPercentage === 100) return 1;
      return 0;
    };
    setStreak(calculateStreak());
  }, [completionPercentage, userName]);

  // Play sound effect
  const playSound = (completed) => {
    try {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      
      oscillator.frequency.value = completed ? 800 : 400;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);
      
      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.1);
    } catch (e) {
      // Silent fail if audio not supported
    }
  };

  // Haptic feedback
  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  // Listen for habits reset event
  useEffect(() => {
    const handleReset = () => {
      const today = new Date().toDateString();
      const saved = localStorage.getItem(`habits_${userName}_${today}`);
      if (!saved) {
        const customHabits = localStorage.getItem(`customHabits_${userName}`);
        if (customHabits) {
          setHabits(JSON.parse(customHabits).map(h => ({ ...h, completed: false })));
        } else {
          setHabits(defaultHabits.map(h => ({ ...h, completed: false })));
        }
      }
    };

    window.addEventListener('habitsReset', handleReset);
    return () => window.removeEventListener('habitsReset', handleReset);
  }, [defaultHabits, userName]);

  useEffect(() => {
    const today = new Date().toDateString();
    localStorage.setItem(`habits_${userName}_${today}`, JSON.stringify(habits));
    
    // Update streak
    if (completionPercentage === 100) {
      const streakData = { lastDate: today, count: streak === 0 ? 1 : streak };
      localStorage.setItem(`streak_${userName}`, JSON.stringify(streakData));
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
    
    if (onProgressUpdate) {
      onProgressUpdate(completionPercentage);
    }
  }, [habits, completionPercentage, onProgressUpdate, userName]);

  const handleToggle = (habitId) => {
    const habit = habits.find(h => h.id === habitId);
    playSound(!habit.completed);
    triggerHaptic();
    
    setHabits(prev =>
      prev.map(h =>
        h.id === habitId ? { ...h, completed: !h.completed } : h
      )
    );
    
    // Add visual celebration effect for completion
    if (!habit.completed) {
      // Create a brief animation effect
      const element = document.querySelector(`[data-habit-id="${habitId}"]`);
      if (element) {
        element.style.transform = 'scale(1.05)';
        element.style.transition = 'transform 0.2s ease';
        setTimeout(() => {
          element.style.transform = 'scale(1)';
        }, 200);
      }
    }
  };

  const handleAddHabit = () => {
    if (!newHabit.label.trim()) return;
    
    const habit = {
      id: Date.now().toString(),
      label: newHabit.label,
      category: newHabit.category,
      emoji: newHabit.emoji,
      completed: false,
    };
    
    const updatedHabits = [...habits, habit];
    setHabits(updatedHabits);
    
    // Save to custom habits
    const customHabits = updatedHabits.map(({ completed, ...rest }) => rest);
    localStorage.setItem(`customHabits_${userName}`, JSON.stringify(customHabits));
    
    setNewHabit({ label: '', category: 'Health', emoji: '✨' });
    setOpenAddDialog(false);
  };

  const handleEditHabit = () => {
    if (!editingHabit.label.trim()) return;
    
    const updatedHabits = habits.map(h =>
      h.id === editingHabit.id ? { ...h, label: editingHabit.label, category: editingHabit.category } : h
    );
    setHabits(updatedHabits);
    
    const customHabits = updatedHabits.map(({ completed, ...rest }) => rest);
    localStorage.setItem(`customHabits_${userName}`, JSON.stringify(customHabits));
    
    setEditingHabit(null);
    setOpenEditDialog(false);
  };

  const handleDeleteHabit = (habitId) => {
    const updatedHabits = habits.filter(h => h.id !== habitId);
    setHabits(updatedHabits);
    
    const customHabits = updatedHabits.map(({ completed, ...rest }) => rest);
    localStorage.setItem(`customHabits_${userName}`, JSON.stringify(customHabits));
  };

  const filteredHabits = filteredCategory === 'All' 
    ? habits 
    : habits.filter(h => h.category === filteredCategory);

  const categories = ['All', ...new Set(habits.map(h => h.category))];

  const getHabitIcon = (iconName) => {
    const iconProps = { sx: { fontSize: 20, mr: 1, color: '#ff6347' } };
    const icons = {
      FitnessCenter: <FitnessCenterIcon {...iconProps} />,
      WaterDrop: <WaterDropIcon {...iconProps} />,
      MenuBook: <MenuBookIcon {...iconProps} />,
      SelfImprovement: <SelfImprovementIcon {...iconProps} />,
      Bedtime: <BedtimeIcon {...iconProps} />,
      Favorite: <FavoriteIcon {...iconProps} />,
      Restaurant: <RestaurantIcon {...iconProps} />,
      People: <PeopleIcon {...iconProps} />,
      Lightbulb: <LightbulbIcon {...iconProps} />,
      Work: <WorkIcon {...iconProps} />,
    };
    return icons[iconName] || null;
  };

  const getCategoryColor = (category) => {
    const colors = {
      Health: '#4CAF50',
      Wellness: '#9C27B0',
      Learning: '#2196F3',
      Social: '#FF9800',
      Productivity: '#F44336',
    };
    return colors[category] || '#757575';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Celebration Confetti */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 9999,
              fontSize: '100px',
            }}
          >
            🎉🎊✨
          </motion.div>
        )}
      </AnimatePresence>

      <Paper
        elevation={8}
        sx={{
          p: { xs: 2, sm: 2.5, md: 3 },
          borderRadius: { xs: 2, md: 3 },
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          mx: { xs: 0.5, sm: 0 },
        }}
      >
        {/* Header with Streak */}
        <Box 
          display="flex" 
          alignItems="center" 
          justifyContent="space-between" 
          mb={{ xs: 2, md: 3 }} 
          flexWrap="wrap" 
          gap={{ xs: 1, md: 2 }}
        >
          <Box display="flex" alignItems="center" gap={{ xs: 1, sm: 1.5 }}>
            <EmojiEventsIcon 
              color="primary" 
              sx={{ 
                fontSize: { xs: 28, sm: 32, md: 36 },
                color: '#ff6347',
                filter: 'drop-shadow(0 2px 4px rgba(255, 99, 71, 0.3))'
              }} 
            />
            <Typography 
              variant="h5" 
              fontWeight="bold"
              sx={{
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                color: '#ff6347',
                letterSpacing: '-0.02em',
              }}
            >
              Daily Habits
            </Typography>
          </Box>
          <Box display="flex" gap={{ xs: 1, sm: 1.5 }} alignItems="center" flexWrap="wrap">
            {streak > 0 && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Tooltip title={`${streak} day streak!`} arrow>
                  <Chip
                    icon={<LocalFireDepartmentIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                    label={`${streak} 🔥`}
                    color="error"
                    size={isMobile ? "small" : "medium"}
                    sx={{ 
                      fontWeight: 'bold',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      minHeight: { xs: 32, sm: 36 },
                      '& .MuiChip-label': {
                        px: { xs: 1, sm: 1.5 }
                      },
                      background: 'linear-gradient(45deg, #ff6347, #ff8570)',
                      color: 'white',
                      boxShadow: '0 4px 12px rgba(255, 99, 71, 0.3)',
                    }}
                  />
                </Tooltip>
              </motion.div>
            )}
            {completedCount > 0 && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Chip
                  label={`${completedCount}/${totalCount}`}
                  color="primary"
                  size={isMobile ? "small" : "medium"}
                  sx={{ 
                    fontWeight: 'bold',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    minHeight: { xs: 32, sm: 36 },
                    backgroundColor: 'rgba(255, 99, 71, 0.15)',
                    color: '#ff6347',
                    border: '1px solid rgba(255, 99, 71, 0.3)',
                    '& .MuiChip-label': {
                      px: { xs: 1, sm: 1.5 }
                    },
                  }}
                />
              </motion.div>
            )}
            <Tooltip title="Add Habit" arrow>
              <IconButton 
                color="primary" 
                onClick={() => setOpenAddDialog(true)} 
                size={isMobile ? "small" : "medium"}
                sx={{
                  minWidth: { xs: 44, sm: 48 },
                  minHeight: { xs: 44, sm: 48 },
                  backgroundColor: 'rgba(255, 99, 71, 0.1)',
                  border: '2px solid rgba(255, 99, 71, 0.3)',
                  borderRadius: '12px',
                  color: '#ff6347',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: '#ff6347',
                    color: 'white',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 6px 16px rgba(255, 99, 71, 0.3)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                }}
              >
                <AddIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Progress Bar */}
        <Box mb={{ xs: 2, md: 3 }}>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            >
              Today's Progress
            </Typography>
            <Typography 
              variant="body2" 
              fontWeight="bold" 
              color="primary"
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            >
              {completionPercentage}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={completionPercentage}
            sx={{
              height: { xs: 10, md: 12 },
              borderRadius: 6,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 6,
                background: 'linear-gradient(90deg, #ff6347 0%, #ff8570 100%)',
                boxShadow: '0 2px 8px rgba(255, 99, 71, 0.3)',
              },
            }}
          />
        </Box>

        {/* Category Filter */}
        <Box 
          mb={{ xs: 2.5, md: 3 }} 
          sx={{
            display: 'flex', 
            flexDirection: 'column',
            gap: 1.5,
          }}
        >
          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
            <FilterListIcon 
              sx={{ 
                color: '#ff6347', 
                fontSize: { xs: 20, sm: 22 },
                filter: 'drop-shadow(0 2px 4px rgba(255, 99, 71, 0.3))'
              }} 
            />
            <Typography 
              variant="body2"
              sx={{ 
                color: '#ff6347',
                fontWeight: 600,
                letterSpacing: '0.02em',
                fontSize: { xs: '0.875rem', sm: '0.95rem' }
              }}
            >
              Filter Categories
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            {categories.map(cat => (
              <Box
                key={cat}
                onClick={() => setFilteredCategory(cat)}
                sx={{
                  px: { xs: 2.5, sm: 3 },
                  py: { xs: 1, sm: 1.25 },
                  borderRadius: '20px',
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  fontWeight: 600,
                  cursor: 'pointer',
                  userSelect: 'none',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: '2px solid',
                  borderColor: filteredCategory === cat ? '#ff6347' : 'rgba(255, 255, 255, 0.15)',
                  backgroundColor: filteredCategory === cat 
                    ? 'linear-gradient(135deg, #ff6347 0%, #ff8570 100%)'
                    : 'rgba(255, 255, 255, 0.05)',
                  background: filteredCategory === cat 
                    ? 'linear-gradient(135deg, #ff6347 0%, #ff8570 100%)'
                    : 'rgba(255, 255, 255, 0.05)',
                  color: filteredCategory === cat ? 'white' : 'rgba(255, 255, 255, 0.8)',
                  boxShadow: filteredCategory === cat 
                    ? '0 6px 20px rgba(255, 99, 71, 0.4)'
                    : '0 2px 8px rgba(0, 0, 0, 0.1)',
                  transform: filteredCategory === cat ? 'translateY(-2px) scale(1.02)' : 'translateY(0)',
                  '&:hover': {
                    backgroundColor: filteredCategory === cat 
                      ? 'linear-gradient(135deg, #ff6347 0%, #ff8570 100%)'
                      : 'rgba(255, 255, 255, 0.1)',
                    background: filteredCategory === cat 
                      ? 'linear-gradient(135deg, #ff6347 0%, #ff8570 100%)'
                      : 'rgba(255, 255, 255, 0.1)',
                    borderColor: filteredCategory === cat ? '#ff6347' : 'rgba(255, 255, 255, 0.3)',
                    transform: 'translateY(-2px) scale(1.05)',
                    boxShadow: filteredCategory === cat 
                      ? '0 8px 24px rgba(255, 99, 71, 0.5)'
                      : '0 4px 12px rgba(255, 255, 255, 0.1)',
                  },
                  '&:active': {
                    transform: 'translateY(-1px) scale(1.02)',
                  },
                }}
              >
                {cat}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Habits List */}
        <List sx={{ width: '100%' }}>
          <AnimatePresence>
            {filteredHabits.map((habit, index) => (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                layout
              >
                <ListItem
                  data-habit-id={habit.id}
                  sx={{
                    borderRadius: { xs: 2, md: 3 },
                    mb: { xs: 1, md: 1.5 },
                    p: { xs: 1.5, sm: 2, md: 2.5 },
                    minHeight: { xs: 64, sm: 68, md: 72 },
                    background: habit.completed 
                      ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)' 
                      : 'rgba(255, 255, 255, 0.03)',
                    border: habit.completed 
                      ? '2px solid rgba(76, 175, 80, 0.5)' 
                      : '2px solid rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: habit.completed ? '100%' : '0%',
                      height: '3px',
                      background: 'linear-gradient(90deg, #4CAF50, #81C784)',
                      transition: 'width 0.5s ease',
                    },
                    '&:hover': {
                      background: habit.completed 
                        ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(76, 175, 80, 0.08) 100%)' 
                        : 'rgba(255, 255, 255, 0.08)',
                      transform: 'translateY(-2px)',
                      boxShadow: habit.completed 
                        ? '0 8px 24px rgba(76, 175, 80, 0.2)'
                        : '0 8px 24px rgba(255, 99, 71, 0.1)',
                    },
                    '&:active': {
                      transform: 'translateY(-1px)',
                    },
                  }}
                  onClick={() => handleToggle(habit.id)}
                  secondaryAction={
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton 
                        size={isMobile ? "small" : "medium"}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingHabit(habit);
                          setOpenEditDialog(true);
                        }}
                        sx={{ 
                          minWidth: { xs: 40, sm: 'auto' }, 
                          minHeight: { xs: 40, sm: 'auto' },
                          p: { xs: 1, sm: 'auto' },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size={isMobile ? "small" : "medium"}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteHabit(habit.id);
                        }}
                        color="error"
                        sx={{ 
                          minWidth: { xs: 40, sm: 'auto' }, 
                          minHeight: { xs: 40, sm: 'auto' },
                          p: { xs: 1, sm: 'auto' },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemIcon sx={{ minWidth: { xs: 44, sm: 56 } }}>
                    <Checkbox
                      edge="start"
                      checked={habit.completed}
                      onChange={() => handleToggle(habit.id)}
                      icon={<RadioButtonUncheckedIcon />}
                      checkedIcon={<CheckCircleIcon />}
                      size={isMobile ? "medium" : "large"}
                      sx={{
                        color: 'rgba(255, 255, 255, 0.3)',
                        p: { xs: 1, sm: 'auto' },
                        transition: 'all 0.2s ease',
                        '&.Mui-checked': {
                          color: '#4CAF50',
                          filter: 'drop-shadow(0 2px 6px rgba(76, 175, 80, 0.4))',
                        },
                        '&:hover': {
                          backgroundColor: 'rgba(255, 99, 71, 0.08)',
                          transform: 'scale(1.1)',
                        },
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: { xs: 1, sm: 1.5 },
                        flexWrap: 'wrap',
                      }}>
                        {/* Show emoji if available, otherwise show icon */}
                        {habit.emoji ? (
                          <Box sx={{ 
                            fontSize: { xs: '1.5rem', sm: '1.75rem' },
                            lineHeight: 1,
                            opacity: habit.completed ? 0.5 : 1,
                            transition: 'all 0.3s ease',
                            filter: habit.completed ? 'grayscale(100%)' : 'none',
                          }}>
                            {habit.emoji}
                          </Box>
                        ) : habit.icon ? (
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            opacity: habit.completed ? 0.5 : 1,
                            transition: 'opacity 0.3s ease',
                          }}>
                            {getHabitIcon(habit.icon)}
                          </Box>
                        ) : null}
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column',
                          flex: 1,
                          gap: 0.5,
                        }}>
                          <Typography
                            variant="body1"
                            sx={{
                              textDecoration: habit.completed ? 'line-through' : 'none',
                              color: habit.completed ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.95)',
                              fontWeight: habit.completed ? 400 : 600,
                              fontSize: { xs: '0.95rem', sm: '1rem' },
                              lineHeight: 1.4,
                              letterSpacing: '0.01em',
                              transition: 'all 0.3s ease',
                            }}
                          >
                            {habit.label}
                          </Typography>
                          <Chip
                            label={habit.category}
                            size="small"
                            sx={{
                              width: 'fit-content',
                              backgroundColor: habit.completed 
                                ? 'rgba(255, 255, 255, 0.05)'
                                : `${getCategoryColor(habit.category)}20`,
                              color: habit.completed 
                                ? 'rgba(255, 255, 255, 0.4)'
                                : getCategoryColor(habit.category),
                              fontWeight: 600,
                              fontSize: { xs: '0.65rem', sm: '0.7rem' },
                              height: { xs: 22, sm: 24 },
                              border: `1px solid ${habit.completed 
                                ? 'rgba(255, 255, 255, 0.1)'
                                : `${getCategoryColor(habit.category)}40`}`,
                              transition: 'all 0.3s ease',
                              '& .MuiChip-label': {
                                px: { xs: 1.25, sm: 1.5 },
                                py: 0.25,
                              },
                            }}
                          />
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
              </motion.div>
            ))}
          </AnimatePresence>
        </List>

        {/* Completion Message */}
        {completionPercentage === 100 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <Paper
              elevation={2}
              sx={{
                p: { xs: 1.5, sm: 2 },
                mt: { xs: 1.5, sm: 2 },
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                textAlign: 'center',
                borderRadius: { xs: 1.5, sm: 2 },
                mx: { xs: 0.5, sm: 0 },
              }}
            >
              <Typography 
                variant={isMobile ? "body1" : "h6"} 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: 1,
                  fontSize: { xs: '0.875rem', sm: '1.25rem' },
                  flexWrap: 'wrap',
                }}
              >
                🎉 Amazing! All habits completed today! 🎉
              </Typography>
            </Paper>
          </motion.div>
        )}
      </Paper>

      {/* Add Habit Dialog */}
      <Dialog 
        open={openAddDialog} 
        onClose={() => setOpenAddDialog(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            mx: { xs: 2, sm: 3 },
            width: { xs: 'calc(100% - 32px)', sm: '100%' }
          }
        }}
      >
        <DialogTitle>Add New Habit</DialogTitle>
        <DialogContent>
          {/* Emoji Picker */}
          <Box sx={{ mb: 2, mt: 1 }}>
            <Typography variant="caption" sx={{ mb: 1, display: 'block', color: 'text.secondary', fontWeight: 600 }}>
              Choose an Emoji
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 1,
              p: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 2,
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}>
              {[
                '✨', '🎯', '💪', '🏃', '🧘', '📚', '💡', '🎨',
                '🌟', '🔥', '💖', '🌈', '🎵', '☕', '🌻', '🎓',
                '⚡', '🚀', '💎', '🏆', '🌙', '☀️', '🌊', '🎪',
                '🍎', '🥗', '💧', '🏋️', '🧠', '❤️', '😊', '🎉'
              ].map((emoji) => (
                <Box
                  key={emoji}
                  onClick={() => setNewHabit({ ...newHabit, emoji })}
                  sx={{
                    fontSize: '1.75rem',
                    width: { xs: 44, sm: 48 },
                    height: { xs: 44, sm: 48 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    borderRadius: '12px',
                    border: '2px solid',
                    borderColor: newHabit.emoji === emoji ? '#ff6347' : 'transparent',
                    backgroundColor: newHabit.emoji === emoji ? 'rgba(255, 99, 71, 0.15)' : 'transparent',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 99, 71, 0.1)',
                      transform: 'scale(1.1)',
                      borderColor: 'rgba(255, 99, 71, 0.5)',
                    },
                    '&:active': {
                      transform: 'scale(1.05)',
                    },
                  }}
                >
                  {emoji}
                </Box>
              ))}
            </Box>
          </Box>
          
          <TextField
            autoFocus
            margin="dense"
            label="Habit Name"
            fullWidth
            value={newHabit.label}
            onChange={(e) => setNewHabit({ ...newHabit, label: e.target.value })}
            placeholder="e.g., Workout for 30 minutes"
            sx={{
              '& input': {
                fontSize: { xs: '16px', sm: '14px' }, // Prevents iOS zoom
              }
            }}
          />
          <FormControl fullWidth margin="dense" sx={{ mb: { xs: 2, sm: 1 } }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={newHabit.category}
              label="Category"
              onChange={(e) => setNewHabit({ ...newHabit, category: e.target.value })}
              sx={{
                '& .MuiSelect-select': {
                  fontSize: { xs: '16px', sm: '14px' },
                },
              }}
            >
              <MenuItem value="Health">Health</MenuItem>
              <MenuItem value="Wellness">Wellness</MenuItem>
              <MenuItem value="Learning">Learning</MenuItem>
              <MenuItem value="Social">Social</MenuItem>
              <MenuItem value="Productivity">Productivity</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ 
          px: { xs: 2, sm: 3 }, 
          pb: { xs: 2, sm: 2 },
          gap: { xs: 1, sm: 0 },
          flexDirection: { xs: 'column-reverse', sm: 'row' },
        }}>
          <Button 
            onClick={() => setOpenAddDialog(false)} 
            sx={{ 
              minHeight: { xs: 44, sm: 'auto' },
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddHabit} 
            variant="contained" 
            sx={{ 
              minHeight: { xs: 44, sm: 'auto' },
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Habit Dialog */}
      <Dialog 
        open={openEditDialog} 
        onClose={() => setOpenEditDialog(false)} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            mx: { xs: 0, sm: 2, md: 3 },
            width: { xs: '100%', sm: 'calc(100% - 32px)', md: '100%' },
            height: { xs: '100%', sm: 'auto' },
            maxHeight: { xs: '100%', sm: '90vh' },
            borderRadius: { xs: 0, sm: 2 },
          }
        }}
      >
        <DialogTitle sx={{ 
          fontSize: { xs: '1.1rem', sm: '1.25rem' },
          pb: { xs: 1, sm: 2 },
        }}>
          Edit Habit
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
          {editingHabit && (
            <>
              <TextField
                autoFocus={!isMobile}
                margin="dense"
                label="Habit Name"
                fullWidth
                value={editingHabit.label}
                onChange={(e) => setEditingHabit({ ...editingHabit, label: e.target.value })}
                sx={{
                  mb: { xs: 2, sm: 1 },
                  '& input': {
                    fontSize: { xs: '16px', sm: '14px' }, // Prevents iOS zoom
                  }
                }}
              />
              <FormControl fullWidth margin="dense" sx={{ mb: { xs: 2, sm: 1 } }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={editingHabit.category}
                  label="Category"
                  onChange={(e) => setEditingHabit({ ...editingHabit, category: e.target.value })}
                  sx={{
                    '& .MuiSelect-select': {
                      fontSize: { xs: '16px', sm: '14px' },
                    },
                  }}
                >
                  <MenuItem value="Health">Health</MenuItem>
                  <MenuItem value="Wellness">Wellness</MenuItem>
                  <MenuItem value="Learning">Learning</MenuItem>
                  <MenuItem value="Social">Social</MenuItem>
                  <MenuItem value="Productivity">Productivity</MenuItem>
                </Select>
              </FormControl>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          px: { xs: 2, sm: 3 }, 
          pb: { xs: 2, sm: 2 },
          gap: { xs: 1, sm: 0 },
          flexDirection: { xs: 'column-reverse', sm: 'row' },
        }}>
          <Button 
            onClick={() => setOpenEditDialog(false)} 
            sx={{ 
              minHeight: { xs: 44, sm: 'auto' },
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleEditHabit} 
            variant="contained" 
            sx={{ 
              minHeight: { xs: 44, sm: 'auto' },
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
};

export default HabitCheckbox;
