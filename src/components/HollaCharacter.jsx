import React from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';

const HollaCharacter = ({ mood = 'happy', message = '' }) => {
  // Get icon based on mood
  const getIcon = () => {
    const iconStyle = { fontSize: 80, color: '#ff6347' };
    switch (mood) {
      case 'happy':
        return <StarIcon sx={iconStyle} />;
      case 'excited':
        return <EmojiEventsIcon sx={iconStyle} />;
      case 'proud':
        return <EmojiEventsIcon sx={iconStyle} />;
      case 'encouraging':
        return <LocalFireDepartmentIcon sx={iconStyle} />;
      default:
        return <StarIcon sx={iconStyle} />;
    }
  };

  return (
    <motion.div
      animate={{
        y: [0, -10, 0],
        rotate: [0, 5, -5, 0],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      style={{
        filter: 'drop-shadow(0 4px 12px rgba(255,99,71,0.3))',
        position: 'relative',
        display: 'inline-flex',
      }}
    >
      {getIcon()}
    </motion.div>
  );
};

export default HollaCharacter;

