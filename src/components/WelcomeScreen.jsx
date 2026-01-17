import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Box, 
  Typography,
  Alert,
  IconButton,
  Checkbox,
  FormControlLabel,
  Paper,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LoginIcon from '@mui/icons-material/Login';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmailIcon from '@mui/icons-material/Email';

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

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#0f0f0f',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Paper
          elevation={0}
          sx={{
            background: '#1e1e1e',
            border: '1px solid #2a2a2a',
            borderRadius: 3,
            p: { xs: 3, sm: 4 },
            width: { xs: '90vw', sm: 400 },
            maxWidth: 450,
          }}
        >
          {/* Back Button */}
          {currentStep !== 'choice' && (
            <IconButton
              onClick={handleBack}
              sx={{
                color: '#9e9e9e',
                mb: 2,
                '&:hover': {
                  background: 'rgba(255, 99, 71, 0.1)',
                  color: '#ff6347',
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    color: '#e0e0e0',
                  }}
                >
                  Habit Tracker
                </Typography>
                <Typography
                  sx={{
                    mb: 4,
                    color: '#9e9e9e',
                    fontSize: '0.95rem',
                  }}
                >
                  Your minimal habit tracking companion
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<PersonAddIcon />}
                    onClick={() => handleUserTypeSelection(false)}
                    sx={{
                      py: 1.5,
                      fontSize: '16px',
                      fontWeight: 600,
                      background: '#ff6347',
                      '&:hover': {
                        background: '#ff7f5e',
                      },
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
                      py: 1.5,
                      fontSize: '16px',
                      fontWeight: 600,
                      borderColor: '#2a2a2a',
                      color: '#e0e0e0',
                      '&:hover': {
                        borderColor: '#ff6347',
                        background: 'rgba(255, 99, 71, 0.1)',
                      },
                    }}
                  >
                    Login
                  </Button>
                </Box>
              </motion.div>
            )}

            {/* Name Input Screen */}
            {currentStep === 'name' && (
              <motion.div
                key="name"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    color: '#e0e0e0',
                  }}
                >
                  {isReturningUser ? 'Welcome back' : "What's your name?"}
                </Typography>
                <Typography
                  sx={{
                    mb: 3,
                    color: '#9e9e9e',
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
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: '#ff6347',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#ff6347',
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
                        startAdornment: <EmailIcon sx={{ mr: 1, color: '#9e9e9e' }} />
                      }}
                      sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: '#ff6347',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#ff6347',
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
                            color: '#9e9e9e',
                            '&.Mui-checked': {
                              color: '#ff6347',
                            },
                          }}
                        />
                      }
                      label="Enable email memory backup"
                      sx={{ mb: 2 }}
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
                    py: 1.5,
                    fontSize: '16px',
                    fontWeight: 600,
                    background: '#ff6347',
                    '&:hover': {
                      background: '#ff7f5e',
                    },
                    '&:disabled': {
                      background: '#2a2a2a',
                    },
                  }}
                >
                  Continue
                </Button>
              </motion.div>
            )}

            {/* PIN Input Screen */}
            {currentStep === 'pin' && (
              <motion.div
                key="pin"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    color: '#e0e0e0',
                  }}
                >
                  {isReturningUser ? `Hi ${name}` : 'Create your PIN'}
                </Typography>
                <Typography
                  sx={{
                    mb: 3,
                    color: '#9e9e9e',
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
                        borderColor: '#ff6347',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#ff6347',
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
                    py: 1.5,
                    fontSize: '16px',
                    fontWeight: 600,
                    background: '#ff6347',
                    '&:hover': {
                      background: '#ff7f5e',
                    },
                    '&:disabled': {
                      background: '#2a2a2a',
                    },
                  }}
                >
                  {isReturningUser ? 'Unlock' : 'Continue'}
                </Button>
              </motion.div>
            )}

            {/* Confirm PIN Screen */}
            {currentStep === 'confirm' && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    color: '#e0e0e0',
                  }}
                >
                  Confirm your PIN
                </Typography>
                <Typography
                  sx={{
                    mb: 3,
                    color: '#9e9e9e',
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
                        borderColor: '#ff6347',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#ff6347',
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
                    py: 1.5,
                    fontSize: '16px',
                    fontWeight: 600,
                    background: '#ff6347',
                    '&:hover': {
                      background: '#ff7f5e',
                    },
                    '&:disabled': {
                      background: '#2a2a2a',
                    },
                  }}
                >
                  Get Started
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default WelcomeScreen;
