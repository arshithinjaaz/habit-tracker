import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  List,
  Toolbar,
  Typography,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Photo as PhotoIcon,
  CheckCircle as CheckCircleIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { clearAdminSession } from '../../utils/adminAuth';

const AdminSidebar = ({ onItemClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleLogout = () => {
    clearAdminSession();
    navigate('/admin');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
    { text: 'Memories', icon: <PhotoIcon />, path: '/admin/memories' },
    { text: 'Habits', icon: <CheckCircleIcon />, path: '/admin/habits' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/admin/settings' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile && onItemClick) {
      onItemClick();
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Toolbar
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          minHeight: { xs: 56, sm: 64 },
        }}
      >
        <Typography variant="h6" noWrap component="div" fontWeight="bold">
          Admin Panel
        </Typography>
      </Toolbar>

      {/* Navigation Menu */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  minHeight: 48,
                  px: 2.5,
                  '&.Mui-selected': {
                    background: 'linear-gradient(135deg, rgba(102,126,234,0.15) 0%, rgba(118,75,162,0.15) 100%)',
                    borderRight: '4px solid #667eea',
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(102,126,234,0.2) 0%, rgba(118,75,162,0.2) 100%)',
                    },
                  },
                  '&:hover': {
                    background: 'rgba(102,126,234,0.08)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: location.pathname === item.path ? '#667eea' : 'text.secondary',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: location.pathname === item.path ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Bottom Actions */}
      <Box sx={{ p: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <ListItemButton
          onClick={() => handleNavigation('/')}
          sx={{
            minHeight: 48,
            borderRadius: 2,
            mb: 1,
            '&:hover': {
              bgcolor: 'rgba(102,126,234,0.08)',
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="Back to App" />
        </ListItemButton>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            minHeight: 48,
            borderRadius: 2,
            color: 'error.main',
            '&:hover': {
              bgcolor: 'rgba(244, 67, 54, 0.08)',
            },
          }}
        >
          <ListItemIcon sx={{ color: 'error.main', minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </Box>
    </Box>
  );
};

export default AdminSidebar;
