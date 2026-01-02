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
  
  // Initialize email settings once
  const initialEmailSettings = getEmailSettings();
  const [emailSettings, setEmailSettings] = useState(initialEmailSettings);
  const [sendToEmail, setSendToEmail] = useState(initialEmailSettings.enabled); // Auto-enabled when email is set
  const [sendingEmail, setSendingEmail] = useState(false);
  const [tempEmail, setTempEmail] = useState(initialEmailSettings.emailAddress);
  const [tempEnabled, setTempEnabled] = useState(initialEmailSettings.enabled);

  const MotionDiv = motion.div;

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
      const memory = {
        id: Date.now(),
        text: newMemory,
        date: now.toISOString(),
        timestamp: now.toLocaleTimeString(),
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

      const today = new Date().toDateString();
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
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                  ✨📝✨
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
                    color: '#1976d2',
                    '&.Mui-checked': {
                      color: '#1976d2',
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
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                📝
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
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                              sx={{
                                mb: 2,
                                p: 2,
                                borderRadius: 2,
                                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                                border: '2px solid',
                                borderColor: 'primary.light',
                                borderLeftWidth: 6,
                                position: 'relative',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  transform: 'translateX(4px)',
                                  boxShadow: 3,
                                },
                              }}
                            >
                              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                <Box flex={1}>
                                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                                    <Avatar
                                      sx={{
                                        width: 32,
                                        height: 32,
                                        bgcolor: 'primary.main',
                                        fontSize: '1rem',
                                      }}
                                    >
                                      📖
                                    </Avatar>
                                    <Box>
                                      <Box display="flex" gap={1} alignItems="center">
                                        <Chip
                                          icon={<TodayIcon />}
                                          label={memory.date}
                                          size="small"
                                          color="primary"
                                          variant="outlined"
                                          sx={{ fontWeight: 600 }}
                                        />
                                        <Chip
                                          label={memory.timestamp}
                                          size="small"
                                          sx={{
                                            bgcolor: '#e3f2fd',
                                            color: '#1976d2',
                                            fontWeight: 600,
                                          }}
                                        />
                                      </Box>
                                    </Box>
                                  </Box>
                                  <Divider sx={{ my: 1 }} />
                                  <Typography
                                    variant="body1"
                                    sx={{
                                      color: '#333',
                                      lineHeight: 1.6,
                                      whiteSpace: 'pre-wrap',
                                      wordBreak: 'break-word',
                                    }}
                                  >
                                    {memory.text}
                                  </Typography>
                                </Box>
                                <IconButton
                                  aria-label="delete memory"
                                  onClick={() => handleDeleteMemory(memory.id)}
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
            <EmailIcon sx={{ color: '#1976d2' }} />
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
              startAdornment: <span style={{ marginRight: 8 }}>📧</span>
            }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={tempEnabled}
                onChange={(e) => setTempEnabled(e.target.checked)}
                sx={{
                  color: '#1976d2',
                  '&.Mui-checked': {
                    color: '#1976d2',
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
          <Button onClick={handleSaveSettings} variant="contained" sx={{ bgcolor: '#1976d2', minHeight: { xs: 44, sm: 'auto' } }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </MotionDiv>
  );
};

export default MemoryLogger;
