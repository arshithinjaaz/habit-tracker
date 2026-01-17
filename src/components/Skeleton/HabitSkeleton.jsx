/**
 * Skeleton loading component for habit list
 */

import { Box, Paper, Skeleton } from '@mui/material';

const HabitSkeleton = ({ count = 5 }) => {
  return (
    <Box>
      {[...Array(count)].map((_, index) => (
        <Paper
          key={index}
          elevation={2}
          sx={{
            p: 2,
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          {/* Checkbox skeleton */}
          <Skeleton variant="circular" width={24} height={24} />
          
          {/* Text skeleton */}
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="text" width="40%" height={16} />
          </Box>
          
          {/* Action buttons skeleton */}
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="circular" width={32} height={32} />
        </Paper>
      ))}
    </Box>
  );
};

export default HabitSkeleton;
