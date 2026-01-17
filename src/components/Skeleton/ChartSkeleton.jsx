/**
 * Skeleton loading component for charts
 */

import { Box, Paper, Skeleton } from '@mui/material';

const ChartSkeleton = () => {
  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: 3,
      }}
    >
      {/* Header skeleton */}
      <Box sx={{ mb: 3 }}>
        <Skeleton variant="text" width="40%" height={32} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="60%" height={20} />
      </Box>
      
      {/* Chart area skeleton */}
      <Box
        sx={{
          height: 300,
          display: 'flex',
          alignItems: 'flex-end',
          gap: 2,
          mb: 2,
        }}
      >
        {[...Array(7)].map((_, index) => (
          <Skeleton
            key={index}
            variant="rectangular"
            sx={{
              flex: 1,
              height: `${Math.random() * 60 + 40}%`,
              borderRadius: 1,
            }}
          />
        ))}
      </Box>
      
      {/* Legend skeleton */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        {[...Array(3)].map((_, index) => (
          <Skeleton key={index} variant="text" width={80} height={20} />
        ))}
      </Box>
    </Paper>
  );
};

export default ChartSkeleton;
