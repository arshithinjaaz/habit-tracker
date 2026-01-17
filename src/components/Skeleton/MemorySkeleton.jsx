/**
 * Skeleton loading component for memory list
 */

import { Box, Paper, Skeleton } from '@mui/material';

const MemorySkeleton = ({ count = 3 }) => {
  return (
    <Box>
      {[...Array(count)].map((_, index) => (
        <Paper
          key={index}
          elevation={2}
          sx={{
            p: 2,
            mb: 2,
            borderRadius: 2,
          }}
        >
          {/* Header with date */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Skeleton variant="text" width={120} height={20} />
            <Skeleton variant="circular" width={24} height={24} />
          </Box>
          
          {/* Memory text */}
          <Skeleton variant="text" width="100%" height={20} sx={{ mb: 0.5 }} />
          <Skeleton variant="text" width="90%" height={20} sx={{ mb: 0.5 }} />
          <Skeleton variant="text" width="70%" height={20} />
        </Paper>
      ))}
    </Box>
  );
};

export default MemorySkeleton;
