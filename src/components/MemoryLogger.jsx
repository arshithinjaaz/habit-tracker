import { useState, useEffect } from 'react';
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
  CircularProgress,
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
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import { firestore } from '../config/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';

const MemoryLogger = ({ userName }) => {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMemory, setNewMemory] = useState('');
  const [expandedFolders, setExpandedFolders] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [syncStatus, setSyncStatus] = useState('synced'); // 'syncing', 'synced', 'offline'

  const MotionDiv = motion.div;

  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  // Load memories from Firestore on mount
  useEffect(() => {
    const loadMemories = async () => {
      try {
        // Try to load from Firestore
        const q = query(
          collection(firestore, 'memories'),
          where('userName', '==', userName),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const firestoreMemories = querySnapshot.docs.map(doc => ({
          firestoreId: doc.id,
          ...doc.data()
        }));
        
        if (firestoreMemories.length > 0) {
          setMemories(firestoreMemories);
          // Update localStorage with cloud data
          localStorage.setItem(`memories_${userName}`, JSON.stringify(firestoreMemories));
          setSyncStatus('synced');
        } else {
          // Fallback to localStorage if no cloud data
          const saved = localStorage.getItem(`memories_${userName}`);
          setMemories(saved ? JSON.parse(saved) : []);
          setSyncStatus('synced');
        }
      } catch (error) {
        console.error('Error loading from Firestore:', error);
        // Fallback to localStorage
        const saved = localStorage.getItem(`memories_${userName}`);
        setMemories(saved ? JSON.parse(saved) : []);
        setSyncStatus('offline');
      } finally {
        setLoading(false);
      }
    };

    loadMemories();
  }, [userName]);

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
        userName: userName,
        createdAt: now.toISOString()
      };

      try {
        setSyncStatus('syncing');
        // Save to Firestore cloud
        await addDoc(collection(firestore, 'memories'), memory);
        
        // Also save to localStorage as backup
        const updatedMemories = [memory, ...memories];
        setMemories(updatedMemories);
        localStorage.setItem(`memories_${userName}`, JSON.stringify(updatedMemories));
        
        setNewMemory('');
        setShowSuccessAnimation(true);
        setTimeout(() => setShowSuccessAnimation(false), 2000);
        setSyncStatus('synced');

        // Reset today's habits
        const today = new Date().toDateString();
        localStorage.removeItem(`habits_${userName}_${today}`);
        window.dispatchEvent(new Event('habitsReset'));
        
      } catch (error) {
        console.error('Error saving to Firestore:', error);
        // Fallback to localStorage only if cloud fails
        const updatedMemories = [memory, ...memories];
        setMemories(updatedMemories);
        localStorage.setItem(`memories_${userName}`, JSON.stringify(updatedMemories));
        setSyncStatus('offline');
        alert('Saved locally. Cloud backup failed - check internet connection.');
        setNewMemory('');
        setShowSuccessAnimation(true);
        setTimeout(() => setShowSuccessAnimation(false), 2000);
      }
    }
  };

  const handleDeleteMemory = async (id, firestoreId) => {
    try {
      // Delete from Firestore if firestoreId exists
      if (firestoreId) {
        await deleteDoc(doc(firestore, 'memories', firestoreId));
      }
      
      // Delete from local state and localStorage
      const updatedMemories = memories.filter((m) => m.id !== id);
      setMemories(updatedMemories);
      localStorage.setItem(`memories_${userName}`, JSON.stringify(updatedMemories));
    } catch (error) {
      console.error('Error deleting from Firestore:', error);
      alert('Failed to delete from cloud. Removed locally.');
      // Still remove from local state even if cloud fails
      const updatedMemories = memories.filter((m) => m.id !== id);
      setMemories(updatedMemories);
      localStorage.setItem(`memories_${userName}`, JSON.stringify(updatedMemories));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddMemory();
    }
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading memories from cloud...</Typography>
      </Paper>
    );
  }

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
        <Box display="flex" alignItems="center" gap={1} mb={3}>
          <NoteAddIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h5" fontWeight="bold">
            Daily Memories
          </Typography>
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
            {syncStatus === 'syncing' && (
              <>
                <CircularProgress size={20} />
                <Typography variant="caption" color="text.secondary">
                  Syncing...
                </Typography>
              </>
            )}
            {syncStatus === 'synced' && (
              <>
                <CloudDoneIcon color="success" />
                <Typography variant="caption" color="success.main">
                  Synced
                </Typography>
              </>
            )}
            {syncStatus === 'offline' && (
              <>
                <CloudOffIcon color="error" />
                <Typography variant="caption" color="error.main">
                  Offline
                </Typography>
              </>
            )}
            <Button
              startIcon={<FileDownloadIcon />}
              onClick={handleExport}
              variant="outlined"
              size="small"
              disabled={memories.length === 0}
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
          sx={{ mb: 2 }}
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
            sx={{ mb: 2 }}
            inputProps={{
              'aria-label': 'Memory text input',
            }}
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleAddMemory}
            disabled={!newMemory.trim()}
            startIcon={<NoteAddIcon />}
            aria-label="Add memory"
          >
            Add Memory
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
                                  onClick={() => handleDeleteMemory(memory.id, memory.firestoreId)}
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
    </MotionDiv>
  );
};

export default MemoryLogger;
