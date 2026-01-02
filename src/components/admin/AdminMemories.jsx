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
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  FileDownload as FileDownloadIcon,
  CalendarToday as CalendarTodayIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';

const ITEMS_PER_PAGE = 10;

const AdminMemories = () => {
  const [allMemories, setAllMemories] = useState([]);
  const [filteredMemories, setFilteredMemories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, memory: null, userKey: null });
  const [successMessage, setSuccessMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [availableUsers, setAvailableUsers] = useState([]);

  const loadAllMemories = () => {
    const allKeys = Object.keys(localStorage);
    const memoryKeys = allKeys.filter((key) => key.startsWith('memories_'));
    
    const memories = [];
    const users = new Set();
    
    memoryKeys.forEach((key) => {
      try {
        const userName = key.replace('memories_', '');
        users.add(userName);
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
    setAvailableUsers(Array.from(users).sort());
  };

  useEffect(() => {
    loadAllMemories();
  }, []);

  useEffect(() => {
    let filtered = [...allMemories];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.memory.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.userName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply user filter
    if (selectedUser !== 'all') {
      filtered = filtered.filter((item) => item.userName === selectedUser);
    }

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      let filterDate;
      
      switch (dateFilter) {
        case 'today':
          filterDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          filterDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          filterDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          filterDate = null;
      }

      if (filterDate) {
        filtered = filtered.filter((item) => {
          const memoryDate = new Date(item.memory.timestamp || item.memory.date);
          return memoryDate >= filterDate;
        });
      }
    }

    setFilteredMemories(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchQuery, allMemories, selectedUser, dateFilter]);

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

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedUser('all');
    setDateFilter('all');
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

  // Pagination
  const totalPages = Math.ceil(filteredMemories.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedMemories = filteredMemories.slice(startIndex, endIndex);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
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

      {/* Filters */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterListIcon sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="h6" fontWeight="bold">
            Filters
          </Typography>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
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
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>User</InputLabel>
              <Select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                label="User"
              >
                <MenuItem value="all">All Users</MenuItem>
                {availableUsers.map((user) => (
                  <MenuItem key={user} value={user}>
                    {user}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Time Period</InputLabel>
              <Select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                label="Time Period"
              >
                <MenuItem value="all">All Time</MenuItem>
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="week">Last 7 Days</MenuItem>
                <MenuItem value="month">Last 30 Days</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleResetFilters}
              sx={{ height: '56px' }}
            >
              Reset Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={2}>
        <Box sx={{ p: 2, bgcolor: 'background.default' }}>
          <Typography variant="h6" fontWeight="bold">
            {filteredMemories.length} Memories Found
            {filteredMemories.length !== allMemories.length && ` (of ${allMemories.length} total)`}
          </Typography>
        </Box>
        <Divider />
        <List>
          {paginatedMemories.length === 0 ? (
            <ListItem>
              <ListItemText
                primary="No memories found"
                secondary={
                  filteredMemories.length === 0 && allMemories.length > 0
                    ? 'Try adjusting your filters'
                    : 'Memories will appear here once users start logging them'
                }
              />
            </ListItem>
          ) : (
            paginatedMemories.map((item, index) => (
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
                {index < paginatedMemories.length - 1 && <Divider />}
              </Box>
            ))
          )}
        </List>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <>
            <Divider />
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          </>
        )}
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
