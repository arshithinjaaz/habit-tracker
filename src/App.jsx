import { Container, CssBaseline, ThemeProvider, createTheme, Box, Typography, Link, Button, useMediaQuery, Paper } from '@mui/material';
import { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import WelcomeScreen from './components/WelcomeScreen';
import MemoryLogger from './components/MemoryLogger';
import ProgressGraph from './components/ProgressGraph';
import HabitCheckbox from './components/HabitCheckbox';
import Onboarding from './components/Onboarding';
import QuoteOfTheDay from './components/QuoteOfTheDay';
import AdminLogin from './components/admin/AdminLogin';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminMemories from './components/admin/AdminMemories';
import AdminHabits from './components/admin/AdminHabits';
import AdminSettings from './components/admin/AdminSettings';
import ProtectedAdminRoute from './components/admin/ProtectedAdminRoute';
import GitHubIcon from '@mui/icons-material/GitHub';
import LogoutIcon from '@mui/icons-material/Logout';

const getTheme = (mode) => createTheme({
  palette: {
    mode: 'dark', // Always dark theme
    primary: {
      main: '#ff6347', // Orange accent
    },
    secondary: {
      main: '#ff7f5e',
    },
    background: {
      default: '#0f0f0f',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#e0e0e0',
      secondary: '#9e9e9e',
    },
    success: {
      main: '#4caf50',
    },
    error: {
      main: '#f44336',
    },
    divider: '#2a2a2a',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      fontSize: '24px',
    },
    h5: {
      fontWeight: 600,
      fontSize: '20px',
    },
    h6: {
      fontWeight: 500,
      fontSize: '18px',
    },
    body1: {
      fontSize: '16px',
      fontWeight: 400,
    },
    body2: {
      fontSize: '14px',
      fontWeight: 400,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
        },
        contained: {
          backgroundColor: '#ff6347',
          '&:hover': {
            backgroundColor: '#ff7f5e',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundImage: 'none',
        },
      },
    },
  },
});

function MainApp() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginMode, setLoginMode] = useState('initial');
  const [habitProgress, setHabitProgress] = useState(0);
  const [hollaMood, setHollaMood] = useState('happy');
  const [hollaMessage, setHollaMessage] = useState("Let's build great habits together!");
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('onboardingCompleted');
  });

  const theme = useMemo(() => getTheme('dark'), []); // Always use dark theme
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Check for existing user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('habitTracker_currentUser');
    if (savedUser) {
      setCurrentUser(savedUser);
      // User exists but not authenticated yet - require PIN login
      setIsAuthenticated(false);
      setLoginMode('login');
    }
  }, []);

  // Handle successful login
  const handleLoginSuccess = (name) => {
    setCurrentUser(name);
    setIsAuthenticated(true);
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setLoginMode('login');
  };

  // Update message based on habit progress (no emojis)
  useEffect(() => {
    if (habitProgress === 100) {
      setHollaMood('excited');
      setHollaMessage("Amazing! You completed everything today!");
    } else if (habitProgress >= 70) {
      setHollaMood('proud');
      setHollaMessage("You're doing fantastic! Keep up the great work!");
    } else if (habitProgress >= 40) {
      setHollaMood('encouraging');
      setHollaMessage("Great progress! You're on the right track!");
    } else if (habitProgress > 0) {
      setHollaMood('happy');
      setHollaMessage("Every step counts! Let's keep going together!");
    } else {
      setHollaMood('encouraging');
      setHollaMessage("Ready to start today's journey? Let's do this!");
    }
  }, [habitProgress]);

  const handleProgressUpdate = (progress) => {
    setHabitProgress(progress);
  };

  // Show welcome screen if not authenticated
  if (!isAuthenticated) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <WelcomeScreen onLoginSuccess={handleLoginSuccess} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Onboarding Tutorial */}
      <Onboarding open={showOnboarding && isAuthenticated} onClose={() => setShowOnboarding(false)} />
      
      <Box 
        sx={{ 
          minHeight: '100vh', 
          background: '#0f0f0f',
          py: 4,
        }}
      >
        <Container maxWidth="xl">
          {/* Header */}
          <Paper
            elevation={0}
            sx={{ 
              mb: { xs: 2, md: 4 },
              background: '#1e1e1e',
              borderRadius: 3,
              p: { xs: 2, md: 3 },
              border: '1px solid #2a2a2a',
            }}
          >
            <Typography
              variant={isMobile ? 'h5' : 'h4'}
              sx={{
                fontWeight: 600,
                color: '#e0e0e0',
                mb: 1,
              }}
            >
              Welcome back, {currentUser}
            </Typography>
            <Typography 
              variant={isMobile ? 'body1' : 'h6'}
              sx={{ 
                color: '#9e9e9e',
                fontWeight: 400,
                mb: 2,
                px: { xs: 1, md: 0 },
              }}
            >
              {hollaMessage}
            </Typography>
            
            {/* Logout Button */}
            <Box sx={{ 
              display: 'flex', 
              gap: 1,
              justifyContent: 'flex-start',
              mt: { xs: 2, md: 0 },
            }}>
              <Button
                variant="outlined"
                startIcon={!isMobile && <LogoutIcon />}
                onClick={handleLogout}
                aria-label="Logout"
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  borderColor: '#2a2a2a',
                  color: '#e0e0e0',
                  fontWeight: 500,
                  '&:hover': {
                    borderColor: '#ff6347',
                    background: 'rgba(255, 99, 71, 0.1)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                {isMobile ? <LogoutIcon /> : 'Logout'}
              </Button>
            </Box>
          </Paper>
          
          {/* Main Content Grid */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 3 } }}>
            {/* Quote of the Day */}
            <QuoteOfTheDay />
            
            {/* Habit Checkbox */}
            <HabitCheckbox onProgressUpdate={handleProgressUpdate} userName={currentUser} />
            
            {/* Memory Logger and Progress Graph - Stack on mobile, side by side on desktop */}
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
              gap: { xs: 2, md: 3 },
            }}>
              <MemoryLogger userName={currentUser} />
              <ProgressGraph userName={currentUser} />
            </Box>
          </Box>

          {/* Footer */}
          <Paper
            elevation={0}
            sx={{ 
              mt: { xs: 3, md: 4 },
              textAlign: 'center',
              background: '#1e1e1e',
              borderRadius: 3,
              p: 2,
              border: '1px solid #2a2a2a',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Built for better habits |{' '}
              <Link
                href="https://github.com"
                target="_blank"
                rel="noopener"
                aria-label="View on GitHub"
                sx={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: 0.5,
                  color: '#ff6347',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                <GitHubIcon fontSize="small" />
                View on GitHub
              </Link>
            </Typography>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

function App() {
  const theme = useMemo(() => getTheme('dark'), []); // Always dark theme

  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          {/* Main App Route */}
          <Route path="/" element={<MainApp />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route
            path="/admin/*"
            element={
              <ProtectedAdminRoute>
                <AdminLayout />
              </ProtectedAdminRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="memories" element={<AdminMemories />} />
            <Route path="habits" element={<AdminHabits />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
          
          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ThemeProvider>
    </Router>
  );
}

export default App;
