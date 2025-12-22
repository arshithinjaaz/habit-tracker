import { Container, CssBaseline, ThemeProvider, createTheme, Box, Typography, Link, Button, IconButton, Tooltip, useMediaQuery, Paper } from '@mui/material';
import { useState, useEffect, useMemo } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import MemoryLogger from './components/MemoryLogger';
import ProgressGraph from './components/ProgressGraph';
import HollaCharacter from './components/HollaCharacter';
import HabitCheckbox from './components/HabitCheckbox';
import Onboarding from './components/Onboarding';
import GitHubIcon from '@mui/icons-material/GitHub';
import LogoutIcon from '@mui/icons-material/Logout';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

const getTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: {
      main: '#667eea',
    },
    secondary: {
      main: '#764ba2',
    },
    background: {
      default: mode === 'light' ? '#f5f7fa' : '#121212',
      paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginMode, setLoginMode] = useState('initial');
  const [habitProgress, setHabitProgress] = useState(0);
  const [hollaMood, setHollaMood] = useState('happy');
  const [hollaMessage, setHollaMessage] = useState("Let's build great habits together!");
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('onboardingCompleted');
  });

  const theme = useMemo(() => getTheme(darkMode ? 'dark' : 'light'), [darkMode]);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const newMode = !prev;
      localStorage.setItem('darkMode', JSON.stringify(newMode));
      return newMode;
    });
  };

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
      setHollaMessage("🎉 WOW! You completed everything! You're amazing!");
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

      {/* Onboarding Tutorial */}
      <Onboarding open={showOnboarding && isAuthenticated} onClose={() => setShowOnboarding(false)} />
      
      
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box 
        sx={{ 
          minHeight: '100vh', 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          py: 4,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative background circles */}
        {[...Array(3)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              width: `${200 + i * 100}px`,
              height: `${200 + i * 100}px`,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)',
              top: `${-50 + i * 30}%`,
              right: `${-10 + i * 20}%`,
              pointerEvents: 'none',
            }}
          />
        ))}

        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <Paper
            elevation={8}
            sx={{ 
              mb: { xs: 2, md: 4 },
              textAlign: 'center', 
              position: 'relative',
              backdropFilter: 'blur(10px)',
              borderRadius: 4,
              p: { xs: 2, md: 3 },
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <HollaCharacter mood={hollaMood} />
            </Box>
            
            <Typography
              variant={isMobile ? 'h5' : 'h4'}
              sx={{
                fontWeight: 'bold',
                color: 'text.primary',
                mb: 1,
              }}
            >
              Welcome back, {currentUser}! 👋
            </Typography>
            <Typography 
              variant={isMobile ? 'body1' : 'h6'}
              sx={{ 
                color: '#667eea',
                fontWeight: 500,
                mb: 2,
                px: { xs: 1, md: 0 },
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
              mt: { xs: 2, md: 0 },
            }}>
              <Tooltip title={darkMode ? 'Light Mode' : 'Dark Mode'}>
                <IconButton 
                  onClick={toggleDarkMode}
                  aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                  sx={{
                    color: '#667eea',
                    '&:hover': {
                      background: 'rgba(102,126,234,0.1)',
                    },
                  }}
                >
                  {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
              </Tooltip>
              <Button
                variant="outlined"
                startIcon={!isMobile && <LogoutIcon />}
                onClick={handleLogout}
                aria-label="Logout"
                sx={{
                  borderRadius: 3,
                  textTransform: 'none',
                  borderColor: '#667eea',
                  color: '#667eea',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#764ba2',
                    background: 'rgba(102,126,234,0.1)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {isMobile ? <LogoutIcon /> : 'Logout'}
              </Button>
            </Box>
          </Paper>
          
          {/* Main Content Grid */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 3 } }}>
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
            elevation={2}
            sx={{ 
              mt: { xs: 3, md: 4 },
              textAlign: 'center',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              p: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Built with ❤️ for better habits |{' '}
              <Link
                href="https://github.com"
                target="_blank"
                rel="noopener"
                aria-label="View on GitHub"
                sx={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: 0.5,
                  color: '#667eea',
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

export default App;
