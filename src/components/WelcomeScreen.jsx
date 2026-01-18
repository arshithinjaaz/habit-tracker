import React, { useState, useEffect, useMemo } from 'react';
import { 
  TextField, 
  Button, 
  Box, 
  Typography,
  Alert,
  IconButton,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  Paper,
  Fade,
  Slide,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LoginIcon from '@mui/icons-material/Login';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmailIcon from '@mui/icons-material/Email';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import HollaCharacter from './HollaCharacter';
import { hashPin, verifyPin, migratePlainTextPin } from '../utils/crypto';
import { sanitizeUserName } from '../utils/sanitize';
import { validateUserPin, validateUserName } from '../schemas/user.schema';

const WelcomeScreen = ({ onLoginSuccess }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [currentStep, setCurrentStep] = useState('choice'); // 'choice', 'name', 'pin', 'confirm'
  const [error, setError] = useState('');
  const [isReturningUser, setIsReturningUser] = useState(null);
  const [emailAddress, setEmailAddress] = useState('');
  const [enableEmail, setEnableEmail] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);

  // Harvey Specter inspired quotes for motivation
  const motivationalQuotes = useMemo(() => [
    "Success isn't about luck. It's about preparation meeting opportunity.",
    "I don't have dreams. I have goals.",
    "Excellence isn't a skill, it's an attitude.",
    "The only time success comes before work is in the dictionary.",
    "I refuse to answer that on the grounds that I don't want to.",
    "Life isn't about the amount of breaths you take. It's about the moments that take your breath away."
  ], []);
  
  const currentQuote = useMemo(() => 
    motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)],
    [motivationalQuotes]
  );

  // Modern animated background elements
  const backgroundElements = useMemo(() => 
    [...Array(12)].map((_, i) => ({
      id: i,
      size: Math.random() * 200 + 50,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 10 + Math.random() * 20,
    })),
    []
  );

  // Migrate plain-text PINs on mount
  useEffect(() => {
    const migrateExistingPins = async () => {
      const users = [];
      for (let key in localStorage) {
        if (key.startsWith('habitTracker_pin_')) {
          const userName = key.replace('habitTracker_pin_', '');
          users.push(userName);
        }
      }
      
      for (const user of users) {
        await migratePlainTextPin(user);
      }
    };
    
    migrateExistingPins();
  }, []);

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
    
    // Validate and sanitize username
    const validation = validateUserName(name.trim());
    if (!validation.success) {
      setError(validation.error);
      return;
    }
    
    const sanitizedName = sanitizeUserName(name.trim());
    setName(sanitizedName);
    
    const existingPin = localStorage.getItem(`habitTracker_pin_${sanitizedName}`);
    
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

  const handlePinSubmit = async () => {
    if (pin.length !== 4) return;
    
    // Validate PIN format
    const validation = validateUserPin(pin);
    if (!validation.success) {
      setError(validation.error);
      setPin('');
      return;
    }
    
    if (isReturningUser) {
      const storedPin = localStorage.getItem(`habitTracker_pin_${name}`);
      const isValid = await verifyPin(pin, storedPin);
      
      if (isValid) {
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

  const handleConfirmPinSubmit = async () => {
    if (confirmPin !== pin) {
      setError("PINs don't match. Try again.");
      setPin('');
      setConfirmPin('');
      setCurrentStep('pin');
      return;
    }
    
    // Hash the PIN before storing
    const hashedPin = await hashPin(pin);
    localStorage.setItem(`habitTracker_pin_${name}`, hashedPin);
    
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

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Modern Animated Background */}
      {backgroundElements.map((element) => (
        <motion.div
          key={element.id}
          style={{
            position: 'absolute',
            width: element.size,
            height: element.size,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(255,99,71,0.${Math.floor(Math.random() * 3) + 1}) 0%, transparent 70%)`,
            filter: 'blur(1px)',
          }}
          animate={{
            x: [`${element.x}%`, `${(element.x + 20) % 100}%`, `${element.x}%`],
            y: [`${element.y}%`, `${(element.y + 15) % 100}%`, `${element.y}%`],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: element.duration,
            repeat: Infinity,
            delay: element.delay,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Navigation Back Button */}
      {currentStep !== 'choice' && (
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          style={{
            position: 'absolute',
            top: isMobile ? '2rem' : '3rem',
            left: isMobile ? '1rem' : '2rem',
            zIndex: 10,
          }}
        >
          <IconButton
            onClick={handleBack}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: '#ff6347',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 99, 71, 0.2)',
              '&:hover': {
                backgroundColor: 'rgba(255, 99, 71, 0.1)',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        </motion.div>
      )}

      {/* Main Content Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ width: '100%', maxWidth: '500px', padding: isMobile ? '1rem' : '2rem' }}
      >
        <Paper
          elevation={20}
          sx={{
            background: 'rgba(30, 30, 30, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 99, 71, 0.1)',
            borderRadius: 4,
            p: { xs: 3, md: 5 },
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: 'linear-gradient(90deg, transparent 0%, #ff6347 50%, transparent 100%)',
            }
          }}
        >
          <AnimatePresence mode="wait">
            {/* Initial Choice Screen */}
            {currentStep === 'choice' && (
              <motion.div
                key="choice"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5 }}
              >
                <Box sx={{ textAlign: 'center', mb: 5 }}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  >
                    <Box
                      sx={{
                        width: { xs: 80, md: 100 },
                        height: { xs: 80, md: 100 },
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #ff6347 0%, #ff8570 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 2rem',
                        boxShadow: '0 20px 40px rgba(255, 99, 71, 0.3)',
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: { xs: '2.5rem', md: '3.5rem' },
                          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
                        }}
                      >
                        🎯
                      </Typography>
                    </Box>
                  </motion.div>

                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #ffffff 0%, #ff6347 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 2,
                      fontSize: { xs: '2rem', md: '3rem' },
                      letterSpacing: '-0.02em',
                    }}
                  >
                    Habit Tracker
                  </Typography>

                  <Typography
                    variant="h6"
                    sx={{
                      color: '#a0a0a0',
                      fontStyle: 'italic',
                      mb: 1,
                      fontSize: { xs: '0.9rem', md: '1.1rem' },
                      lineHeight: 1.6,
                    }}
                  >
                    "{currentQuote}"
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color: '#ff6347',
                      fontWeight: 600,
                      mb: 4,
                      fontSize: { xs: '0.8rem', md: '0.9rem' },
                    }}
                  >
                    — Inspired by Excellence
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        variant="contained"
                        size="large"
                        fullWidth
                        startIcon={<PersonAddIcon />}
                        onClick={() => handleUserTypeSelection(false)}
                        sx={{
                          py: { xs: 2, md: 2.5 },
                          fontSize: { xs: '1rem', md: '1.1rem' },
                          fontWeight: 600,
                          background: 'linear-gradient(135deg, #ff6347 0%, #ff8570 100%)',
                          boxShadow: '0 8px 32px rgba(255, 99, 71, 0.4)',
                          border: 'none',
                          borderRadius: 3,
                          '&:hover': {
                            background: 'linear-gradient(135deg, #ff8570 0%, #ff6347 100%)',
                            boxShadow: '0 12px 40px rgba(255, 99, 71, 0.6)',
                            transform: 'translateY(-2px)',
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        Create New Journey
                      </Button>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        variant="outlined"
                        size="large"
                        fullWidth
                        startIcon={<LoginIcon />}
                        onClick={() => handleUserTypeSelection(true)}
                        sx={{
                          py: { xs: 2, md: 2.5 },
                          fontSize: { xs: '1rem', md: '1.1rem' },
                          fontWeight: 600,
                          borderColor: '#ff6347',
                          color: '#ff6347',
                          borderWidth: 2,
                          borderRadius: 3,
                          background: 'rgba(255, 99, 71, 0.05)',
                          '&:hover': {
                            borderWidth: 2,
                            borderColor: '#ff6347',
                            background: 'rgba(255, 99, 71, 0.15)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 24px rgba(255, 99, 71, 0.2)',
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        Continue Journey
                      </Button>
                    </motion.div>
                  </Box>
                </Box>
              </motion.div>
            )}

            {/* Name Input Screen */}
            {currentStep === 'name' && (
              <motion.div
                key="name"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
              >
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: '#ffffff',
                      mb: 1,
                      fontSize: { xs: '1.8rem', md: '2.5rem' },
                    }}
                  >
                    {isReturningUser ? 'Welcome Back!' : "Let's Begin"}
                  </Typography>
                  <Typography
                    sx={{
                      mb: 4,
                      color: '#a0a0a0',
                      fontSize: { xs: '0.9rem', md: '1rem' },
                      lineHeight: 1.6,
                    }}
                  >
                    {isReturningUser ? 'Enter your username to continue your journey' : 'Choose your unique username to start building habits'}
                  </Typography>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <Alert 
                        severity="error" 
                        sx={{ 
                          mb: 3,
                          borderRadius: 2,
                          background: 'rgba(244, 67, 54, 0.1)',
                          border: '1px solid rgba(244, 67, 54, 0.3)',
                          color: '#ff6b6b',
                        }}
                      >
                        {error}
                      </Alert>
                    </motion.div>
                  )}

                  <TextField
                    fullWidth
                    variant="outlined"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleNameSubmit()}
                    placeholder="Enter your username"
                    autoFocus={!isMobile}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon sx={{ color: '#ff6347' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mb: 4,
                      '& input': {
                        fontSize: { xs: '16px', sm: '1.1rem' },
                        color: '#ffffff',
                        padding: '18px 14px',
                      },
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        background: 'rgba(255, 255, 255, 0.02)',
                        backdropFilter: 'blur(10px)',
                        '& fieldset': {
                          borderColor: 'rgba(255, 99, 71, 0.3)',
                          borderWidth: 1,
                        },
                        '&:hover fieldset': {
                          borderColor: '#ff6347',
                          borderWidth: 2,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#ff6347',
                          borderWidth: 2,
                          boxShadow: '0 0 0 3px rgba(255, 99, 71, 0.1)',
                        },
                      },
                    }}
                  />

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      onClick={handleNameSubmit}
                      disabled={!name.trim() || loading}
                      sx={{
                        py: { xs: 2, md: 2.5 },
                        fontSize: { xs: '1rem', md: '1.1rem' },
                        fontWeight: 600,
                        background: name.trim() ? 'linear-gradient(135deg, #ff6347 0%, #ff8570 100%)' : 'rgba(255, 255, 255, 0.1)',
                        boxShadow: name.trim() ? '0 8px 32px rgba(255, 99, 71, 0.4)' : 'none',
                        borderRadius: 3,
                        '&:hover': {
                          background: name.trim() ? 'linear-gradient(135deg, #ff8570 0%, #ff6347 100%)' : 'rgba(255, 255, 255, 0.15)',
                          boxShadow: name.trim() ? '0 12px 40px rgba(255, 99, 71, 0.6)' : 'none',
                        },
                        '&:disabled': {
                          background: 'rgba(255, 255, 255, 0.1)',
                          color: 'rgba(255, 255, 255, 0.3)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {loading ? 'Processing...' : 'Continue'}
                    </Button>
                  </motion.div>
                </Box>
              </motion.div>
            )}

            {/* PIN Input Screen */}
            {currentStep === 'pin' && (
              <motion.div
                key="pin"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
              >
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: '#ffffff',
                      mb: 1,
                      fontSize: { xs: '1.8rem', md: '2.5rem' },
                    }}
                  >
                    {isReturningUser ? 'Enter PIN' : 'Create PIN'}
                  </Typography>
                  <Typography
                    sx={{
                      mb: 4,
                      color: '#a0a0a0',
                      fontSize: { xs: '0.9rem', md: '1rem' },
                      lineHeight: 1.6,
                    }}
                  >
                    {isReturningUser ? 'Enter your 4-digit PIN to unlock' : 'Create a secure 4-digit PIN'}
                  </Typography>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <Alert 
                        severity="error" 
                        sx={{ 
                          mb: 3,
                          borderRadius: 2,
                          background: 'rgba(244, 67, 54, 0.1)',
                          border: '1px solid rgba(244, 67, 54, 0.3)',
                          color: '#ff6b6b',
                        }}
                      >
                        {error}
                      </Alert>
                    </motion.div>
                  )}

                  <TextField
                    fullWidth
                    variant="outlined"
                    type={showPin ? 'text' : 'password'}
                    value={pin}
                    onChange={(e) => {
                      if (/^\d{0,4}$/.test(e.target.value)) {
                        setPin(e.target.value);
                      }
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && pin.length === 4 && handlePinSubmit()}
                    placeholder="••••"
                    autoFocus={!isMobile}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: '#ff6347' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPin(!showPin)}
                            edge="end"
                            sx={{ color: '#ff6347' }}
                          >
                            {showPin ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    inputProps={{
                      maxLength: 4,
                      inputMode: 'numeric',
                      style: { 
                        textAlign: 'center', 
                        fontSize: isMobile ? '1.5rem' : '2rem', 
                        letterSpacing: '0.5rem',
                        color: '#ffffff'
                      },
                    }}
                    sx={{
                      mb: 4,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        background: 'rgba(255, 255, 255, 0.02)',
                        backdropFilter: 'blur(10px)',
                        '& fieldset': {
                          borderColor: 'rgba(255, 99, 71, 0.3)',
                          borderWidth: 1,
                        },
                        '&:hover fieldset': {
                          borderColor: '#ff6347',
                          borderWidth: 2,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#ff6347',
                          borderWidth: 2,
                          boxShadow: '0 0 0 3px rgba(255, 99, 71, 0.1)',
                        },
                      },
                    }}
                  />

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      onClick={handlePinSubmit}
                      disabled={pin.length !== 4 || loading}
                      sx={{
                        py: { xs: 2, md: 2.5 },
                        fontSize: { xs: '1rem', md: '1.1rem' },
                        fontWeight: 600,
                        background: pin.length === 4 ? 'linear-gradient(135deg, #ff6347 0%, #ff8570 100%)' : 'rgba(255, 255, 255, 0.1)',
                        boxShadow: pin.length === 4 ? '0 8px 32px rgba(255, 99, 71, 0.4)' : 'none',
                        borderRadius: 3,
                        '&:hover': {
                          background: pin.length === 4 ? 'linear-gradient(135deg, #ff8570 0%, #ff6347 100%)' : 'rgba(255, 255, 255, 0.15)',
                          boxShadow: pin.length === 4 ? '0 12px 40px rgba(255, 99, 71, 0.6)' : 'none',
                        },
                        '&:disabled': {
                          background: 'rgba(255, 255, 255, 0.1)',
                          color: 'rgba(255, 255, 255, 0.3)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {loading ? 'Processing...' : (isReturningUser ? 'Unlock' : 'Continue')}
                    </Button>
                  </motion.div>
                </Box>
              </motion.div>
            )}

            {/* Confirm PIN Screen */}
            {currentStep === 'confirm' && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
              >
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: '#ffffff',
                      mb: 1,
                      fontSize: { xs: '1.8rem', md: '2.5rem' },
                    }}
                  >
                    Confirm PIN
                  </Typography>
                  <Typography
                    sx={{
                      mb: 4,
                      color: '#a0a0a0',
                      fontSize: { xs: '0.9rem', md: '1rem' },
                      lineHeight: 1.6,
                    }}
                  >
                    Enter your PIN again to confirm
                  </Typography>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <Alert 
                        severity="error" 
                        sx={{ 
                          mb: 3,
                          borderRadius: 2,
                          background: 'rgba(244, 67, 54, 0.1)',
                          border: '1px solid rgba(244, 67, 54, 0.3)',
                          color: '#ff6b6b',
                        }}
                      >
                        {error}
                      </Alert>
                    </motion.div>
                  )}

                  <TextField
                    fullWidth
                    variant="outlined"
                    type={showPin ? 'text' : 'password'}
                    value={confirmPin}
                    onChange={(e) => {
                      if (/^\d{0,4}$/.test(e.target.value)) {
                        setConfirmPin(e.target.value);
                      }
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && confirmPin.length === 4 && handleConfirmPinSubmit()}
                    placeholder="••••"
                    autoFocus={!isMobile}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: '#ff6347' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPin(!showPin)}
                            edge="end"
                            sx={{ color: '#ff6347' }}
                          >
                            {showPin ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    inputProps={{
                      maxLength: 4,
                      inputMode: 'numeric',
                      style: { 
                        textAlign: 'center', 
                        fontSize: isMobile ? '1.5rem' : '2rem', 
                        letterSpacing: '0.5rem',
                        color: '#ffffff'
                      },
                    }}
                    sx={{
                      mb: 4,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        background: 'rgba(255, 255, 255, 0.02)',
                        backdropFilter: 'blur(10px)',
                        '& fieldset': {
                          borderColor: 'rgba(255, 99, 71, 0.3)',
                          borderWidth: 1,
                        },
                        '&:hover fieldset': {
                          borderColor: '#ff6347',
                          borderWidth: 2,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#ff6347',
                          borderWidth: 2,
                          boxShadow: '0 0 0 3px rgba(255, 99, 71, 0.1)',
                        },
                      },
                    }}
                  />

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      onClick={handleConfirmPinSubmit}
                      disabled={confirmPin.length !== 4 || loading}
                      sx={{
                        py: { xs: 2, md: 2.5 },
                        fontSize: { xs: '1rem', md: '1.1rem' },
                        fontWeight: 600,
                        background: confirmPin.length === 4 ? 'linear-gradient(135deg, #ff6347 0%, #ff8570 100%)' : 'rgba(255, 255, 255, 0.1)',
                        boxShadow: confirmPin.length === 4 ? '0 8px 32px rgba(255, 99, 71, 0.4)' : 'none',
                        borderRadius: 3,
                        '&:hover': {
                          background: confirmPin.length === 4 ? 'linear-gradient(135deg, #ff8570 0%, #ff6347 100%)' : 'rgba(255, 255, 255, 0.15)',
                          boxShadow: confirmPin.length === 4 ? '0 12px 40px rgba(255, 99, 71, 0.6)' : 'none',
                        },
                        '&:disabled': {
                          background: 'rgba(255, 255, 255, 0.1)',
                          color: 'rgba(255, 255, 255, 0.3)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {loading ? 'Creating Account...' : 'Start Journey'}
                    </Button>
                  </motion.div>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default WelcomeScreen;
