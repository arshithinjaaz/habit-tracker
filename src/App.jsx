import { Container, CssBaseline, ThemeProvider, createTheme, Box, Typography, Link, Button, useMediaQuery, Paper } from '@mui/material';
import { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import WelcomeScreen from './components/WelcomeScreen';
import MemoryLogger from './components/MemoryLogger';
import ProgressGraph from './components/ProgressGraph';
import HollaCharacter from './components/HollaCharacter';
import HabitCheckbox from './components/HabitCheckbox';
import Onboarding from './components/Onboarding';
import QuoteOfTheDay from './components/QuoteOfTheDay';
import SubscriptionViewer from './components/SubscriptionViewer';
import AdminLogin from './components/admin/AdminLogin';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminMemories from './components/admin/AdminMemories';
import AdminHabits from './components/admin/AdminHabits';
import AdminSettings from './components/admin/AdminSettings';
import AdminSubscriptions from './components/admin/AdminSubscriptions';
import ProtectedAdminRoute from './components/admin/ProtectedAdminRoute';
import GitHubIcon from '@mui/icons-material/GitHub';
import LogoutIcon from '@mui/icons-material/Logout';

const getTheme = (mode) => createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ff6347',
    },
    secondary: {
      main: '#ff6347',
    },
    background: {
      default: '#0f0f0f',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#a0a0a0',
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  spacing: 8,
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      fontSize: {
        xs: '1.75rem',
        sm: '2rem',
        md: '2.125rem',
      },
      lineHeight: 1.3,
    },
    h5: {
      fontWeight: 600,
      fontSize: {
        xs: '1.25rem',
        sm: '1.5rem',
        md: '1.5rem',
      },
      lineHeight: 1.3,
    },
    h6: {
      fontSize: {
        xs: '1rem',
        sm: '1.125rem',
        md: '1.25rem',
      },
      lineHeight: 1.3,
    },
    body1: {
      fontSize: {
        xs: '0.875rem',
        sm: '1rem',
      },
    },
  },
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: 12,
          paddingRight: 12,
          '@media (min-width: 600px)': {
            paddingLeft: 24,
            paddingRight: 24,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 12,
          backgroundColor: '#1e1e1e',
          marginTop: 8,
          marginBottom: 8,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          minHeight: 44,
          padding: '10px 16px',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          width: 40,
          height: 40,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          minHeight: 36,
          borderRadius: 12,
          margin: 4,
          paddingLeft: 8,
          paddingRight: 8,
        },
        label: {
          fontWeight: 600,
          letterSpacing: 0.2,
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',
          padding: '0 4px',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
        input: {
          fontSize: '1rem',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        margin: 'dense',
        fullWidth: true,
      },
      styleOverrides: {
        root: {
          marginTop: 8,
          marginBottom: 8,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          margin: 12,
          borderRadius: 12,
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

  const theme = useMemo(() => getTheme('dark'), []);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Run migrations on mount
  useEffect(() => {
    const initializeApp = async () => {
      const { runMigrations } = await import('./services/migration.service.js');
      await runMigrations();
    };
    
    initializeApp();
  }, []);

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

  // Update Holla's mood and message based on habit progress
  useEffect(() => {
    if (habitProgress === 100) {
      setHollaMood('excited');
      setHollaMessage("WOW! You completed everything! You're amazing!");
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
      setHollaMessage("Ready to start today's journey? I'm here with you!");
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
          backgroundColor: '#0f0f0f',
          py: { xs: 0.5, sm: 2, md: 4 },
          position: 'relative',
          overflow: 'hidden',
          pb: { xs: 6, sm: 4 }, // Extra bottom padding for mobile
        }}
      >

        <Container 
          maxWidth="xl" 
          sx={{ 
            position: 'relative', 
            zIndex: 1,
            px: { xs: 0.5, sm: 2, md: 3 },
            maxWidth: { xs: '100%', sm: 'none' },
          }}
        >
          {/* Header */}
          <Paper
            elevation={8}
            sx={{ 
              mb: { xs: 1, sm: 2, md: 4 },
              textAlign: 'center', 
              position: 'relative',
              backdropFilter: 'blur(10px)',
              borderRadius: { xs: 2, md: 4 },
              p: { xs: 1.25, sm: 2, md: 3 },
              mx: { xs: 0, sm: 0 },
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: { xs: 1, sm: 2 } }}>
              <HollaCharacter mood={hollaMood} />
            </Box>
            
            <Typography
              variant={isMobile ? 'h6' : 'h4'}
              sx={{
                fontWeight: 'bold',
                color: 'text.primary',
                mb: { xs: 0.25, md: 1 },
                fontSize: { xs: '1.05rem', sm: '1.25rem', md: '2.125rem' },
                lineHeight: 1.2,
              }}
            >
              Welcome back, {currentUser}!
            </Typography>
            <Typography 
              variant={isMobile ? 'body2' : 'h6'}
              sx={{ 
                color: '#ff6347',
                fontWeight: 500,
                mb: { xs: 0.75, md: 2 },
                px: { xs: 0, md: 0 },
                fontSize: { xs: '0.8rem', sm: '1rem', md: '1.25rem' },
                lineHeight: 1.3,
              }}
            >
              {hollaMessage}
            </Typography>
            
            {/* Dark Mode & Logout Buttons */}
            <Box sx={{ 
              position: { xs: 'relative', md: 'absolute' },
              right: { md: 16 },
              top: { md: 16 },
              display: 'flex', 
              gap: 1,
              justifyContent: 'center',
              mt: { xs: 1, md: 0 },
            }}>
              <Button
                variant="outlined"
                startIcon={!isMobile && <LogoutIcon />}
                onClick={handleLogout}
                aria-label="Logout"
                sx={{
                  borderRadius: 3,
                  textTransform: 'none',
                  borderColor: '#ff6347',
                  color: '#ff6347',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#ff6347',
                    background: 'rgba(255,99,71,0.1)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {isMobile ? <LogoutIcon /> : 'Logout'}
              </Button>
            </Box>
          </Paper>
          
          {/* Main Content Grid - New Modern Layout */}
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { 
              xs: '1fr', 
              lg: '2fr 1fr' 
            },
            gap: { xs: 1, md: 3, lg: 4 },
            minHeight: 'calc(100vh - 200px)',
            position: 'relative',
          }}>
            
            {/* Left Column - Primary Content */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: { xs: 1, md: 3 },
              minHeight: 'fit-content',
            }}>
              {/* Quote Section - Featured */}
              <QuoteOfTheDay />
              
              {/* Habits Section */}
              <Box sx={{
                background: 'linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%)',
                borderRadius: { xs: 2, md: 4 },
                border: '1px solid rgba(255, 99, 71, 0.1)',
                p: { xs: 1.5, md: 3 },
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: 'linear-gradient(90deg, #ff6347, #ff8570)',
                },
              }}>
                <HabitCheckbox onProgressUpdate={handleProgressUpdate} userName={currentUser} />
              </Box>
            </Box>
            
            {/* Right Column - Secondary Content */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: { xs: 1, md: 3 },
              position: { lg: 'sticky' },
              top: { lg: '2rem' },
              height: { lg: 'fit-content' },
            }}>
              {/* Subscription Viewer */}
              <Box sx={{
                background: 'linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%)',
                borderRadius: { xs: 2, md: 4 },
                border: '1px solid rgba(255, 99, 71, 0.1)',
                p: { xs: 1.5, md: 3 },
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: 'linear-gradient(90deg, #ff6347, #ff8570)',
                },
              }}>
                <SubscriptionViewer userName={currentUser} />
              </Box>

              {/* Memory Logger */}
              <Box sx={{
                background: 'linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%)',
                borderRadius: { xs: 2, md: 4 },
                border: '1px solid rgba(255, 99, 71, 0.1)',
                p: { xs: 1.5, md: 3 },
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: 'linear-gradient(90deg, #ff6347, #ff8570)',
                },
              }}>
                <MemoryLogger userName={currentUser} currentHabits={[]} />
              </Box>
              
              {/* Progress Graph */}
              <Box sx={{
                background: 'linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%)',
                borderRadius: { xs: 2, md: 4 },
                border: '1px solid rgba(255, 99, 71, 0.1)',
                p: { xs: 1.5, md: 3 },
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: 'linear-gradient(90deg, #ff6347, #ff8570)',
                },
              }}>
                <ProgressGraph userName={currentUser} />
              </Box>
            </Box>
          </Box>

          {/* Footer */}
          <Paper
            elevation={2}
            sx={{ 
              mt: { xs: 1.5, sm: 3, md: 4 },
              textAlign: 'center',
              backdropFilter: 'blur(10px)',
              borderRadius: { xs: 2, md: 3 },
              p: { xs: 1.25, sm: 2 },
              mx: { xs: 0, sm: 0 },
            }}
          >
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                lineHeight: 1.4,
              }}
            >
              Built with passion for better habits{!isMobile && ' |'}{' '}
              <Link
                href="https://github.com"
                target="_blank"
                rel="noopener"
                aria-label="View on GitHub"
                sx={{ 
                  display: { xs: 'block', sm: 'inline-flex' },
                  alignItems: 'center', 
                  gap: 0.5,
                  color: '#ff6347',
                  textDecoration: 'none',
                  mt: { xs: 0.5, sm: 0 },
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
  const theme = useMemo(() => getTheme('dark'), []);

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
            <Route path="subscriptions" element={<AdminSubscriptions />} />
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
