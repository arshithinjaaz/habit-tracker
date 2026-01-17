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
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
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
import GroupIcon from '@mui/icons-material/Group';
import SchoolIcon from '@mui/icons-material/School';
import FolderIcon from '@mui/icons-material/Folder';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';

const HabitCheckbox = ({ onProgressUpdate, userName }) => {
  const defaultHabits = [
    { id: 'exercise', label: 'Exercise (30 min)', category: 'Health', icon: 'FitnessCenter' },
    { id: 'water', label: 'Drink 8 glasses of water', category: 'Health', icon: 'WaterDrop' },
    { id: 'reading', label: 'Read for 20 minutes', category: 'Learning', icon: 'MenuBook' },
    { id: 'meditation', label: 'Meditate (10 min)', category: 'Wellness', icon: 'SelfImprovement' },
    { id: 'sleep', label: 'Sleep 7-8 hours', category: 'Health', icon: 'Bedtime' },
    { id: 'gratitude', label: 'Practice gratitude', category: 'Wellness', icon: 'Favorite' },
    { id: 'healthy-meal', label: 'Eat healthy meals', category: 'Health', icon: 'Restaurant' },
    { id: 'social', label: 'Connect with loved ones', category: 'Social', icon: 'Group' },
    { id: 'learn', label: 'Learn something new', category: 'Learning', icon: 'School' },
    { id: 'organize', label: 'Organize workspace', category: 'Productivity', icon: 'Folder' },
  ];

  // Helper function to get icon component
  const getIconComponent = (iconName) => {
    const icons = {
      FitnessCenter: FitnessCenterIcon,
      WaterDrop: WaterDropIcon,
      MenuBook: MenuBookIcon,
      SelfImprovement: SelfImprovementIcon,
      Bedtime: BedtimeIcon,
      Favorite: FavoriteIcon,
      Restaurant: RestaurantIcon,
      Group: GroupIcon,
      School: SchoolIcon,
      Folder: FolderIcon,
    };
    const IconComponent = icons[iconName] || FolderIcon;
    return <IconComponent sx={{ fontSize: 20, color: '#9e9e9e' }} />;
  };

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
  const [newHabit, setNewHabit] = useState({ label: '', category: 'Health' });
  const [streak, setStreak] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  const completedCount = habits.filter(h => h.completed).length;
  const totalCount = habits.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);

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
  };

  const handleAddHabit = () => {
    if (!newHabit.label.trim()) return;
    
    const habit = {
      id: Date.now().toString(),
      label: newHabit.label,
      category: newHabit.category,
      completed: false,
    };
    
    const updatedHabits = [...habits, habit];
    setHabits(updatedHabits);
    
    // Save to custom habits
    const customHabits = updatedHabits.map(({ completed, ...rest }) => rest);
    localStorage.setItem(`customHabits_${userName}`, JSON.stringify(customHabits));
    
    setNewHabit({ label: '', category: 'Health' });
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

  const getCategoryColor = (category) => {
    const colors = {
      Health: '#4caf50',
      Wellness: '#9c27b0',
      Learning: '#2196f3',
      Social: '#ff9800',
      Productivity: '#ff6347',
    };
    return colors[category] || '#757575';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 3,
          background: '#1e1e1e',
          border: '1px solid #2a2a2a',
        }}
      >
        {/* Header with Streak */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2} flexWrap="wrap" gap={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h5" fontWeight={600} color="#e0e0e0">
              Daily Habits
            </Typography>
          </Box>
          <Box display="flex" gap={1} alignItems="center">
            {streak > 0 && (
              <Tooltip title={`${streak} day streak!`}>
                <Chip
                  icon={<LocalFireDepartmentIcon sx={{ color: '#ff6347 !important' }} />}
                  label={streak}
                  sx={{ 
                    fontWeight: 600,
                    background: 'rgba(255, 99, 71, 0.15)',
                    color: '#ff6347',
                    border: '1px solid rgba(255, 99, 71, 0.3)',
                  }}
                />
              </Tooltip>
            )}
            {completedCount > 0 && (
              <Chip
                label={`${completedCount}/${totalCount}`}
                sx={{ 
                  fontWeight: 600,
                  background: 'rgba(255, 99, 71, 0.15)',
                  color: '#ff6347',
                  border: '1px solid rgba(255, 99, 71, 0.3)',
                }}
              />
            )}
            <Tooltip title="Add Habit">
              <IconButton 
                sx={{ 
                  color: '#ff6347',
                  '&:hover': {
                    background: 'rgba(255, 99, 71, 0.1)',
                  }
                }} 
                onClick={() => setOpenAddDialog(true)} 
                size="small"
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Progress Bar */}
        <Box mb={3}>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2" color="#9e9e9e">
              Today's Progress
            </Typography>
            <Typography variant="body2" fontWeight={600} color="#ff6347">
              {completionPercentage}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={completionPercentage}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: '#2a2a2a',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                background: '#ff6347',
              },
            }}
          />
        </Box>

        {/* Category Filter */}
        <Box mb={2} display="flex" alignItems="center" gap={1} flexWrap="wrap">
          <FilterListIcon sx={{ color: '#9e9e9e' }} fontSize="small" />
          <ToggleButtonGroup
            value={filteredCategory}
            exclusive
            onChange={(e, newValue) => newValue && setFilteredCategory(newValue)}
            size="small"
          >
            {categories.map(cat => (
              <ToggleButton 
                key={cat} 
                value={cat} 
                sx={{ 
                  textTransform: 'none', 
                  px: 2,
                  color: '#9e9e9e',
                  borderColor: '#2a2a2a',
                  '&.Mui-selected': {
                    background: 'rgba(255, 99, 71, 0.15)',
                    color: '#ff6347',
                    borderColor: '#ff6347',
                    '&:hover': {
                      background: 'rgba(255, 99, 71, 0.2)',
                    },
                  },
                }}
              >
                {cat}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
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
                  sx={{
                    borderRadius: 2,
                    mb: 1.5,
                    p: 2,
                    background: habit.completed ? 'rgba(76, 175, 80, 0.1)' : '#242424',
                    border: habit.completed ? '1px solid rgba(76, 175, 80, 0.3)' : '1px solid #2a2a2a',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      background: habit.completed ? 'rgba(76, 175, 80, 0.15)' : '#2a2a2a',
                      transform: 'translateX(4px)',
                    },
                  }}
                  secondaryAction={
                    <Box>
                      <IconButton 
                        size="small" 
                        onClick={() => {
                          setEditingHabit(habit);
                          setOpenEditDialog(true);
                        }}
                        sx={{ 
                          color: '#9e9e9e',
                          '&:hover': {
                            color: '#ff6347',
                            background: 'rgba(255, 99, 71, 0.1)',
                          }
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteHabit(habit.id)}
                        sx={{ 
                          color: '#9e9e9e',
                          '&:hover': {
                            color: '#f44336',
                            background: 'rgba(244, 67, 54, 0.1)',
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {habit.icon && getIconComponent(habit.icon)}
                  </ListItemIcon>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Checkbox
                      edge="start"
                      checked={habit.completed}
                      onChange={() => handleToggle(habit.id)}
                      icon={<RadioButtonUncheckedIcon />}
                      checkedIcon={<CheckCircleIcon />}
                      sx={{
                        color: '#757575',
                        '&.Mui-checked': {
                          color: '#4caf50',
                        },
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        variant="body1"
                        sx={{
                          textDecoration: habit.completed ? 'line-through' : 'none',
                          color: habit.completed ? '#757575' : '#e0e0e0',
                          fontWeight: habit.completed ? 400 : 500,
                        }}
                      >
                        {habit.label}
                      </Typography>
                    }
                  />
                  <Chip
                    label={habit.category}
                    size="small"
                    sx={{
                      backgroundColor: `${getCategoryColor(habit.category)}20`,
                      color: getCategoryColor(habit.category),
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      mr: 8,
                    }}
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
              elevation={0}
              sx={{
                p: 2,
                mt: 2,
                background: 'rgba(255, 99, 71, 0.15)',
                color: '#ff6347',
                textAlign: 'center',
                borderRadius: 2,
                border: '1px solid rgba(255, 99, 71, 0.3)',
              }}
            >
              <Typography variant="h6" fontWeight={600}>
                Amazing! All habits completed today!
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
            width: { xs: 'calc(100% - 32px)', sm: '100%' },
            background: '#1e1e1e',
            border: '1px solid #2a2a2a',
          }
        }}
      >
        <DialogTitle sx={{ color: '#e0e0e0' }}>Add New Habit</DialogTitle>
        <DialogContent>
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
                fontSize: { xs: '16px', sm: '14px' },
              },
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#ff6347',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#ff6347',
                },
              },
            }}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Category</InputLabel>
            <Select
              value={newHabit.category}
              label="Category"
              onChange={(e) => setNewHabit({ ...newHabit, category: e.target.value })}
            >
              <MenuItem value="Health">Health</MenuItem>
              <MenuItem value="Wellness">Wellness</MenuItem>
              <MenuItem value="Learning">Learning</MenuItem>
              <MenuItem value="Social">Social</MenuItem>
              <MenuItem value="Productivity">Productivity</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 2 } }}>
          <Button onClick={() => setOpenAddDialog(false)} sx={{ minHeight: { xs: 44, sm: 'auto' }, color: '#9e9e9e' }}>Cancel</Button>
          <Button 
            onClick={handleAddHabit} 
            variant="contained" 
            sx={{ 
              minHeight: { xs: 44, sm: 'auto' },
              background: '#ff6347',
              '&:hover': {
                background: '#ff7f5e',
              },
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
        PaperProps={{
          sx: {
            mx: { xs: 2, sm: 3 },
            width: { xs: 'calc(100% - 32px)', sm: '100%' },
            background: '#1e1e1e',
            border: '1px solid #2a2a2a',
          }
        }}
      >
        <DialogTitle sx={{ color: '#e0e0e0' }}>Edit Habit</DialogTitle>
        <DialogContent>
          {editingHabit && (
            <>
              <TextField
                autoFocus
                margin="dense"
                label="Habit Name"
                fullWidth
                value={editingHabit.label}
                onChange={(e) => setEditingHabit({ ...editingHabit, label: e.target.value })}
                sx={{
                  '& input': {
                    fontSize: { xs: '16px', sm: '14px' },
                  },
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#ff6347',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#ff6347',
                    },
                  },
                }}
              />
              <FormControl fullWidth margin="dense">
                <InputLabel>Category</InputLabel>
                <Select
                  value={editingHabit.category}
                  label="Category"
                  onChange={(e) => setEditingHabit({ ...editingHabit, category: e.target.value })}
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
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 2 } }}>
          <Button onClick={() => setOpenEditDialog(false)} sx={{ minHeight: { xs: 44, sm: 'auto' }, color: '#9e9e9e' }}>Cancel</Button>
          <Button 
            onClick={handleEditHabit} 
            variant="contained" 
            sx={{ 
              minHeight: { xs: 44, sm: 'auto' },
              background: '#ff6347',
              '&:hover': {
                background: '#ff7f5e',
              },
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
