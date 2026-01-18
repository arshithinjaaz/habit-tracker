import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Divider,
  Avatar,
  Collapse,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import DeleteIcon from '@mui/icons-material/Delete';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import TodayIcon from '@mui/icons-material/Today';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import EmailIcon from '@mui/icons-material/Email';
import SendIcon from '@mui/icons-material/Send';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { sendMemoryToEmail, getEmailSettings, updateEmailSettings } from '../utils/email';
import { CircularProgress } from '@mui/material';

const MemoryLogger = ({ userName }) => {
  const [memories, setMemories] = useState(() => {
    const saved = localStorage.getItem(`memories_${userName}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [newMemory, setNewMemory] = useState('');
  const [expandedFolders, setExpandedFolders] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [memoryModalOpen, setMemoryModalOpen] = useState(false);
  
  // Initialize email settings once
  const initialEmailSettings = getEmailSettings();
  const [emailSettings, setEmailSettings] = useState(initialEmailSettings);
  const [sendToEmail, setSendToEmail] = useState(initialEmailSettings.enabled); // Auto-enabled when email is set
  const [sendingEmail, setSendingEmail] = useState(false);
  const [tempEmail, setTempEmail] = useState(initialEmailSettings.emailAddress);
  const [tempEnabled, setTempEnabled] = useState(initialEmailSettings.enabled);

  const MotionDiv = motion.div;

  // Format date as "18th January 2026"
  const formatDateWithSuffix = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const suffix = ['th', 'st', 'nd', 'rd'];
    const v = day % 100;
    const daySuffix = suffix[(v - 20) % 10] || suffix[v] || suffix[0];
    const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    return `${day}${daySuffix} ${monthYear}`;
  };

  // Open memory detail modal
  const handleViewMemory = (memory) => {
    setSelectedMemory(memory);
    setMemoryModalOpen(true);
  };

  // Group memories by month and year
  const groupMemoriesByMonth = () => {
    const filtered = searchQuery 
      ? memories.filter(m => m.text.toLowerCase().includes(searchQuery.toLowerCase()))
      : memories;
      
    const grouped = {};
    filtered.forEach((memory) => {
      const date = new Date(memory.date);
      const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(memory);
    });
    return grouped;
  };

  const toggleFolder = (folderKey) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderKey]: !prev[folderKey],
    }));
  };

  const handleExport = () => {
    const dataStr = JSON.stringify({ memories, userName, exportDate: new Date().toISOString() }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `habit-tracker-memories-${userName}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleAddMemory = async () => {
    if (newMemory.trim()) {
      const now = new Date();
      // Get completed habits for today
      const today = new Date().toDateString();
      const savedHabits = localStorage.getItem(`habits_${userName}_${today}`);
      const completedHabits = savedHabits ? JSON.parse(savedHabits).filter(h => h.completed) : [];
      
      const memory = {
        id: Date.now(),
        text: newMemory,
        date: now.toISOString(),
        displayDate: formatDateWithSuffix(now.toISOString()),
        timestamp: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        habits: completedHabits.map(h => ({
          id: h.id,
          label: h.label,
          category: h.category,
          emoji: h.emoji || '✅',
        })),
      };
      
      const updatedMemories = [memory, ...memories];
      setMemories(updatedMemories);
      localStorage.setItem(`memories_${userName}`, JSON.stringify(updatedMemories));
      
      // Send email automatically if enabled
      if (emailSettings.enabled && sendToEmail) {
        setSendingEmail(true);
        const result = await sendMemoryToEmail(memory, userName, emailSettings.emailAddress);
        setSendingEmail(false);
        
        if (!result.success) {
          alert(`⚠️ ${result.error}`);
        }
      }
      
      setNewMemory('');
      setSendToEmail(emailSettings.enabled); // Keep enabled for next memory
      setShowSuccessAnimation(true);
      setTimeout(() => setShowSuccessAnimation(false), 2000);

      localStorage.removeItem(`habits_${userName}_${today}`);
      window.dispatchEvent(new Event('habitsReset'));
    }
  };

  const handleDeleteMemory = (id) => {
    const updatedMemories = memories.filter((m) => m.id !== id);
    setMemories(updatedMemories);
    localStorage.setItem(`memories_${userName}`, JSON.stringify(updatedMemories));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddMemory();
    }
  };

  const handleSaveSettings = () => {
    updateEmailSettings(tempEmail, tempEnabled);
    setEmailSettings(getEmailSettings());
    setSettingsOpen(false);
  };

  const handleOpenSettings = () => {
    const currentSettings = getEmailSettings();
    setTempEmail(currentSettings.emailAddress);
    setTempEnabled(currentSettings.enabled);
    setSettingsOpen(true);
  };

  return (
    <MotionDiv
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* Success Animation */}
      <AnimatePresence>
        {showSuccessAnimation && (
          <motion.div
            initial={{ scale: 0, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 9999,
            }}
          >
            <Paper
              elevation={10}
              sx={{
                p: 4,
                borderRadius: 4,
                background: '#1e1e1e',
                color: 'white',
                textAlign: 'center',
                minWidth: 300,
              }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 3 }}
              >
                <Typography variant="h3" sx={{ mb: 1 }}>
                  ✨✨
                </Typography>
              </motion.div>
              <Typography variant="h6" fontWeight="bold">
                Memory Saved!
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                Habits reset for a fresh start
              </Typography>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

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
        <Box display="flex" alignItems="center" gap={1} mb={3} flexWrap="wrap">
          <NoteAddIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h5" fontWeight="bold" sx={{ flex: { xs: '1 1 100%', sm: '0 1 auto' } }}>
            Daily Memories
          </Typography>
          <Box sx={{ ml: { xs: 0, sm: 'auto' }, display: 'flex', alignItems: 'center', gap: 1, width: { xs: '100%', sm: 'auto' } }}>
            <Button
              startIcon={<SettingsIcon />}
              onClick={handleOpenSettings}
              variant="outlined"
              size="small"
              sx={{ 
                minHeight: { xs: 44, sm: 'auto' },
                flex: { xs: 1, sm: '0 1 auto' }
              }}
            >
              Email
            </Button>
            <Button
              startIcon={<FileDownloadIcon />}
              onClick={handleExport}
              variant="outlined"
              size="small"
              disabled={memories.length === 0}
              sx={{ 
                minHeight: { xs: 44, sm: 'auto' },
                flex: { xs: 1, sm: '0 1 auto' }
              }}
            >
              Export
            </Button>
          </Box>
        </Box>

        {/* Search Bar */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search memories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ 
            mb: 2,
            '& input': {
              fontSize: { xs: '16px', sm: '14px' }, // Prevents iOS zoom
            }
          }}
        />

        <Box mb={3}>
          <TextField
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            label="What's on your mind today?"
            value={newMemory}
            onChange={(e) => setNewMemory(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Write about your day, feelings, or achievements..."
            sx={{ 
              mb: 2,
              '& textarea': {
                fontSize: { xs: '16px', sm: '14px' }, // Prevents iOS zoom
              }
            }}
            inputProps={{
              'aria-label': 'Memory text input',
            }}
          />
          {emailSettings.enabled && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={sendToEmail}
                  onChange={(e) => setSendToEmail(e.target.checked)}
                  icon={<EmailIcon />}
                  checkedIcon={<EmailIcon />}
                  sx={{
                    color: '#ff6347',
                    '&.Mui-checked': {
                      color: '#ff6347',
                    },
                  }}
                />
              }
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body2">Send to Email</Typography>
                  <Chip
                    label={emailSettings.emailAddress}
                    size="small"
                    sx={{ fontSize: '0.7rem' }}
                  />
                </Box>
              }
              sx={{ mb: 1 }}
            />
          )}
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleAddMemory}
            disabled={!newMemory.trim() || sendingEmail}
            startIcon={sendingEmail ? <CircularProgress size={20} color="inherit" /> : <NoteAddIcon />}
            aria-label="Add memory"
            sx={{
              minHeight: { xs: 48, sm: 44 },
              fontSize: { xs: '16px', sm: '15px' },
              py: { xs: 1.5, sm: 1.25 }
            }}
          >
            {sendingEmail ? 'Sending Email...' : 'Add Memory'}
          </Button>
        </Box>

        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <AutoAwesomeIcon color="primary" />
          Recent Memories ({memories.length})
        </Typography>

        <Box sx={{ maxHeight: 450, overflow: 'auto', pr: 1 }}>
          {memories.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 4,
                textAlign: 'center',
                background: '#2a2a2a',
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                
              </Typography>
              <Typography variant="body1" color="text.secondary">
                No memories yet. Start capturing your precious moments!
              </Typography>
            </Paper>
          ) : (
            <AnimatePresence>
              {Object.entries(groupMemoriesByMonth()).map(([monthYear, monthMemories]) => (
                <MotionDiv
                  key={monthYear}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Folder Header */}
                  <Paper
                    elevation={3}
                    sx={{
                      mb: 2,
                      borderRadius: 2,
                      overflow: 'hidden',
                      background: '#1e1e1e',
                    }}
                  >
                    <Box
                      onClick={() => toggleFolder(monthYear)}
                      sx={{
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={1.5}>
                        {expandedFolders[monthYear] ? (
                          <FolderOpenIcon sx={{ fontSize: 32, color: 'white' }} />
                        ) : (
                          <FolderIcon sx={{ fontSize: 32, color: 'white' }} />
                        )}
                        <Box>
                          <Typography variant="h6" fontWeight="bold" sx={{ color: 'white' }}>
                            {monthYear}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                            {monthMemories.length} {monthMemories.length === 1 ? 'memory' : 'memories'}
                          </Typography>
                        </Box>
                      </Box>
                      <IconButton sx={{ color: 'white' }}>
                        {expandedFolders[monthYear] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </Box>

                    {/* Folder Contents */}
                    <Collapse in={expandedFolders[monthYear]} timeout="auto" unmountOnExit>
                      <Box sx={{ bgcolor: 'rgba(255, 255, 255, 0.95)', p: 2 }}>
                        {monthMemories.map((memory, index) => (
                          <MotionDiv
                            key={memory.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                          >
                            <Paper
                              elevation={1}
                              onClick={() => handleViewMemory(memory)}
                              sx={{
                                mb: 2,
                                p: 2,
                                borderRadius: 2,
                                background: 'linear-gradient(135deg, #2a2a2a 0%, #1e1e1e 100%)',
                                border: '2px solid',
                                borderColor: 'rgba(255, 99, 71, 0.3)',
                                borderLeftWidth: 6,
                                borderLeftColor: '#ff6347',
                                position: 'relative',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                  transform: 'translateX(8px) translateY(-2px)',
                                  boxShadow: '0 8px 24px rgba(255, 99, 71, 0.3)',
                                  borderColor: '#ff6347',
                                },
                              }}
                            >
                              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                <Box flex={1}>
                                  <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                                    <Avatar
                                      sx={{
                                        width: 36,
                                        height: 36,
                                        bgcolor: 'linear-gradient(135deg, #ff6347, #ff8570)',
                                        background: 'linear-gradient(135deg, #ff6347, #ff8570)',
                                        fontSize: '1.2rem',
                                      }}
                                    >
                                      📝
                                    </Avatar>
                                    <Box>
                                      <Typography
                                        variant="subtitle2"
                                        sx={{
                                          color: '#ff6347',
                                          fontWeight: 700,
                                          fontSize: '0.95rem',
                                        }}
                                      >
                                        {memory.displayDate || formatDateWithSuffix(memory.date)}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          color: 'rgba(255, 255, 255, 0.6)',
                                          fontSize: '0.75rem',
                                        }}
                                      >
                                        {memory.timestamp}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: 'rgba(255, 255, 255, 0.85)',
                                      lineHeight: 1.6,
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                    }}
                                  >
                                    {memory.text}
                                  </Typography>
                                </Box>
                                <IconButton
                                  aria-label="delete memory"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteMemory(memory.id);
                                  }}
                                  sx={{
                                    color: 'error.main',
                                    '&:hover': {
                                      bgcolor: 'error.light',
                                      color: 'white',
                                    },
                                  }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                              <Box
                                sx={{
                                  position: 'absolute',
                                  bottom: 8,
                                  right: 8,
                                  opacity: 0.3,
                                }}
                              >
                                <FavoriteIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                              </Box>
                            </Paper>
                          </MotionDiv>
                        ))}
                      </Box>
                    </Collapse>
                  </Paper>
                </MotionDiv>
              ))}
            </AnimatePresence>
          )}
        </Box>
      </Paper>

      {/* Email Settings Dialog */}
      <Dialog 
        open={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            mx: { xs: 2, sm: 3 },
            width: { xs: 'calc(100% - 32px)', sm: '100%' }
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <EmailIcon sx={{ color: '#ff6347' }} />
            <Typography variant="h6">Email Settings</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            placeholder="your@example.com"
            value={tempEmail}
            onChange={(e) => setTempEmail(e.target.value)}
            helperText="Receive automatic memory backups via email"
            sx={{ 
              mt: 2, 
              mb: 2,
              '& input': {
                fontSize: { xs: '16px', sm: '14px' }, // Prevents iOS zoom
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ color: '#ff6347' }} />
                </InputAdornment>
              )
            }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={tempEnabled}
                onChange={(e) => setTempEnabled(e.target.checked)}
                sx={{
                  color: '#ff6347',
                  '&.Mui-checked': {
                    color: '#ff6347',
                  },
                }}
              />
            }
            label="Enable email memory backup"
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
            When enabled, you can choose to send each memory to your email address as a backup.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 2 } }}>
          <Button onClick={() => setSettingsOpen(false)} sx={{ minHeight: { xs: 44, sm: 'auto' } }}>Cancel</Button>
          <Button onClick={handleSaveSettings} variant="contained" sx={{ bgcolor: '#ff6347', minHeight: { xs: 44, sm: 'auto' } }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Memory Detail Popup Modal */}
      <Dialog
        open={memoryModalOpen}
        onClose={() => setMemoryModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          component: motion.div,
          initial: { scale: 0.8, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          exit: { scale: 0.8, opacity: 0 },
          transition: { duration: 0.3, type: 'spring', damping: 20, stiffness: 300 },
          sx: {
            borderRadius: 4,
            background: 'linear-gradient(145deg, #1e1e1e 0%, #2a2a2a 100%)',
            border: '2px solid #ff6347',
            boxShadow: '0 20px 60px rgba(255, 99, 71, 0.4)',
            overflow: 'hidden',
          },
        }}
      >
        {selectedMemory && (
          <>
            {/* Header with gradient */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #ff6347 0%, #ff8570 100%)',
                p: 3,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Decorative circles */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -50,
                  right: -50,
                  width: 150,
                  height: 150,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -30,
                  left: -30,
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                }}
              />

              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        bgcolor: 'white',
                        color: '#ff6347',
                        fontSize: '2rem',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                      }}
                    >
                      📝
                    </Avatar>
                    <Box>
                      <Typography
                        variant="h5"
                        sx={{
                          color: 'white',
                          fontWeight: 800,
                          textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                        }}
                      >
                        Memory Details
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.9)',
                          fontSize: '0.9rem',
                        }}
                      >
                        {selectedMemory.displayDate || formatDateWithSuffix(selectedMemory.date)}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton
                    onClick={() => setMemoryModalOpen(false)}
                    sx={{
                      color: 'white',
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.3)',
                        transform: 'rotate(90deg)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
              </Box>
            </Box>

            {/* Content */}
            <DialogContent sx={{ p: 3, bgcolor: '#2a2a2a' }}>
              {/* Time Badge */}
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  bgcolor: 'rgba(255, 99, 71, 0.15)',
                  px: 2,
                  py: 1,
                  borderRadius: 3,
                  mb: 3,
                  border: '1px solid rgba(255, 99, 71, 0.3)',
                }}
              >
                <AccessTimeIcon sx={{ color: '#ff6347', fontSize: 20 }} />
                <Typography sx={{ color: '#ff6347', fontWeight: 600, fontSize: '0.9rem' }}>
                  {selectedMemory.timestamp}
                </Typography>
              </Box>

              {/* Memory Content */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #1a1a1a 0%, #252525 100%)',
                  border: '1px solid rgba(255, 99, 71, 0.2)',
                  mb: 3,
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.95)',
                    lineHeight: 1.8,
                    fontSize: '1.05rem',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {selectedMemory.text}
                </Typography>
              </Paper>

              {/* Completed Habits Section */}
              {selectedMemory.habits && selectedMemory.habits.length > 0 && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #2a1a1a 0%, #1a2525 100%)',
                    border: '1px solid rgba(255, 99, 71, 0.3)',
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <Typography
                      variant="h6"
                      sx={{
                        color: '#ff6347',
                        fontWeight: 700,
                        fontSize: '1.1rem',
                      }}
                    >
                      ✅ Completed Habits
                    </Typography>
                    <Chip
                      label={selectedMemory.habits.length}
                      size="small"
                      sx={{
                        bgcolor: '#ff6347',
                        color: 'white',
                        fontWeight: 700,
                        minWidth: 32,
                      }}
                    />
                  </Box>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                      gap: 1.5,
                    }}
                  >
                    {selectedMemory.habits.map((habit, index) => (
                      <Box
                        key={habit.id}
                        component={motion.div}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          p: 1.5,
                          borderRadius: 2,
                          background: 'rgba(255, 99, 71, 0.1)',
                          border: '1px solid rgba(255, 99, 71, 0.2)',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            background: 'rgba(255, 99, 71, 0.15)',
                            transform: 'translateX(4px)',
                          },
                        }}
                      >
                        <Box
                          sx={{
                            fontSize: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: 'rgba(255, 99, 71, 0.2)',
                          }}
                        >
                          {habit.emoji}
                        </Box>
                        <Box flex={1}>
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'rgba(255, 255, 255, 0.95)',
                              fontWeight: 600,
                              fontSize: '0.9rem',
                              lineHeight: 1.3,
                            }}
                          >
                            {habit.label}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'rgba(255, 255, 255, 0.5)',
                              fontSize: '0.75rem',
                            }}
                          >
                            {habit.category}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              )}

              {/* Memory ID Badge */}
              <Box
                sx={{
                  mt: 3,
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <Chip
                  label={`ID: ${selectedMemory.id}`}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                  }}
                />
              </Box>
            </DialogContent>

            {/* Footer Actions */}
            <Box
              sx={{
                p: 2,
                bgcolor: '#1e1e1e',
                borderTop: '1px solid rgba(255, 99, 71, 0.2)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 1,
              }}
            >
              <Button
                onClick={() => setMemoryModalOpen(false)}
                variant="contained"
                sx={{
                  bgcolor: '#ff6347',
                  minHeight: { xs: 44, sm: 36 },
                  borderRadius: 2,
                  px: 4,
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(255, 99, 71, 0.3)',
                  '&:hover': {
                    bgcolor: '#ff4500',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 16px rgba(255, 99, 71, 0.4)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Close
              </Button>
            </Box>
          </>
        )}
      </Dialog>
    </MotionDiv>
  );
};

export default MemoryLogger;
