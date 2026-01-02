import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Divider,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  FileDownload as FileDownloadIcon,
  CalendarToday as CalendarTodayIcon,
} from '@mui/icons-material';

const AdminMemories = () => {
  const [allMemories, setAllMemories] = useState([]);
  const [filteredMemories, setFilteredMemories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, memory: null, userKey: null });
  const [successMessage, setSuccessMessage] = useState('');

  const loadAllMemories = () => {
    const allKeys = Object.keys(localStorage);
    const memoryKeys = allKeys.filter((key) => key.startsWith('memories_'));
    
    const memories = [];
    memoryKeys.forEach((key) => {
      try {
        const userName = key.replace('memories_', '');
        const userMemories = JSON.parse(localStorage.getItem(key) || '[]');
        userMemories.forEach((memory) => {
          memories.push({
            userName,
            memory,
            storageKey: key,
          });
        });
      } catch (error) {
        console.error('Error loading memories:', error);
      }
    });

    // Sort by date (most recent first)
    memories.sort((a, b) => {
      const dateA = new Date(a.memory.timestamp || a.memory.date);
      const dateB = new Date(b.memory.timestamp || b.memory.date);
      return dateB - dateA;
    });

    setAllMemories(memories);
    setFilteredMemories(memories);
  };

  useEffect(() => {
    loadAllMemories();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = allMemories.filter(
        (item) =>
          item.memory.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.userName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMemories(filtered);
    } else {
      setFilteredMemories(allMemories);
    }
  }, [searchQuery, allMemories]);

  const handleDeleteMemory = (userKey, memory) => {
    setDeleteDialog({ open: true, memory, userKey });
  };

  const confirmDelete = () => {
    const { userKey, memory } = deleteDialog;
    try {
      const memories = JSON.parse(localStorage.getItem(userKey) || '[]');
      const updatedMemories = memories.filter(
        (m) => {
          // Use id if available (most reliable)
          if (m.id && memory.id) {
            return m.id !== memory.id;
          }
          // Fallback to comparing both timestamp and text for uniqueness
          return !(m.timestamp === memory.timestamp && 
                   (m.text || m.content) === (memory.text || memory.content));
        }
      );
      localStorage.setItem(userKey, JSON.stringify(updatedMemories));
      
      setSuccessMessage('Memory deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      loadAllMemories();
    } catch (error) {
      console.error('Error deleting memory:', error);
    }
    setDeleteDialog({ open: false, memory: null, userKey: null });
  };

  const handleExportAll = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      totalMemories: allMemories.length,
      memories: allMemories,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `all-memories-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    setSuccessMessage('Memories exported successfully');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Memories Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage all user memories
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<FileDownloadIcon />}
          onClick={handleExportAll}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            minHeight: 44,
          }}
        >
          Export All
        </Button>
      </Box>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search memories by text or username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <Paper elevation={2}>
        <Box sx={{ p: 2, bgcolor: 'background.default' }}>
          <Typography variant="h6" fontWeight="bold">
            Total Memories: {filteredMemories.length}
          </Typography>
        </Box>
        <Divider />
        <List>
          {filteredMemories.length === 0 ? (
            <ListItem>
              <ListItemText
                primary="No memories found"
                secondary="Memories will appear here once users start logging them"
              />
            </ListItem>
          ) : (
            filteredMemories.map((item, index) => (
              <Box key={index}>
                <ListItem
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={() => handleDeleteMemory(item.storageKey, item.memory)}
                      sx={{
                        color: 'error.main',
                        minWidth: 44,
                        minHeight: 44,
                      }}
                      aria-label="Delete memory"
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Chip
                          label={item.userName}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        <Chip
                          icon={<CalendarTodayIcon />}
                          label={formatDate(item.memory.timestamp || item.memory.date)}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Typography
                        variant="body2"
                        sx={{
                          mt: 1,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {item.memory.text || item.memory.content || 'No content'}
                      </Typography>
                    }
                  />
                </ListItem>
                {index < filteredMemories.length - 1 && <Divider />}
              </Box>
            ))
          )}
        </List>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, memory: null, userKey: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this memory? This action cannot be undone.
          </Typography>
          {deleteDialog.memory && (
            <Paper sx={{ p: 2, mt: 2, bgcolor: 'background.default' }}>
              <Typography variant="body2">
                {deleteDialog.memory.text || deleteDialog.memory.content}
              </Typography>
            </Paper>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialog({ open: false, memory: null, userKey: null })}
            sx={{ minHeight: 44 }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            sx={{ minHeight: 44 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminMemories;
