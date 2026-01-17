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
                borderRadius: 3,
                background: '#1e1e1e',
                border: '2px solid #ff6347',
                color: '#e0e0e0',
                textAlign: 'center',
                minWidth: 300,
              }}
            >
              <Typography variant="h6" fontWeight={600} color="#ff6347">
                Memory Saved!
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, color: '#9e9e9e' }}>
                Habits reset for a fresh start
              </Typography>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

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
        <Box display="flex" alignItems="center" gap={1} mb={3} flexWrap="wrap">
          <NoteAddIcon sx={{ fontSize: 32, color: '#ff6347' }} />
          <Typography variant="h5" fontWeight={600} color="#e0e0e0" sx={{ flex: { xs: '1 1 100%', sm: '0 1 auto' } }}>
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
              py: { xs: 1.5, sm: 1.25 },
              background: '#ff6347',
              '&:hover': {
                background: '#ff7f5e',
              },
              '&:disabled': {
                background: '#2a2a2a',
              },
            }}
          >
            {sendingEmail ? 'Sending Email...' : 'Add Memory'}
          </Button>
        </Box>

        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: '#e0e0e0' }}>
          <AutoAwesomeIcon sx={{ color: '#ff6347' }} />
          Recent Memories ({memories.length})
        </Typography>

        <Box sx={{ maxHeight: 450, overflow: 'auto', pr: 1 }}>
          {memories.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 4,
                textAlign: 'center',
                background: '#242424',
                border: '1px solid #2a2a2a',
                borderRadius: 2,
              }}
            >
              <NoteAddIcon sx={{ fontSize: 48, color: '#9e9e9e', mb: 1 }} />
              <Typography variant="body1" color="#9e9e9e">
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
                    elevation={0}
                    sx={{
                      mb: 2,
                      borderRadius: 2,
                      overflow: 'hidden',
                      background: '#242424',
                      border: '1px solid #2a2a2a',
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
                          backgroundColor: 'rgba(255, 99, 71, 0.1)',
                        },
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={1.5}>
                        {expandedFolders[monthYear] ? (
                          <FolderOpenIcon sx={{ fontSize: 32, color: '#ff6347' }} />
                        ) : (
                          <FolderIcon sx={{ fontSize: 32, color: '#ff6347' }} />
                        )}
                        <Box>
                          <Typography variant="h6" fontWeight={600} sx={{ color: '#e0e0e0' }}>
                            {monthYear}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#9e9e9e' }}>
                            {monthMemories.length} {monthMemories.length === 1 ? 'memory' : 'memories'}
                          </Typography>
                        </Box>
                      </Box>
                      <IconButton sx={{ color: '#9e9e9e' }}>
                        {expandedFolders[monthYear] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </Box>

                    {/* Folder Contents */}
                    <Collapse in={expandedFolders[monthYear]} timeout="auto" unmountOnExit>
                      <Box sx={{ bgcolor: '#1e1e1e', p: 2 }}>
                        {monthMemories.map((memory, index) => (
                          <MotionDiv
                            key={memory.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                          >
                            <Paper
                              elevation={0}
                              sx={{
                                mb: 2,
                                p: 2,
                                borderRadius: 2,
                                background: '#242424',
                                border: '2px solid #2a2a2a',
                                borderLeftColor: '#ff6347',
                                borderLeftWidth: 4,
                                position: 'relative',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  transform: 'translateX(4px)',
                                  borderLeftColor: '#ff7f5e',
                                },
                              }}
                            >
                              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                <Box flex={1}>
                                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                                    <Box>
                                      <Box display="flex" gap={1} alignItems="center">
                                        <Chip
                                          icon={<TodayIcon />}
                                          label={memory.date}
                                          size="small"
                                          sx={{ 
                                            fontWeight: 600,
                                            background: 'rgba(255, 99, 71, 0.15)',
                                            color: '#ff6347',
                                            border: '1px solid rgba(255, 99, 71, 0.3)',
                                          }}
                                        />
                                        <Chip
                                          label={memory.timestamp}
                                          size="small"
                                          sx={{
                                            bgcolor: '#2a2a2a',
                                            color: '#9e9e9e',
                                            fontWeight: 600,
                                          }}
                                        />
                                      </Box>
                                    </Box>
                                  </Box>
                                  <Divider sx={{ my: 1, borderColor: '#2a2a2a' }} />
                                  <Typography
                                    variant="body1"
                                    sx={{
                                      color: '#e0e0e0',
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
                                    color: '#9e9e9e',
                                    '&:hover': {
                                      bgcolor: 'rgba(244, 67, 54, 0.1)',
                                      color: '#f44336',
                                    },
                                  }}
                                >
                                  <DeleteIcon />
                                </IconButton>
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
            width: { xs: 'calc(100% - 32px)', sm: '100%' },
            background: '#1e1e1e',
            border: '1px solid #2a2a2a',
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <EmailIcon sx={{ color: '#ff6347' }} />
            <Typography variant="h6" color="#e0e0e0">Email Settings</Typography>
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
            InputProps={{
              startAdornment: <EmailIcon sx={{ mr: 1, color: '#9e9e9e' }} />
            }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={tempEnabled}
                onChange={(e) => setTempEnabled(e.target.checked)}
                sx={{
                  color: '#9e9e9e',
                  '&.Mui-checked': {
                    color: '#ff6347',
                  },
                }}
              />
            }
            label="Enable email memory backup"
          />
          <Typography variant="caption" color="#9e9e9e" sx={{ display: 'block', mt: 2 }}>
            When enabled, you can choose to send each memory to your email address as a backup.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 2 } }}>
          <Button onClick={() => setSettingsOpen(false)} sx={{ minHeight: { xs: 44, sm: 'auto' }, color: '#9e9e9e' }}>Cancel</Button>
          <Button 
            onClick={handleSaveSettings} 
            variant="contained" 
            sx={{ 
              bgcolor: '#ff6347', 
              minHeight: { xs: 44, sm: 'auto' },
              '&:hover': {
                bgcolor: '#ff7f5e',
              },
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </MotionDiv>
  );
};

export default MemoryLogger;
