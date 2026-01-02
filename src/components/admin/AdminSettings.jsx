import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
  Chip,
} from '@mui/material';
import {
  FileDownload as FileDownloadIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';

const AdminSettings = () => {
  const [dataSize, setDataSize] = useState(0);
  const [emailBackupStatus, setEmailBackupStatus] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const calculateDataSize = () => {
    let totalSize = 0;
    for (let key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        totalSize += localStorage[key].length + key.length;
      }
    }
    // Convert to KB
    setDataSize((totalSize / 1024).toFixed(2));
  };

  const checkEmailBackupStatus = () => {
    const allKeys = Object.keys(localStorage);
    const emailSettings = allKeys
      .filter((key) => key.includes('emailSettings'))
      .map((key) => {
        try {
          const settings = JSON.parse(localStorage.getItem(key) || '{}');
          const userName = key.replace('emailSettings_', '');
          return {
            userName,
            enabled: settings.autoBackup || false,
            email: settings.email || 'Not set',
            lastBackup: settings.lastBackupDate || 'Never',
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    setEmailBackupStatus(emailSettings);
  };

  useEffect(() => {
    calculateDataSize();
    checkEmailBackupStatus();
  }, []);

  const handleExportAllData = () => {
    const allData = {};
    for (let key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        try {
          allData[key] = JSON.parse(localStorage[key]);
        } catch {
          allData[key] = localStorage[key];
        }
      }
    }

    const exportData = {
      exportDate: new Date().toISOString(),
      dataSize: `${dataSize} KB`,
      data: allData,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `habit-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    setSuccessMessage('All data exported successfully');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleClearAllData = () => {
    setConfirmDialog({ open: true, action: 'clear' });
  };

  const confirmClearData = () => {
    try {
      // Keep only essential data like dark mode preference and admin session
      const darkMode = localStorage.getItem('darkMode');
      const adminSession = sessionStorage.getItem('admin_session');
      
      localStorage.clear();
      
      if (darkMode) {
        localStorage.setItem('darkMode', darkMode);
      }
      // Restore admin session to prevent logout
      if (adminSession) {
        sessionStorage.setItem('admin_session', adminSession);
      }
      
      setSuccessMessage('All data cleared successfully. Admin session maintained.');
      setTimeout(() => setSuccessMessage(''), 3000);
      calculateDataSize();
      checkEmailBackupStatus();
    } catch (error) {
      setErrorMessage('Error clearing data: ' + error.message);
      setTimeout(() => setErrorMessage(''), 3000);
    }
    setConfirmDialog({ open: false, action: null });
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        System Settings
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Manage system data and configurations
      </Typography>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMessage('')}>
          {errorMessage}
        </Alert>
      )}

      {/* Data Size */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <StorageIcon sx={{ color: '#667eea', mr: 1 }} />
          <Typography variant="h6" fontWeight="bold">
            Data Storage
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" mb={2}>
          Total storage used: <strong>{dataSize} KB</strong>
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportAllData}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              minHeight: 44,
            }}
          >
            Export All Data
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleClearAllData}
            sx={{ minHeight: 44 }}
          >
            Clear All Data
          </Button>
        </Box>
      </Paper>

      {/* Email Backup Status */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <EmailIcon sx={{ color: '#667eea', mr: 1 }} />
          <Typography variant="h6" fontWeight="bold">
            Email Backup Status
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        
        {emailBackupStatus.length === 0 ? (
          <Typography color="text.secondary">
            No email backups configured
          </Typography>
        ) : (
          <List>
            {emailBackupStatus.map((status, index) => (
              <Box key={index}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="body1" fontWeight="bold">
                          {status.userName}
                        </Typography>
                        <Chip
                          label={status.enabled ? 'Enabled' : 'Disabled'}
                          size="small"
                          color={status.enabled ? 'success' : 'default'}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Email: {status.email}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Last Backup: {status.lastBackup}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < emailBackupStatus.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        )}
      </Paper>

      {/* Confirm Clear Dialog */}
      <Dialog
        open={confirmDialog.open && confirmDialog.action === 'clear'}
        onClose={() => setConfirmDialog({ open: false, action: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Clear All Data</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone!
          </Alert>
          <Typography>
            Are you sure you want to clear all data? This will remove:
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="• All user accounts" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• All memories" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• All habit data" />
            </ListItem>
            <ListItem>
              <ListItemText primary="• All settings and preferences" />
            </ListItem>
          </List>
          <Typography variant="body2" color="error" fontWeight="bold" mt={2}>
            Please export your data before proceeding if you want to keep a backup.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDialog({ open: false, action: null })}
            sx={{ minHeight: 44 }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmClearData}
            color="error"
            variant="contained"
            sx={{ minHeight: 44 }}
          >
            Clear All Data
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminSettings;
