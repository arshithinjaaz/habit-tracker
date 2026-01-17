import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Box, 
  Typography,
  Alert,
  IconButton,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LoginIcon from '@mui/icons-material/Login';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HollaCharacter from './HollaCharacter';

const WelcomeScreen = ({ onLoginSuccess }) => {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [currentStep, setCurrentStep] = useState('choice'); // 'choice', 'name', 'pin', 'confirm'
  const [error, setError] = useState('');
  const [isReturningUser, setIsReturningUser] = useState(null);
  const [emailAddress, setEmailAddress] = useState('');
  const [enableEmail, setEnableEmail] = useState(false);

  const handleUserTypeSelection = (isReturning) => {
    setIsReturningUser(isReturning);
    setCurrentStep('name');
    setError('');
  };

  const handleBack = () => {
    if (currentStep === 'name') {
      setCurrentStep('choice');
      setName('');
      setError('');
    } else if (currentStep === 'pin') {
      setCurrentStep('name');
      setPin('');
      setError('');
    } else if (currentStep === 'confirm') {
      setCurrentStep('pin');
      setConfirmPin('');
      setError('');
    }
  };

  const handleNameSubmit = () => {
    if (!name.trim()) return;
    
    const existingPin = localStorage.getItem(`habitTracker_pin_${name.trim()}`);
    
    if (isReturningUser) {
      if (existingPin) {
        setCurrentStep('pin');
        setError('');
      } else {
        setError('Account not found. Please check your name.');
      }
    } else {
      if (existingPin) {
        setError('Username already exists. Choose a different name.');
      } else {
        setCurrentStep('pin');
        setError('');
      }
    }
  };

  const handlePinSubmit = () => {
    if (pin.length !== 4) return;
    
    if (isReturningUser) {
      const storedPin = localStorage.getItem(`habitTracker_pin_${name}`);
      if (pin === storedPin) {
        onLoginSuccess(name);
      } else {
        setError('Incorrect PIN. Try again.');
        setPin('');
      }
    } else {
      setCurrentStep('confirm');
      setError('');
    }
  };

  const handleConfirmPinSubmit = () => {
    if (confirmPin !== pin) {
      setError("PINs don't match. Try again.");
      setPin('');
      setConfirmPin('');
      setCurrentStep('pin');
      return;
    }
    localStorage.setItem(`habitTracker_pin_${name}`, pin);
    
    // Save Email settings if provided
    if (enableEmail && emailAddress.trim()) {
      localStorage.setItem('emailAddress', emailAddress);
      localStorage.setItem('emailEnabled', 'true');
    }
    
    onLoginSuccess(name);
  };

  const getHollaMood = () => {
    if (error) return 'encouraging';
    if (currentStep === 'choice') return 'happy';
    if (currentStep === 'name') return 'excited';
    if (currentStep === 'pin') return 'happy';
    if (currentStep === 'confirm') return 'proud';
    return 'happy';
  };

  const getHollaMessage = () => {
    if (currentStep === 'choice') return '👋';
    if (currentStep === 'name' && !isReturningUser) return '😊';
    if (currentStep === 'name' && isReturningUser) return '💖';
    if (currentStep === 'pin' && !isReturningUser) return '🔒';
    if (currentStep === 'pin' && isReturningUser) return '🔐';
    if (currentStep === 'confirm') return '✨';
    return '😊';
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: `${100 + i * 50}px`,
              height: `${100 + i * 50}px`,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.05)',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </Box>

      {/* Main Content */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        <Box
          sx={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            p: { xs: 2, sm: 3, md: 5 },
            width: { xs: '90%', sm: 400 },
            maxWidth: { xs: '100%', sm: 450 },
            mx: { xs: 2, sm: 0 },
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            position: 'relative',
          }}
        >
          {/* Holla Character - Clash of Clans Style */}
          <Box
            sx={{
              position: 'absolute',
              top: -80,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10,
            }}
          >
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ 
                type: 'spring', 
                stiffness: 200, 
                damping: 15,
                delay: 0.2 
              }}
            >
              <Box sx={{ 
                transform: 'scale(1.2)',
                filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))',
              }}>
                <HollaCharacter 
                  mood={getHollaMood()}
                  message={getHollaMessage()}
                />
              </Box>
            </motion.div>
          </Box>

          {/* Back Button */}
          {currentStep !== 'choice' && (
            <IconButton
              onClick={handleBack}
              sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                color: '#667eea',
                '&:hover': {
                  background: 'rgba(102, 126, 234, 0.1)',
                },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          )}

          <AnimatePresence mode="wait">
            {/* Choice Screen */}
            {currentStep === 'choice' && (
              <motion.div
                key="choice"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Box sx={{ mt: 6 }}>
                  <Typography
                    variant="h4"
                    sx={{
                      mb: 1,
                      fontWeight: 700,
                      fontSize: { xs: '1.75rem', sm: '2.125rem' },
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textAlign: 'center',
                    }}
                  >
                    Holla! 👋
                  </Typography>
                  <Typography
                    sx={{
                      mb: 4,
                      color: '#666',
                      textAlign: 'center',
                      fontSize: '0.95rem',
                    }}
                  >
                    Your friendly habit tracker
                  </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<PersonAddIcon />}
                    onClick={() => handleUserTypeSelection(false)}
                    sx={{
                      py: { xs: 1.5, sm: 2 },
                      minHeight: { xs: 48, sm: 44 },
                      fontSize: { xs: '16px', sm: '1rem' },
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      boxShadow: '0 4px 15px rgba(102,126,234,0.4)',
                      '&:hover': {
                        boxShadow: '0 6px 20px rgba(102,126,234,0.6)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Create Account
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<LoginIcon />}
                    onClick={() => handleUserTypeSelection(true)}
                    sx={{
                      py: { xs: 1.5, sm: 2 },
                      minHeight: { xs: 48, sm: 44 },
                      fontSize: { xs: '16px', sm: '1rem' },
                      fontWeight: 600,
                      borderColor: '#667eea',
                      color: '#667eea',
                      borderWidth: 2,
                      '&:hover': {
                        borderWidth: 2,
                        borderColor: '#764ba2',
                        background: 'rgba(102,126,234,0.05)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Login
                  </Button>
                </Box>
                </Box>
              </motion.div>
            )}

            {/* Name Input Screen */}
            {currentStep === 'name' && (
              <motion.div
                key="name"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Box sx={{ mt: 6 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                      color: '#333',
                      textAlign: 'center',
                    }}
                  >
                    {isReturningUser ? 'Welcome back!' : "What's your name?"}
                  </Typography>
                <Typography
                  sx={{
                    mb: 3,
                    color: '#666',
                    textAlign: 'center',
                    fontSize: '0.9rem',
                  }}
                >
                  {isReturningUser ? 'Enter your username to continue' : 'Choose a username for your account'}
                </Typography>

                {error && (
                  <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                    {error}
                  </Alert>
                )}

                <TextField
                  fullWidth
                  variant="outlined"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleNameSubmit()}
                  placeholder="Enter your name"
                  autoFocus
                  sx={{
                    mb: 3,
                    '& input': {
                      fontSize: { xs: '16px', sm: '14px' }, // Prevents iOS zoom
                    },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: '#667eea',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#667eea',
                        borderWidth: 2,
                      },
                    },
                  }}
                />

                {!isReturningUser && (
                  <>
                    <TextField
                      fullWidth
                      variant="outlined"
                      label="Email Address (Optional)"
                      type="email"
                      placeholder="your@example.com"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      helperText="Receive automatic memory backups via email"
                      InputProps={{
                        startAdornment: <span style={{ marginRight: 8 }}>📧</span>
                      }}
                      sx={{
                        mb: 2,
                        '& input': {
                          fontSize: { xs: '16px', sm: '14px' }, // Prevents iOS zoom
                        },
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: '#667eea',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#667eea',
                            borderWidth: 2,
                          },
                        },
                      }}
                    />

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={enableEmail}
                          onChange={(e) => setEnableEmail(e.target.checked)}
                          sx={{
                            color: '#667eea',
                            '&.Mui-checked': {
                              color: '#667eea',
                            },
                          }}
                        />
                      }
                      label="📨 Enable email memory backup"
                      sx={{ 
                        mb: 2,
                        '& .MuiTypography-root': {
                          fontSize: { xs: '14px', sm: '16px' }
                        }
                      }}
                    />
                  </>
                )}

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleNameSubmit}
                  disabled={!name.trim()}
                  sx={{
                    py: { xs: 1.5, sm: 1.5 },
                    minHeight: { xs: 48, sm: 44 },
                    fontSize: { xs: '16px', sm: '1rem' },
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      boxShadow: '0 6px 20px rgba(102,126,234,0.4)',
                    },
                    '&:disabled': {
                      background: '#e0e0e0',
                    },
                  }}
                >
                  Continue
                </Button>
                </Box>
              </motion.div>
            )}

            {/* PIN Input Screen */}
            {currentStep === 'pin' && (
              <motion.div
                key="pin"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Box sx={{ mt: 6 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                      color: '#333',
                      textAlign: 'center',
                    }}
                  >
                    {isReturningUser ? `Hi ${name}! 🔐` : 'Create your PIN'}
                  </Typography>
                <Typography
                  sx={{
                    mb: 3,
                    color: '#666',
                    textAlign: 'center',
                    fontSize: '0.9rem',
                  }}
                >
                  {isReturningUser ? 'Enter your 4-digit PIN' : 'Choose a 4-digit PIN to secure your account'}
                </Typography>

                {error && (
                  <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                    {error}
                  </Alert>
                )}

                <TextField
                  fullWidth
                  variant="outlined"
                  type="password"
                  value={pin}
                  onChange={(e) => {
                    if (/^\d{0,4}$/.test(e.target.value)) {
                      setPin(e.target.value);
                    }
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && pin.length === 4 && handlePinSubmit()}
                  placeholder="••••"
                  autoFocus
                  inputProps={{
                    maxLength: 4,
                    inputMode: 'numeric',
                    style: { textAlign: 'center', fontSize: '2rem', letterSpacing: '1rem' },
                  }}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: '#667eea',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#667eea',
                        borderWidth: 2,
                      },
                    },
                  }}
                />

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handlePinSubmit}
                  disabled={pin.length !== 4}
                  sx={{
                    py: { xs: 1.5, sm: 1.5 },
                    minHeight: { xs: 48, sm: 44 },
                    fontSize: { xs: '16px', sm: '1rem' },
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      boxShadow: '0 6px 20px rgba(102,126,234,0.4)',
                    },
                    '&:disabled': {
                      background: '#e0e0e0',
                    },
                  }}
                >
                  {isReturningUser ? 'Unlock' : 'Continue'}
                </Button>
                </Box>
              </motion.div>
            )}

            {/* Confirm PIN Screen */}
            {currentStep === 'confirm' && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Box sx={{ mt: 6 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                      color: '#333',
                      textAlign: 'center',
                    }}
                  >
                    Confirm your PIN
                  </Typography>
                <Typography
                  sx={{
                    mb: 3,
                    color: '#666',
                    textAlign: 'center',
                    fontSize: '0.9rem',
                  }}
                >
                  Enter your PIN again to confirm
                </Typography>

                {error && (
                  <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                    {error}
                  </Alert>
                )}

                <TextField
                  fullWidth
                  variant="outlined"
                  type="password"
                  value={confirmPin}
                  onChange={(e) => {
                    if (/^\d{0,4}$/.test(e.target.value)) {
                      setConfirmPin(e.target.value);
                    }
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && confirmPin.length === 4 && handleConfirmPinSubmit()}
                  placeholder="••••"
                  autoFocus
                  inputProps={{
                    maxLength: 4,
                    inputMode: 'numeric',
                    style: { textAlign: 'center', fontSize: '2rem', letterSpacing: '1rem' },
                  }}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: '#667eea',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#667eea',
                        borderWidth: 2,
                      },
                    },
                  }}
                />

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleConfirmPinSubmit}
                  disabled={confirmPin.length !== 4}
                  sx={{
                    py: { xs: 1.5, sm: 1.5 },
                    minHeight: { xs: 48, sm: 44 },
                    fontSize: { xs: '16px', sm: '1rem' },
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      boxShadow: '0 6px 20px rgba(102,126,234,0.4)',
                    },
                    '&:disabled': {
                      background: '#e0e0e0',
                    },
                  }}
                >
                  Get Started 🚀
                </Button>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </motion.div>
    </Box>
  );
};

export default WelcomeScreen;
